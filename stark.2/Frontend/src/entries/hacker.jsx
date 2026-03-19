import React from "react";
import { createRoot } from "react-dom/client";
import HackerOnboarding from "../pages/HackerOnboarding.jsx";
import "../index.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HackerOnboarding />
  </React.StrictMode>
);
