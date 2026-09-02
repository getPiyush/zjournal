import { useEffect, useState } from "react";
import { ConfirmationButton } from "@zjournal/ui-library";
import { useJournal } from "../../../datastore/contexts/JournalContext";
import { updateJournalinDB } from "../../../datastore/actions/JournalActions";
import TemplateRendererView from "../../../components/TemplateRendererView";
import { applicationProperties } from "../../../ApplicationConstants";

// Row layout for auto-generated templates: 1 hero article, then rows of 3/5/5
// bar-separated articles, ranked by analytics view count (most-read first).
const AUTO_GENERATE_ROW_SIZES = [1, 3, 5, 5];
const AUTO_GENERATE_ARTICLE_COUNT = AUTO_GENERATE_ROW_SIZES.reduce(
  (sum, size) => sum + size,
  0
);

/*
type HomeTemplateProps = {
    title: string;
  };
 */

export const HomeTemplate = () => {
  const { dispatch, state: jState } = useJournal();
  const { templateData } = jState.journal;

  const [textData, setTextData] = useState(templateData);
  const [updatedTemplateData, setTemplateData] = useState(templateData);
  const [invalidArticles, setInvalidArticles] = useState([]);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [autoGenerateError, setAutoGenerateError] = useState(null);

  useEffect(() => {
    if (invalidArticles.length === 0) setTemplateData(textData);
  }, [invalidArticles]);

  /* useEffect(() => {
        setInvalidArticles([]);
      }, [textData]);
    */
  // let invalidArticles = [];
  const dataChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // @todoo add validation
    setTextData(event.target.value);
  };

  const updateTemplate = () => {
    // @todoo add validation
    setInvalidArticles([]);
  };

  const autoGenerateTemplate = async () => {
    setAutoGenerating(true);
    setAutoGenerateError(null);
    try {
      const response = await fetch(
        `${applicationProperties.analyticsUrl}/api/applications/${applicationProperties.applicationName}/stats`
      );
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "No analytics data recorded yet — read some articles first."
            : `Analytics request failed (${response.status}).`
        );
      }
      const stats = await response.json();
      const rankedArticleIds = stats.articles
        .slice(0, AUTO_GENERATE_ARTICLE_COUNT)
        .map((article) => article.articleId);

      let cursor = 0;
      const generatedTemplate = AUTO_GENERATE_ROW_SIZES.map((rowSize) => {
        const row = rankedArticleIds.slice(cursor, cursor + rowSize);
        cursor += rowSize;
        return row.join("|");
      })
        .filter((row) => row.length > 0)
        .join("\n");

      setTextData(generatedTemplate);
      setInvalidArticles([]);
    } catch (err) {
      setAutoGenerateError(err.message);
    } finally {
      setAutoGenerating(false);
    }
  };

  const blockInvalidChars = (e) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  };

  const saveTemplate = () => {
    const updatedJournal = {
      ...jState.journal,
      templateData: updatedTemplateData,
    };
    console.log(updatedJournal);
    updateJournalinDB(dispatch, updatedJournal);
  };

  const removeItem = (arr: Array<string>, value: string): Array<string> => {
    const updatedArr = [...arr];
    const index = updatedArr.indexOf(value);

    if (index > -1) {
      updatedArr.splice(index, 1);
    }
    return updatedArr;
  };

  const addItem = (arr: Array<string>, value: string): Array<string> => {
    const updatedArr = [...arr];
    updatedArr.push(value);
    return updatedArr;
  };

  const invalidArticleFound = (articleId: string, flag) => {
    if (textData.includes(articleId)) {
      if (invalidArticles.indexOf(articleId) === -1 && flag) {
        const updatedArray = addItem(invalidArticles, articleId);
        if (invalidArticles.join("") !== updatedArray.join(""))
          setInvalidArticles(updatedArray);
      }

      if (!flag) {
        const updatedArray = removeItem(invalidArticles, articleId);
        if (invalidArticles.join("") !== updatedArray.join(""))
          setInvalidArticles(updatedArray);
      }
    }
  };

  const showToasts = () => (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: "11" }}>
      <div className="card border-danger mb-3">
        <div className="card-header">Invalid Article ID(s)</div>
        <div className="card-body text-danger">
          <div className="card-title">
            <b>Following Article IDs are invalid</b>
          </div>
          <p className="card-text">
            <ul>
              {invalidArticles.map((articleId) => (
                <li>{articleId}</li>
              ))}
            </ul>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-template-home container">
      <div className="row">
        <div className="col">
          <div>
            <h5>Home Template Code</h5>
          </div>
          <div>
            <textarea
              className="form-control"
              id="dataInputTextAres"
              rows={6}
              value={textData}
              onChange={dataChanged}
              onKeyDown={blockInvalidChars}
            />
          </div>
        </div>
        <div className="row">
          <div className="col top-action-box">
            <button
              disabled={autoGenerating}
              className="btn btn-outline-primary"
              onClick={autoGenerateTemplate}
            >
              {autoGenerating ? "Generating…" : "Auto generate"}
            </button>
            <button
              disabled={textData === updatedTemplateData}
              className="btn btn-secondary"
              onClick={updateTemplate}
            >
              Preview
            </button>
            <ConfirmationButton
              confirmationMessage="Are you sure want to update Home Page?"
              iconComp={null}
              disabled={
                invalidArticles.length > 0 ||
                templateData === updatedTemplateData
              }
              buttonText="Save Template"
              confirmationClick={saveTemplate}
            />
          </div>
        </div>
        {autoGenerateError && (
          <div className="row">
            <div className="col text-danger">{autoGenerateError}</div>
          </div>
        )}
      </div>
      <div className="row">
        <div className="col">
          <hr />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div>
            <h5>Home Template Preview</h5>
          </div>
          <div
            className="template-viewer p-3"
            style={{ border: "solid 1px green" }}
          >
            <TemplateRendererView
              invalidArticleError={invalidArticleFound}
              dataString={updatedTemplateData}
              mode="edit"
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col mt-2 mb-2">
          <span>
            Note: Please be careful beofre updating the home page template,
            preview it properly before saving.
          </span>
        </div>
      </div>
      {invalidArticles.length > 0 && showToasts()}
    </div>
  );
};
