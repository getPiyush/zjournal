import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Articles,
  ArticleSearchState,
  ArticleTileSize,
  months,
  readSearchParams,
  TILE_SIZES,
  writeSearchParams,
} from "@zjournal/ui-library";
import { useArticle } from "../datastore/contexts/ArticleContext";
import { useJournal } from "../datastore/contexts/JournalContext";
import { searchArticles } from "../datastore/actions/ArticleActions";
import { updatePage } from "../datastore/actions/JournalActions";
import { applicationProperties } from "../ApplicationConstants";
import { properties } from "../properties";

export const PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50];
// How long typing has to pause before the search runs.
export const SEARCH_DELAY_MS = 250;

export default function ArticlesRouteView() {
  const [params, setParams] = useSearchParams();
  const categoryId = params.get("categoryId") ?? "";
  const blogDate = params.get("blogdate") ?? "";
  const authorId = params.get("authorId") ?? "";

  const isArticleByCategory = categoryId !== "" && categoryId !== "All";
  const isArticleByBlog = /^\d{4}-\d{2}$/.test(blogDate);
  const isArticleByAuthor = authorId !== "";

  const { dispatch, state: articleData } = useArticle();
  const { dispatch: journalDispatch } = useJournal();

  // The search box, filters, sort and page live in the URL, so a search survives a reload and
  // can be shared.
  const searchState = readSearchParams(params);
  // Articles per page, as `size` in the URL; anything not on offer falls back to the default.
  const sizeParam = Number(params.get("size"));
  const pageSize = PAGE_SIZE_OPTIONS.includes(sizeParam) ? sizeParam : PAGE_SIZE;
  // Tile size, as `tiles` in the URL; medium unless set.
  const tilesParam = params.get("tiles") as ArticleTileSize;
  const tileSize = TILE_SIZES.includes(tilesParam) ? tilesParam : "medium";

  let title = "All";
  if (isArticleByCategory) title = categoryId;
  if (isArticleByBlog) {
    const [year, month] = blogDate.split("-");
    title = `${months[Number(month) - 1]} ${year} `;
  }
  if (isArticleByAuthor) title = authorId;

  useEffect(() => {
    window.document.title = `${title} - ${applicationProperties.title}`;
  }, [title]);

  // What to ask the server for. view=public: an admin's token rides along on every request, and
  // the public site must still only list published articles.
  const query = useMemo(() => {
    const { filters, sortBy, page } = searchState;
    const request: Record<string, string> = { view: "public", limit: String(pageSize), page: String(page), sort: sortBy };
    if (filters.search.trim()) request.q = filters.search;
    if (filters.field !== "all") request.in = filters.field;
    if (isArticleByBlog) {
      // A month's archive: its dates replace the date filter, which isn't offered there.
      request.from = `${blogDate}-01`;
      request.to = `${blogDate}-31`;
    } else {
      if (filters.from) request.from = filters.from;
      if (filters.to) request.to = filters.to;
    }
    if (isArticleByCategory) request.categryId = categoryId;
    if (isArticleByAuthor) request.author = authorId;
    return request;
  }, [params]);
  const queryKey = new URLSearchParams(query).toString();

  // The first search runs straight away; later ones wait for typing to pause.
  const firstSearch = useRef(true);
  useEffect(() => {
    const delay = firstSearch.current ? 0 : SEARCH_DELAY_MS;
    firstSearch.current = false;
    const timer = setTimeout(() => searchArticles(dispatch, query), delay);
    return () => clearTimeout(timer);
  }, [queryKey]);

  const total = articleData.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // After moving to another page, go back to the top once that page has arrived (scrolling any
  // earlier, the list changing height underneath would move the window again).
  const scrollOnArrival = useRef(false);
  useEffect(() => {
    if (articleData.status === "success" && scrollOnArrival.current) {
      scrollOnArrival.current = false;
      window.scrollTo(0, 0);
    }
  }, [articleData.status, articleData.articles]);

  const changeSearch = (next: ArticleSearchState) => {
    const pageChanged = next.page !== searchState.page;
    // Typing replaces the history entry; moving between pages adds one, so Back returns.
    setParams(writeSearchParams(params, next), { replace: !pageChanged });
    if (pageChanged) scrollOnArrival.current = true;
  };

  // A new page size starts again from the first page.
  const changePageSize = (size: number) => {
    const next = writeSearchParams(params, { ...searchState, page: 1 });
    if (size === PAGE_SIZE) next.delete("size");
    else next.set("size", String(size));
    setParams(next, { replace: true });
  };

  // Only changes the layout, so the search and page stay as they are.
  const changeTileSize = (size: ArticleTileSize) => {
    const next = new URLSearchParams(params);
    if (size === "medium") next.delete("tiles");
    else next.set("tiles", size);
    setParams(next, { replace: true });
  };

  // A shared link can point past the last page (e.g. after articles were removed).
  useEffect(() => {
    if (articleData.status === "success" && total > 0 && searchState.page > pageCount) {
      setParams(writeSearchParams(params, { ...searchState, page: pageCount }), { replace: true });
    }
  }, [articleData.status, total, searchState.page, pageCount]);

  return (
    <Articles
      title={title}
      status={articleData.status}
      articles={articleData.articles}
      disableTextSelect={properties.disableTextSelect}
      onBrowseCategories={() => updatePage("categories", journalDispatch)}
      tileSize={tileSize}
      onTileSizeChange={changeTileSize}
      search={{
        state: searchState,
        onChange: changeSearch,
        total,
        pageSize,
        pageSizeOptions: PAGE_SIZE_OPTIONS,
        onPageSizeChange: changePageSize,
        showDateFilter: !isArticleByBlog,
      }}
    />
  );
}
