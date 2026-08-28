import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import RouteErrorBoundary from "./RouteErrorBoundary";
import { rootLoader, homeArticlesLoader, articleLoader, articlesLoader } from "./loaders";

const LandingPage = lazy(() => import("../web/LandingPage"));
const Home = lazy(() => import("../web/Home"));
const AboutUs = lazy(() => import("../web/AboutUs"));
const ArticleRouteView = lazy(() => import("../web/ArticleRouteView"));
const ArticlesRouteView = lazy(() => import("../web/ArticlesRouteView"));

const pageFallback = <div>Loading...</div>;

export const router = createBrowserRouter([
  {
    path: "/",
    id: "root",
    element: (
      <Suspense fallback={pageFallback}>
        <LandingPage />
      </Suspense>
    ),
    loader: rootLoader,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Home />, loader: homeArticlesLoader, errorElement: <RouteErrorBoundary /> },
      { path: "home", element: <Home />, loader: homeArticlesLoader, errorElement: <RouteErrorBoundary /> },
      { path: "aboutus", element: <AboutUs /> },
      { path: "article", element: <ArticleRouteView /> },
      {
        path: "article/:articleId",
        element: <ArticleRouteView />,
        loader: articleLoader,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "articles/*",
        element: <ArticlesRouteView />,
        loader: articlesLoader,
        errorElement: <RouteErrorBoundary />,
      },
      { path: "*", element: <Home />, loader: homeArticlesLoader, errorElement: <RouteErrorBoundary /> },
    ],
  },
]);
