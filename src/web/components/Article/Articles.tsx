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
  if (isArticleByCategory) title = "Showing Articles Related to " + categoryId;

  if (isArticleByBlog) {
    const yearMonth = blogDate.split("-");
    title =
      `Showing Articles for ${months[Number(yearMonth[1])-1]} ${yearMonth[0]}`;
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
    return articleData.status === "loading" ? (
      <h4>
        <br />
        <br />
        <br />
        <br />
        <br />
        ...
      </h4>
    ) : (
      <PageNotFound />
    );
  };

  return (
    <div className="container article-viewer">
      {articleData.status !== "loading" && articleData.status !== "error" ? (
        <div className="container article-viewer disable-text-selection">
          <h2>{title}</h2>
          <hr/>
          {articleData.articles.length > 0 &&
            articleData.articles.map((article) => {
              return <ArticlePreviewWeb data={article} />;
            })}

          {articleData.articles.length === 0 && <PageNotFound />}
        </div>
      ) : (
        getNoArticle()
      )}
    </div>
  );
}
