import "./styles.css";
import AppRoot from "./AppRoot";
import React, { useEffect } from "react";
import { applicationProperties } from "./ApplicationConstants";
import { JournalProvider } from "./datastore/contexts/JournalContext";
import { ArticleProvider } from "./datastore/contexts/ArticleContext";

function GoogleFontLoader({ fonts }: { fonts: Array<{ font: string; weights?: Array<string | number> }> }) {
  useEffect(() => {
    const existing = document.querySelectorAll('link[data-google-font-loader="true"]');
    existing.forEach((node) => node.remove());

    const href = fonts
      .map((font) => {
        const weights = font.weights && font.weights.length > 0 ? `:${font.weights.join(",")}` : "";
        return `${encodeURIComponent(font.font)}${weights}`;
      })
      .join("|");

    if (!href) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${href}&display=swap`;
    link.setAttribute("data-google-font-loader", "true");
    document.head.appendChild(link);
  }, [fonts]);

  return null;
}

export default function App() {
  return (
    <React.Fragment>
      <GoogleFontLoader fonts={applicationProperties.fonts} />
      <JournalProvider>
        <ArticleProvider>
          <AppRoot />
        </ArticleProvider>
      </JournalProvider>
    </React.Fragment>
  );
}
