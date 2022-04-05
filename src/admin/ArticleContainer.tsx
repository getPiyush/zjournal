import React, { useEffect, useState } from "react";
import { useArticle } from "../datastore/contexts/ArticleContext";
import { ArticleT } from "../Types";
import Article from "../web/components/Article/Article";
import ArticleEditor from "./editor/ArticleEditor";
import SaveButton from "./editor/SaveButton";
import { PageTitle } from "./PageTitle";

type ArticleContainerProps = {
  inArticle: ArticleT;
  setOutArticle: (article: ArticleT) => void;
};

export default function ArticleContainer({
  inArticle,
  setOutArticle,
}: ArticleContainerProps) {
  const { state: aState } = useArticle();
  
  const [article, setArticle] = useState(inArticle);
  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
    if (
      aState.status === "add_article_success" &&
      article.id === "" &&
      aState.articles.length > 0
    ) {
      setArticle(aState.articles[0]);
    }
  }, [aState]);

  const showPreview = (updatedArticle: ArticleT) => {
    setArticle(updatedArticle);
    setOutArticle(updatedArticle);
    setEditMode(false);
  };

  const hidePreview = () => {
    setEditMode(true);
  };

  return (
    <div id="article_editor" className="editor container">
      <div className="row">
        <div className="col">
          <PageTitle title="Article Editor" />{" "}
        </div>
      </div>
      <div className="row">
        <div className="col">
          {editMode && (
            <ArticleEditor articleIn={article} setPreview={showPreview} />
          )}
          {!editMode && (
            <React.Fragment>
              <div className="top-action-box">
                <SaveButton article={article} />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={hidePreview}
                >
                  <i className="bi bi-pencil"></i>&nbsp;&nbsp;Edit
                </button>
              </div>
              <hr/>
              <Article data={article} />
            </React.Fragment>
          )}{" "}
        </div>
      </div>
    </div>
  );
}
