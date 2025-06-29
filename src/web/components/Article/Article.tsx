import React, { useEffect, useState } from "react";
import { parsex } from "../../../utils/parserUtil";
import { useLocation } from "react-router-dom";
import { applicationProperties } from "../../../ApplicationConstants";
import { getArticleById } from "../../../datastore/actions/ArticleActions";
import { useArticle } from "../../../datastore/contexts/ArticleContext";

import { ArticleT } from "../../../Types";
import { getDate } from "../../../utils/componentUtil";
import { PageNotFound } from "../../PageNotFound";
import LoadingPage from "../Loader/LoadingPage";
import ArticleContainer from "./ArticleContainer";
import { properties } from "../../../properties";

type ArticleProps = {
  data: ArticleT;
};

export default function Article({ data }: ArticleProps) {
  const path = useLocation().pathname;
  const articleId = path.split("/")[3];
  const isWebArticle =
    path.search("/article") !== -1 && articleId && articleId !== "";

  const { dispatch, state: articleData } = useArticle();

  const [article, setArticle] = useState(data);

  useEffect(() => {
    loadArticle();
  }, []);

  useEffect(() => {
    if (
      isWebArticle &&
      articleData.status === "success" &&
      articleData.articles.length > 0
    ) {
      setArticle(articleData.articles[0]);
      window.document.title = `${articleData.articles[0].title} - ${applicationProperties.title}`;
    } else if (isWebArticle && articleData.status === "error") {
      setArticle(null);
    }
  }, [articleData]);

  const loadArticle = () => {
    if (isWebArticle) {
      getArticleById(dispatch, articleId);
    } else {
      setArticle(data);
    }
  };

  const getNoArticle = () => {
    return articleData.status === "loading" ? (
      <LoadingPage />
    ) : (
      <PageNotFound />
    );
  };

  return (
    <div className="container article-viewer">
      {article && article.title !== "" && !article.deleteFlag ? (
        <div className={`container article-viewer ${properties.disableTextSelect?"disable-text-selection":""}`}>
          <div className="row">
            <div className="col">
              {" "}
              <h1>{parsex(article.title)}</h1>
            </div>
          </div>
          <div className="row">
            <div className="col">
              {" "}
              <div className="sub-header">
                <span>
                  By <b>{article.author}</b> on {getDate(article.dateCreated)}
                </span>
                <div>
                  <span className="badge bg-success">{article.categryId}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              {" "}
              <ArticleContainer containerJson={article.content} />
            </div>
          </div>
          {article.dateCreated !== article.dateModified && (
            <div className="row">
              <div className="col sub-header">
                <i>
                  Last Updated on <b>{getDate(article.dateModified)}</b>
                </i>
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
