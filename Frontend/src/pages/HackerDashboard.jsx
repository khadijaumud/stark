import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Calendar,
  Crown,
  LayoutDashboard,
  Shield,
  Sparkles,
  Terminal,
  Users,
  Zap,
} from "lucide-react";

import { getAllBounties } from "../../api";

function Toasts({ toasts, onDismiss }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex w-[92vw] max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-2xl border px-4 py-3 backdrop-blur-md shadow-lg ${
            t.variant === "success"
              ? "border-emerald-400/30 bg-emerald-400/10"
              : "border-red-400/30 bg-red-400/10"
          }`}
          onClick={() => onDismiss(t.id)}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border ${
                t.variant === "success"
                  ? "border-emerald-400/30 bg-emerald-400/10"
                  : "border-red-400/30 bg-red-400/10"
              }`}
            >
              {t.variant === "success" ? (
                <Sparkles className="h-5 w-5 text-emerald-200" />
              ) : (
                <Zap className="h-5 w-5 text-red-200" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">{t.title}</div>
              {t.message ? <div className="mt-0.5 text-xs text-white/70">{t.message}</div> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HackerDashboard({ data }) {
  const jobs = useMemo(() => data?.open_jobs || [], [data]);
  const [toasts, setToasts] = useState([]);
  const toastSeq = useRef(0);

  const [bounties, setBounties] = useState([]);
  const [bountyLoading, setBountyLoading] = useState(false);
  const [bountyError, setBountyError] = useState(null);

  const score = data?.score ?? 0;
  const rank = data?.rank ?? 0;
  const completedTasks = data?.completed_tasks ?? 0;

  const leaderboard = useMemo(
    () => [
      { name: "NullByte", score: 9840 },
      { name: "RootKit", score: 8710 },
      { name: "Cipher", score: 7620 },
      { name: "0xStark", score: 6900 },
      { name: data?.username || "You", score: score || 6400 },
    ],
    [data?.username, score]
  );

  const pushToast = (toast) => {
    const id = `${Date.now()}-${toastSeq.current++}`;
    setToasts((prev) => [...prev, { id, ...toast }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  };

  const formatTimeRemaining = (endDate) => {
    if (!endDate) return { label: "No deadline", classes: "border-white/10 bg-white/5 text-white/70" };
    const end = new Date(endDate).getTime();
    if (!Number.isFinite(end)) return { label: "No deadline", classes: "border-white/10 bg-white/5 text-white/70" };
    const now = Date.now();
    const diffMs = end - now;
    if (diffMs <= 0) return { label: "Ended", classes: "border-red-500/30 bg-red-500/10 text-red-200" };

    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    let label = "";
    if (days > 0) label = `${days}d ${hours % 24}h left`;
    else if (hours > 0) label = `${hours}h ${mins % 60}m left`;
    else label = `${mins}m left`;

    const urgent = diffMs < 6 * 60 * 60 * 1000;
    return {
      label,
      classes: urgent
        ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
        : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    };
  };

  useEffect(() => {
    let mounted = true;
    setBountyLoading(true);
    setBountyError(null);
    getAllBounties()
      .then((rows) => {
        if (!mounted) return;
        setBounties(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        if (!mounted) return;
        setBountyError(err?.message || "Failed to load bounties");
      })
      .finally(() => {
        if (!mounted) return;
        setBountyLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Toasts toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[#00ff00]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,0,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,_rgba(34,197,94,0.07),transparent_45%),radial-gradient(circle_at_10%_70%,_rgba(15,23,42,0.8),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-10">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00ff00]/25 bg-white/5 px-4 py-2 backdrop-blur-md">
              <Terminal className="h-4 w-4 text-[#00ff00]" />
              <span className="text-xs font-medium text-white/80">Hacker Console</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Welcome back, <span className="text-[#00ff00]">{data?.username}</span>
            </h1>
            <p className="mt-1 text-sm text-white/60">Bounty intel, rankings, and your mission control.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#bounties"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-md hover:bg-white/10"
            >
              <LayoutDashboard className="h-4 w-4 text-white/70" />
              Bounty Board
            </a>
            <a
              href="#rankings"
              className="inline-flex items-center gap-2 rounded-full border border-[#00ff00]/25 bg-[#00ff00]/10 px-4 py-2 text-sm backdrop-blur-md hover:bg-[#00ff00]/15"
            >
              <Zap className="h-4 w-4 text-[#00ff00]" />
              Rankings
            </a>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <main className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#00ff00]/15 blur-2xl" />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/50">Campaigns Explored</div>
                    <div className="mt-2 text-2xl font-semibold text-[#00ff00]">{jobs.length}</div>
                    <div className="mt-1 text-xs text-white/55">Active bounty windows</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#00ff00]/25 bg-[#00ff00]/10">
                    <Terminal className="h-5 w-5 text-[#00ff00]" />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-400/15 blur-2xl" />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/50">Bounties Resolved</div>
                    <div className="mt-2 text-2xl font-semibold">{completedTasks}</div>
                    <div className="mt-1 text-xs text-white/55">Your verified completions</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10">
                    <Shield className="h-5 w-5 text-emerald-200" />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-purple-400/15 blur-2xl" />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/50">Global Rank</div>
                    <div className="mt-2 text-2xl font-semibold">#{rank || 0}</div>
                    <div className="mt-1 text-xs text-white/55">Based on score</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-400/25 bg-purple-400/10">
                    <Crown className="h-5 w-5 text-purple-200" />
                  </div>
                </div>
              </div>
            </section>

            <section id="bounties" className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Bounty Explorer</h2>
                  <p className="mt-1 text-sm text-white/60">Browse active campaigns with timelines and join missions.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/70">
                  <BarChart3 className="h-4 w-4" />
                  Active bounties: <span className="text-white">{bounties.length}</span>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {bountyLoading ? (
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-white/60">
                    Loading bounties...
                  </div>
                ) : bountyError ? (
                  <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-sm text-red-200">
                    {bountyError}
                  </div>
                ) : bounties.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-white/60">
                    No open bounties yet.
                  </div>
                ) : (
                  bounties.map((job) => {
                    const remaining = formatTimeRemaining(job.end_date);
                    return (
                      <div
                        key={job.id}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-6"
                      >
                        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <div className="absolute -left-10 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-[#00ff00]/10 blur-3xl" />
                        </div>

                        <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${remaining.classes}`}
                              >
                                <Calendar className="mr-1 h-3.5 w-3.5" />
                                {remaining.label}
                              </span>
                              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                                ID #{job.id}
                              </span>
                            </div>

                            <div className="mt-3 text-lg font-semibold text-white">{job.title}</div>
                            <div className="mt-1 text-sm text-white/60 line-clamp-3 whitespace-pre-line">
                              {job.description}
                            </div>

                            <div className="mt-4 flex flex-row items-center justify-between gap-2 text-xs text-white/60">
                              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {job.start_date ? new Date(job.start_date).toLocaleDateString() : "—"}
                              </span>
                              <span className="text-white/40">→</span>
                              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {job.end_date ? new Date(job.end_date).toLocaleDateString() : "—"}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                            <button
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
                              onClick={() => pushToast({ variant: "success", title: "Bounty joined", message: job.title })}
                            >
                              <Terminal className="h-4 w-4" />
                              Explore / Join
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </main>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/50">Operator</div>
                  <div className="mt-1 text-base font-semibold">{data?.username}</div>
                  <div className="mt-0.5 text-xs text-white/50 break-all">{data?.email}</div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#00ff00]/25 bg-[#00ff00]/10">
                  <Terminal className="h-5 w-5 text-[#00ff00]" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-white/50">Score</div>
                  <div className="mt-1 text-lg font-semibold">{score}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-white/50">Active</div>
                  <div className="mt-1 text-lg font-semibold">{jobs.length}</div>
                </div>
              </div>
            </section>

            <section id="rankings" className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Mini Leaderboard</h3>
                  <p className="mt-1 text-xs text-white/60">Top 5 hackers this week</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                  <Users className="h-5 w-5 text-white/70" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {leaderboard.map((row, idx) => (
                  <div
                    key={`${row.name}-${idx}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                          idx === 0
                            ? "border-[#00ff00]/30 bg-[#00ff00]/10"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <Zap className={`h-4 w-4 ${idx === 0 ? "text-[#00ff00]" : "text-white/70"}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{row.name}</div>
                        <div className="text-xs text-white/50">#{idx + 1}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-white">{row.score}</div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
