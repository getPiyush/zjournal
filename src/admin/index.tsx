import React, { useEffect, useState } from "react";
import { getJournalFromDB } from "../datastore/actions/JournalActions";
import { useJournal } from "../datastore/contexts/JournalContext";
import { encryptAES, encryptString } from "../utils/crypto";

import Footer from "../web/Footer";
import AdminContainer from "./AdminContainer";
import Header from "./Header";
import Login from "./pages/Login";

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
     console.log("password =",encryptString(userDetailsIn.password));
     console.log(userDetailsIn.userid,"userid =",encryptString(userDetailsIn.userid));

    if (
      encryptString(userDetailsIn.userid) === adminDetails.id &&
      encryptString(userDetailsIn.password) === adminDetails.passPhase
    ){

      window.document.title = "zJournal Admin Panel";
      setUserDetails({ loggedIn: true });

    }
  };

  const logOut = () => {
    setUserDetails({ loggedIn: false });
  }

  return (
    <React.Fragment>
      {userDetails.loggedIn ? (
        <React.Fragment>
          <Header journal={jState.journal} onLogout={logOut} />
          <AdminContainer />
          <Footer />
        </React.Fragment>
      ) : (
        <Login onLogin={validateCreds} />
      )}
    </React.Fragment>
  );
}
