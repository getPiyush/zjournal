import { useState } from "react";
import { updateJournalinDB } from "../datastore/actions/JournalActions";
import { useJournal } from "../datastore/contexts/JournalContext";
import { TemplateRenderer } from "../web/components/Templates/TemplateRenderer";
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
    console.log("Invalid Article Found ", articleId);
    if (invalidArticles.indexOf(articleId) < 0) {
      setInvalidArticles([...invalidArticles, articleId]);
    }
  };

  return (
    <div className="template container">
      <div className="row">
        <div className="col">
          <PageTitle title="Templates" />
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
          <div className="col">
            <button
              disabled={textData === updatedTemplateData}
              className="btn btn-secondary"
              onClick={updateTemplate}
            >
              Preview Template
            </button>
            <button
              disabled={
                invalidArticles.length > 0 ||
                templateData === updatedTemplateData
              }
              className="btn btn-primary"
              onClick={saveTemplate}
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div>
            <h5>Preview</h5>
          </div>
          <div className="p-3">
            <TemplateRenderer
              invalidArticleError={invalidArticleFound}
              dataString={updatedTemplateData}
              mode="edit"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
