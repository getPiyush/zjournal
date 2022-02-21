import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Home from "./Home";
import Article from "./Article";


export default function Content() {
  const location = useLocation().pathname;
  const preventDefaultDelegate = (e: any) => {
    e.preventDefault();
  };

  useEffect(() => {
    // Update the document title using the browser API
    // disable right click
    console.log("location is", location);
    if (location !== "/article") {
      document.removeEventListener("contextmenu", preventDefaultDelegate);
    } else {
      document.addEventListener("contextmenu", preventDefaultDelegate);
    }
  });

  return (
    <main className="flex-shrink-0">
      <Routes> 
        <Route path="home" element={<Home/>} />
        <Route path="article" element={<Article/>} />
        <Route path="/*" element={<Home/>} />
      </Routes>
    
    </main>
  );
}
