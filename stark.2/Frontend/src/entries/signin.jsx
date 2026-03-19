import React from "react";
import { createRoot } from "react-dom/client";
import { SignInPage } from "../components/ui/sign-in-flow-1.jsx";
import "../index.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <SignInPage />
  </React.StrictMode>
);
