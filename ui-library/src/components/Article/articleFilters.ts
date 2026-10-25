import { ArticleT } from "../../Types";

export type ArticleSortOption = "newest" | "oldest" | "title-asc" | "title-desc";
export type ArticleSearchField = "all" | "title" | "author" | "content" | "id";
export type ArticleStatusFilter = "any" | "published" | "draft";

export type ArticleFilters = {
  search: string;
  field: ArticleSearchField;
  // Inclusive `YYYY-MM-DD` bounds on the created date; "" leaves that end open.
  from: string;
  to: string;
  // Only offered in the admin; the public site only ever gets published articles.
  status: ArticleStatusFilter;
};

export const emptyArticleFilters: ArticleFilters = {
  search: "",
  field: "all",
  from: "",
  to: "",
  status: "any",
};

// How many filters beyond the plain search box are narrowing the list.
export const activeFilterCount = ({ from, to, status }: ArticleFilters) =>
  [from !== "", to !== "", status !== "any"].filter(Boolean).length;

export const hasActiveFilters = (filters: ArticleFilters) =>
  filters.search.trim() !== "" || activeFilterCount(filters) > 0;

// The article's created date as `YYYY-MM-DD`, comparable with the date inputs' values. Stored
// dates are read as written (the first 10 characters), the same rule the server's search uses.
const createdDay = (article: ArticleT) => {
  const raw = article.createdAt as unknown;
  if (typeof raw === "string") return /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : "";
  const date = new Date(article.createdAt);
  if (isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// The readable text of an article's body: every component except images, with HTML tags removed.
const contentText = (article: ArticleT) =>
  (article.content ?? [])
    .filter((component) => component.componenType !== "Image")
    .map((component) => (Array.isArray(component.data) ? component.data.join(" ") : component.data ?? ""))
    .join(" ")
    .replace(/<[^>]*>/g, " ");

const searchableText = (article: ArticleT, field: ArticleSearchField) => {
  switch (field) {
    case "title":
      return article.title ?? "";
    case "author":
      return article.author ?? "";
    case "id":
      return article.id ?? "";
    case "content":
      return contentText(article);
    case "all":
    default:
      return [article.title, article.author, article.id, contentText(article)].join(" ");
  }
};

// What to mark in results: the searched words, in the part of the article that was searched.
export type ArticleHighlight = { words: string[]; field: ArticleSearchField };

export const highlightWordsFor = (highlight: ArticleHighlight | undefined, part: Exclude<ArticleSearchField, "all">) =>
  highlight && (highlight.field === "all" || highlight.field === part) ? highlight.words : [];

// The search box's words; every one has to appear somewhere in the searched text, in any order.
export const searchWords = (search: string) => search.trim().toLowerCase().split(/\s+/).filter(Boolean);

export const filterArticles = (articles: ArticleT[], filters: ArticleFilters) => {
  const words = searchWords(filters.search);
  // A reversed range still means "between these two dates".
  const [from, to] =
    filters.from && filters.to && filters.from > filters.to ? [filters.to, filters.from] : [filters.from, filters.to];

  return articles.filter((article) => {
    if (filters.status === "published" && !article.published) return false;
    if (filters.status === "draft" && article.published) return false;

    if (from || to) {
      const day = createdDay(article);
      if (!day || (from && day < from) || (to && day > to)) return false;
    }

    if (words.length === 0) return true;
    const text = searchableText(article, filters.field).toLowerCase();
    return words.every((word) => text.includes(word));
  });
};

export const sortArticles = (articles: ArticleT[], sortBy: ArticleSortOption) => {
  return [...articles].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
};

// --- Filters in the URL, so a search survives a reload and can be shared. ---

const SEARCH_FIELDS: ArticleSearchField[] = ["all", "title", "author", "content", "id"];
const SORT_OPTIONS: ArticleSortOption[] = ["newest", "oldest", "title-asc", "title-desc"];
const STATUSES: ArticleStatusFilter[] = ["any", "published", "draft"];
const DAY = /^\d{4}-\d{2}-\d{2}$/;

// Query parameter names. Other parameters (e.g. categoryId) are left as they are.
export const SEARCH_PARAMS = ["q", "in", "from", "to", "status", "sort", "page"];

const oneOf = <T extends string>(value: string | null, options: T[], fallback: T): T =>
  options.includes(value as T) ? (value as T) : fallback;

export type ArticleSearchState = { filters: ArticleFilters; sortBy: ArticleSortOption; page: number };

// Reads the filters, sort and page from the URL. Anything missing or invalid is left at its default.
export const readSearchParams = (params: URLSearchParams): ArticleSearchState => {
  const day = (name: string) => (DAY.test(params.get(name) ?? "") ? (params.get(name) as string) : "");
  const page = Number(params.get("page"));
  return {
    filters: {
      search: params.get("q") ?? "",
      field: oneOf(params.get("in"), SEARCH_FIELDS, "all"),
      from: day("from"),
      to: day("to"),
      status: oneOf(params.get("status"), STATUSES, "any"),
    },
    sortBy: oneOf(params.get("sort"), SORT_OPTIONS, "newest"),
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
};

// A copy of `params` with the filters, sort and page written in. Defaults are left out, so a
// plain list keeps a plain URL.
export const writeSearchParams = (params: URLSearchParams, { filters, sortBy, page }: ArticleSearchState) => {
  const next = new URLSearchParams(params);
  SEARCH_PARAMS.forEach((name) => next.delete(name));
  const set = (name: string, value: string, fallback: string) => {
    if (value !== fallback) next.set(name, value);
  };
  set("q", filters.search, "");
  set("in", filters.field, "all");
  set("from", filters.from, "");
  set("to", filters.to, "");
  set("status", filters.status, "any");
  set("sort", sortBy, "newest");
  set("page", String(page), "1");
  return next;
};
