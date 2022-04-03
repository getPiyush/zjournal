import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { updateCurrentArticle } from "../datastore/actions/JournalActions";
import { useArticle } from "../datastore/contexts/ArticleContext";
import { useJournal } from "../datastore/contexts/JournalContext";
import { ArticleT } from "../Types";
import { Spinner } from "../web/components/Spinner";
import ArticleContainer from "./ArticleContainer";
import CategoryEditor from "./CategoryEditor";
import Templates from "./Templates";

export default function AdminContainer() {
  const { state: jState, dispatch } = useJournal();
  const { state: aState } = useArticle();

  const updateJournalArticle = (article: ArticleT) => {
    updateCurrentArticle(article, dispatch);
  };

  const showLoader = jState.status === "loading" || aState.status === "loading";

  return (
    <main className="flex-shrink-0">
      <div id="editor" className="admin">
        {showLoader && <Spinner />}
        <Routes>
          <Route path="categories" element={<CategoryEditor />} />
          <Route path="templates" element={<Templates />} />
          <Route
            path="editor"
            element={
              <ArticleContainer
                inArticle={jState?.journal?.currentArticle}
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
