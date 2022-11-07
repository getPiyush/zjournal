import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { defaultArticle } from "../ApplicationConstants";
import { updateCurrentArticle } from "../datastore/actions/JournalActions";
import { useArticle } from "../datastore/contexts/ArticleContext";
import { useContact } from "../datastore/contexts/ContactContext";
import { useJournal } from "../datastore/contexts/JournalContext";
import { ArticleT } from "../Types";
import { Spinner } from "../web/components/Spinner";
import ArticleContainer from "./pages/ArticleContainer";
import CategoryEditor from "./pages/CategoryEditor";
import { Contacts } from "./pages/Contacts";
import { Purge } from "./pages/Purge";
import Templates from "./pages/Templates";
import UserInfo from "./pages/UserInfo";

export default function AdminContainer() {
  const { state: jState, dispatch } = useJournal();
  const { state: aState } = useArticle();
  const { state: cState } = useContact();


  const updateJournalArticle = (article: ArticleT) => {
    updateCurrentArticle(article, dispatch);
  };

  const showLoader = jState.status === "loading" || aState.status === "loading" || cState.status.includes("loading");

  const getValidatedArticle = (article: ArticleT) => {
    console.log("current jstate article = ", jState.journal.currentArticle);
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
          <Route path="edituserinfo" element={<UserInfo />} />
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
