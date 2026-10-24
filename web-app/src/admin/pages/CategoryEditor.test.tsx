import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../../datastore/actions/ArticleActions", () => ({
  getArticlesBycategory: jest.fn(),
}));

import CategoryEditor from "./CategoryEditor";
import { JournalLoader } from "../../testUtils/JournalLoader";
import { renderWithProviders } from "../../testUtils/renderWithProviders";
import { getArticlesBycategory } from "../../datastore/actions/ArticleActions";

describe("CategoryEditor", () => {
  test("fetches all categories by default and shows the article count", () => {
    renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });

    expect(getArticlesBycategory).toHaveBeenCalledWith(expect.any(Function), "");
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByText(/Articles$/)).toBeInTheDocument();
  });

  test("renders search and sort controls", () => {
    renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });

    expect(screen.getByRole("searchbox", { name: "Search articles" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Sort articles" })).toBeInTheDocument();
  });

  test("filters the visible articles and count when searching", async () => {
    const sampleArticles = [
      {
        id: "1",
        author: "Mina",
        title: "Shipping with confidence",
        createdAt: new Date("2024-04-20T09:00:00Z"),
        updatedAt: new Date("2024-04-20T09:00:00Z"),
        categryId: "Product",
        origin: "server" as const,
        published: true,
        deleteFlag: false,
        content: [],
      },
      {
        id: "2",
        author: "Jules",
        title: "Designing for the edges",
        createdAt: new Date("2024-05-02T09:00:00Z"),
        updatedAt: new Date("2024-05-02T09:00:00Z"),
        categryId: "Design",
        origin: "server" as const,
        published: true,
        deleteFlag: false,
        content: [],
      },
    ];
    (getArticlesBycategory as jest.Mock).mockImplementation((dispatch) =>
      dispatch({ type: "get_article_by_category", value: sampleArticles })
    );

    const user = userEvent.setup();
    renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });

    await user.type(screen.getByRole("searchbox", { name: "Search articles" }), "edges");

    expect(screen.getByText("1 Articles")).toBeInTheDocument();
    expect(screen.queryByText("Shipping with confidence")).toBeNull();
  });

  test("choosing a category fetches its articles without touching the URL", async () => {
    const { router } = renderWithProviders(
      <>
        <JournalLoader journal={{ categories: ["All", "Art"] }} />
        <CategoryEditor />
      </>,
      { route: "/admin/categories" }
    );

    await userEvent.click(screen.getByRole("button", { name: "Art" }));

    expect(getArticlesBycategory).toHaveBeenLastCalledWith(expect.any(Function), "Art");
    expect(router.state.location.pathname + router.state.location.hash).toBe("/admin/categories");
  });

  test("New article opens an empty editor", async () => {
    const { router } = renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });

    await userEvent.click(screen.getByRole("button", { name: "New article" }));

    expect(router.state.location.pathname).toBe("/admin/editor");
    expect(router.state.location.search).toBe("");
  });
});
