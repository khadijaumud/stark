import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

function RootRedirect() {
  useEffect(() => {
    window.location.replace("/signin/");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Stark</h1>
        <p className="text-white/70">Redirecting to sign in…</p>
        <a href="/signin/" className="underline text-white/80 hover:text-white">
          Continue to Sign In
        </a>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RootRedirect />
  </React.StrictMode>
);
