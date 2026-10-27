import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Articles from "./Articles";
import { emptyArticleFilters } from "./articleFilters";

const sampleArticles = [
  {
    id: "article-001",
    author: "Mina",
    title: "Shipping with confidence",
    createdAt: new Date("2024-04-20T09:00:00Z"),
    updatedAt: new Date("2024-04-21T12:30:00Z"),
    categryId: "Product",
    origin: "server" as const,
    published: true,
    deleteFlag: false,
    content: [],
  },
];

const twoArticles = [
  sampleArticles[0],
  {
    id: "article-002",
    author: "Jules",
    title: "Designing for the edges",
    createdAt: new Date("2024-01-02T09:00:00Z"),
    updatedAt: new Date("2024-01-02T09:00:00Z"),
    categryId: "Design",
    origin: "server" as const,
    published: true,
    deleteFlag: false,
    content: [],
  },
];

describe("Articles", () => {
  test("renders the title and each article preview on success", () => {
    render(<Articles title="Product" status="success" articles={sampleArticles} />);

    expect(screen.getByRole("heading", { name: /Product Articles/ })).toBeInTheDocument();
    expect(screen.getByText("Shipping with confidence")).toBeInTheDocument();
  });

  test("filters articles by title using the search box", async () => {
    const user = userEvent.setup();
    render(<Articles title="Product" status="success" articles={twoArticles} />);

    await user.type(screen.getByRole("searchbox", { name: "Search articles" }), "edges");

    // The match is highlighted, so the title is split across a <mark>.
    expect(screen.getByRole("link", { name: "Designing for the edges" })).toBeInTheDocument();
    expect(screen.queryByText("Shipping with confidence")).toBeNull();
  });

  test("shows a message when no article matches the search", async () => {
    const user = userEvent.setup();
    render(<Articles title="Product" status="success" articles={twoArticles} />);

    await user.type(screen.getByRole("searchbox", { name: "Search articles" }), "nothing matches this");

    expect(screen.getByText("No articles match your search or filters.")).toBeInTheDocument();
  });

  test("sorts articles by title when Title A-Z is selected", async () => {
    const user = userEvent.setup();
    render(<Articles title="Product" status="success" articles={twoArticles} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Sort articles" }), "title-asc");

    const titles = screen.getAllByRole("heading", { level: 5 }).map((el) => el.textContent);
    expect(titles).toEqual(["Designing for the edges", "Shipping with confidence"]);
  });

  test("shows a loading page while loading", () => {
    render(<Articles title="Product" status="loading" articles={[]} />);
    expect(screen.getByTestId("loading-page")).toBeInTheDocument();
  });

  test("shows the not-found page on error", () => {
    render(
      <MemoryRouter>
        <Articles title="Product" status="error" articles={[]} />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  });

  test("shows the not-found page when there are no articles", () => {
    render(
      <MemoryRouter>
        <Articles title="Product" status="success" articles={[]} />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  });

  describe("server-side search", () => {
    const state = { filters: emptyArticleFilters, sortBy: "newest" as const, page: 1 };
    const renderServer = (props: Partial<React.ComponentProps<typeof Articles>> = {}, search = {}) => {
      const onChange = jest.fn();
      // A router, for the not-found page's links.
      const view = render(
        <MemoryRouter>
          <Articles
            title="All"
            status="success"
            articles={twoArticles}
            search={{ state, onChange, total: 45, pageSize: 20, ...search }}
            {...props}
          />
        </MemoryRouter>
      );
      return { onChange, ...view };
    };

    test("shows the given page as-is, with a pager for the total", () => {
      renderServer();
      expect(screen.getAllByRole("link", { name: /Shipping|Designing/ })).toHaveLength(2);
      expect(screen.getByRole("button", { name: "Page 3" })).toBeInTheDocument();
    });

    test("reports searches and sorting from the first page, and page changes as they are", async () => {
      const { onChange } = renderServer({}, { state: { ...state, page: 2 } });

      await userEvent.type(screen.getByRole("searchbox", { name: "Search articles" }), "x");
      expect(onChange).toHaveBeenLastCalledWith({ filters: { ...emptyArticleFilters, search: "x" }, sortBy: "newest", page: 1 });

      await userEvent.selectOptions(screen.getByRole("combobox", { name: "Sort articles" }), "oldest");
      expect(onChange).toHaveBeenLastCalledWith({ filters: emptyArticleFilters, sortBy: "oldest", page: 1 });

      await userEvent.click(screen.getByRole("button", { name: "Page 3" }));
      expect(onChange).toHaveBeenLastCalledWith({ ...state, page: 3 });
    });

    test("offers a page size only when the caller handles it", async () => {
      const { unmount } = renderServer();
      expect(screen.queryByRole("combobox", { name: "Articles per page" })).toBeNull();
      unmount();

      const onPageSizeChange = jest.fn();
      renderServer({}, { pageSizeOptions: [10, 20, 50], onPageSizeChange });
      const select = screen.getByRole("combobox", { name: "Articles per page" });
      expect(select).toHaveValue("20");
      await userEvent.selectOptions(select, "50");
      expect(onPageSizeChange).toHaveBeenCalledWith(50);
    });

    test("lays the tiles out by size, and offers a choice only when the caller handles it", async () => {
      const { container, unmount } = renderServer();
      expect(screen.queryByRole("combobox", { name: "Tile size" })).toBeNull();
      expect(container.querySelectorAll(".col-md-6:not(.col-lg-4)")).toHaveLength(2);
      unmount();

      const onTileSizeChange = jest.fn();
      const view = renderServer({ tileSize: "large", onTileSizeChange });
      expect(view.container.querySelectorAll(".col-12")).toHaveLength(2);
      const select = screen.getByRole("combobox", { name: "Tile size" });
      expect(select).toHaveValue("large");
      await userEvent.selectOptions(select, "small");
      expect(onTileSizeChange).toHaveBeenCalledWith("small");
    });

    test("keeps the search box on screen while the next search loads", () => {
      renderServer(
        { status: "loading" },
        { state: { ...state, filters: { ...emptyArticleFilters, search: "edg" } } }
      );
      expect(screen.getByRole("searchbox", { name: "Search articles" })).toHaveValue("edg");
      expect(screen.getByRole("status")).toHaveTextContent("45 articles found");
    });

    test("tells an empty search apart from an empty category", () => {
      const { unmount } = renderServer(
        { articles: [] },
        { total: 0, state: { ...state, filters: { ...emptyArticleFilters, search: "zzz" } } }
      );
      expect(screen.getByText("No articles match your search or filters.")).toBeInTheDocument();
      unmount();

      renderServer({ articles: [] }, { total: 0 });
      expect(screen.queryByRole("searchbox")).toBeNull();
      expect(screen.queryByText("No articles match your search or filters.")).toBeNull();
    });

    test("can hide the date filter", async () => {
      renderServer({}, { showDateFilter: false });
      expect(screen.queryByRole("button", { name: "Filters" })).toBeNull();
    });

    test("highlights the searched words", () => {
      const { container } = renderServer({}, { state: { ...state, filters: { ...emptyArticleFilters, search: "edges" } } });
      expect(container.querySelector("mark")).toHaveTextContent("edges");
    });
  });
});
