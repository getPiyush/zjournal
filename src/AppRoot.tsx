import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./web/LandingPage";
import Admin from "./admin";

export default function AppRoot() {
  return (
      <Routes>
        <Route path="web/*" element={<LandingPage />} />
        <Route path="admin/*" element={<Admin />} />
        <Route path="/" element={<Navigate to="/web/home" />} />
        <Route path="admin" element={<Navigate to="/admin/categories" />} />
      </Routes>
  );
}
