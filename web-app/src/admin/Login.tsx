import { useEffect, useRef, useState } from "react";
import { PageTitle } from "@zjournal/ui-library";
import { AdminSession, saveSession, sessionFromToken } from "../datastore/authSession";
import { authConfig, isAllowedEmail } from "./authConfig";

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google?: any;
  }
}

let gisScript: Promise<void> | null = null;

// Loads Google Identity Services once per page, however many times Login mounts.
const loadGoogleIdentityServices = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gisScript) {
    gisScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GIS_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gisScript = null;
        reject(new Error("Failed to load Google Identity Services"));
      };
      document.head.appendChild(script);
    });
  }
  return gisScript;
};

type LoginProps = {
  onLogin: (session: AdminSession) => void;
  message?: string;
};

export default function Login({ onLogin, message }: LoginProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  // Google keeps the first callback it's given, so read the latest onLogin through a ref.
  const onLoginRef = useRef(onLogin);
  onLoginRef.current = onLogin;
  const [error, setError] = useState(message ?? "");

  useEffect(() => {
    if (!authConfig.googleClientId) {
      setError(
        "Admin sign-in isn't configured for this build. Set REACT_APP_GOOGLE_CLIENT_ID and rebuild."
      );
      return;
    }

    const handleCredential = ({ credential }: { credential: string }) => {
      const session = sessionFromToken(credential);
      if (!session || !session.emailVerified) {
        setError("Google sign-in failed. Please try again.");
        return;
      }
      if (!isAllowedEmail(session.email)) {
        // Stop One Tap from silently re-selecting the same unauthorized account.
        window.google?.accounts.id.disableAutoSelect();
        setError(`${session.email} isn't an admin account.`);
        return;
      }
      onLoginRef.current(saveSession(credential) ?? session);
    };

    let cancelled = false;
    loadGoogleIdentityServices()
      .then(() => {
        if (cancelled || !buttonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: authConfig.googleClientId,
          callback: handleCredential,
          auto_select: true,
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
        });
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load Google sign-in. Check your connection and reload.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex-shrink-0">
      <div className="admin-login container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4 text-center">
            <img width="64px" src="/images/zjournal_logo.png" alt="" />
            <PageTitle title="Admin Sign-in" />
            <p className="text-muted">
              Sign in with an authorized Google account to manage the journal.
            </p>
            <div ref={buttonRef} className="d-flex justify-content-center" />
            {error && (
              <div className="alert alert-danger mt-3" role="alert">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
