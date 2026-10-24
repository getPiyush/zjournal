import React, { useEffect, useState } from "react";
import { getJournalFromDB } from "../datastore/actions/JournalActions";
import { useJournal } from "../datastore/contexts/JournalContext";
import {
  AdminSession,
  clearSession,
  getSession,
  UNAUTHORIZED_EVENT,
} from "../datastore/authSession";

import Footer from "../web/Footer";
import AdminContainer from "./AdminContainer";
import { authConfig } from "./authConfig";
import Header from "./Header";
import Login from "./Login";
import Toasts from "./Toasts";

const SESSION_EXPIRED = "Your session has expired. Please sign in again.";
const NOT_AUTHORIZED = "This account is no longer authorized to use the admin panel.";

export default function Admin() {
  const { dispatch } = useJournal();
  const [session, setSession] = useState<AdminSession | null>(() => getSession());
  const [signedOutMessage, setSignedOutMessage] = useState<string>();

  useEffect(() => {
    window.document.title = "zJournal Admin Panel";
  }, []);

  // Load the journal again once signed in: anonymous reads get a public copy without admin-only
  // fields, and saving a template sends the whole journal back, which would drop them.
  useEffect(() => {
    getJournalFromDB(dispatch);
  }, [session?.token]);

  // The API rejected the token (http-client has already cleared it).
  useEffect(() => {
    const onUnauthorized = (event: Event) => {
      const { status } = (event as CustomEvent<{ status: number }>).detail ?? {};
      setSession(null);
      setSignedOutMessage(status === 403 ? NOT_AUTHORIZED : SESSION_EXPIRED);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  // Google ID tokens last about an hour; sign out when this one runs out.
  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(() => {
      clearSession();
      setSession(null);
      setSignedOutMessage(SESSION_EXPIRED);
    }, session.expiresAt - Date.now());
    return () => clearTimeout(timer);
  }, [session]);

  const logIn = (newSession: AdminSession) => {
    setSession(newSession);
    setSignedOutMessage(undefined);
  };

  const logOut = () => {
    clearSession();
    window.google?.accounts.id.disableAutoSelect();
    setSession(null);
    setSignedOutMessage(undefined);
  };

  if (authConfig.required && !session) {
    return (
      <React.Fragment>
        <Login onLogin={logIn} message={signedOutMessage} />
        <Footer />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {!authConfig.required && (
        <div className="alert alert-warning rounded-0 mb-0 py-1 text-center small" role="status">
          Admin sign-in is off (development build without REACT_APP_GOOGLE_CLIENT_ID).
        </div>
      )}
      <Header onLogout={logOut} userEmail={session?.email} />
      <AdminContainer />
      <Toasts />
      <Footer />
    </React.Fragment>
  );
}
