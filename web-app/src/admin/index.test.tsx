import { act, screen } from "@testing-library/react";

jest.mock("../datastore/actions/JournalActions", () => ({
  ...jest.requireActual("../datastore/actions/JournalActions"),
  getJournalFromDB: jest.fn(),
}));
jest.mock("../datastore/actions/ArticleActions", () => ({
  getArticlesBycategory: jest.fn(),
}));

let mockAuthRequired = false;
jest.mock("./authConfig", () => ({
  get authConfig() {
    return { googleClientId: "client-id", allowedEmails: [], required: mockAuthRequired };
  },
  isAllowedEmail: () => true,
}));
// The real Login loads Google's script; these tests only care which screen is shown.
let mockLogin: ((session: any) => void) | undefined;
jest.mock("./Login", () => ({ message, onLogin }: { message?: string; onLogin: (session: any) => void }) => {
  mockLogin = onLogin;
  return (
    <div>
      <h4>Admin Sign-in</h4>
      {message && <p>{message}</p>}
    </div>
  );
});

import Admin from "./index";
import { saveSession, UNAUTHORIZED_EVENT } from "../datastore/authSession";
import { fakeIdToken } from "../testUtils/fakeIdToken";
import { renderWithProviders } from "../testUtils/renderWithProviders";
import { getJournalFromDB } from "../datastore/actions/JournalActions";

describe("Admin", () => {
  test("fetches the journal on mount and sets the document title", () => {
    renderWithProviders(<Admin />, { route: "/admin/categories" });

    expect(getJournalFromDB).toHaveBeenCalledWith(expect.any(Function));
    expect(document.title).toBe("zJournal Admin Panel");
  });

  test("renders the admin header, container and footer", () => {
    renderWithProviders(<Admin />, { route: "/admin/categories" });

    expect(screen.getByRole("link", { name: "Categories" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Categories" })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeInTheDocument();
  });

  describe("when sign-in is required", () => {
    beforeEach(() => (mockAuthRequired = true));
    afterEach(() => {
      mockAuthRequired = false;
      sessionStorage.clear();
    });

    test("shows the sign-in page instead of the panel when signed out", () => {
      renderWithProviders(<Admin />, { route: "/admin/contacts" });

      expect(screen.getByRole("heading", { name: "Admin Sign-in" })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Categories" })).not.toBeInTheDocument();
    });

    test("shows the panel and the admin's email with a stored session", () => {
      saveSession(fakeIdToken({ email: "admin@example.com" }));
      renderWithProviders(<Admin />, { route: "/admin/categories" });

      expect(screen.getByRole("link", { name: "Categories" })).toBeInTheDocument();
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    });

    test("loads the journal again after signing in, to get the admin's full copy", () => {
      renderWithProviders(<Admin />, { route: "/admin/categories" });
      expect(getJournalFromDB).toHaveBeenCalledTimes(1);

      // Sign in the way Login does: store the session, then report it.
      act(() => {
        mockLogin!(saveSession(fakeIdToken())!);
      });

      expect(getJournalFromDB).toHaveBeenCalledTimes(2);
      expect(screen.getByRole("link", { name: "Categories" })).toBeInTheDocument();
    });

    test("returns to sign-in with a reason when the API rejects the token", () => {
      saveSession(fakeIdToken());
      renderWithProviders(<Admin />, { route: "/admin/categories" });

      act(() => {
        window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT, { detail: { status: 401 } }));
      });

      expect(screen.getByRole("heading", { name: "Admin Sign-in" })).toBeInTheDocument();
      expect(screen.getByText(/session has expired/)).toBeInTheDocument();
    });
  });
});
