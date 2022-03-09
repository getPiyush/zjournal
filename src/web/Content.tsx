import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Home from "./Home";
import Article from "./components/Article/Article";

import { useJournal } from "../datastore/contexts/JournalContext";
import { Spinner } from "./components/Spinner";
import Articles from "./components/Article/Articles";

export default function Content() {
  const { state } = useJournal();

  const showLoader = state.status === "loading";

  const location = useLocation().pathname;

  const preventDefaultDelegate = (e: any) => {
    e.preventDefault();
  };

  useEffect(() => {
    // Update the document title using the browser API
    // disable right click
    if (location !== "/article") {
      document.removeEventListener("contextmenu", preventDefaultDelegate);
    } else {
      document.addEventListener("contextmenu", preventDefaultDelegate);
    }
  });

  return (
    <main className="flex-shrink-0">
      {showLoader && <Spinner />}
      <Routes>
        <Route path="home" element={<Home />} />
        <Route path="article" element={<Article data={state.journal.currentArticle} />} />
        <Route path="article/*" element={<Article data={state.journal.currentArticle} />} />
        <Route path="articles/*" element={<Articles/>} />
        <Route path="/*" element={<Home />} />
      </Routes>
    </main>
  );
}
