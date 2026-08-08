import React, { useState } from "react";
import { ArticleT, Article, ArticleEditor, SaveButton, PageTitle } from "@zjournal/ui-library";
import { useArticle } from "../../datastore/contexts/ArticleContext";
import { useJournal } from "../../datastore/contexts/JournalContext";
import { addArticleToDB, updateArticleinDB } from "../../datastore/actions/ArticleActions";
import { defaultArticle } from "../../ApplicationConstants";
import { properties } from "../../properties";

type ArticleContainerProps = {
  inArticle: ArticleT;
  setOutArticle: (article: ArticleT) => void;
};

export default function ArticleContainer({
  inArticle,
  setOutArticle,
}: ArticleContainerProps) {
  const { dispatch, state: aState } = useArticle();
  const { state: jState } = useJournal();

  const [article, setArticle] = useState(inArticle);
  const [editMode, setEditMode] = useState(true);

  const savedArticle = aState.status === "add_article_success" && aState.articles.length > 0 ? aState.articles[0] : null;

  const onSave = (savedArticleOut: ArticleT, isNew: boolean) => {
    if (isNew) {
      addArticleToDB(dispatch, savedArticleOut);
    } else {
      updateArticleinDB(dispatch, savedArticleOut);
    }
  };

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
            <ArticleEditor
              articleIn={article}
              setPreview={showPreview}
              defaultArticle={defaultArticle}
              availableComponents={jState.journal?.components ?? []}
              categories={jState.journal?.categories ?? []}
              savedArticle={savedArticle}
            />
          )}
          {!editMode && (
            <React.Fragment>
              <div className="top-action-box">
                <SaveButton article={article} onSave={onSave} />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={hidePreview}
                >
                  <i className="bi bi-pencil"></i>&nbsp;&nbsp;Edit
                </button>
              </div>
              <hr />
              <Article article={article} status="success" disableTextSelect={properties.disableTextSelect} />
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}
