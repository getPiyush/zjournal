import { screen } from "@testing-library/react";

jest.mock("../datastore/actions/JournalActions", () => ({
  ...jest.requireActual("../datastore/actions/JournalActions"),
  getJournalFromDB: jest.fn(),
}));
jest.mock("../datastore/actions/ArticleActions", () => ({
  getArticlesBycategory: jest.fn(),
}));

import Admin from "./index";
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
    expect(screen.getByText(/Copyright 2022/)).toBeInTheDocument();
  });
});
