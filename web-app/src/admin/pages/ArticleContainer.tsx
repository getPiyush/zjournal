import React, { useEffect, useRef, useState } from "react";
import { ArticleT, Article, ArticleEditor, SaveButton, PageTitle } from "@zjournal/ui-library";
import { useArticle } from "../../datastore/contexts/ArticleContext";
import { useJournal } from "../../datastore/contexts/JournalContext";
import { addArticleToDB, updateArticleinDB } from "../../datastore/actions/ArticleActions";
import { defaultArticle } from "../../ApplicationConstants";
import { properties } from "../../properties";
import { useUnsavedChangesGuard } from "../useUnsavedChangesGuard";

const UNSAVED_CHANGES_MESSAGE = "You have unsaved changes to this article. Leave without saving them?";

const sameArticle = (a: ArticleT, b: ArticleT) => JSON.stringify(a) === JSON.stringify(b);

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
  // The latest edits (previewed or not) and the version last saved to the server. They differ
  // while there are unsaved changes; leaving the editor then asks first.
  const [draft, setDraft] = useState(inArticle);
  const [lastSaved, setLastSaved] = useState(inArticle);
  const pendingSave = useRef<ArticleT | null>(null);

  useUnsavedChangesGuard(!sameArticle(draft, lastSaved), UNSAVED_CHANGES_MESSAGE);

  const savedArticle = aState.status === "add_article_success" && aState.articles.length > 0 ? aState.articles[0] : null;

  // Settle a save once its request finishes. A failed save leaves the changes unsaved.
  useEffect(() => {
    const saving = pendingSave.current;
    if (!saving || aState.status === "loading") return;
    pendingSave.current = null;
    if (aState.status === "add_article_success" && aState.articles[0]) {
      // Continue with the created article (it now has an id), so saving again updates it
      // instead of creating a duplicate.
      const created = aState.articles[0];
      setArticle(created);
      setDraft(created);
      setLastSaved(created);
    } else if (aState.status === "success") {
      setLastSaved(saving);
    }
  }, [aState]);

  const onSave = (savedArticleOut: ArticleT, isNew: boolean) => {
    pendingSave.current = savedArticleOut;
    if (isNew) {
      addArticleToDB(dispatch, savedArticleOut);
    } else {
      updateArticleinDB(dispatch, savedArticleOut);
    }
  };

  const showPreview = (updatedArticle: ArticleT) => {
    setArticle(updatedArticle);
    setDraft(updatedArticle);
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
              onChange={setDraft}
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
