import "./styles.css";
import AppRoot from "./AppRoot";
import { JournalProvider } from "./datastore/contexts/JournalContext";
import { ArticleProvider } from "./datastore/contexts/ArticleContext";
import React from "react";
import GoogleFontLoader from "react-google-font-loader";
import { applicationProperties } from "./ApplicationConstants";


export default function App() {
  return (
    <React.Fragment>
      <GoogleFontLoader
        fonts={applicationProperties.fonts}
        subsets={["cyrillic-ext", "greek"]}
      />
      <JournalProvider>
        <ArticleProvider>
          <AppRoot />
        </ArticleProvider>
      </JournalProvider>
    </React.Fragment>
  );
}
