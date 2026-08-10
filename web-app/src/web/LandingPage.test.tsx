import { screen } from "@testing-library/react";

jest.mock("../datastore/actions/JournalActions", () => ({
  ...jest.requireActual("../datastore/actions/JournalActions"),
  getJournalFromDB: jest.fn(),
}));
jest.mock("../datastore/actions/ArticleActions", () => ({
  getArticlesByIds: jest.fn(),
}));

import LandingPage from "./LandingPage";
import { renderWithProviders } from "../testUtils/renderWithProviders";
import { getJournalFromDB } from "../datastore/actions/JournalActions";

describe("LandingPage", () => {
  test("fetches the journal on mount and renders the page chrome", () => {
    renderWithProviders(<LandingPage />, { route: "/web/home" });

    expect(getJournalFromDB).toHaveBeenCalledWith(expect.any(Function));
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByText(/Copyright 2022/)).toBeInTheDocument();
  });
});
