// Google sign-in for the admin panel (see Login.tsx). The client-side email check is only for
// a friendlier error message: the API (server/node/auth.js) verifies the ID token and enforces
// its own allowlist (ZJOURNAL_ADMIN_EMAILS) on every protected request.
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID ?? "";

const allowedEmails = (process.env.REACT_APP_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const authConfig = {
  googleClientId,
  allowedEmails,
  // Mirrors the server: sign-in may only be skipped in development/test builds with no client id.
  // A production build always requires it, and shows a "not configured" error if the id is missing.
  required: googleClientId !== "" || process.env.NODE_ENV === "production",
};

// With no client-side allowlist, defer entirely to the server.
export const isAllowedEmail = (email: string) =>
  allowedEmails.length === 0 || allowedEmails.includes(email.toLowerCase());
