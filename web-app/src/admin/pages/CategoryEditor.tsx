import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArticleT,
  ArticleSortOption,
  ArticlePreview,
  ArticlesToolbar,
  PageTitle,
  Pagination,
  emptyArticleFilters,
  filterArticles,
  sortArticles,
  searchWords,
} from "@zjournal/ui-library";
import { getArticlesBycategory } from "../../datastore/actions/ArticleActions";
import { useArticle } from "../../datastore/contexts/ArticleContext";
import { useJournal } from "../../datastore/contexts/JournalContext";
import { updateCurrentArticle } from "../../datastore/actions/JournalActions";
import { defaultArticle } from "../../ApplicationConstants";

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 40, 50];
export const DEFAULT_PAGE_SIZE = 10;

type TileSize = "small" | "medium" | "large";

const TILE_SIZES: { value: TileSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

// Bootstrap grid columns per tile size: smaller tiles fit more per row.
const TILE_GRID_CLASSES: Record<TileSize, string> = {
  small: "row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4",
  medium: "row-cols-1 row-cols-md-2",
  large: "row-cols-1",
};

export default function CategoryEditor() {
  const { state: state, dispatch: journalDispatch } = useJournal();
  const navigate = useNavigate();

  const { dispatch, state: articleData } = useArticle();

  const editArticle = (article: ArticleT) => {
    updateCurrentArticle(article, journalDispatch);
    navigate(`/admin/editor?id=${encodeURIComponent(article.id)}`);
  };

  const newArticle = () => {
    const now = new Date();
    updateCurrentArticle({ ...defaultArticle, createdAt: now, updatedAt: now }, journalDispatch);
    navigate("/admin/editor");
  };

  const getArticlesBycategoryID = (categoryId) => {
    getArticlesBycategory(dispatch, categoryId);
  };

  const [selectedCategory, setSelectedcategory] = useState("");
  const [filters, setFilters] = useState(emptyArticleFilters);
  const [sortBy, setSortBy] = useState<ArticleSortOption>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [tileSize, setTileSize] = useState<TileSize>("small");

  useEffect(() => {
    getArticlesBycategoryID(selectedCategory);
  }, [selectedCategory]);

  // A new category, search, filter, sort or page size changes what's listed, so start again from page one.
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, filters, sortBy, pageSize]);

  const allArticles = articleData?.articles ?? [];
  const visibleArticles = useMemo(
    () => sortArticles(filterArticles(allArticles, filters), sortBy),
    [allArticles, filters, sortBy]
  );

  const highlight = { words: searchWords(filters.search), field: filters.field };

  const pageCount = Math.max(1, Math.ceil(visibleArticles.length / pageSize));
  // Clamp in case the list shrank (e.g. a refetch) while we were on a later page.
  const currentPage = Math.min(page, pageCount);
  const pageArticles = visibleArticles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getCategoryDropdown = (currentCategory: string) => (
    <div className="dropdown">
      <button
        className="btn btn-light btn-lg dropdown-toggle text-wrap"
        type="button"
        id="categoryButton"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <b>{currentCategory != "" ? currentCategory : "All"}</b>
      </button>

      <ul className="dropdown-menu" aria-labelledby="categoryButton">
        {state.journal.categories.map((category) => (
          <li key={category}>
            {/* A button, not href="#": choosing a category shouldn't touch the URL. */}
            <button
              type="button"
              className={
                category === currentCategory
                  ? "dropdown-item active"
                  : "dropdown-item"
              }
              onClick={() => setSelectedcategory(category !== "All" ? category : "")}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <PageTitle title="Categories" />
        </div>
      </div>
      <div className="row">
        <div className="col-md-4">
          {getCategoryDropdown(selectedCategory)}
        </div>
        <div className="col-md-4 offset-md-4 d-flex justify-content-end">
          <div className="align-self-center"><b>{visibleArticles.length} Articles</b></div>
          <button type="button" className="btn btn-primary btn-sm ms-3 align-self-center" onClick={newArticle}>
            <i className="bi bi-plus-lg" />
            &nbsp;New article
          </button>
        </div>
      </div>
      <ArticlesToolbar
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        shownCount={visibleArticles.length}
        totalCount={allArticles.length}
        showStatusFilter
        idPrefix="admin-articles"
      />
      <div className="row mb-3 align-items-center">
        <div className="col-auto">
          <div className="btn-group btn-group-sm" role="group" aria-label="Tile size">
            {TILE_SIZES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={tileSize === value ? "btn btn-secondary" : "btn btn-outline-secondary"}
                aria-pressed={tileSize === value}
                onClick={() => setTileSize(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="col-auto ms-auto d-flex align-items-center">
          <label htmlFor="pageSize" className="form-label mb-0 me-2 text-nowrap">
            Per page
          </label>
          <select
            id="pageSize"
            className="form-select form-select-sm"
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <hr />
        </div>
      </div>
      <div className={`row g-4 ${TILE_GRID_CLASSES[tileSize]}`} data-testid="article-grid">
        {visibleArticles.length > 0 ? (
          pageArticles.map((article) => (
            <div className="col admin-preview" key={article.id}>
              <ArticlePreview data={article} onEdit={editArticle} highlight={highlight} />
            </div>
          ))
        ) : (
          <div className="col">
            <div>
              {articleData?.articles?.length > 0
                ? "No articles match your search or filters."
                : "No article in this category"}
            </div>
          </div>
        )}
      </div>
      <div className="row mt-4">
        <div className="col">
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
