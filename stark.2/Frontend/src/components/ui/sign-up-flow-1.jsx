import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils.js";
import MiniNavbar from "./mini-navbar.jsx";
import { registerUser } from "../../../api.js";

const roleOptions = [
  {
    value: "hacker",
    label: "Hacker / Pentester",
    description: "Independent security researchers and red teamers.",
  },
  {
    value: "company",
    label: "Company / Organization",
    description: "Teams posting scopes and managing reports.",
  },
];

export default function SignUpPage({ className }) {
  const [role, setRole] = useState("hacker");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");

  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState("");
  const [githubLink, setGithubLink] = useState("");

  const roleDetails = useMemo(() => roleOptions.find((item) => item.value === role), [role]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const payload = {
      username,
      email,
      password,
      role,
      company_name: "",
      industry: "",
      experience_level: "",
      skills: [],
      github_link: "",
    };

    if (role === "company") {
      payload.company_name = companyName;
      payload.industry = industry;
    }

    if (role === "hacker") {
      payload.experience_level = experienceLevel;
      payload.skills = skills
        ? skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      payload.github_link = githubLink;
    }

    try {
      const data = await registerUser(payload);
      alert(data?.message || "Registered successfully");

      if (role === "company") {
        window.location.href = "/company/";
        return;
      }

      window.location.href = "/hacker/";
    } catch (err) {
      alert(err?.message || "Registration failed");
    }
  };

  return (
    <div
      className={cn(
        "flex w-[100%] flex-col min-h-screen text-slate-900 relative",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#eef2ff_30%,_#e2e8f0_100%)]" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_10%_20%,_rgba(56,189,248,0.35),transparent_40%),radial-gradient(circle_at_85%_15%,_rgba(99,102,241,0.35),transparent_45%),radial-gradient(circle_at_40%_85%,_rgba(16,185,129,0.25),transparent_50%)]" />

      <div className="relative z-10 flex flex-col flex-1">
        <MiniNavbar variant="light" />

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
          <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white/80 shadow-2xl backdrop-blur-md p-8 sm:p-10">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl sm:text-4xl font-semibold">Create your account</h1>
              <p className="text-slate-600">Tell us a bit more so we can personalize onboarding.</p>
            </div>

            <form className="mt-8 grid gap-6" onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm text-slate-700">Full name</label>
                  <input
                    type="text"
                    placeholder="Alex Carter"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-700">Nickname or handle</label>
                  <input
                    type="text"
                    placeholder="CyberNinja99"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-700">Work email</label>
                  <input
                    type="email"
                    placeholder="hacker67@gmail.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-slate-700">Password</label>
                    <input
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-700">Confirm password</label>
                    <input
                      type="password"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/90 p-5">
                <p className="text-sm font-medium text-slate-900">Choose your role</p>
                <div className="mt-4 grid gap-3">
                  {roleOptions.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border px-4 py-3 transition",
                        role === option.value
                          ? "border-slate-900/60 bg-slate-900/5"
                          : "border-black/10 bg-white"
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={role === option.value}
                        onChange={() => setRole(option.value)}
                        className="mt-1 h-4 w-4 border-black/30 text-slate-900"
                        required
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{option.label}</p>
                        <p className="text-xs text-slate-600">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-black/10 bg-white/90 p-5"
                >
                  <p className="text-sm font-medium text-slate-900">
                    {roleDetails?.label} details
                  </p>
                  <div className="mt-4 grid gap-4">
                    {role === "company" && (
                      <>
                        <div>
                          <label className="text-sm text-slate-700">Company name</label>
                          <input
                            type="text"
                            placeholder="Stark Labs"
                            value={companyName}
                            onChange={(event) => setCompanyName(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-700">Official website</label>
                          <input
                            type="url"
                            placeholder="https://starklabs.com"
                            value={industry}
                            onChange={(event) => setIndustry(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                            required
                          />
                        </div>
                      </>
                    )}

                    {role === "hacker" && (
                      <>
                        <div>
                          <label className="text-sm text-slate-700">Primary specialty</label>
                          <input
                            type="text"
                            placeholder="Web Pentest, Mobile Security, Cloud"
                            value={skills}
                            onChange={(event) => setSkills(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-700">Static IP address</label>
                          <input
                            type="text"
                            placeholder="193.111.0.42"
                            value={experienceLevel}
                            onChange={(event) => setExperienceLevel(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-700">GitHub link</label>
                          <input
                            type="url"
                            placeholder="https://github.com/yourhandle"
                            value={githubLink}
                            onChange={(event) => setGithubLink(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              <label className="flex items-start gap-3 text-sm text-slate-900">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-black/30 text-slate-900"
                  required
                />
                <span>
                  I agree to the platform terms, privacy notice, and confirm the information above is accurate.
                </span>
              </label>

              <button className="rounded-full bg-slate-900 text-white font-medium py-3 hover:bg-slate-800 transition-colors">
                Create account and continue
              </button>

              <p className="text-center text-xs text-slate-500">
                Already have an account? <a href="/signin/" className="text-slate-900 underline">Sign in</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
