import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("../datastore/actions/ArticleActions", () => ({
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
});
