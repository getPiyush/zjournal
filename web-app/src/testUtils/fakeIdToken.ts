// Builds an unsigned JWT shaped like a Google ID token. The client only decodes the payload
// (the server is what verifies signatures), so this is all the frontend tests need.
const base64Url = (value: object) =>
  btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export const fakeIdToken = (payload: Record<string, unknown> = {}) =>
  [
    base64Url({ alg: "RS256", typ: "JWT" }),
    base64Url({
      email: "admin@example.com",
      email_verified: true,
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...payload,
    }),
    "signature",
  ].join(".");
