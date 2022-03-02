import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ArticleT } from "../Types";
import { getUid } from "../utils/componentUtil";
import ArticleContainer from "./ArticleContainer";
import CategoryEditor from "./CategoryEditor";
import ArticleContainerEditor from "./editor/ArticleContainerEditor";

export default function EditorContainer() {
  const defaulArticle: ArticleT = {
    id: getUid(),
    author: "Piyush Praharaj",
    title: "",
    dateCreated: new Date(),
    dateModified: new Date(),
    categryId: "NONE",
    content: [],
  };
  const [article, setArticle] = useState(defaulArticle);

  console.log(article);

  return (
    <main className="flex-shrink-0">
      <div id="editor" className="admin">
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
        </Routes>
      </div>
    </main>
  );
}
