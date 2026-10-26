import { Routes, Route } from "react-router-dom";

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
