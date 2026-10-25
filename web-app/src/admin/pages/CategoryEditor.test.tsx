import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../../datastore/actions/ArticleActions", () => ({
  getArticlesBycategory: jest.fn(),
}));

import CategoryEditor, { DEFAULT_PAGE_SIZE } from "./CategoryEditor";
import { JournalLoader } from "../../testUtils/JournalLoader";
import { renderWithProviders } from "../../testUtils/renderWithProviders";
import { getArticlesBycategory } from "../../datastore/actions/ArticleActions";

const makeArticles = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    author: "Mina",
    // Zero-padded so "Title A-Z" order matches the numbering.
    title: `Article ${String(i + 1).padStart(2, "0")}`,
    createdAt: new Date(2024, 0, i + 1),
    updatedAt: new Date(2024, 0, i + 1),
    categryId: "Product",
    origin: "server" as const,
    published: true,
    deleteFlag: false,
    content: [],
  }));

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

  describe("pagination", () => {
    const total = DEFAULT_PAGE_SIZE * 2 + 3;

    beforeEach(() => {
      (getArticlesBycategory as jest.Mock).mockImplementation((dispatch) =>
        dispatch({ type: "get_article_by_category", value: makeArticles(total) })
      );
    });

    test("shows one page of articles but counts them all", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });
      await user.selectOptions(screen.getByRole("combobox", { name: "Sort articles" }), "title-asc");

      expect(screen.getByText(`${total} Articles`)).toBeInTheDocument();
      expect(screen.getByText("Article 01")).toBeInTheDocument();
      expect(screen.getByText(`Article ${DEFAULT_PAGE_SIZE}`)).toBeInTheDocument();
      expect(screen.queryByText(`Article ${DEFAULT_PAGE_SIZE + 1}`)).toBeNull();
      expect(screen.getByRole("button", { name: "Page 3" })).toBeInTheDocument();
    });

    test("moves between pages", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });
      await user.selectOptions(screen.getByRole("combobox", { name: "Sort articles" }), "title-asc");

      await user.click(screen.getByRole("button", { name: "Page 3" }));

      expect(screen.getByText(`Article ${total}`)).toBeInTheDocument();
      expect(screen.queryByText("Article 01")).toBeNull();
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    });

    test("searching returns to the first page", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });

      await user.click(screen.getByRole("button", { name: "Next" }));
      expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");

      await user.type(screen.getByRole("searchbox", { name: "Search articles" }), "Article");

      expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    });

    test("hides the pager when everything fits on one page", () => {
      (getArticlesBycategory as jest.Mock).mockImplementation((dispatch) =>
        dispatch({ type: "get_article_by_category", value: makeArticles(3) })
      );
      renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });

      expect(screen.queryByRole("navigation", { name: "Pagination" })).toBeNull();
    });

    test("changing items per page resizes the page and returns to page one", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });
      await user.selectOptions(screen.getByRole("combobox", { name: "Sort articles" }), "title-asc");
      await user.click(screen.getByRole("button", { name: "Next" }));

      await user.selectOptions(screen.getByRole("combobox", { name: "Per page" }), "5");

      expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
      expect(screen.getByText("Article 05")).toBeInTheDocument();
      expect(screen.queryByText("Article 06")).toBeNull();
    });

    test("offers 5, 10, 20, 40 and 50 items per page", () => {
      renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });

      const options = screen.getAllByRole("option").filter((o) => o.closest("#pageSize"));
      expect(options.map((o) => o.textContent)).toEqual(["5", "10", "20", "40", "50"]);
      expect(screen.getByRole("combobox", { name: "Per page" })).toHaveValue(String(DEFAULT_PAGE_SIZE));
    });
  });

  test("switches tile size between small, medium and large", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });
    const grid = screen.getByTestId("article-grid");

    expect(screen.getByRole("button", { name: "Small" })).toHaveAttribute("aria-pressed", "true");
    expect(grid).toHaveClass("row-cols-xl-4");

    await user.click(screen.getByRole("button", { name: "Medium" }));
    expect(grid).toHaveClass("row-cols-md-2");
    expect(grid).not.toHaveClass("row-cols-xl-4");
    expect(screen.getByRole("button", { name: "Medium" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Large" }));
    expect(grid).toHaveClass("row-cols-1");
    expect(grid).not.toHaveClass("row-cols-md-2");
  });

  describe("search and filters", () => {
    // 1-12 January 2024; even ids are drafts.
    beforeEach(() => {
      const articles = makeArticles(12).map((a) => ({ ...a, published: Number(a.id) % 2 === 1 }));
      (getArticlesBycategory as jest.Mock).mockImplementation((dispatch) =>
        dispatch({ type: "get_article_by_category", value: articles })
      );
    });

    test("finds an article by its ID", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });

      await user.selectOptions(screen.getByRole("combobox", { name: "Search in" }), "id");
      await user.type(screen.getByRole("searchbox", { name: "Search articles" }), "11");

      expect(screen.getByText("1 Articles")).toBeInTheDocument();
      expect(screen.getByText("Article 11")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("Showing 1 of 12 articles");
    });

    test("narrows to a date range and to drafts", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });

      await user.click(screen.getByRole("button", { name: "Filters" }));
      await user.type(screen.getByLabelText("From"), "2024-01-03");
      await user.type(screen.getByLabelText("To"), "2024-01-06");
      expect(screen.getByText("4 Articles")).toBeInTheDocument();

      await user.selectOptions(screen.getByLabelText("Status"), "draft");
      expect(screen.getByText("2 Articles")).toBeInTheDocument();
      expect(screen.getByText("Article 04")).toBeInTheDocument();
      expect(screen.getByText("Article 06")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Clear filters" }));
      expect(screen.getByText("12 Articles")).toBeInTheDocument();
    });

    test("changing a filter returns to the first page", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });
      await user.click(screen.getByRole("button", { name: "Next" }));

      expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");

      // Still two pages' worth, so only the reset can move us back.
      await user.click(screen.getByRole("button", { name: "Filters" }));
      await user.type(screen.getByLabelText("From"), "2024-01-02");

      expect(screen.getByText("11 Articles")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    });
  });
});
