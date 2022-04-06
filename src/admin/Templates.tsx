import { useState } from "react";
import { updateJournalinDB } from "../datastore/actions/JournalActions";
import { useJournal } from "../datastore/contexts/JournalContext";
import { TemplateRenderer } from "../web/components/Templates/TemplateRenderer";
import ConfirmationButton from "./editor/ConfirmationButton";
import { PageTitle } from "./PageTitle";

export default function Templates() {
  const { dispatch, state: jState } = useJournal();
  const { templateData } = jState.journal;
  const [textData, setTextData] = useState(templateData);
  const [updatedTemplateData, setTemplateData] = useState(templateData);
  const [invalidArticles, setInvalidArticles] = useState([]);

  const dataChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // @todoo add validation
    setTextData(event.target.value);
  };

  const blockInvalidChars = (e) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  };

  const updateTemplate = () => {
    // @todoo add validation
    setInvalidArticles([]);
    setTemplateData(textData);
  };

  const saveTemplate = () => {
    const updatedJournal = {
      ...jState.journal,
      templateData: updatedTemplateData,
    };
    console.log(updatedJournal);
    updateJournalinDB(dispatch, updatedJournal);
  };

  const invalidArticleFound = (articleId: string) => {
    console.log(invalidArticles.join(","),"|",articleId,"|",invalidArticles.indexOf(articleId));
    if (invalidArticles.indexOf(articleId) < 0) {
      setInvalidArticles([...invalidArticles, articleId]);
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
              {invalidArticles.map(articleId=><li>{articleId}</li>)}
            </ul>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="template container">
      <div className="row">
        <div className="col">
          <PageTitle title="Edit Home Template" />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div>
            <h5>Template Code</h5>
          </div>
          <div>
            <textarea
              className="form-control"
              id="dataInputTextAres"
              rows={6}
              onChange={dataChanged}
              onKeyDown={blockInvalidChars}
            >
              {textData}
            </textarea>
          </div>
        </div>
        <div className="row">
          <div className="col top-action-box">
            <button
              disabled={textData === updatedTemplateData}
              className="btn btn-secondary"
              onClick={updateTemplate}
            >
              Preview Template
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
      </div>
      <div className="row">
        <div className="col">
          <hr />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div>
            <h5>Preview</h5>
          </div>
          <div
            className="template-viewer p-3"
            style={{ border: "solid 1px green" }}
          >
            <TemplateRenderer
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
}
