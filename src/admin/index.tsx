import React, { useEffect, useState } from "react";
import { getJournalFromDB } from "../datastore/actions/JournalActions";
import { useJournal } from "../datastore/contexts/JournalContext";
import { encryptAES, encryptString } from "../utils/crypto";

import Footer from "../web/Footer";
import AdminContainer from "./AdminContainer";
import Header from "./Header";
import Login from "./Login";

export default function Admin() {
  const [userDetails, setUserDetails] = useState({
    loggedIn: false,
  });

  const { state: jState, dispatch } = useJournal();

  useEffect(() => {
    getJournalFromDB(dispatch);
    window.document.title = "zJournal Admin Panel";
  }, []);

  const validateCreds = (userDetailsIn) => {
    const { adminDetails } = jState.journal;
    if (
      encryptString(userDetailsIn.userid) === adminDetails.id &&
      encryptString(userDetailsIn.password) === adminDetails.passPhase
    )
      setUserDetails({ loggedIn: true });
  };

  const logOut = () => {
    setUserDetails({ loggedIn: false });
  }

  return (
    <React.Fragment>
      {userDetails.loggedIn ? (
        <React.Fragment>
          <Header onLogout={logOut} />
          <AdminContainer />
          <Footer />
        </React.Fragment>
      ) : (
        <Login onLogin={validateCreds} />
      )}
    </React.Fragment>
  );
}
