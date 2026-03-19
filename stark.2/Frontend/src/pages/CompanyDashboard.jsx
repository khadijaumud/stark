import React, { useMemo, useRef, useState } from "react";
import {
  Activity,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Wand2,
  X,
} from "lucide-react";

import { nextAiAssessment, startAiAssessment } from "../../api";

function Toasts({ toasts, onDismiss }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex w-[92vw] max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-2xl border px-4 py-3 backdrop-blur-md shadow-lg ${
            t.variant === "success"
              ? "border-sky-400/30 bg-sky-400/10"
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
                  ? "border-sky-400/30 bg-sky-400/10"
                  : "border-red-400/30 bg-red-400/10"
              }`}
            >
              {t.variant === "success" ? (
                <Sparkles className="h-5 w-5 text-sky-200" />
              ) : (
                <Activity className="h-5 w-5 text-red-200" />
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

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="text-sm font-semibold text-white">{title}</div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function CompanyDashboard({ data, onCreateJob }) {
  const jobs = useMemo(() => data?.jobs || [], [data]);
  const [toasts, setToasts] = useState([]);
  const toastSeq = useRef(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formError, setFormError] = useState(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSessionId, setAiSessionId] = useState(null);
  const [aiStep, setAiStep] = useState(0);
  const [aiTotalSteps, setAiTotalSteps] = useState(5);
  const [aiQuestion, setAiQuestion] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);

  const pushToast = (toast) => {
    const id = `${Date.now()}-${toastSeq.current++}`;
    setToasts((prev) => [...prev, { id, ...toast }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !description.trim()) {
      setFormError("Please provide a title and description");
      return;
    }
    if (!startDate || !endDate) {
      setFormError("Please select a start and end date");
      return;
    }
    if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
      setFormError("End date must be after start date");
      return;
    }

    try {
      await onCreateJob({
        title: title.trim(),
        description: description.trim(),
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
      });
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      pushToast({ variant: "success", title: "Campaign created", message: "Bounty is now live" });
    } catch (err) {
      setFormError(err?.message || "Failed to create campaign");
      pushToast({ variant: "error", title: "Create failed", message: err?.message || "" });
    }
  };

  const startAssessment = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await startAiAssessment();
      setAiSessionId(res.session_id);
      setAiStep(res.step || 1);
      setAiTotalSteps(res.total_steps || 5);
      setAiQuestion(res.question);
      setAiResult(null);
      pushToast({ variant: "success", title: "Assessment started", message: "AI Security Advisor ready" });
    } catch (e) {
      setAiError(e?.message || "Failed to start assessment");
      pushToast({ variant: "error", title: "Could not start", message: e?.message || "" });
    } finally {
      setAiLoading(false);
    }
  };

  const sendAnswer = async (answer) => {
    if (!aiSessionId) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await nextAiAssessment({ session_id: aiSessionId, answer });
      if (res.finished) {
        setAiQuestion(null);
        setAiResult(res.result);
        pushToast({ variant: "success", title: "Assessment completed", message: "Security report generated" });
      } else {
        setAiQuestion(res.question);
        setAiStep(res.step || aiStep + 1);
      }
    } catch (e) {
      setAiError(e?.message || "Failed to continue assessment");
      pushToast({ variant: "error", title: "Assessment error", message: e?.message || "" });
    } finally {
      setAiLoading(false);
    }
  };

  const resetAssessment = () => {
    setAiSessionId(null);
    setAiStep(0);
    setAiTotalSteps(5);
    setAiQuestion(null);
    setAiResult(null);
    setAiError(null);
  };

  const riskPill = (risk) => {
    const r = (risk || "").toLowerCase();
    if (r === "low") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
    if (r === "moderate") return "border-sky-400/30 bg-sky-400/10 text-sky-200";
    if (r === "high") return "border-amber-300/30 bg-amber-300/10 text-amber-200";
    return "border-red-400/30 bg-red-400/10 text-red-200";
  };

  const analytics = useMemo(() => {
    const activeReports = Math.max(0, Math.round(jobs.length * 0.35));
    const securityScore = Math.min(100, 70 + Math.round(jobs.length * 2));
    return { activeReports, securityScore };
  }, [jobs]);

  const companyName = data?.profile?.company_name || data?.username;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Toasts toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.10),transparent_40%),radial-gradient(circle_at_70%_20%,_rgba(251,191,36,0.06),transparent_55%),radial-gradient(circle_at_10%_80%,_rgba(15,23,42,0.85),transparent_65%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-10">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-white/5 px-4 py-2 backdrop-blur-md">
              <Building2 className="h-4 w-4 text-sky-300" />
              <span className="text-xs font-medium text-white/80">Company Control Center</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {companyName} <span className="text-sky-300">Security</span> Dashboard
            </h1>
            <p className="mt-1 text-sm text-white/60">Track bounties, manage jobs, and monitor your posture.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#campaigns"
              className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70 hover:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Campaigns
              </span>
            </a>
            <a
              href="#ai"
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-4 py-2 text-sm backdrop-blur-md hover:bg-sky-400/15"
            >
              <Wand2 className="h-4 w-4 text-sky-200" />
              AI Assessment
            </a>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/50">Company</div>
                  <div className="mt-1 text-base font-semibold">{companyName}</div>
                  <div className="mt-0.5 text-xs text-white/50 break-all">{data?.email}</div>
                  <div className="mt-2 text-xs text-white/60">Industry: {data?.profile?.industry || ""}</div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10">
                  <ShieldCheck className="h-5 w-5 text-sky-200" />
                </div>
              </div>

              <nav className="mt-5 grid gap-2">
                <a
                  href="#overview"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm hover:bg-white/5"
                >
                  <Activity className="h-4 w-4 text-white/70" />
                  Analytics
                </a>
                <a
                  href="#ai"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm hover:bg-white/5"
                >
                  <Wand2 className="h-4 w-4 text-white/70" />
                  AI Assessment
                </a>
                <a
                  href="#campaigns"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm hover:bg-white/5"
                >
                  <Briefcase className="h-4 w-4 text-white/70" />
                  Campaigns
                </a>
              </nav>
            </section>
          </aside>

          <main className="space-y-6">
            <section id="overview" className="grid gap-4 md:grid-cols-3">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-400/15 blur-2xl" />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/50">Active Reports</div>
                    <div className="mt-2 text-2xl font-semibold">{analytics.activeReports}</div>
                    <div className="mt-1 text-xs text-white/55">Estimated activity</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10">
                    <ClipboardList className="h-5 w-5 text-sky-200" />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-amber-300/15 blur-2xl" />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/50">Campaigns Launched</div>
                    <div className="mt-2 text-2xl font-semibold text-amber-200">{jobs.length}</div>
                    <div className="mt-1 text-xs text-white/55">Time-boxed bounty windows</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-300/10">
                    <Briefcase className="h-5 w-5 text-amber-200" />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-400/15 blur-2xl" />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/50">Security Score</div>
                    <div className="mt-2 text-2xl font-semibold">{analytics.securityScore}/100</div>
                    <div className="mt-1 text-xs text-white/55">Baseline posture</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10">
                    <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                  </div>
                </div>
              </div>
            </section>

            <section id="ai" className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-xs text-sky-200">
                    <Wand2 className="h-3.5 w-3.5" />
                    Company-only
                  </div>
                  <h2 className="mt-3 text-xl font-semibold">AI Security Readiness Assessment</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Answer 5 quick questions to get an instant security score and prioritized next steps.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {aiSessionId && !aiResult ? (
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                      onClick={resetAssessment}
                      disabled={aiLoading}
                      type="button"
                    >
                      Reset
                    </button>
                  ) : null}

                  {!aiSessionId ? (
                    <button
                      className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300"
                      onClick={startAssessment}
                      disabled={aiLoading}
                      type="button"
                    >
                      <FileSearch className="h-4 w-4" />
                      {aiLoading ? "Starting…" : "AI Security Advisor"}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs uppercase tracking-wide text-white/50">Progress</div>
                  <div className="text-xs text-white/60">
                    {aiResult ? "Completed" : aiSessionId ? `${Math.max(1, aiStep)} / ${aiTotalSteps}` : "Not started"}
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400/70 via-amber-300/50 to-emerald-400/60 transition-[width]"
                    style={{
                      width: aiResult
                        ? "100%"
                        : aiSessionId
                          ? `${Math.min(100, Math.round(((Math.max(1, aiStep) - 1) / aiTotalSteps) * 100))}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              {aiError ? (
                <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {aiError}
                </div>
              ) : null}

              {!aiSessionId ? (
                <div className="mt-5 grid gap-3 rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="text-sm font-semibold text-white">What you’ll get</div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-white/50">Output</div>
                      <div className="mt-1 text-sm font-semibold">Security Score</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-white/50">Output</div>
                      <div className="mt-1 text-sm font-semibold">Risk Level</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-white/50">Output</div>
                      <div className="mt-1 text-sm font-semibold">Recommended Actions</div>
                    </div>
                  </div>
                </div>
              ) : null}

              {aiSessionId && !aiResult ? (
                <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wide text-white/50">
                        Question {Math.max(1, aiStep)} of {aiTotalSteps}
                      </div>
                      <div className="mt-2 text-base font-semibold">Security Assessment Wizard</div>
                      <div className="mt-2 text-sm text-white/70">{aiQuestion?.question}</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10">
                      <Target className="h-5 w-5 text-sky-200" />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {aiLoading ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                        AI is thinking...
                      </div>
                    ) : null}

                    <div className="grid gap-2 sm:grid-cols-2">
                      {(aiQuestion?.options || []).map((opt) => (
                        <button
                          key={opt}
                          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 disabled:opacity-60"
                          type="button"
                          disabled={aiLoading}
                          onClick={() => sendAnswer(opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {aiResult ? (
                <div className="mt-5 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      <div className="text-xs uppercase tracking-wide text-white/50">Security Score</div>
                      <div className="mt-2 text-3xl font-semibold text-sky-200">{aiResult.security_score}/100</div>
                      <div className="mt-2 text-xs text-white/55">Generated from your answers</div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      <div className="text-xs uppercase tracking-wide text-white/50">Risk Level</div>
                      <div className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-sm ${riskPill(aiResult.risk_level)}`}>
                        {aiResult.risk_level}
                      </div>
                      <div className="mt-2 text-xs text-white/55">Overall posture classification</div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      <div className="text-xs uppercase tracking-wide text-white/50">Next Step</div>
                      <div className="mt-2 text-sm font-semibold">Invite Hackers</div>
                      <div className="mt-2 text-xs text-white/55">Turn recommendations into real testing</div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white">Recommended Actions</div>
                        <div className="mt-1 text-xs text-white/60">Prioritized to reduce risk fast</div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                          type="button"
                          onClick={resetAssessment}
                        >
                          Run again
                        </button>
                        <button
                          className="inline-flex items-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-200"
                          type="button"
                          onClick={() => pushToast({ variant: "success", title: "Download Report", message: "Mock download started" })}
                        >
                          Download Report
                        </button>
                        <button
                          className="inline-flex items-center gap-2 rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-300"
                          type="button"
                          onClick={() => {
                            setModalOpen(true);
                            pushToast({ variant: "success", title: "Start Pentest", message: "Create a bounty to begin" });
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Start Pentest
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {(aiResult.recommended_actions || []).map((a, idx) => (
                        <div
                          key={`${idx}-${a}`}
                          className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10">
                            <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                          </div>
                          <div className="text-sm text-white/80">{a}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            <section id="campaigns" className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Bounty Campaign Manager</h2>
                  <p className="mt-1 text-sm text-white/60">Launch timed campaigns with clear timelines.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/70">
                  <Briefcase className="h-4 w-4" />
                  Active campaigns: <span className="text-white">{jobs.length}</span>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="text-sm font-semibold text-white">Create Campaign</div>
                  <div className="mt-1 text-xs text-white/60">Title, description, and a start/end window.</div>

                  <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Title</label>
                      <input
                        className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-sky-400/40"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="SQLi in checkout"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Description</label>
                      <textarea
                        className="min-h-[140px] w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-sky-400/40"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe scope, reproduction steps, and rules..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-white/80">Timeline</div>
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="w-full">
                          <label className="sr-only">Start Date</label>
                          <div className="relative">
                            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                          <input
                            type="datetime-local"
                            className="h-12 w-full rounded-lg border border-slate-700 bg-slate-900/50 pl-10 pr-3 text-sm text-white outline-none focus:border-sky-400/40"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                          />
                        </div>
                          <div className="mt-2 text-xs text-white/60">Start Date</div>
                        </div>

                        <div className="w-full">
                          <label className="sr-only">End Date</label>
                          <div className="relative">
                            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                          <input
                            type="datetime-local"
                            className="h-12 w-full rounded-lg border border-slate-700 bg-slate-900/50 pl-10 pr-3 text-sm text-white outline-none focus:border-sky-400/40"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                          />
                        </div>
                          <div className="mt-2 text-xs text-white/60">End Date</div>
                        </div>
                      </div>
                    </div>

                    {formError ? (
                      <div className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                        {formError}
                      </div>
                    ) : null}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-300"
                      >
                        <Plus className="h-4 w-4" />
                        Create Bounty
                      </button>
                    </div>
                  </form>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">Published Campaigns</div>
                      <div className="mt-1 text-xs text-white/60">Timelines and scope previews</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-4">
                    {jobs.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                        No active campaigns found.
                      </div>
                    ) : (
                      jobs.map((job) => (
                        <div key={job.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-bold text-white">{job.title}</div>
                              <div className="mt-1 line-clamp-2 text-xs text-white/60 whitespace-pre-line">{job.description}</div>
                            </div>
                            <div className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                              {job.status === "open" ? "Active" : "Closed"}
                            </div>
                          </div>
                          <div className="mt-3 flex flex-row items-center gap-2 text-xs text-white/60">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {job.start_date ? new Date(job.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                            </span>
                            <span className="text-white/40">→</span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {job.end_date ? new Date(job.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
