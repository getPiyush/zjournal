import { screen } from "@testing-library/react";

jest.mock("../datastore/actions/ArticleActions", () => ({
  getArticlesBycategory: jest.fn(),
  getArticlesByBlogDate: jest.fn(),
}));

import ArticlesRouteView from "./ArticlesRouteView";
import { renderWithProviders } from "../testUtils/renderWithProviders";
import {
  getArticlesBycategory,
  getArticlesByBlogDate,
} from "../datastore/actions/ArticleActions";

describe("ArticlesRouteView", () => {
  test("fetches articles by category and sets the page title", () => {
    renderWithProviders(<ArticlesRouteView />, {
      route: "/web/articles?categoryId=Engineering",
    });

    expect(getArticlesBycategory).toHaveBeenCalledWith(
      expect.any(Function),
      "Engineering",
      true
    );
    expect(document.title).toContain("Engineering");
  });

  test("categoryId=All fetches all articles instead of filtering by a literal 'All' category", () => {
    renderWithProviders(<ArticlesRouteView />, {
      route: "/web/articles?categoryId=All",
    });

    expect(getArticlesBycategory).toHaveBeenCalledWith(
      expect.any(Function),
      "",
      true
    );
    expect(document.title).toContain("All");
  });

  test("fetches articles by blog date", () => {
    renderWithProviders(<ArticlesRouteView />, {
      route: "/web/articles?blogdate=2024-06",
    });

    expect(getArticlesByBlogDate).toHaveBeenCalledWith(
      expect.any(Function),
      "2024-06",
      true
    );
    expect(screen.getByRole("heading", { name: /June 2024 Articles/ })).toBeInTheDocument();
  });
});
