import { parsex } from "../utils/parserUtil";

import { applicationProperties } from "../ApplicationConstants";
import { useJournal } from "../datastore/contexts/JournalContext";

export default function AboutUs() {
  window.document.title = `About - ${applicationProperties.title}`;
  const { state: jState } = useJournal();

  return (
    <div className="about-us container">
      {jState.journal.aboutUs === "" ? (
        <div className="row">
          <div className="col">
        
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col">
            <div className="container">
              {parsex(jState.journal.aboutUs)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
