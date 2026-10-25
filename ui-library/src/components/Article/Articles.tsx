import React, { useMemo, useState } from "react";
import { ArticleViewer } from "./Article.styles";

import { ArticleT } from "../../Types";

import { PageNotFound } from "../PageNotFound";
import LoadingPage from "../Loader/LoadingPage";
import { Pagination } from "../Pagination";
import ArticlePreviewWeb from "./ArticlePreviewWeb";
import ArticlesToolbar from "./ArticlesToolbar";
import {
  ArticleSearchState,
  ArticleSortOption,
  emptyArticleFilters,
  filterArticles,
  hasActiveFilters,
  searchWords,
  sortArticles,
} from "./articleFilters";

// Server-side search: the caller owns the filters, sort and page (e.g. in the URL), runs the
// search, and passes in one page of results plus the total number of matches.
export type ServerSearchProps = {
  state: ArticleSearchState;
  onChange: (state: ArticleSearchState) => void;
  total: number;
  pageSize: number;
  showDateFilter?: boolean;
};

type ArticlesProps = {
  title: string;
  status: string;
  articles: ArticleT[];
  disableTextSelect?: boolean;
  onBrowseCategories?: () => void;
  basePath?: string;
  // Without this, the list filters, sorts and searches `articles` in the browser.
  search?: ServerSearchProps;
};

export default function Articles({
  title,
  status,
  articles,
  disableTextSelect,
  onBrowseCategories,
  basePath,
  search,
}: ArticlesProps) {
  const [localFilters, setLocalFilters] = useState(emptyArticleFilters);
  const [localSort, setLocalSort] = useState<ArticleSortOption>("newest");

  const filters = search ? search.state.filters : localFilters;
  const sortBy = search ? search.state.sortBy : localSort;
  const loading = status === "loading";

  const visibleArticles = useMemo(
    () => (search ? articles : sortArticles(filterArticles(articles, localFilters), localSort)),
    [search, articles, localFilters, localSort]
  );
  const highlight = { words: searchWords(filters.search), field: filters.field };
  const filtering = hasActiveFilters(filters);
  // Whether there is anything at all to list, before searching.
  const hasArticles = search ? search.total > 0 || filtering : articles.length > 0;

  const setFilters = search
    ? (next: typeof filters) => search.onChange({ filters: next, sortBy, page: 1 })
    : setLocalFilters;
  const setSort = search
    ? (next: ArticleSortOption) => search.onChange({ filters, sortBy: next, page: 1 })
    : setLocalSort;

  const notFound = <PageNotFound onBrowseCategories={onBrowseCategories} basePath={basePath} />;

  // Server mode keeps the list (and the search box being typed in) on screen while a new search
  // loads; only the very first load shows the full loader.
  if (status === "error") return <ArticleViewer className="container">{notFound}</ArticleViewer>;
  if (loading && (!search || (articles.length === 0 && !filtering))) {
    return (
      <ArticleViewer className="container">
        <LoadingPage />
      </ArticleViewer>
    );
  }

  return (
    <ArticleViewer className="container">
      <ArticleViewer className="container" $disableTextSelect={disableTextSelect}>
        <div className="row">
          <div className="col">
            <h2>
              {title} <i>Articles</i>
            </h2>
            <hr />
          </div>
        </div>

        {hasArticles && (
          <ArticlesToolbar
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSort}
            shownCount={search ? search.total : visibleArticles.length}
            totalCount={search ? undefined : articles.length}
            showDateFilter={search?.showDateFilter ?? true}
          />
        )}

        <div className={`row${loading ? " opacity-50" : ""}`} aria-busy={loading}>
          {visibleArticles.map((article, index) => (
            <div key={`article_${index}_${article.id}`} className="col-md-6">
              <ArticlePreviewWeb data={article} highlight={highlight} basePath={basePath} />
            </div>
          ))}
        </div>

        {!hasArticles && !loading && (
          <div className="row">
            <div className="col">{notFound}</div>
          </div>
        )}

        {hasArticles && visibleArticles.length === 0 && !loading && (
          <div className="row">
            <div className="col">No articles match your search or filters.</div>
          </div>
        )}

        {search && (
          <Pagination
            page={search.state.page}
            pageCount={Math.ceil(search.total / search.pageSize)}
            onPageChange={(page) => search.onChange({ ...search.state, page })}
          />
        )}
      </ArticleViewer>
    </ArticleViewer>
  );
}
