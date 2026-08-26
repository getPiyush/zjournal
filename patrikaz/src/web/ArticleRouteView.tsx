import { Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Article } from "../remotes/uiLibraryComponents";
import { useArticle } from "../datastore/contexts/ArticleContext";
import { useJournal } from "../datastore/contexts/JournalContext";
import { getArticleById } from "../datastore/actions/ArticleActions";
import { updatePage } from "../datastore/actions/JournalActions";
import { applicationProperties } from "../ApplicationConstants";
import { properties } from "../properties";

export default function ArticleRouteView() {
  const path = useLocation().pathname;
  const articleId = path.split("/")[2];
  const isWebArticle = path.search("/article") !== -1 && !!articleId;

  const { dispatch, state: articleData } = useArticle();
  const { state: jState, dispatch: journalDispatch } = useJournal();

  useEffect(() => {
    if (isWebArticle) {
      getArticleById(dispatch, articleId);
    }
  }, [articleId]);

  useEffect(() => {
    if (isWebArticle && articleData.status === "success" && articleData.articles.length > 0) {
      window.document.title = `${articleData.articles[0].title} - ${applicationProperties.title}`;
    }
  }, [articleData]);

  const article = isWebArticle
    ? (articleData.status === "success" ? articleData.articles[0] ?? null : null)
    : jState.journal.currentArticle;
  const status = isWebArticle ? articleData.status : "success";

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Article
        article={article}
        status={status}
        disableTextSelect={properties.disableTextSelect}
        onBrowseCategories={() => updatePage("categories", journalDispatch)}
      />
    </Suspense>
  );
}
