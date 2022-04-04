import { useState } from "react";
import { useJournal } from "../datastore/contexts/JournalContext";
import { TemplateRenderer } from "../web/components/Templates/TemplateRenderer";
import { PageTitle } from "./PageTitle";

export default function Templates() {

  const { state: jState } = useJournal();


  const [textData, setTextData] = useState(jState.journal.templateData);
  const [templateData, setTemplateData] = useState(jState.journal.templateData);

  const dataChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // @todoo add validation
    setTextData(event.target.value);
  };

  const updateTemplate = () => {
    // @todoo add validation
    setTemplateData(textData);
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
          <div><h5>Template Code</h5></div>
          <div>
            <textarea
              className="form-control"
              id="dataInputTextAres"
              rows={6}
              onChange={dataChanged}
            >
              {textData}
            </textarea>
          </div>
        </div>
        <div className="row">
        <div className="col">
          <button className="btn btn-secondary" onClick={updateTemplate}>Preview Template</button>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div><h5>Preview</h5></div>
          <div className="p-3">
            <TemplateRenderer dataString={templateData} />
          </div>
        </div>
      </div>
    </div>
  );
}
