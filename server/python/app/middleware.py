"""Reproduces the envelope handling from server/php/index.php (and com.zjournal.filter
.EncryptionFilter on the Java side): every request/response body is wrapped as
{"ezjData": "<base64 envelope>"} and encrypted via app.crypto, which implements the matching
PBKDF2/AES-256-CBC scheme from server/php/crypto.php.
"""

import json

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app import config, crypto

_UNENCRYPTED_PATHS = {"/", "/health"}


class EncryptionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if not config.ENCRYPTION_ENABLED or request.url.path in _UNENCRYPTED_PATHS:
            return await call_next(request)

        raw_body = await request.body()
        if raw_body:
            envelope = json.loads(raw_body)
            ezj_data = envelope.get("ezjData")
            if ezj_data is not None:
                decrypted = crypto.decrypt(ezj_data)
                request._body = decrypted.encode("utf-8")

        response = await call_next(request)

        response_body = b""
        async for chunk in response.body_iterator:
            response_body += chunk

        plain_json = response_body.decode("utf-8") if response_body else "null"
        encrypted = crypto.encrypt(plain_json)
        out = json.dumps({"ezjData": encrypted}).encode("utf-8")

        return Response(
            content=out,
            status_code=response.status_code,
            media_type="application/json",
        )
