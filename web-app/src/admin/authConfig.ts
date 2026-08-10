// Placeholder for the future Google OAuth admin gate.
// Currently unused — /admin has no login gate (see src/admin/index.tsx).
// When wiring up real OAuth: check the signed-in Google account's email
// against allowedEmails (server-side, via ID-token verification) before
// granting access to the admin panel.
export const authConfig = {
  googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID ?? "",
  allowedEmails: (process.env.REACT_APP_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean),
};
