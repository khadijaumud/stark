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

export default function CompanyOnboarding() {
  const standards = ["ISO 27001", "GDPR", "Local regulations", "PCI DSS", "SOC 2"];

  return (
    <div className="min-h-screen text-slate-900 flex items-center justify-center px-6 py-16 bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#ecfeff_35%,_#e2e8f0_100%)]">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_15%_30%,_rgba(14,165,233,0.35),transparent_45%),radial-gradient(circle_at_85%_20%,_rgba(59,130,246,0.25),transparent_45%),radial-gradient(circle_at_60%_80%,_rgba(16,185,129,0.2),transparent_50%)]" />
      <div className="relative w-full max-w-3xl rounded-3xl border border-black/5 bg-white/80 backdrop-blur-md p-10 shadow-2xl">
        <div className="mb-8">
          <p className="text-slate-500 text-sm">Company</p>
          <h1 className="text-3xl font-semibold">Onboarding Form</h1>
          <p className="text-slate-500 mt-2">
            This profile helps you set project requirements and compliance goals.
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
            <label className="text-sm text-slate-600">Company Name</label>
            <input
              type="text"
              placeholder="Stark Labs"
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Industry / Sector</label>
            <select
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Select industry
              </option>
              <option>Finance</option>
              <option>E-commerce</option>
              <option>Healthcare</option>
              <option>Education</option>
              <option>IT / Technology</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600">Company Size</label>
            <select
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Select size
              </option>
              <option>1-10</option>
              <option>11-50</option>
              <option>51-200</option>
              <option>200+</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600">Official Website</label>
            <input
              type="url"
              placeholder="https://company.com"
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Target Compliance (Optional)</label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {standards.map((item) => (
                <Checkbox key={item} id={item} label={item} />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              We use this to align reporting with your compliance needs.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-black/20 bg-white text-slate-900 focus:ring-slate-400"
              required
            />
            I confirm the company information is accurate and authorized.
          </label>

          <button className="mt-2 rounded-full bg-slate-900 text-white font-medium py-3 hover:bg-slate-800 transition-colors">
            Complete company profile
          </button>
        </form>
      </div>
    </div>
  );
}
