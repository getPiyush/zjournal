// Holds the admin's Google ID token for this tab. The API (server/node/auth.js) verifies the
// token on every protected request; nothing here is trusted for access control — decoding the
// payload is only for showing who's signed in and knowing when the token expires.

const STORAGE_KEY = "zjournal.admin.idToken";
// Treat tokens as expired slightly early so a request doesn't race the real expiry.
const EXPIRY_SKEW_MS = 60 * 1000;

// Fired on window when the API rejects the stored token (401/403); detail is { status }.
export const UNAUTHORIZED_EVENT = "zjournal:unauthorized";

export type AdminSession = {
  token: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  expiresAt: number;
};

const decodeBase64Url = (input: string) => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
  // Re-encode bytes as %XX so decodeURIComponent turns multi-byte UTF-8 (e.g. names) back into text.
  return decodeURIComponent(
    Array.from(binary, (char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")
  );
};

export const sessionFromToken = (token: string): AdminSession | null => {
  try {
    const payload = JSON.parse(decodeBase64Url(token.split(".")[1]));
    if (typeof payload.email !== "string" || typeof payload.exp !== "number") return null;
    return {
      token,
      email: payload.email.toLowerCase(),
      emailVerified: payload.email_verified === true,
      name: payload.name,
      expiresAt: payload.exp * 1000 - EXPIRY_SKEW_MS,
    };
  } catch {
    return null;
  }
};

export const clearSession = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable (private mode, blocked site data) — nothing to clear
  }
};

export const saveSession = (token: string): AdminSession | null => {
  const session = sessionFromToken(token);
  if (!session) return null;
  try {
    sessionStorage.setItem(STORAGE_KEY, token);
  } catch {
    // storage unavailable — the session still works until the tab reloads
  }
  return session;
};

export const getSession = (): AdminSession | null => {
  let token: string | null = null;
  try {
    token = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  const session = token ? sessionFromToken(token) : null;
  if (!session || session.expiresAt <= Date.now()) {
    if (token) clearSession();
    return null;
  }
  return session;
};

export const getAuthToken = () => getSession()?.token ?? null;
