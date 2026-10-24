import { useState } from "react";
import { parsex, ConfirmationButton } from "@zjournal/ui-library";
import { useJournal } from "../../../datastore/contexts/JournalContext";
import { updateJournalinDB } from "../../../datastore/actions/JournalActions";

export const AboutTemplate = () => {
  const { dispatch, state: jState } = useJournal();
  const { aboutUs } = jState.journal;

  // null until the admin edits, so the box shows the saved text even when the journal loads after
  // this page first renders. aboutUs is optional on Journal (it's missing before the journal has
  // loaded), but the length check below requires a string.
  const [draft, setDraft] = useState<string | null>(null);
  const htmlData = draft ?? aboutUs ?? "";

  const dataChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // @todoo add validation
    setDraft(event.target.value);
  };

  const saveTemplate = () => {
    updateJournalinDB(dispatch, { ...jState.journal, aboutUs: htmlData });
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
              value={htmlData}
              onChange={dataChanged}
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
        <ConfirmationButton
              confirmationMessage="Are you sure you want to update the About page?"
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
                {parsex(htmlData)}
            </div>
        </div>
      </div>
    </div>
  );
};
