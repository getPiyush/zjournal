import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import { useContact } from "../datastore/contexts/ContactContext";
import { useArticle } from "../datastore/contexts/ArticleContext";
import { useJournal } from "../datastore/contexts/JournalContext";
import { updateCurrentArticle } from "../datastore/actions/JournalActions";
import { getArticleById } from "../datastore/actions/ArticleActions";
import { defaultArticle } from "../ApplicationConstants";
import { ArticleT, Spinner } from "@zjournal/ui-library";
import ArticleContainer from "./pages/ArticleContainer";
import CategoryEditor from "./pages/CategoryEditor";
import { Contacts } from "./pages/Contacts";
import { Purge } from "./pages/Purge";
import Templates from "./pages/Templates";

export default function AdminContainer() {
  const { state: jState, dispatch } = useJournal();
  const { state: aState, dispatch: aDispatch } = useArticle();
  const { state: cState } = useContact();
  const [searchParams] = useSearchParams();
  const articleIdParam = searchParams.get("id");
  const currentArticle = jState?.journal?.currentArticle;

  // Load the article referenced by ?id= when it isn't already the current article
  useEffect(() => {
    if (articleIdParam && currentArticle?.id !== articleIdParam) {
      getArticleById(aDispatch, articleIdParam);
    }
  }, [articleIdParam]);

  useEffect(() => {
    const fetched = aState.articles?.[0];
    if (articleIdParam && aState.status === "success" && fetched?.id === articleIdParam && currentArticle?.id !== articleIdParam) {
      updateCurrentArticle(fetched, dispatch);
    }
  }, [aState, articleIdParam]);

  const updateJournalArticle = (article: ArticleT) => {
    updateCurrentArticle(article, dispatch);
  };

  const showLoader = jState.status === "loading" || aState.status === "loading" || cState.status.includes("loading");

  const getValidatedArticle = (article: ArticleT) => {
    return article.createdAt &&
      article.updatedAt &&
      article.author !== "" &&
      article.id !== ""
      ? article
      : defaultArticle;
  };

  return (
    <main className="flex-shrink-0">
      <div id="editor" className="admin">
        {showLoader && <Spinner />}
        <Routes>
          <Route path="categories" element={<CategoryEditor />} />
          <Route path="templates" element={<Templates />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="purge" element={<Purge />} />

          <Route
            path="editor"
            element={
              <ArticleContainer
                key={getValidatedArticle(currentArticle).id}
                inArticle={getValidatedArticle(currentArticle)}
                setOutArticle={updateJournalArticle}
              />
            }
          />
          <Route path="/*" element={<CategoryEditor />} />
        </Routes>
      </div>
    </main>
  );
}
