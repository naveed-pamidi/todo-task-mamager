export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function parseDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtDate(d) {
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: sameYear ? undefined : "numeric" });
}

export function deadlineText(t) {
  if (!t.deadline) return "No deadline";
  const d = parseDate(t.deadline);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((d - today) / 86400000);
  if (t.is_overdue) {
    const n = Math.abs(diff);
    return `Overdue by ${n} ${n === 1 ? "day" : "days"} (due ${fmtDate(d)})`;
  }
  if (t.status === "pending") {
    if (diff === 0) return "Due today";
    if (diff === 1) return "Due tomorrow";
  }
  return `Due ${fmtDate(d)}`;
}

const pad = (n) => String(n).padStart(2, "0");

/** "2026-10-17" or an ISO datetime -> "17/10/2026" */
export function fmtDMY(value) {
  if (!value) return "—";
  const d = value.length === 10 ? parseDate(value) : new Date(value);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
