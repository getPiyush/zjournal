import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const LandingPage = lazy(() => import("./web/LandingPage"));
const Admin = lazy(() => import("./admin"));

export default function AppRoot() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="web/*" element={<LandingPage />} />
        <Route path="admin/*" element={<Admin />} />
        <Route path="/" element={<Navigate to="/web/home" />} />
        <Route path="admin" element={<Navigate to="/admin/categories" />} />
      </Routes>
    </Suspense>
  );
}
