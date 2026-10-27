import React, { useState } from "react";
import {
  ArticleFilters,
  ArticleSearchField,
  ArticleSortOption,
  ArticleStatusFilter,
  ArticleTileSize,
  TILE_SIZES,
  activeFilterCount,
  emptyArticleFilters,
  hasActiveFilters,
} from "./articleFilters";

export type { ArticleSortOption } from "./articleFilters";

type ArticlesToolbarProps = {
  filters: ArticleFilters;
  onFiltersChange: (filters: ArticleFilters) => void;
  sortBy: ArticleSortOption;
  onSortChange: (value: ArticleSortOption) => void;
  // Once anything is narrowing the list: "Showing N of M articles", or "N articles found" when
  // only the match count is known (server-side search).
  shownCount?: number;
  totalCount?: number;
  // Published/draft filter, for the admin.
  showStatusFilter?: boolean;
  // From/To dates; off where the page already fixes the dates (e.g. a month's archive).
  showDateFilter?: boolean;
  // Prefix for the inputs' ids, so two toolbars on one page don't clash.
  idPrefix?: string;
  // Articles per page; the select only shows when there are options and a handler.
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  // Tile size; the select only shows with a handler.
  tileSize?: ArticleTileSize;
  onTileSizeChange?: (size: ArticleTileSize) => void;
};

const TILE_SIZE_LABELS: Record<ArticleTileSize, string> = {
  small: "Small tiles",
  medium: "Medium tiles",
  large: "Large tiles",
};

const SEARCH_FIELDS: { value: ArticleSearchField; label: string }[] = [
  { value: "all", label: "All fields" },
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
  { value: "content", label: "Content" },
  { value: "id", label: "ID" },
];

const SEARCH_PLACEHOLDERS: Record<ArticleSearchField, string> = {
  all: "Search title, author, content or ID...",
  title: "Search titles...",
  author: "Search authors...",
  content: "Search article text...",
  id: "Article ID...",
};

export default function ArticlesToolbar({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  shownCount,
  totalCount,
  showStatusFilter = false,
  showDateFilter = true,
  idPrefix = "articles",
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  tileSize = "medium",
  onTileSizeChange,
}: ArticlesToolbarProps) {
  const extraFilters = activeFilterCount(filters);
  const hasFilterPanel = showDateFilter || showStatusFilter;
  // Start open when filters are already set, e.g. after coming back to the page.
  const [showFilters, setShowFilters] = useState(extraFilters > 0);
  const update = (change: Partial<ArticleFilters>) => onFiltersChange({ ...filters, ...change });
  const panelId = `${idPrefix}-filters`;

  return (
    <div className="articles-toolbar mb-3">
      <div className="row g-2">
        <div className="col-md">
          <input
            type="search"
            className="form-control"
            placeholder={SEARCH_PLACEHOLDERS[filters.field]}
            aria-label="Search articles"
            value={filters.search}
            onChange={(event) => update({ search: event.target.value })}
          />
        </div>
        <div className="col-6 col-md-2">
          <select
            className="form-select"
            aria-label="Search in"
            value={filters.field}
            onChange={(event) => update({ field: event.target.value as ArticleSearchField })}
          >
            {SEARCH_FIELDS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <select
            className="form-select"
            aria-label="Sort articles"
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as ArticleSortOption)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
        </div>
        {pageSizeOptions && onPageSizeChange && (
          <div className="col-6 col-md-auto">
            <select
              className="form-select"
              aria-label="Articles per page"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        )}
        {onTileSizeChange && (
          <div className="col-6 col-md-auto">
            <select
              className="form-select"
              aria-label="Tile size"
              value={tileSize}
              onChange={(event) => onTileSizeChange(event.target.value as ArticleTileSize)}
            >
              {TILE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {TILE_SIZE_LABELS[size]}
                </option>
              ))}
            </select>
          </div>
        )}
        {hasFilterPanel && (
          <div className="col-md-auto d-grid">
            <button
              type="button"
              className={`text-nowrap ${extraFilters > 0 ? "btn btn-secondary" : "btn btn-outline-secondary"}`}
              aria-expanded={showFilters}
              aria-controls={panelId}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters{extraFilters > 0 && <span className="badge bg-light text-dark ms-1">{extraFilters}</span>}
            </button>
          </div>
        )}
      </div>

      {showFilters && hasFilterPanel && (
        <div className="row g-2 mt-1 align-items-end" id={panelId}>
          {showDateFilter && (
            <>
              <div className="col-6 col-md-3">
                <label htmlFor={`${idPrefix}-from`} className="form-label small mb-1">
                  From
                </label>
                <input
                  type="date"
                  id={`${idPrefix}-from`}
                  className="form-control"
                  value={filters.from}
                  max={filters.to || undefined}
                  onChange={(event) => update({ from: event.target.value })}
                />
              </div>
              <div className="col-6 col-md-3">
                <label htmlFor={`${idPrefix}-to`} className="form-label small mb-1">
                  To
                </label>
                <input
                  type="date"
                  id={`${idPrefix}-to`}
                  className="form-control"
                  value={filters.to}
                  min={filters.from || undefined}
                  onChange={(event) => update({ to: event.target.value })}
                />
              </div>
            </>
          )}
          {showStatusFilter && (
            <div className="col-6 col-md-3">
              <label htmlFor={`${idPrefix}-status`} className="form-label small mb-1">
                Status
              </label>
              <select
                id={`${idPrefix}-status`}
                className="form-select"
                value={filters.status}
                onChange={(event) => update({ status: event.target.value as ArticleStatusFilter })}
              >
                <option value="any">Any</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          )}
        </div>
      )}

      {hasActiveFilters(filters) && (
        <div className="d-flex align-items-center mt-2 small">
          {shownCount !== undefined && (
            <span className="text-muted" role="status">
              {totalCount !== undefined
                ? `Showing ${shownCount} of ${totalCount} articles`
                : `${shownCount} ${shownCount === 1 ? "article" : "articles"} found`}
            </span>
          )}
          <button
            type="button"
            className="btn btn-link btn-sm ms-auto"
            onClick={() => onFiltersChange({ ...emptyArticleFilters, field: filters.field })}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
