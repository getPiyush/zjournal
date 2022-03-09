import React, { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  getArticleById,
  getArticlesBycategory,
} from "../../../datastore/actions/ArticleActions";
import { useArticle } from "../../../datastore/contexts/ArticleContext";

import { PageNotFound } from "../../PageNotFound";
import ArticlePreviewWeb from "./ArticlePreviewWeb";

export default function Articles() {
  const path = useLocation().pathname;
  const [params] = useSearchParams();
  const categoryId = params.getAll("categoryId")[0];
  const blogDate = params.getAll("blogDate")[0];
  console.log("useSearchParams()=", categoryId, blogDate);
  const isArticleByCategory =
    path.search("/articles") !== -1 && categoryId && categoryId !== "";

  const { dispatch, state: articleData } = useArticle();

  useEffect(() => {
    loadArticle();
    getArticleById;
  }, []);

  const loadArticle = () => {
    if (isArticleByCategory) {
      getArticlesBycategory(dispatch, categoryId, true);
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
          {articleData.articles.length>0 && articleData.articles.map((article) => {
            return <ArticlePreviewWeb data={article} />;
          })}

{articleData.articles.length===0 && 

<PageNotFound/>
}
        </div>
      ) : (
        getNoArticle()
      )}
    </div>
  );
}
