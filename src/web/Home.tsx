import React, { useEffect } from "react";
import { applicationProperties } from "../ApplicationConstants";
import { getArticlesByIds } from "../datastore/actions/ArticleActions";
import { useArticle } from "../datastore/contexts/ArticleContext";
import { useJournal } from "../datastore/contexts/JournalContext";
import { getArticleFromId } from "../utils/componentUtil";
import { ArticleScroller } from "./components/ArticleScroller";
import ArticleCard from "./components/Home/ArticleCard";
import HeroArticle from "./components/Home/HeroArticle";

export default function Home() {
  const { state: jState } = useJournal();
  const { dispatch, state: articleData } = useArticle();

  useEffect(() => {
    if (jState.journal.templateArticles.length > 0)
      getArticlesByIds(dispatch, jState.journal.templateArticles);
  }, [jState]);

  window.document.title = `Home - ${applicationProperties.title}`;

  const getArticleFromIndex = (index) => {
    // console.log("getArticleFromId", jState.journal, articleData.articles);
    return getArticleFromId(
      jState.journal.templateArticles[index],
      articleData.articles
    );
  };

  return (
      <div className="container">
        <div className="row">
          <div className="col">
            {articleData.articles && getArticleFromIndex(0) && (
              <HeroArticle article={getArticleFromIndex(0)} />
            )}
          </div>
        </div>
        <div className="row">
          <div className="col">
            {articleData.articles && getArticleFromIndex(1) && (
              <ArticleCard article={getArticleFromIndex(1)} />
            )}
            {articleData.articles && getArticleFromIndex(2) && (
              <ArticleCard article={getArticleFromIndex(2)} />
            )}
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            {articleData.articles && getArticleFromIndex(3) && (
              <ArticleCard article={getArticleFromIndex(3)} />
            )}
          </div>
          <div className="col-md-6">
            {articleData.articles && getArticleFromIndex(4) && (
              <ArticleCard article={getArticleFromIndex(4)} />
            )}
          </div>
        </div>
        <div className="row">
          <div className="col">
            <ArticleScroller/>
          </div>
        </div>
      </div>
  );
}
