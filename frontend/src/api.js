const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const API = `${BASE}/api/tasks/`;

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    const err = new Error("Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function listTasks({ view, status, priority, deadline, search }) {
  const p = new URLSearchParams();
  const st = status || (view === "pending" || view === "completed" ? view : "");
  if (st) p.set("status", st);
  if (view === "overdue") p.set("overdue", "1");
  if (priority) p.set("priority", priority);
  if (deadline) p.set("deadline", deadline);
  if (search.trim()) p.set("search", search.trim());
  const q = p.toString();
  return request(API + (q ? `?${q}` : ""));
}

export const getStats = () => request(API + "stats/");
export const createTask = (body) => request(API, { method: "POST", body: JSON.stringify(body) });
export const updateTask = (id, body) => request(`${API}${id}/`, { method: "PUT", body: JSON.stringify(body) });
export const patchTask = (id, body) => request(`${API}${id}/`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteTask = (id) => request(`${API}${id}/`, { method: "DELETE" });
