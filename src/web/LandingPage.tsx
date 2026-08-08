import React, { useEffect } from "react";

import Header from "./Header";
import Content from "./Content";
import { SidePanel } from "@zjournal/ui-library";
import Footer from "./Footer";
import { getJournalFromDB } from "../datastore/actions/JournalActions";
import { useJournal } from "../datastore/contexts/JournalContext";
import { applicationProperties } from "../ApplicationConstants";

export default function LandingPage() {

  const {state, dispatch} = useJournal();

  useEffect(() => {
    getJournalFromDB(dispatch);
  }, []);


  return (
    <React.Fragment>
      <Header />
      <Content />
      <SidePanel
        selectedPage={state.journal.selectedPage}
        categories={state.journal.categories}
        startDate={applicationProperties.startDate}
      />
      <Footer />
    </React.Fragment>
  );
}
