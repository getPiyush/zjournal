import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useContact } from "../datastore/contexts/ContactContext";
import { useArticle } from "../datastore/contexts/ArticleContext";
import { useJournal } from "../datastore/contexts/JournalContext";
import { updateCurrentArticle } from "../datastore/actions/JournalActions";
import { defaultArticle } from "../ApplicationConstants";
import { ArticleT, Spinner } from "@zjournal/ui-library";
import ArticleContainer from "./pages/ArticleContainer";
import CategoryEditor from "./pages/CategoryEditor";
import { Contacts } from "./pages/Contacts";
import { Purge } from "./pages/Purge";
import Templates from "./pages/Templates";

export default function AdminContainer() {
  const { state: jState, dispatch } = useJournal();
  const { state: aState } = useArticle();
  const { state: cState } = useContact();


  const updateJournalArticle = (article: ArticleT) => {
    updateCurrentArticle(article, dispatch);
  };

  const showLoader = jState.status === "loading" || aState.status === "loading" || cState.status.includes("loading");

  const getValidatedArticle = (article: ArticleT) => {
    return article.dateCreated &&
      article.dateModified &&
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
                inArticle={getValidatedArticle(jState?.journal?.currentArticle)}
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
