import { clearSession, getAuthToken, getSession, saveSession, sessionFromToken } from "./authSession";
import { fakeIdToken } from "../testUtils/fakeIdToken";

describe("authSession", () => {
  afterEach(() => sessionStorage.clear());

  test("decodes the email, verification flag and expiry from an ID token", () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const session = sessionFromToken(fakeIdToken({ email: "Admin@Example.com", exp, name: "Ada" }));

    expect(session).toMatchObject({ email: "admin@example.com", emailVerified: true, name: "Ada" });
    // expires a minute early so requests don't race the real expiry
    expect(session!.expiresAt).toBe(exp * 1000 - 60 * 1000);
  });

  test("returns null for a malformed token", () => {
    expect(sessionFromToken("not-a-jwt")).toBeNull();
    expect(sessionFromToken("a.b.c")).toBeNull();
  });

  test("saves, reads back and clears the session", () => {
    const token = fakeIdToken();
    saveSession(token);

    expect(getSession()?.email).toBe("admin@example.com");
    expect(getAuthToken()).toBe(token);

    clearSession();
    expect(getSession()).toBeNull();
  });

  test("drops an expired token instead of returning it", () => {
    saveSession(fakeIdToken({ exp: Math.floor(Date.now() / 1000) + 30 }));

    expect(getSession()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });
});
