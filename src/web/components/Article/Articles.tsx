import React, { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { applicationProperties, months } from "../../../ApplicationConstants";
import {
  getArticleById,
  getArticlesByBlogDate,
  getArticlesBycategory,
} from "../../../datastore/actions/ArticleActions";
import { useArticle } from "../../../datastore/contexts/ArticleContext";

import { PageNotFound } from "../../PageNotFound";
import LoadingPage from "../Loader/LoadingPage";
import ArticlePreviewWeb from "./ArticlePreviewWeb";

export default function Articles() {
  const path = useLocation().pathname;
  const [params] = useSearchParams();
  const categoryId = params.getAll("categoryId")[0];
  const blogDate = params.getAll("blogdate")[0];

  const isArticleByCategory =
    path.search("/articles") !== -1 && categoryId && categoryId !== "";

  const isArticleByBlog =
    path.search("/articles") !== -1 && blogDate && blogDate !== "";

  const { dispatch, state: articleData } = useArticle();

  let title = "";
  if (isArticleByCategory) title = `${categoryId}`;

  if (isArticleByBlog) {
    const yearMonth = blogDate.split("-");
    title = `${months[Number(yearMonth[1]) - 1]} ${yearMonth[0]} `;
  }
  window.document.title = `${title} - ${applicationProperties.title}`;

  useEffect(() => {
    loadArticle();
    //  getArticleById;
  }, []);

  const loadArticle = () => {
    if (isArticleByCategory) {
      getArticlesBycategory(dispatch, categoryId, true);
    } else if (isArticleByBlog) {
      getArticlesByBlogDate(dispatch, blogDate, true);
    }
  };

  const getNoArticle = () => {
    return articleData.status === "error" ? <PageNotFound /> : <LoadingPage />;
  };

  return (
    <div className="container article-viewer">
      {articleData.status !== "loading" && articleData.status !== "error" ? (
        <div className="container article-viewer disable-text-selection">
          <div className="row">
            <div className="col">
              <h2>
                {title} <i>Articles</i>
              </h2>
              <hr />
            </div>
          </div>
          <div className="row">
            {articleData.articles.length > 0 &&
              articleData.articles.map((article, index) => {
                return  <div key={`article_${index}_${article.id}`} className="col-md-6"><ArticlePreviewWeb data={article} /></div>;
              })}
          </div>

          {articleData.articles.length === 0 && (
            <div className="row">
              <div className="col">
                <PageNotFound />
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
