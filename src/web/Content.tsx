import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Home from "./Home";
import Article from "./components/Article/Article";

import { useJournal } from "../datastore/contexts/JournalContext";
import { Spinner } from "./components/Spinner";
import Articles from "./components/Article/Articles";
import ContactUs from "./ContactUs";
import AboutUs from "./AboutUs";
import LoadingPage from "./components/Loader/LoadingPage";
import InterviewQA from "./InterviewAQ";

export default function Content() {
  const { state } = useJournal();

  const showLoader = state.status === "loading";

  const location = useLocation().pathname;

  const preventDefaultDelegate = (e: any) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (location !== "/article") {
      document.removeEventListener("contextmenu", preventDefaultDelegate);
    } else {
      document.addEventListener("contextmenu", preventDefaultDelegate);
    }
  });

  return (
    <main className="flex-shrink-0">
      {showLoader && <LoadingPage />}
      <Routes>
        <Route path="home" element={<Home />} />
        <Route path="contactus" element={<ContactUs />} />
        <Route path="aboutus" element={<AboutUs/>}/>
        <Route path="iqa" element={<InterviewQA />} />
        <Route path="article" element={<Article data={state.journal.currentArticle} />} />
        <Route path="article/*" element={<Article data={state.journal.currentArticle} />} />
        <Route path="articles/*" element={<Articles/>} />
        <Route path="/*" element={<Home />} />
      </Routes>
    </main>
  );
}
