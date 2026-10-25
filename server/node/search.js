// search.js
// GET /articles/search: the same search, filters and paging as the other three backends.
// The rules are in server/SEARCH.md and pinned down by server/search_cases.json.
const { isPublicArticle } = require("./auth");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const FIELDS = new Set(["all", "title", "author", "content", "id"]);

const isTrue = (value) => value === true || value === 1 || value === "true" || value === "1";
const text = (value) => (value === null || value === undefined ? "" : String(value));

const contentText = (article) =>
  (Array.isArray(article.content) ? article.content : [])
    .filter((component) => component && typeof component === "object" && component.componenType !== "Image")
    .map(({ data }) => (Array.isArray(data) ? data.map(text).join(" ") : text(data)))
    .join(" ")
    .replace(/<[^>]*>/g, " ");

const searchable = (article, field) => {
  if (field === "content") return contentText(article);
  if (field === "title" || field === "author" || field === "id") return text(article[field]);
  return [text(article.title), text(article.author), text(article.id), contentText(article)].join(" ");
};

const dayOf = (article) => {
  const created = text(article.createdAt);
  return /^\d{4}-\d{2}-\d{2}/.test(created) ? created.slice(0, 10) : null;
};

const intParam = (value, fallback, low, high) => {
  const number = /^-?\d+$/.test(text(value).trim()) ? parseInt(value, 10) : fallback;
  return Math.max(low, Math.min(high, number));
};

const compareStrings = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

const comparator = (sort) => (a, b) => {
  let order;
  if (sort === "title-asc" || sort === "title-desc") {
    order = compareStrings(text(a.title).toLowerCase(), text(b.title).toLowerCase());
    if (sort === "title-desc") order = -order;
  } else {
    // Undated articles go last in both directions; dated ones sort by their createdAt string.
    const aDated = dayOf(a) !== null;
    const bDated = dayOf(b) !== null;
    if (aDated !== bDated) return aDated ? -1 : 1;
    order = compareStrings(text(a.createdAt), text(b.createdAt));
    if (sort !== "oldest") order = -order;
  }
  return order || compareStrings(text(a.id), text(b.id));
};

// params: a plain object of query values (repeated keys use their first value).
const search = (articles, params, isPublic) => {
  const param = (name) => {
    const value = params[name];
    return text(Array.isArray(value) ? value[0] : value);
  };
  const publicOnly = isPublic || param("view") === "public";
  const words = param("q").toLowerCase().split(/\s+/).filter(Boolean);
  const field = FIELDS.has(param("in")) ? param("in") : "all";
  let [from, to] = [param("from"), param("to")];
  if (from && to && from > to) [from, to] = [to, from];
  const status = param("status") || "any";
  const category = param("categryId").toLowerCase();
  const author = param("author").toLowerCase();

  const matches = (article) => {
    if (publicOnly && !isPublicArticle(article)) return false;
    if (status === "published" && !isTrue(article.published)) return false;
    if (status === "draft" && isTrue(article.published)) return false;
    if (category && text(article.categryId).toLowerCase() !== category) return false;
    if (author && text(article.author).toLowerCase() !== author) return false;
    if (from || to) {
      const day = dayOf(article);
      if (day === null || (from && day < from) || (to && day > to)) return false;
    }
    if (words.length === 0) return true;
    const haystack = searchable(article, field).toLowerCase();
    return words.every((word) => haystack.includes(word));
  };

  const found = articles
    .filter((article) => article && typeof article === "object" && matches(article))
    .sort(comparator(param("sort") || "newest"));
  const page = intParam(param("page"), 1, 1, 1000000);
  const limit = intParam(param("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);
  const offset = (page - 1) * limit;
  return { items: found.slice(offset, offset + limit), total: found.length, page, limit };
};

module.exports = { search };
