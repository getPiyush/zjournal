import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../datastore/actions/ArticleActions", () => ({
  searchArticles: jest.fn(),
}));

import ArticlesRouteView, { PAGE_SIZE, SEARCH_DELAY_MS } from "./ArticlesRouteView";
import { renderWithProviders } from "../testUtils/renderWithProviders";
import { searchArticles } from "../datastore/actions/ArticleActions";

const makeArticles = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `id${i + 1}`,
    author: "Mina",
    title: `Article ${i + 1}`,
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-01T00:00:00",
    categryId: "Product",
    origin: "server" as const,
    published: true,
    deleteFlag: false,
    content: [],
  }));

// Each search answers with one page of `total` matches.
const answerWith = (total: number) =>
  (searchArticles as jest.Mock).mockImplementation((dispatch) =>
    dispatch({ type: "search_articles", value: makeArticles(Math.min(total, PAGE_SIZE)), total })
  );

const lastQuery = () => (searchArticles as jest.Mock).mock.calls.at(-1)[1];

const base = { view: "public", limit: String(PAGE_SIZE), page: "1", sort: "newest" };

describe("ArticlesRouteView", () => {
  beforeEach(() => {
    (searchArticles as jest.Mock).mockReset();
    answerWith(3);
  });

  test("searches a category, publicly, and sets the page title", async () => {
    renderWithProviders(<ArticlesRouteView />, { route: "/web/articles?categoryId=Engineering" });

    await waitFor(() => expect(searchArticles).toHaveBeenCalledTimes(1));
    expect(lastQuery()).toEqual({ ...base, categryId: "Engineering" });
    expect(document.title).toContain("Engineering");
  });

  test("categoryId=All searches every article instead of a literal 'All' category", async () => {
    renderWithProviders(<ArticlesRouteView />, { route: "/web/articles?categoryId=All" });

    await waitFor(() => expect(lastQuery()).toEqual(base));
    expect(document.title).toContain("All");
  });

  test("a month's archive searches that month and doesn't offer a date filter", async () => {
    renderWithProviders(<ArticlesRouteView />, { route: "/web/articles?blogdate=2024-06&from=2020-01-01" });

    await waitFor(() => expect(lastQuery()).toEqual({ ...base, from: "2024-06-01", to: "2024-06-31" }));
    expect(screen.getByRole("heading", { name: /June 2024 Articles/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Filters/ })).toBeNull();
  });

  test("searches an author's articles", async () => {
    renderWithProviders(<ArticlesRouteView />, { route: "/web/articles?authorId=Ada%20Lovelace" });
    await waitFor(() => expect(lastQuery()).toEqual({ ...base, author: "Ada Lovelace" }));
  });

  test("a shared link restores the search, filters, sort and page", async () => {
    answerWith(45);
    renderWithProviders(<ArticlesRouteView />, {
      route: "/web/articles?categoryId=Space&q=mars%20water&in=title&from=2026-01-01&to=2026-03-31&sort=oldest&page=2",
    });

    await waitFor(() =>
      expect(lastQuery()).toEqual({
        ...base,
        categryId: "Space",
        q: "mars water",
        in: "title",
        from: "2026-01-01",
        to: "2026-03-31",
        sort: "oldest",
        page: "2",
      })
    );
    expect(screen.getByRole("searchbox", { name: "Search articles" })).toHaveValue("mars water");
    expect(screen.getByRole("combobox", { name: "Search in" })).toHaveValue("title");
    expect(screen.getByLabelText("From")).toHaveValue("2026-01-01");
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  });

  describe("typing", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    test("writes the search into the URL right away, and searches once typing pauses", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { router } = renderWithProviders(<ArticlesRouteView />, { route: "/web/articles?categoryId=Space" });
      act(() => jest.runOnlyPendingTimers());
      expect(searchArticles).toHaveBeenCalledTimes(1);

      await user.type(screen.getByRole("searchbox", { name: "Search articles" }), "mars");

      expect(router.state.location.search).toBe("?categoryId=Space&q=mars");
      // Typing doesn't pile up history entries.
      expect(router.state.historyAction).toBe("REPLACE");
      expect(searchArticles).toHaveBeenCalledTimes(1);

      act(() => jest.advanceTimersByTime(SEARCH_DELAY_MS));
      expect(searchArticles).toHaveBeenCalledTimes(2);
      expect(lastQuery()).toEqual({ ...base, categryId: "Space", q: "mars" });
    });
  });

  test("moving to another page adds a history entry and keeps the search", async () => {
    answerWith(45);
    const user = userEvent.setup();
    window.scrollTo = jest.fn();
    const { router } = renderWithProviders(<ArticlesRouteView />, { route: "/web/articles?q=mars" });

    await user.click(await screen.findByRole("button", { name: "Page 3" }));

    expect(router.state.location.search).toBe("?q=mars&page=3");
    expect(router.state.historyAction).toBe("PUSH");
    await waitFor(() => expect(lastQuery()).toEqual({ ...base, q: "mars", page: "3" }));
    // Back to the top once the new page is in, not before.
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test("a new search starts again from the first page", async () => {
    answerWith(45);
    const user = userEvent.setup();
    const { router } = renderWithProviders(<ArticlesRouteView />, { route: "/web/articles?page=2" });

    await user.selectOptions(await screen.findByRole("combobox", { name: "Sort articles" }), "title-asc");

    expect(router.state.location.search).toBe("?sort=title-asc");
  });

  test("a link past the last page moves to the last page", async () => {
    answerWith(45);
    const { router } = renderWithProviders(<ArticlesRouteView />, { route: "/web/articles?q=mars&page=9" });

    await waitFor(() => expect(router.state.location.search).toBe("?q=mars&page=3"));
  });
});
