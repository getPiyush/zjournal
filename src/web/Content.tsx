import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Home from "./Home";
import { LoadingPage } from "@zjournal/ui-library";
import { useJournal } from "../datastore/contexts/JournalContext";
import ContactUs from "./ContactUs";
import AboutUs from "./AboutUs";
import InterviewQA from "./InterviewAQ";
import ArticleRouteView from "./ArticleRouteView";
import ArticlesRouteView from "./ArticlesRouteView";

export default function Content() {
  const { state } = useJournal();

  const showLoader = state.status === "loading";

  const location = useLocation().pathname;

  const preventDefaultDelegate = (e: any) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (location === "/article") {
      document.addEventListener("contextmenu", preventDefaultDelegate);
      return () => {
        document.removeEventListener("contextmenu", preventDefaultDelegate);
      };
    }

    return () => {
      document.removeEventListener("contextmenu", preventDefaultDelegate);
    };
  }, [location]);

  return (
    <main className="flex-shrink-0">
      {showLoader && <LoadingPage />}
      <Routes>
        <Route path="home" element={<Home />} />
        <Route path="contactus" element={<ContactUs />} />
        <Route path="aboutus" element={<AboutUs/>}/>
        <Route path="iqa" element={<InterviewQA />} />
        <Route path="article" element={<ArticleRouteView />} />
        <Route path="article/*" element={<ArticleRouteView />} />
        <Route path="articles/*" element={<ArticlesRouteView />} />
        <Route path="/*" element={<Home />} />
      </Routes>
    </main>
  );
}
