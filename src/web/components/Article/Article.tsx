import React, { useEffect, useState } from "react";
import ReactHtmlParser from "react-html-parser";
import { useLocation } from "react-router-dom";
import { applicationProperties } from "../../../ApplicationConstants";
import { getArticleById } from "../../../datastore/actions/ArticleActions";
import { useArticle } from "../../../datastore/contexts/ArticleContext";

import { ArticleT } from "../../../Types";
import { getDate } from "../../../utils/componentUtil";
import { PageNotFound } from "../../PageNotFound";
import ArticleContainer from "./ArticleContainer";

type ArticleProps = {
  data: ArticleT;
};

export default function Article({ data }: ArticleProps) {
  const path = useLocation().pathname;
  const articleId = path.split("/")[3];
  const isWebArticle = path.search("/article") !== -1 && articleId && articleId !== "";

  const { dispatch, state: articleData } = useArticle();

  const [article, setArticle] = useState(data);

  useEffect(() => {
    loadArticle();
  }, []);

  useEffect(() => {
    if (isWebArticle && articleData.status === "success" && articleData.articles.length > 0) {
      setArticle(articleData.articles[0]);
      window.document.title =  `${articleData.articles[0].title} - ${applicationProperties.title}`;
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
      {article && article.title !== "" ? (
        <div className="container article-viewer disable-text-selection">
          <h1>{ReactHtmlParser(article.title)}</h1>
          <div className="sub-header">
            <span>
              By <b>{article.author}</b> on {getDate(article.dateCreated)}
            </span>
            <div>
              <span className="badge bg-success">{article.categryId}</span>
            </div>
          </div>
          <ArticleContainer containerJson={article.content} />
        </div>
      ) : (
        getNoArticle()
      )}
    </div>
  );
}
