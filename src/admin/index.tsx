import React, { useState } from "react";


import { ArticleT } from "../Types";
import { getUid } from "../utils/componentUtil";

import Article from "../web/Article/Article";
import Footer from "../web/Footer";
import ArticleEditor from "./editor/ArticleEditor";
import Header from "./Header";

export default function Admin() {
  const defaulArticle : ArticleT = {
    id: getUid(),
    author: "Piyush Praharaj",
    title: "",
    dateCreated: new Date(),
    dateModified: new Date(),
    categryId: "NONE",
    content: []};
  const [article, setArticle] = useState(defaulArticle);
  const [editMode, setEditMode] = useState(true);


  const showPreview = (updatedArticle:ArticleT) => {
    setArticle(updatedArticle);
    setEditMode(false);
  };

  const hidePreview = () => {
    setEditMode(true);
  };

  return (
    <div id="editor" className="admin">
      <Header/>
      <main className="flex-shrink-0">
      {editMode && <ArticleEditor articleIn={article} setPreview={showPreview}/>}
      {!editMode && <React.Fragment> <div><button
            className="btn btn-primary btn-sm"
            onClick={hidePreview}
          >
            <i className="bi bi-pencil"></i>&nbsp;&nbsp;Edit
          </button></div><Article data={article}/></React.Fragment>}
      </main>
      
      <Footer/>
    </div>
  );
}
