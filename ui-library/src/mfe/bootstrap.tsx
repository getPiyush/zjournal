import React from "react";
import { createRoot } from "react-dom/client";
import { Button } from "../index";

function StandaloneHost() {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>@zjournal/ui-library — MFE remote</h1>
      <p>
        Served from <code>remoteEntry.js</code>. This page is only a local preview; consuming apps
        load exposed modules via Module Federation instead of rendering this page.
      </p>
      <Button onClick={() => alert("Button works")}>Sample Button</Button>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<StandaloneHost />);
}
