import { useCallback, useEffect, useRef, useState } from "react";
import { deleteTask, getStats, listTasks, patchTask } from "./api.js";
import TaskRow from "./components/TaskRow.jsx";
import TaskDialog from "./components/TaskDialog.jsx";
import DeleteDialog from "./components/DeleteDialog.jsx";
import {
  BellIcon, BoxIcon, CalendarIcon, ChartIcon, ChevronDown, ChevronLeft, ChevronRight,
  HomeIcon, MoonIcon, PieIcon, PlusIcon, SearchIcon, SettingsIcon,
} from "./components/Icons.jsx";

const TABS = [
  { key: "all", label: "All Tasks", empty: "You have no tasks yet. Choose Create New Task to add your first one." },
  { key: "pending", label: "Pending Tasks", empty: "Nothing pending right now." },
  { key: "completed", label: "Completed Tasks", empty: "No completed tasks yet. Mark a task as completed to see it here." },
  { key: "overdue", label: "Overdue Tasks", empty: "Nothing is overdue." },
];
const NO_FILTERS = { deadline: "", status: "", priority: "" };

export default function App() {
  const [view, setView] = useState("all");
  const [draft, setDraft] = useState(NO_FILTERS); // what the controls show
  const [filters, setFilters] = useState(NO_FILTERS); // what was applied with the Filter button
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ all: 0, pending: 0, completed: 0, overdue: 0 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, task = edit
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  const showToast = useCallback((message, error = false) => {
    setToast({ message, error });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    try {
      const [t, s] = await Promise.all([listTasks({ view, search, ...filters }), getStats()]);
      setTasks(t);
      setStats(s);
    } catch {
      showToast("Could not load tasks. Check your connection and try again.", true);
    }
  }, [view, search, filters, showToast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [view, search, filters, pageSize]);

  async function toggle(task) {
    const next = task.status === "completed" ? "pending" : "completed";
    try {
      await patchTask(task.id, { status: next });
      showToast(next === "completed" ? "Task marked as completed." : "Task moved back to pending.");
    } catch {
      showToast("Could not update the task. Try again.", true);
    }
    load();
  }

  async function confirmDelete(task) {
    setDeleting(null);
    try {
      await deleteTask(task.id);
      showToast("Task deleted.");
    } catch {
      showToast("Could not delete the task. Try again.", true);
    }
    load();
  }

  const setD = (name) => (e) => setDraft((d) => ({ ...d, [name]: e.target.value }));
  const hasFilters = Object.values(filters).some(Boolean);
  const reset = () => { setDraft(NO_FILTERS); setFilters(NO_FILTERS); };
  const toggleSearch = () => {
    if (searchOpen) setSearchInput("");
    setSearchOpen(!searchOpen);
  };

  const total = tasks.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  const startIdx = (current - 1) * pageSize;
  const visible = tasks.slice(startIdx, startIdx + pageSize);
  const tab = TABS.find((t) => t.key === view);
  const narrowed = hasFilters || search.trim();

  return (
    <>
      <div className="app">
        <aside className="rail" aria-label="Main navigation">
          <div className="logo" aria-hidden="true">UI</div>
          <button className="rail-btn is-on" aria-label="Tasks" aria-current="page"><HomeIcon /></button>
          <button className="rail-btn" aria-label="Reports" onClick={() => showToast("Reports are not part of this version.")}><ChartIcon /></button>
          <button className="rail-btn" aria-label="Insights" onClick={() => showToast("Insights are not part of this version.")}><PieIcon /></button>
          <button className="rail-btn" aria-label="Archive" onClick={() => showToast("Archive is not part of this version.")}><BoxIcon /></button>
          <button className="rail-btn" aria-label="Dark mode" onClick={() => showToast("Dark mode is not part of this version.")}><MoonIcon /></button>
          <button className="rail-btn" aria-label="Settings" onClick={() => showToast("Settings are not part of this version.")}><SettingsIcon /></button>
        </aside>

        <div className="content">
          <div className="topbar">
            {searchOpen && (
              <input
                className="topsearch" type="search" autoFocus autoComplete="off"
                placeholder="Search by title or description" aria-label="Search tasks"
                value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              />
            )}
            <button className="icon-btn" onClick={toggleSearch} aria-label={searchOpen ? "Close search" : "Search tasks"} aria-expanded={searchOpen}>
              <SearchIcon />
            </button>
            <button className="icon-btn" onClick={() => setView("overdue")} aria-label={`Overdue tasks: ${stats.overdue}`}>
              <BellIcon />
              {stats.overdue > 0 && <span className="badge">{stats.overdue}</span>}
            </button>
            <div className="avatar" aria-hidden="true">U</div>
          </div>

          <h1 className="title">My Tasks</h1>

          <div className="tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key} role="tab" aria-selected={view === t.key}
                className={"tab" + (view === t.key ? " is-active" : "")}
                onClick={() => setView(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form className="filters" onSubmit={(e) => { e.preventDefault(); setFilters(draft); }}>
            <label className="fbox date">
              <CalendarIcon />
              <span className="sr-only">Due date</span>
              <input type="date" value={draft.deadline} onChange={setD("deadline")} className={draft.deadline ? "has-value" : ""} />
            </label>
            <label className="fbox select">
              <span className="sr-only">Status</span>
              <select value={draft.status} onChange={setD("status")} className={draft.status ? "has-value" : ""}>
                <option value="">Choose Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown className="chev" />
            </label>
            <label className="fbox select">
              <span className="sr-only">Priority</span>
              <select value={draft.priority} onChange={setD("priority")} className={draft.priority ? "has-value" : ""}>
                <option value="">Choose Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown className="chev" />
            </label>
            <button type="submit" className="btn btn-filter">Filter</button>
            {hasFilters && <button type="button" className="link-reset" onClick={reset}>Reset</button>}
            <button type="button" className="btn btn-create" onClick={() => setEditing({})}>
              <PlusIcon /> Create New Task
            </button>
          </form>

          {visible.length > 0 ? (
            <div className="table-wrap">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>Title</th><th>Priority</th><th>Status</th><th>Date Created</th><th>Due Date</th>
                    <th><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((t) => (
                    <TaskRow key={t.id} task={t} onToggle={toggle} onEdit={setEditing} onDelete={setDeleting} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty" role="status">
              <strong>{narrowed ? "No tasks match your filters" : "No tasks to show"}</strong>
              {narrowed ? "Try a different search or choose Reset." : tab.empty}
            </p>
          )}

          <div className="pager">
            <span>Rows per page:</span>
            <label className="fbox select">
              <span className="sr-only">Rows per page</span>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <ChevronDown className="chev" />
            </label>
            <span aria-live="polite">{total === 0 ? "0 of 0" : `${startIdx + 1}-${Math.min(startIdx + pageSize, total)} of ${total}`}</span>
            <button className="pager-btn" onClick={() => setPage(current - 1)} disabled={current <= 1} aria-label="Previous page"><ChevronLeft /></button>
            <button className="pager-btn" onClick={() => setPage(current + 1)} disabled={current >= pages} aria-label="Next page"><ChevronRight /></button>
          </div>
        </div>
      </div>

      {editing && (
        <TaskDialog
          task={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={(msg) => { setEditing(null); showToast(msg); load(); }}
        />
      )}
      {deleting && <DeleteDialog task={deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />}

      {toast && (
        <div className={"toast" + (toast.error ? " is-error" : "")} role="status" aria-live="polite">{toast.message}</div>
      )}
    </>
  );
}
