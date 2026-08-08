import { screen } from "@testing-library/react";

jest.mock("../datastore/actions/ArticleActions", () => ({
  getArticleById: jest.fn(),
}));

import ArticleRouteView from "./ArticleRouteView";
import { renderWithProviders } from "../testUtils/renderWithProviders";
import { getArticleById } from "../datastore/actions/ArticleActions";

describe("ArticleRouteView", () => {
  test("fetches the article by id for a /web/article route", () => {
    renderWithProviders(<ArticleRouteView />, { route: "/web/article/abc123" });

    expect(getArticleById).toHaveBeenCalledWith(expect.any(Function), "abc123");
  });

  test("does not fetch and shows the currently loaded article for other routes", () => {
    renderWithProviders(<ArticleRouteView />, { route: "/admin/editor" });

    expect(getArticleById).not.toHaveBeenCalled();
    // The default (empty) article renders the not-found state.
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  });
});
