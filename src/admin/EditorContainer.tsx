import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useArticle } from "../datastore/contexts/ArticleContext";
import { useJournal } from "../datastore/contexts/JournalContext";
import { ArticleT } from "../Types";
import { getUid } from "../utils/componentUtil";
import { Spinner } from "../web/components/Spinner";
import ArticleContainer from "./ArticleContainer";
import CategoryEditor from "./CategoryEditor";

const defaulArticle: ArticleT = {
  id: getUid(),
  author: "Piyush Praharaj",
  title: "",
  dateCreated: new Date(),
  dateModified: new Date(),
  categryId: "NONE",
  content: [],
};

export default function EditorContainer() {
  const { state: jState } = useJournal();
  const { state: aState } = useArticle();

  const [article, setArticle] = useState(
    jState?.journal?.currentArticle?.id
      ? jState.journal.currentArticle
      : defaulArticle
  );

  useEffect(() => {
    if (
      jState?.journal?.currentArticle?.id &&
      jState?.journal?.currentArticle?.id !== article.id
    )
      setArticle(jState.journal.currentArticle);
  }, [jState]);

  console.log("jState = ", jState);

  const showLoader = jState.status === "loading" || aState.status === "loading";

  return (
    <main className="flex-shrink-0">
      <div id="editor" className="admin">
        {showLoader && <Spinner />}
        <Routes>
          <Route path="categories" element={<CategoryEditor />} />
          <Route
            path="editor"
            element={
              <ArticleContainer
                inArticle={article}
                setOutArticle={setArticle}
              />
            }
          />
          <Route path="/*" element={<CategoryEditor />} />
        </Routes>
      </div>
    </main>
  );
}
