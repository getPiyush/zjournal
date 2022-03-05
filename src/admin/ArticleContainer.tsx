import React, { useState } from "react";
import { ArticleT } from "../Types";
import Article from "../web/components/Article/Article";
import ArticleEditor from "./editor/ArticleEditor";
import { PageTitle } from "./PageTitle";

type ArticleContainerProps = {
  inArticle: ArticleT;
  setOutArticle: (article: ArticleT) => void;
};

export default function ArticleContainer({
  inArticle,
  setOutArticle,
}: ArticleContainerProps) {
  const [article, setArticle] = useState(inArticle);
  const [editMode, setEditMode] = useState(true);

  const showPreview = (updatedArticle: ArticleT) => {
    setArticle(updatedArticle);
    setOutArticle(updatedArticle);
    setEditMode(false);
  };

  console.log("Creating New Article...??", article);

  const hidePreview = () => {
    setEditMode(true);
  };

  return (
    <div id="editor" className="editor container">      
    <div className="row">
        <div className="col">
        <PageTitle title="Article Editor"/>        </div>
      </div>
      <div className="row">
        <div className="col">
        {editMode && (
        <ArticleEditor articleIn={article} setPreview={showPreview} />
      )}
      {!editMode && (
        <React.Fragment>
          <div className="top-action-box">
            <button className="btn btn-primary btn-sm" onClick={hidePreview}>
              <i className="bi bi-pencil"></i>&nbsp;&nbsp;Edit
            </button>
          </div>
          <Article data={article} />
        </React.Fragment>
      )}        </div>
      </div>
    </div>
  );
}
