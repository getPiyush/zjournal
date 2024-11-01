import "./styles.css";
import AppRoot from "./AppRoot";
import { JournalProvider } from "./datastore/contexts/JournalContext";
import { ArticleProvider } from "./datastore/contexts/ArticleContext";
import React from "react";
import GoogleFontLoader from "react-font-loader";
import { applicationProperties } from "./ApplicationConstants";
import { ContactProvider } from "./datastore/contexts/ContactContext";
import { QnAProvider } from "./datastore/contexts/QnAContext";

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
            <QnAProvider>
              <AppRoot />
            </QnAProvider>
          </ContactProvider>
        </ArticleProvider>
      </JournalProvider>
    </React.Fragment>
  );
}
