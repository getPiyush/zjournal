import React, { useMemo, useState } from "react";
import { ArticleViewer } from "./Article.styles";

import { ArticleT } from "../../Types";

import { PageNotFound } from "../PageNotFound";
import LoadingPage from "../Loader/LoadingPage";
import ArticlePreviewWeb from "./ArticlePreviewWeb";
import ArticlesToolbar, { ArticleSortOption } from "./ArticlesToolbar";

type ArticlesProps = {
  title: string;
  status: string;
  articles: ArticleT[];
  disableTextSelect?: boolean;
  onBrowseCategories?: () => void;
  basePath?: string;
};

const sortArticles = (articles: ArticleT[], sortBy: ArticleSortOption) => {
  return [...articles].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "newest":
      default:
        return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
    }
  });
};

export default function Articles({ title, status, articles, disableTextSelect, onBrowseCategories, basePath }: ArticlesProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<ArticleSortOption>("newest");

  const visibleArticles = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const filtered = searchTerm
      ? articles.filter((article) => article.title.toLowerCase().includes(searchTerm))
      : articles;
    return sortArticles(filtered, sortBy);
  }, [articles, search, sortBy]);

  const getNoArticle = () => {
    return status === "error" ? <PageNotFound onBrowseCategories={onBrowseCategories} basePath={basePath} /> : <LoadingPage />;
  };

  return (
    <ArticleViewer className="container">
      {status !== "loading" && status !== "error" ? (
        <ArticleViewer className="container" $disableTextSelect={disableTextSelect}>
          <div className="row">
            <div className="col">
              <h2>
                {title} <i>Articles</i>
              </h2>
              <hr />
            </div>
          </div>

          {articles.length > 0 && (
            <ArticlesToolbar search={search} onSearchChange={setSearch} sortBy={sortBy} onSortChange={setSortBy} />
          )}

          <div className="row">
            {visibleArticles.length > 0 &&
              visibleArticles.map((article, index) => {
                return  <div key={`article_${index}_${article.id}`} className="col-md-6"><ArticlePreviewWeb data={article} /></div>;
              })}
          </div>

          {articles.length === 0 && (
            <div className="row">
              <div className="col">
                <PageNotFound onBrowseCategories={onBrowseCategories} basePath={basePath} />
              </div>
            </div>
          )}

          {articles.length > 0 && visibleArticles.length === 0 && (
            <div className="row">
              <div className="col">No articles match your search.</div>
            </div>
          )}
        </ArticleViewer>
      ) : (
        getNoArticle()
      )}
    </ArticleViewer>
  );
}
