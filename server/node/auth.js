// auth.js
// Admin gate for the API: verifies the Google ID token the admin panel sends as
// `Authorization: Bearer <token>` and checks its email against the admin allowlist.
const { OAuth2Client } = require("google-auth-library");

// Everything not listed here needs an admin. Allowlisting (rather than listing what's protected)
// keeps json-server's extra routes — e.g. `GET /db`, which dumps every collection including
// contacts — closed by default.
const PUBLIC_ROUTES = {
  GET: ["articles", "journal", "qna"],
  HEAD: ["articles", "journal", "qna"],
  // The public "Contact us" form.
  POST: ["contacts"],
};

// Express routes case-insensitively and tolerates repeated slashes, so normalize the same way
// before deciding which collection a request targets.
const collectionOf = (path) => path.toLowerCase().split("/").filter(Boolean)[0] ?? "";

// Public reads where an admin sees more. Anonymous callers get only published, non-flagged
// articles, and a journal without the editor's working copy (currentArticle) or the legacy
// adminDetails credential hashes.
const ADMIN_AWARE_READS = new Set(["articles", "journal"]);
const JOURNAL_PRIVATE_FIELDS = ["currentArticle", "adminDetails"];

const isTrue = (value) => value === true || value === 1 || value === "true" || value === "1";

const isPublicArticle = (article) =>
  article !== null && typeof article === "object" && isTrue(article.published) && !isTrue(article.deleteFlag);

const publicJournal = (journal) => {
  if (journal === null || typeof journal !== "object") return journal;
  const copy = { ...journal };
  JOURNAL_PRIVATE_FIELDS.forEach((field) => delete copy[field]);
  return copy;
};

// Returns { data } to send, or { notFound: true } for a single article anonymous callers can't see.
const publicView = (path, data) => {
  const collection = collectionOf(path);
  if (collection === "journal") return { data: publicJournal(data) };
  if (collection === "articles") {
    if (Array.isArray(data)) return { data: data.filter(isPublicArticle) };
    return isPublicArticle(data) ? { data } : { notFound: true };
  }
  return { data };
};

const requiresAdmin = (method, path) => {
  if (method === "OPTIONS") return false;
  return !(PUBLIC_ROUTES[method] ?? []).includes(collectionOf(path));
};

const reject = (res, status, code, message) => {
  res.status(status).json({ error: { code, message } });
};

const createGoogleVerifier = (clientId) => {
  const client = new OAuth2Client(clientId);
  return async (idToken) => {
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    return ticket.getPayload();
  };
};

const createAuthMiddleware = ({ adminEmails, verifyToken }) => {
  const allowed = new Set(adminEmails.map((email) => email.toLowerCase()));

  return async (req, res, next) => {
    const authorization = req.get("authorization");
    if (!requiresAdmin(req.method, req.path)) {
      if (!["GET", "HEAD"].includes(req.method) || !ADMIN_AWARE_READS.has(collectionOf(req.path))) {
        return next();
      }
      // Anonymous: the public view. Presenting credentials means they must be valid, though,
      // rather than silently falling back to the public view.
      if (!authorization) {
        req.publicView = true;
        return next();
      }
    }

    const match = /^Bearer\s+(\S+)$/i.exec(authorization || "");
    if (!match) {
      return reject(res, 401, "UNAUTHORIZED", "Admin sign-in required");
    }

    let payload;
    try {
      payload = await verifyToken(match[1]);
    } catch (err) {
      return reject(res, 401, "UNAUTHORIZED", "Invalid or expired sign-in token");
    }

    const email = (payload?.email || "").toLowerCase();
    if (!payload?.email_verified || !allowed.has(email)) {
      return reject(res, 403, "FORBIDDEN", "This account is not an admin");
    }

    req.adminEmail = email;
    next();
  };
};

// Returns the middleware, or null when auth is off. Auth is only allowed to be off in
// development: a production server without auth config refuses to start rather than serving
// an open API.
const buildAuthMiddleware = ({ googleClientId, adminEmails }, { production, log = console }) => {
  if (googleClientId && adminEmails.length > 0) {
    return createAuthMiddleware({ adminEmails, verifyToken: createGoogleVerifier(googleClientId) });
  }
  if (production) {
    throw new Error(
      "Admin auth is not configured: set ZJOURNAL_GOOGLE_CLIENT_ID and ZJOURNAL_ADMIN_EMAILS " +
        "before running in production."
    );
  }
  log.warn(
    "⚠️  Admin auth is DISABLED (development mode, ZJOURNAL_GOOGLE_CLIENT_ID / " +
      "ZJOURNAL_ADMIN_EMAILS not set) — every API write is open."
  );
  return null;
};

module.exports = {
  requiresAdmin,
  isPublicArticle,
  publicView,
  createAuthMiddleware,
  buildAuthMiddleware,
};
