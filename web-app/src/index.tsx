import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";

// A data router (rather than <BrowserRouter>) so pages can use useBlocker, e.g. to warn before
// leaving the article editor with unsaved changes. The one catch-all route keeps all routing in
// the existing <Routes> tree.
const router = createBrowserRouter([{ path: "*", element: <App /> }]);

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
