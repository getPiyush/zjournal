import { useState } from "react";
import ReactHtmlParser from "react-html-parser";

import { useJournal } from "../../../datastore/contexts/JournalContext";
import ConfirmationButton from "../../components/editor/ConfirmationButton";
import { updateJournalinDB } from "../../../datastore/actions/JournalActions";

export const AboutTemplate = () => {
  const { dispatch, state: jState } = useJournal();
  const { aboutUs } = jState.journal;

  const [htmlData, setHtmlData] = useState(aboutUs);

  const dataChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // @todoo add validation
    setHtmlData(event.target.value);
  };

  const saveTemplate = () => {
    const updatedJournal = {
      ...jState.journal,
      aboutUs: htmlData,
    };
    console.log(updatedJournal);
    updateJournalinDB(dispatch, updatedJournal);
  };

  return (
    <div className="admin-template-about container">
      <div className="row">
        <div className="col">
          {" "}
          <div>
            <h5>About Us HTML Code</h5>
          </div>
          <div>
            <textarea
              className="form-control"
              id="dataInputTextAres"
              rows={6}
              onChange={dataChanged}
            >
              {htmlData}
            </textarea>
            
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
        <ConfirmationButton
              confirmationMessage="Are you sure want to update About Page?"
              iconComp={null}
              disabled={
                htmlData.length < 20 ||
                aboutUs === htmlData
              }
              buttonText="Save Template"
              confirmationClick={saveTemplate}
            />
            <hr/>
        </div>
      </div>
      <div className="row">
        <div className="col">
        <div>
            <h5>About Us Preview</h5>
          </div>
            <div className="m-3 p-3 admin-preview"
            style={{ border: "solid 1px green" }}>
                {ReactHtmlParser(htmlData)}
            </div>
        </div>
      </div>
    </div>
  );
};
