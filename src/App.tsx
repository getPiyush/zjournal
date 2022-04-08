import "./styles.css";
import AppRoot from "./AppRoot";
import { JournalProvider } from "./datastore/contexts/JournalContext";
import { ArticleProvider } from "./datastore/contexts/ArticleContext";
import React from "react";
import GoogleFontLoader from "react-google-font-loader";
import { applicationProperties } from "./ApplicationConstants";
import { ContactProvider } from "./datastore/contexts/ContactContext";

export default function App() {
  return (
    <React.Fragment>
      <GoogleFontLoader
        fonts={applicationProperties.fonts}
        subsets={["cyrillic-ext", "greek"]}
      />
      <JournalProvider>
        <ArticleProvider>
          <ContactProvider>
            <AppRoot />
          </ContactProvider>
        </ArticleProvider>
      </JournalProvider>
    </React.Fragment>
  );
}
