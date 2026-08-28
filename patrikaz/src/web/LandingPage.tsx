import React, { Suspense, useEffect } from "react";
import { useLoaderData } from "react-router-dom";

import Header from "./Header";
import Content from "./Content";
import { SidePanel } from "../remotes/uiLibraryComponents";
import Footer from "./Footer";
import { useJournal } from "../datastore/contexts/JournalContext";
import { applicationProperties } from "../ApplicationConstants";
import type { Journal } from "../types/domain";

export default function LandingPage() {
  const journal = useLoaderData() as Journal;
  const { state, dispatch } = useJournal();

  // The root route's loader already fetched the journal; mirror it into
  // JournalContext so components below keep the same status/data contract
  // (categories, selectedPage, aboutUs, templateData, currentArticle) they
  // had before the migration, without touching the ui-library remote.
  useEffect(() => {
    dispatch({ type: "get_journal_success", value: journal });
  }, [journal]);

  return (
    <React.Fragment>
      <Header />
      <Content />
      <Suspense fallback={null}>
        <SidePanel
          selectedPage={state.journal.selectedPage}
          categories={state.journal.categories}
          startDate={applicationProperties.startDate}
          basePath=""
        />
      </Suspense>
      <Footer />
    </React.Fragment>
  );
}
