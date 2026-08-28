import "./styles.css";
import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { applicationProperties } from "./ApplicationConstants";
import { JournalProvider } from "./datastore/contexts/JournalContext";
import { router } from "./router";

function buildFontFamilyParam(font: { font: string; weights?: Array<string | number> }) {
  if (!font.weights || font.weights.length === 0) {
    return font.font;
  }

  // Weights can be plain ("400") or italic ("400i"). The css2 endpoint has
  // no comma-separated shorthand for either case; a single weight needs
  // ":wght@400" while any italic weight needs the two-axis
  // ":ital,wght@0,400;1,400" form (0 = normal, 1 = italic) instead.
  const hasItalic = font.weights.some((w) => typeof w === "string" && w.endsWith("i"));

  const values = font.weights.map((w) => {
    const isItalic = typeof w === "string" && w.endsWith("i");
    const weight = isItalic ? (w as string).slice(0, -1) : w;
    return hasItalic ? `${isItalic ? 1 : 0},${weight}` : `${weight}`;
  });

  const axis = hasItalic ? "ital,wght" : "wght";
  return `${font.font}:${axis}@${values.join(";")}`;
}

function GoogleFontLoader({ fonts }: { fonts: Array<{ font: string; weights?: Array<string | number> }> }) {
  useEffect(() => {
    const existing = document.querySelectorAll('link[data-google-font-loader="true"]');
    existing.forEach((node) => node.remove());

    if (fonts.length === 0) {
      return;
    }

    // The css2 endpoint takes one "family" query param per font (not a
    // single "|"-joined value - that's the deprecated v1 /css syntax).
    const params = new URLSearchParams();
    fonts.forEach((font) => params.append("family", buildFontFamilyParam(font)));
    params.append("display", "swap");

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${params.toString()}`;
    link.setAttribute("data-google-font-loader", "true");
    document.head.appendChild(link);
  }, [fonts]);

  return null;
}

export default function App() {
  return (
    <React.Fragment>
      <GoogleFontLoader fonts={applicationProperties.fonts} />
      <JournalProvider>
        <RouterProvider router={router} />
      </JournalProvider>
    </React.Fragment>
  );
}
