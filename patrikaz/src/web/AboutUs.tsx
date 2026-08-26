import { useEffect, useState, type ReactNode } from "react";
import { applicationProperties } from "../ApplicationConstants";
import { useJournal } from "../datastore/contexts/JournalContext";
import { loadUiLibrary } from "../remotes/uiLibraryModule";

export default function AboutUs() {
  window.document.title = `About - ${applicationProperties.title}`;
  const { state: jState } = useJournal();
  const [parsedContent, setParsedContent] = useState<ReactNode>(null);

  useEffect(() => {
    if (jState.journal.aboutUs === "" || !jState.journal.aboutUs) {
      setParsedContent(null);
      return;
    }
    let cancelled = false;
    loadUiLibrary().then(({ parsex }) => {
      if (!cancelled) setParsedContent(parsex(jState.journal.aboutUs as string));
    });
    return () => {
      cancelled = true;
    };
  }, [jState.journal.aboutUs]);

  return (
    <div className="about-us container">
      {parsedContent && (
        <div className="row">
          <div className="col">
            <div className="container">{parsedContent}</div>
          </div>
        </div>
      )}
    </div>
  );
}
