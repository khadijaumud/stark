import React from "react";
import { createRoot } from "react-dom/client";
import CompanyOnboarding from "../pages/CompanyOnboarding.jsx";
import "../index.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CompanyOnboarding />
  </React.StrictMode>
);
