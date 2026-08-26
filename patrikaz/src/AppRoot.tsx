import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const LandingPage = lazy(() => import("./web/LandingPage"));

export default function AppRoot() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/*" element={<LandingPage />} />
      </Routes>
    </Suspense>
  );
}
