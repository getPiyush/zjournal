import React, { useEffect } from "react";
import { getJournalFromDB } from "../datastore/actions/JournalActions";
import { useJournal } from "../datastore/contexts/JournalContext";

import Footer from "../web/Footer";
import AdminContainer from "./AdminContainer";
import Header from "./Header";

// No login gate: anyone reaching /admin lands straight in the panel.
// See src/admin/authConfig.ts for the Google OAuth gate this will be replaced with.
export default function Admin() {
  const { dispatch } = useJournal();

  useEffect(() => {
    getJournalFromDB(dispatch);
    window.document.title = "zJournal Admin Panel";
  }, []);

  const logOut = () => {
    // no-op until OAuth sign-out replaces this
  };

  return (
    <React.Fragment>
      <Header onLogout={logOut} />
      <AdminContainer />
      <Footer />
    </React.Fragment>
  );
}
