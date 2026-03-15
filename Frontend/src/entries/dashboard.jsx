import React from "react";
import { createRoot } from "react-dom/client";
import Dashboard from "../pages/Dashboard.jsx";
import "../index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error("Dashboard crashed:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white text-slate-900 px-6">
          <div className="max-w-xl rounded-2xl border border-black/10 bg-white p-6 shadow-lg">
            <h1 className="text-xl font-semibold">Dashboard failed to render</h1>
            <p className="mt-2 text-sm text-slate-600">
              Open the browser console for the exact error details.
            </p>
            <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-100 p-3 text-xs text-slate-700">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  </React.StrictMode>
);
