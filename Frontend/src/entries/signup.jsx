import React from "react";
import { createRoot } from "react-dom/client";
import SignUpPage from "../components/ui/sign-up-flow-1.jsx";
import "../index.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <SignUpPage />
  </React.StrictMode>
);
