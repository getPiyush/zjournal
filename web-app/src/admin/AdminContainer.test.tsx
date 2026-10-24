import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";

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
import { renderWithProviders } from "../testUtils/renderWithProviders";
import { JournalLoader } from "../testUtils/JournalLoader";
import userEvent from "@testing-library/user-event";

// AdminContainer's own <Routes> uses paths relative to an "admin/*" ancestor
// route (provided by AppRoot in the real app), so it must be mounted the same way here.
function renderAdminContainer(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="admin/*" element={<AdminContainer />} />
    </Routes>,
    { route }
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

  test("New article replaces the article that was open in the editor with a blank one", async () => {
    const existing = {
      id: "a1",
      author: "Someone",
      title: "Existing article",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      categryId: "Art",
      content: [],
      origin: "server" as const,
      published: true,
      deleteFlag: false,
    };
    renderWithProviders(
      <>
        <JournalLoader journal={{ currentArticle: existing }} />
        <Routes>
          <Route path="admin/*" element={<AdminContainer />} />
        </Routes>
      </>,
      { route: "/admin/categories" }
    );

    await userEvent.click(screen.getByRole("button", { name: "New article" }));

    expect(screen.getByPlaceholderText("This is a sample title")).toHaveValue("");
    expect(screen.getByText("Creating New", { exact: false })).toBeInTheDocument();
  });
});
