import React from "react";
import { ArticleT } from "../../Types";

import { PageNotFound } from "../PageNotFound";
import LoadingPage from "../Loader/LoadingPage";
import ArticlePreviewWeb from "./ArticlePreviewWeb";

type ArticlesProps = {
  title: string;
  status: string;
  articles: ArticleT[];
  disableTextSelect?: boolean;
  onBrowseCategories?: () => void;
};

export default function Articles({ title, status, articles, disableTextSelect, onBrowseCategories }: ArticlesProps) {
  const getNoArticle = () => {
    return status === "error" ? <PageNotFound onBrowseCategories={onBrowseCategories} /> : <LoadingPage />;
  };

  return (
    <div className="container article-viewer">
      {status !== "loading" && status !== "error" ? (
        <div className={`container article-viewer ${disableTextSelect ? "disable-text-selection" : ""}`}>
          <div className="row">
            <div className="col">
              <h2>
                {title} <i>Articles</i>
              </h2>
              <hr />
            </div>
          </div>
          <div className="row">
            {articles.length > 0 &&
              articles.map((article, index) => {
                return  <div key={`article_${index}_${article.id}`} className="col-md-6"><ArticlePreviewWeb data={article} /></div>;
              })}
          </div>

          {articles.length === 0 && (
            <div className="row">
              <div className="col">
                <PageNotFound onBrowseCategories={onBrowseCategories} />
              </div>
            </div>
          )}
        </div>
      ) : (
        getNoArticle()
      )}
    </div>
  );
}
