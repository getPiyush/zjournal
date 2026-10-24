"""Admin gate for the API, equivalent to server/node/auth.js (Node), AdminAuthInterceptor (Java)
and auth.php (PHP): verifies the Google ID token the admin panel sends as
`Authorization: Bearer <token>` and checks its email against ZJOURNAL_ADMIN_EMAILS.
"""

import logging
import re
from typing import Callable, Iterable, Optional

import jwt
from starlette.concurrency import run_in_threadpool
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

logger = logging.getLogger("zjournal.auth")

GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"]

# Everything not listed here needs an admin (same rules as the other three backends), plus the
# health/docs routes this backend serves.
_PUBLIC_READS = {"", "health", "articles", "journal", "qna", "docs", "redoc", "openapi.json"}
PUBLIC_ROUTES = {
    "GET": _PUBLIC_READS,
    "HEAD": _PUBLIC_READS,
    # The public "Contact us" form.
    "POST": {"contacts"},
}

# Public reads where an admin sees more. Anonymous callers get only published, non-flagged
# articles, and a journal without the editor's working copy (currentArticle) or the legacy
# adminDetails credential hashes. The routers apply this when request.state.public_view is set.
ADMIN_AWARE_READS = {"articles", "journal"}
JOURNAL_PRIVATE_FIELDS = ("currentArticle", "adminDetails")


def _is_true(value) -> bool:
    return value is True or value == 1 or value in ("true", "1")


def is_public_article(article) -> bool:
    return isinstance(article, dict) and _is_true(article.get("published")) and not _is_true(article.get("deleteFlag"))


def public_journal(journal):
    if not isinstance(journal, dict):
        return journal
    return {key: value for key, value in journal.items() if key not in JOURNAL_PRIVATE_FIELDS}


def is_public_view(request: Request) -> bool:
    return getattr(request.state, "public_view", False)


_BEARER = re.compile(r"^Bearer\s+(\S+)$", re.IGNORECASE)

TokenVerifier = Callable[[str], dict]


class AuthError(Exception):
    def __init__(self, status: int, code: str, message: str):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message


def collection_of(path: str) -> str:
    parts = [part for part in path.lower().split("/") if part]
    return parts[0] if parts else ""


def requires_admin(method: str, path: str) -> bool:
    if method == "OPTIONS":
        return False
    return collection_of(path) not in PUBLIC_ROUTES.get(method, set())


def authenticate(authorization: Optional[str], verify_token: TokenVerifier, admin_emails: Iterable[str]) -> str:
    """Returns the admin's email, or raises AuthError."""
    match = _BEARER.match(authorization or "")
    if not match:
        raise AuthError(401, "UNAUTHORIZED", "Admin sign-in required")

    try:
        payload = verify_token(match.group(1))
    except Exception:
        raise AuthError(401, "UNAUTHORIZED", "Invalid or expired sign-in token")

    email = str(payload.get("email") or "").lower()
    allowed = {address.lower() for address in admin_emails}
    if payload.get("email_verified") is not True or email not in allowed:
        raise AuthError(403, "FORBIDDEN", "This account is not an admin")
    return email


def google_verifier(client_id: str) -> TokenVerifier:
    # PyJWKClient caches Google's signing keys and refetches when it sees an unknown key id.
    jwks = jwt.PyJWKClient(GOOGLE_JWKS_URL, cache_keys=True)

    def verify(token: str) -> dict:
        signing_key = jwks.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=client_id,
            issuer=GOOGLE_ISSUERS,
        )

    return verify


class AdminAuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, verify_token: TokenVerifier, admin_emails: Iterable[str]):
        super().__init__(app)
        self.verify_token = verify_token
        self.admin_emails = list(admin_emails)

    async def dispatch(self, request: Request, call_next):
        authorization = request.headers.get("authorization")
        if not requires_admin(request.method, request.url.path):
            if request.method not in ("GET", "HEAD") or collection_of(request.url.path) not in ADMIN_AWARE_READS:
                return await call_next(request)
            # Anonymous: the public view. Presenting credentials means they must be valid,
            # though, rather than silently falling back to the public view.
            if not authorization:
                request.state.public_view = True
                return await call_next(request)
        try:
            # Key fetching does blocking network I/O, so keep it off the event loop.
            email = await run_in_threadpool(authenticate, authorization, self.verify_token, self.admin_emails)
        except AuthError as err:
            return JSONResponse(
                status_code=err.status, content={"error": {"code": err.code, "message": err.message}}
            )
        request.state.admin_email = email
        return await call_next(request)


def auth_middleware_options(google_client_id: str, admin_emails: list, development: bool) -> Optional[dict]:
    """Keyword arguments for AdminAuthMiddleware, or None when auth is off. Auth may only be off
    in development: production refuses to start rather than serving an open API."""
    if google_client_id and admin_emails:
        return {"verify_token": google_verifier(google_client_id), "admin_emails": admin_emails}
    if not development:
        raise RuntimeError(
            "Admin auth is not configured: set ZJOURNAL_GOOGLE_CLIENT_ID and ZJOURNAL_ADMIN_EMAILS "
            "before running in production (or ZJOURNAL_ENV=development for local use)."
        )
    logger.warning(
        "Admin auth is DISABLED (ZJOURNAL_ENV=development, ZJOURNAL_GOOGLE_CLIENT_ID / "
        "ZJOURNAL_ADMIN_EMAILS not set) — every API write is open."
    )
    return None
