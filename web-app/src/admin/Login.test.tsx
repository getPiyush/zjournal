import { act, render, screen } from "@testing-library/react";
import { fakeIdToken } from "../testUtils/fakeIdToken";
import { getSession } from "../datastore/authSession";

let mockClientId = "client-id.apps.googleusercontent.com";
jest.mock("./authConfig", () => ({
  get authConfig() {
    return { googleClientId: mockClientId, allowedEmails: ["admin@example.com"], required: true };
  },
  isAllowedEmail: (email: string) => email === "admin@example.com",
}));

import Login from "./Login";

describe("admin Login", () => {
  let credentialCallback: (response: { credential: string }) => void;
  let gis: Record<"initialize" | "renderButton" | "disableAutoSelect", jest.Mock>;

  // Built per test: CRA's jest config resets mock implementations before each one.
  beforeEach(() => {
    mockClientId = "client-id.apps.googleusercontent.com";
    gis = {
      initialize: jest.fn((config) => (credentialCallback = config.callback)),
      renderButton: jest.fn(),
      disableAutoSelect: jest.fn(),
    };
    window.google = { accounts: { id: gis } };
  });

  afterEach(() => {
    delete window.google;
    sessionStorage.clear();
  });

  const renderLogin = async (props: Partial<Parameters<typeof Login>[0]> = {}) => {
    const onLogin = jest.fn();
    render(<Login onLogin={onLogin} {...props} />);
    // let the (already loaded) Google script promise resolve
    await act(async () => {});
    return onLogin;
  };

  test("initializes Google sign-in with the configured client id and renders its button", async () => {
    await renderLogin();

    expect(screen.getByRole("heading", { name: "Admin Sign-in" })).toBeInTheDocument();
    expect(gis.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "client-id.apps.googleusercontent.com" })
    );
    expect(gis.renderButton).toHaveBeenCalledTimes(1);
  });

  test("stores the session and calls onLogin for an allowed admin", async () => {
    const onLogin = await renderLogin();

    act(() => credentialCallback({ credential: fakeIdToken() }));

    expect(onLogin).toHaveBeenCalledWith(expect.objectContaining({ email: "admin@example.com" }));
    expect(getSession()?.email).toBe("admin@example.com");
  });

  test("rejects an account that isn't on the allowlist", async () => {
    const onLogin = await renderLogin();

    act(() => credentialCallback({ credential: fakeIdToken({ email: "someone@example.com" }) }));

    expect(onLogin).not.toHaveBeenCalled();
    expect(getSession()).toBeNull();
    expect(gis.disableAutoSelect).toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("someone@example.com isn't an admin account.");
  });

  test("rejects an unverified Google email", async () => {
    const onLogin = await renderLogin();

    act(() => credentialCallback({ credential: fakeIdToken({ email_verified: false }) }));

    expect(onLogin).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Google sign-in failed");
  });

  test("shows the sign-out reason it was given", async () => {
    await renderLogin({ message: "Your session has expired. Please sign in again." });

    expect(screen.getByRole("alert")).toHaveTextContent("Your session has expired");
  });

  test("explains when no client id is configured", async () => {
    mockClientId = "";
    await renderLogin();

    expect(gis.initialize).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("REACT_APP_GOOGLE_CLIENT_ID");
  });
});
