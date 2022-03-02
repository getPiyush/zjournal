import React, { useEffect } from "react";
import Header from "./Header";
import Content from "./Content";
import SidePanel from "./components/Panel/SidePanel";
import Footer from "./Footer";
import { useJournal } from "../datastore/contexts/JournalContext";
import { getJournalFromDB } from "../datastore/actions/JournalActions";

export default function LandingPage() {

  const { dispatch } = useJournal();

  useEffect(() => {
    getJournalFromDB(dispatch);
  }, []);

  
  return (
    <React.Fragment>
      <Header />
      <Content />
      <SidePanel />
      <Footer />
    </React.Fragment>
  );
}
