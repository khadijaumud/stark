const API_BASE_URL = "http://127.0.0.1:8000";

async function requestJson(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;

    const detail = data?.detail;
    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = detail
        .map((e) => {
          const loc = Array.isArray(e?.loc) ? e.loc.join(".") : "";
          const msg = e?.msg || "Invalid value";
          return loc ? `${loc}: ${msg}` : msg;
        })
        .join("\n");
    } else if (typeof detail === "object" && detail) {
      message = JSON.stringify(detail);
    } else if (typeof data?.message === "string") {
      message = data.message;
    }
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function registerUser(payload) {
  return requestJson("/api/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  return requestJson("/api/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getHackerDashboard() {
  return requestJson("/api/hacker/dashboard", {
    method: "GET",
  });
}

export async function getAllBounties() {
  return requestJson("/api/bounties/all", {
    method: "GET",
  });
}

export async function getCompanyDashboard() {
  return requestJson("/api/company/dashboard", {
    method: "GET",
  });
}

export async function createJob(payload) {
  return requestJson("/api/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function startAiAssessment() {
  return requestJson("/api/ai/start", {
    method: "POST",
  });
}

export async function nextAiAssessment(payload) {
  return requestJson("/api/ai/next", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
