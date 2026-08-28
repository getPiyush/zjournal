import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArticleT, ArticleSortOption, ArticlePreview, ArticlesToolbar, PageTitle } from "@zjournal/ui-library";
import { getArticlesBycategory } from "../../datastore/actions/ArticleActions";
import { useArticle } from "../../datastore/contexts/ArticleContext";
import { useJournal } from "../../datastore/contexts/JournalContext";
import { updateCurrentArticle } from "../../datastore/actions/JournalActions";

export default function CategoryEditor() {
  const { state: state, dispatch: journalDispatch } = useJournal();
  const navigate = useNavigate();

  const { dispatch, state: articleData } = useArticle();

  const editArticle = (article: ArticleT) => {
    updateCurrentArticle(article, journalDispatch);
    navigate("/admin/editor");
  };

  const getArticlesBycategoryID = (categoryId) => {
    getArticlesBycategory(dispatch, categoryId);
  };

  const [selectedCategory, setSelectedcategory] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<ArticleSortOption>("newest");

  useEffect(() => {
    getArticlesBycategoryID(selectedCategory);
  }, [selectedCategory]);

  const visibleArticles = useMemo(() => {
    const articles = articleData?.articles ?? [];
    const searchTerm = search.trim().toLowerCase();
    const filtered = searchTerm
      ? articles.filter((article) => article.title.toLowerCase().includes(searchTerm))
      : articles;

    return [...filtered].sort((a, b) => {
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
  }, [articleData?.articles, search, sortBy]);

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
        {state.journal.categories.map((category, index) => (
          <li>
            <a
              className={
                category === currentCategory
                  ? "dropdown-item active"
                  : "dropdown-item"
              }
              onClick={() => setSelectedcategory(category !== "All" ? category : "")}
              href="#"
              key={`key_${index}_${category.replace(/[^A-Z0-9]/gi, "_")}`}
            >
              {category}
            </a>
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
        </div>
      </div>
      <ArticlesToolbar search={search} onSearchChange={setSearch} sortBy={sortBy} onSortChange={setSortBy} />
      <div className="row">
        <div className="col">
          <hr />
        </div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {visibleArticles.length > 0 ? (
          visibleArticles.map((article) => (
            <div className="col admin-preview" key={article.id}>
              <ArticlePreview data={article} onEdit={editArticle} />
            </div>
          ))
        ) : (
          <div className="col">
            <div>
              {articleData?.articles?.length > 0
                ? "No articles match your search."
                : "No article in this category"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
