import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("../datastore/actions/ArticleActions", () => ({
  getArticleById: jest.fn(),
  getArticlesBycategory: jest.fn(),
  getArticlesToDelete: jest.fn(),
  addArticleToDB: jest.fn(),
  updateArticleinDB: jest.fn(),
  deleteArticleinDB: jest.fn(),
}));
jest.mock("../datastore/actions/ContactActions", () => ({
  getContactsDB: jest.fn(),
}));
jest.mock("../datastore/actions/JournalActions", () => ({
  ...jest.requireActual("../datastore/actions/JournalActions"),
  updateJournalinDB: jest.fn(),
}));
jest.mock("../datastore/actions/QnAActions", () => ({
  getQnAsDB: jest.fn(),
  addQnAToDB: jest.fn(),
  deleteQnAFromDB: jest.fn(),
}));

import AdminContainer from "./AdminContainer";
import { getArticleById } from "../datastore/actions/ArticleActions";
import { AllProviders } from "../testUtils/renderWithProviders";

// AdminContainer's own <Routes> uses paths relative to an "admin/*" ancestor
// route (provided by AppRoot in the real app), so it must be mounted the same way here.
function renderAdminContainer(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AllProviders>
        <Routes>
          <Route path="admin/*" element={<AdminContainer />} />
        </Routes>
      </AllProviders>
    </MemoryRouter>
  );
}

describe("AdminContainer", () => {
  test("defaults to the category editor", () => {
    renderAdminContainer("/admin/categories");
    expect(screen.getByRole("heading", { name: "Categories" })).toBeInTheDocument();
  });

  test("routes to the contacts page", () => {
    renderAdminContainer("/admin/contacts");
    expect(screen.getByRole("heading", { name: "Contacts" })).toBeInTheDocument();
  });

  test("routes to the purge page", () => {
    renderAdminContainer("/admin/purge");
    expect(
      screen.getByRole("heading", { name: /Articles to be Purged/ })
    ).toBeInTheDocument();
  });

  test("falls back to the category editor for an unmatched path", () => {
    renderAdminContainer("/admin/does-not-exist");
    expect(screen.getByRole("heading", { name: "Categories" })).toBeInTheDocument();
  });

  test("loads the article from the id query param on the editor route", () => {
    renderAdminContainer("/admin/editor?id=c9q7hr9vxguf03a");
    expect(getArticleById).toHaveBeenCalledWith(expect.any(Function), "c9q7hr9vxguf03a");
  });

  test("does not fetch an article when the editor route has no id", () => {
    (getArticleById as jest.Mock).mockClear();
    renderAdminContainer("/admin/editor");
    expect(getArticleById).not.toHaveBeenCalled();
  });
});
