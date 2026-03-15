import { useMemo } from "react";

const Checkbox = ({ id, label }) => (
  <label htmlFor={id} className="flex items-center gap-2 text-sm text-slate-700">
    <input
      id={id}
      type="checkbox"
      className="h-4 w-4 rounded border-black/20 bg-white text-slate-900 focus:ring-slate-400"
    />
    {label}
  </label>
);

export default function HackerOnboarding() {
  const expertise = useMemo(
    () => ["Web Pentest", "Mobile Security", "Network", "Cloud Security", "Crypto"],
    []
  );

  return (
    <div className="min-h-screen text-slate-900 flex items-center justify-center px-6 py-16 bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#eef2ff_35%,_#e5e7eb_100%)]">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,_rgba(59,130,246,0.35),transparent_45%),radial-gradient(circle_at_80%_10%,_rgba(16,185,129,0.25),transparent_40%),radial-gradient(circle_at_50%_80%,_rgba(99,102,241,0.25),transparent_50%)]" />
      <div className="relative w-full max-w-3xl rounded-3xl border border-black/5 bg-white/80 backdrop-blur-md p-10 shadow-2xl">
        <div className="mb-8">
          <p className="text-slate-500 text-sm">Hacker (Cyber Talent)</p>
          <h1 className="text-3xl font-semibold">Onboarding Form</h1>
          <p className="text-slate-500 mt-2">
            Your details help with matching, anonymity, and trust across projects.
          </p>
        </div>

        <form
          className="grid gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = "/dashboard/";
          }}
        >
          <div>
            <label className="text-sm text-slate-600">Nickname / Username</label>
            <input
              type="text"
              placeholder="CyberNinja99"
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
              required
            />
            <p className="text-xs text-slate-500 mt-2">
              This alias appears on leaderboards and company views to protect anonymity.
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-600">Experience Level</label>
            <select
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Select level
              </option>
              <option>Junior</option>
              <option>Middle</option>
              <option>Senior</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600">Areas of Expertise</label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {expertise.map((item) => (
                <Checkbox key={item} id={item} label={item} />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              We use these to notify you about matching opportunities.
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-600">Professional Links</label>
            <div className="mt-3 grid gap-3">
              <input
                type="url"
                placeholder="LinkedIn"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
              />
              <input
                type="url"
                placeholder="GitHub"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
              />
              <input
                type="url"
                placeholder="HackerOne"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
              />
              <input
                type="url"
                placeholder="Bugcrowd"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Optional, but at least one is recommended.</p>
          </div>

          <div>
            <label className="text-sm text-slate-600">Static IP Address</label>
            <input
              type="text"
              placeholder="193.111.0.42"
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
              required
            />
            <p className="text-xs text-slate-500 mt-2">
              Used for whitelisting when you’re approved for a target.
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-600">Certifications (Optional)</label>
            <input
              type="text"
              placeholder="CEH, OSCP, CompTIA Security+"
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-black/20 bg-white text-slate-900 focus:ring-slate-400"
              required
            />
            I confirm the information provided is accurate.
          </label>

          <button className="mt-2 rounded-full bg-slate-900 text-white font-medium py-3 hover:bg-slate-800 transition-colors">
            Complete onboarding
          </button>
        </form>
      </div>
    </div>
  );
}
