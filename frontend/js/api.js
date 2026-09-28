const BASE = "/api";

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (e) {
    throw new ApiError("network_error", 0, null);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError((body && body.message) || "request_failed", res.status, body);
  }
  return body;
}

export const api = {
  getAccounts: () => request("/accounts"),

  createAccount: (name, birthDate) =>
    request("/accounts", {
      method: "POST",
      body: JSON.stringify({ name, birth_date: birthDate }),
    }),

  updateAccount: (id, name, birthDate) =>
    request(`/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, birth_date: birthDate }),
    }),

  deleteAccount: (id, password) => request(`/accounts/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ password }),
  }),

  checkReading: (systolic, diastolic, pulse, accountId) =>
    request("/check", {
      method: "POST",
      body: JSON.stringify({
        systolic,
        diastolic,
        pulse: pulse === "" || pulse === null || pulse === undefined ? null : pulse,
        account_id: accountId || null,
      }),
    }),

  getHistory: (accountId) => request(`/accounts/${accountId}/history`),
};

export { ApiError };
