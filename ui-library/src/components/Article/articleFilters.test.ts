import { ArticleT } from "../../Types";
import {
  ArticleFilters,
  emptyArticleFilters,
  filterArticles,
  hasActiveFilters,
  readSearchParams,
  sortArticles,
  writeSearchParams,
} from "./articleFilters";

const article = (overrides: Partial<ArticleT>): ArticleT =>
  ({
    id: "id",
    author: "Ada Lovelace",
    title: "Untitled",
    createdAt: "2026-01-15T10:00:00",
    updatedAt: "2026-01-15T10:00:00",
    categryId: "Science",
    content: [],
    origin: "server",
    published: true,
    deleteFlag: false,
    ...overrides,
  } as unknown as ArticleT);

const mars = article({
  id: "smw78pdl911f1ic",
  title: "Water on Mars",
  author: "Carl Sagan",
  createdAt: "2026-02-10T09:00:00" as any,
  content: [
    { componenType: "Image", data: "https://example.com/rover.png" },
    { componenType: "Paragraph", data: "The <b>rover</b> found ice near the pole." },
    { componenType: "List", data: ["Perseverance", "Curiosity"] },
  ],
});
const proofs = article({ id: "k6tk38ew0ej782x", title: "Elegant proofs", createdAt: "2026-03-31T23:30:00" as any });
const draft = article({ id: "e3qztl6tekou9wh", title: "Unfinished Mars notes", published: false, createdAt: "2025-12-01T00:00:00" as any });
const all = [mars, proofs, draft];

const ids = (filters: Partial<ArticleFilters>) =>
  filterArticles(all, { ...emptyArticleFilters, ...filters }).map((a) => a.id);

describe("filterArticles", () => {
  test("no filters keeps everything", () => {
    expect(ids({})).toEqual([mars.id, proofs.id, draft.id]);
  });

  test("all fields searches title, author, ID and body text, ignoring case", () => {
    expect(ids({ search: "MARS" })).toEqual([mars.id, draft.id]);
    expect(ids({ search: "sagan" })).toEqual([mars.id]);
    expect(ids({ search: "k6tk38" })).toEqual([proofs.id]);
    expect(ids({ search: "curiosity" })).toEqual([mars.id]);
  });

  test("every word has to match, in any order", () => {
    expect(ids({ search: "mars water" })).toEqual([mars.id]);
    expect(ids({ search: "mars proofs" })).toEqual([]);
  });

  test("searching one field ignores the others", () => {
    expect(ids({ search: "mars", field: "title" })).toEqual([mars.id, draft.id]);
    expect(ids({ search: "mars", field: "author" })).toEqual([]);
    expect(ids({ search: "smw78pdl911f1ic", field: "id" })).toEqual([mars.id]);
    expect(ids({ search: "Water", field: "id" })).toEqual([]);
  });

  test("content search skips image URLs and HTML tags", () => {
    expect(ids({ search: "rover found", field: "content" })).toEqual([mars.id]);
    expect(ids({ search: "rover.png", field: "content" })).toEqual([]);
    expect(ids({ search: "<b>", field: "content" })).toEqual([]);
  });

  test("date range includes both end days", () => {
    expect(ids({ from: "2026-02-10" })).toEqual([mars.id, proofs.id]);
    expect(ids({ to: "2026-02-10" })).toEqual([mars.id, draft.id]);
    expect(ids({ from: "2026-02-11", to: "2026-03-31" })).toEqual([proofs.id]);
  });

  test("a reversed date range is read as the range between the two dates", () => {
    expect(ids({ from: "2026-03-31", to: "2026-02-11" })).toEqual([proofs.id]);
  });

  test("articles with an unreadable date drop out of a date range", () => {
    const broken = article({ id: "broken", createdAt: "not a date" as any });
    const result = filterArticles([broken], { ...emptyArticleFilters, from: "2000-01-01" });
    expect(result).toEqual([]);
  });

  test("status filters published and draft articles", () => {
    expect(ids({ status: "published" })).toEqual([mars.id, proofs.id]);
    expect(ids({ status: "draft" })).toEqual([draft.id]);
  });

  test("filters combine", () => {
    expect(ids({ search: "mars", status: "published", from: "2026-01-01" })).toEqual([mars.id]);
  });
});

describe("hasActiveFilters", () => {
  test("a blank search and default filters aren't active", () => {
    expect(hasActiveFilters({ ...emptyArticleFilters, search: "   ", field: "id" })).toBe(false);
    expect(hasActiveFilters({ ...emptyArticleFilters, to: "2026-01-01" })).toBe(true);
  });
});

describe("sortArticles", () => {
  test("sorts by date and title without changing the input", () => {
    expect(sortArticles(all, "newest").map((a) => a.id)).toEqual([proofs.id, mars.id, draft.id]);
    expect(sortArticles(all, "oldest").map((a) => a.id)).toEqual([draft.id, mars.id, proofs.id]);
    expect(sortArticles(all, "title-asc").map((a) => a.title)[0]).toBe("Elegant proofs");
    expect(all[0]).toBe(mars);
  });
});

describe("filters in the URL", () => {
  test("round-trips filters, sort and page, keeping other parameters", () => {
    const state = {
      filters: { search: "mars water", field: "title" as const, from: "2026-01-01", to: "2026-03-31", status: "draft" as const },
      sortBy: "oldest" as const,
      page: 3,
    };
    const params = writeSearchParams(new URLSearchParams("categoryId=Space"), state);

    expect(params.get("categoryId")).toBe("Space");
    expect(params.get("q")).toBe("mars water");
    expect(readSearchParams(params)).toEqual(state);
  });

  test("leaves defaults out, so a plain list keeps a plain URL", () => {
    const params = writeSearchParams(new URLSearchParams("categoryId=Space&q=old&page=4"), {
      filters: emptyArticleFilters,
      sortBy: "newest",
      page: 1,
    });
    expect(params.toString()).toBe("categoryId=Space");
  });

  test("ignores missing and invalid values", () => {
    expect(readSearchParams(new URLSearchParams("in=bogus&sort=x&status=y&from=yesterday&to=2026-1-1&page=-2"))).toEqual({
      filters: emptyArticleFilters,
      sortBy: "newest",
      page: 1,
    });
    expect(readSearchParams(new URLSearchParams("page=2.5")).page).toBe(1);
  });
});

describe("stored dates", () => {
  test("are read as written, whatever the browser's time zone", () => {
    const lateUtc = article({ id: "utc", createdAt: "2026-03-31T23:30:00.000Z" as any });
    expect(filterArticles([lateUtc], { ...emptyArticleFilters, from: "2026-03-31", to: "2026-03-31" })).toHaveLength(1);
  });
});
