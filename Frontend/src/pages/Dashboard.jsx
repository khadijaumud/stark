import React, { useEffect, useState } from "react";
import { createJob, getCompanyDashboard, getHackerDashboard } from "../../api.js";
import CompanyDashboard from "./CompanyDashboard.jsx";
import HackerDashboard from "./HackerDashboard.jsx";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const hacker = await getHackerDashboard();
      setRole("hacker");
      setData(hacker);
      return;
    } catch (err) {
      if (err?.status !== 403) {
        setError(err?.message || "Failed to load dashboard");
        return;
      }
    }

    try {
      const company = await getCompanyDashboard();
      setRole("company");
      setData(company);
    } catch (err) {
      setError(err?.message || "Failed to load dashboard");
    }
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleCreateJob = async (payload) => {
    await createJob(payload);
    await load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,_rgba(34,197,94,0.06),transparent_45%),radial-gradient(circle_at_10%_70%,_rgba(15,23,42,0.85),transparent_65%)]" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6">
          <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-white/50">Initializing</div>
                <div className="mt-2 text-2xl font-semibold">Scanning session…</div>
                <div className="mt-1 text-sm text-white/60">Fetching role and dashboard data</div>
              </div>
              <div className="relative h-10 w-10">
                <div className="absolute inset-0 rounded-2xl border border-sky-400/30 bg-sky-400/10" />
                <div className="absolute inset-0 animate-pulse rounded-2xl border border-emerald-400/30 bg-emerald-400/10" />
              </div>
            </div>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-2/5 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-sky-400/60 via-emerald-400/40 to-sky-400/60" />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="h-3 w-24 rounded bg-white/10" />
                  <div className="mt-4 h-6 w-16 rounded bg-white/10" />
                  <div className="mt-3 h-3 w-32 rounded bg-white/10" />
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="h-3 w-40 rounded bg-white/10" />
              <div className="mt-4 grid gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-2xl border border-white/10 bg-white/5" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white px-6">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-red-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,_rgba(15,23,42,0.85),transparent_65%)]" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-md shadow-2xl">
            <div className="text-xs uppercase tracking-wide text-white/50">Error</div>
            <h1 className="mt-2 text-xl font-semibold">Could not load dashboard</h1>
            <p className="mt-2 text-sm text-white/70 whitespace-pre-line">{error}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
                onClick={() => {
                  setLoading(true);
                  load().finally(() => setLoading(false));
                }}
              >
                Retry
              </button>
              <a
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                href="/signin/"
              >
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === "company") {
    return <CompanyDashboard data={data} onCreateJob={handleCreateJob} />;
  }

  return <HackerDashboard data={data} />;
}
