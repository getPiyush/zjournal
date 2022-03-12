import React, { useEffect } from "react";
import { getJournalFromDB } from "../datastore/actions/JournalActions";
import { useJournal } from "../datastore/contexts/JournalContext";

import Footer from "../web/Footer";
import EditorContainer from "./EditorContainer";
import Header from "./Header";

export default function Admin() {

  const {dispatch} = useJournal();

  useEffect(() => {
    getJournalFromDB(dispatch);
    window.document.title = "zJournal Admin Panel";
  }, []);

  return (
    <React.Fragment>
      <Header />
      <EditorContainer/>
      <Footer />
      </React.Fragment>
  );
}
