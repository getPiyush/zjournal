import { screen } from "@testing-library/react";

jest.mock("./datastore/actions/JournalActions", () => ({
  ...jest.requireActual("./datastore/actions/JournalActions"),
  getJournalFromDB: jest.fn(),
}));
jest.mock("./datastore/actions/ArticleActions", () => ({
  getArticlesByIds: jest.fn(),
  getArticlesBycategory: jest.fn(),
}));

import AppRoot from "./AppRoot";
import { renderWithProviders } from "./testUtils/renderWithProviders";

describe("AppRoot", () => {
  test("redirects / to the web home page", async () => {
    renderWithProviders(<AppRoot />, { route: "/" });
    expect(await screen.findByRole("link", { name: "Home" })).toBeInTheDocument();
  });

  test("redirects /admin to the admin categories page", async () => {
    renderWithProviders(<AppRoot />, { route: "/admin" });
    expect(
      await screen.findByRole("heading", { name: "Categories" })
    ).toBeInTheDocument();
  });

  test("renders the admin app under /admin/*", async () => {
    renderWithProviders(<AppRoot />, { route: "/admin/templates" });
    expect(
      await screen.findByRole("heading", { name: "Edit Home Page Template" })
    ).toBeInTheDocument();
  });

  test("renders the web app under /web/*", async () => {
    renderWithProviders(<AppRoot />, { route: "/web/contactus" });
    expect(await screen.findByLabelText("Full Name")).toBeInTheDocument();
  });
});
