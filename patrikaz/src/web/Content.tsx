import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, useEffect, lazy } from "react";

import { LoadingPage } from "../remotes/uiLibraryComponents";
import { useJournal } from "../datastore/contexts/JournalContext";

const Home = lazy(() => import("./Home"));
const AboutUs = lazy(() => import("./AboutUs"));
const ArticleRouteView = lazy(() => import("./ArticleRouteView"));
const ArticlesRouteView = lazy(() => import("./ArticlesRouteView"));

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
      {showLoader && (
        <Suspense fallback={null}>
          <LoadingPage />
        </Suspense>
      )}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="home" element={<Home />} />
          <Route path="aboutus" element={<AboutUs />} />
          <Route path="article" element={<ArticleRouteView />} />
          <Route path="article/*" element={<ArticleRouteView />} />
          <Route path="articles/*" element={<ArticlesRouteView />} />
          <Route path="/*" element={<Home />} />
        </Routes>
      </Suspense>
    </main>
  );
}
