import { useEffect, useRef, useState } from "react";
import { createTask, updateTask } from "../api.js";
import { cap } from "../utils.js";

const first = (v) => (Array.isArray(v) ? v[0] : v);

export default function TaskDialog({ task, onClose, onSaved }) {
  const ref = useRef(null);
  const titleRef = useRef(null);
  const [form, setForm] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    deadline: task?.deadline ?? "",
    priority: task?.priority ?? "medium",
    status: task?.status ?? "pending",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    titleRef.current?.focus();
  }, []);

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setErrors({ title: "Enter a task title before saving." });
      titleRef.current?.focus();
      return;
    }
    setErrors({});
    setSaving(true);
    const payload = {
      title,
      description: form.description.trim(),
      deadline: form.deadline || null,
      priority: form.priority,
      status: form.status,
    };
    try {
      if (task) await updateTask(task.id, payload);
      else await createTask(payload);
      onSaved(task ? "Task updated." : "Task added.");
    } catch (err) {
      if (err.status === 400 && err.data) {
        const next = {};
        const other = [];
        for (const [k, v] of Object.entries(err.data)) {
          if (k === "title" || k === "deadline") next[k] = first(v);
          else other.push(`${cap(k)}: ${first(v)}`);
        }
        if (other.length) next.form = other.join(" ");
        setErrors(next);
      } else {
        setErrors({ form: "Could not save the task. Check your connection and try again." });
      }
      setSaving(false);
    }
  }

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="dialog-title">
      <form onSubmit={submit} noValidate>
        <h3 id="dialog-title">{task ? "Edit task" : "New task"}</h3>
        {errors.form && <div className="form-error" role="alert">{errors.form}</div>}

        <label className="stack" htmlFor="f-title">Title</label>
        <input
          id="f-title"
          ref={titleRef}
          type="text"
          maxLength={200}
          autoComplete="off"
          value={form.title}
          onChange={set("title")}
          className={errors.title ? "invalid" : ""}
          aria-describedby="e-title"
        />
        <p className="err" id="e-title" role="alert">{errors.title}</p>

        <label className="stack" htmlFor="f-description">Description</label>
        <textarea id="f-description" rows={3} value={form.description} onChange={set("description")} />

        <div className="row">
          <div>
            <label className="stack" htmlFor="f-deadline">Deadline</label>
            <input
              id="f-deadline"
              type="date"
              value={form.deadline}
              onChange={set("deadline")}
              className={errors.deadline ? "invalid" : ""}
              aria-describedby="e-deadline"
            />
            <p className="err" id="e-deadline" role="alert">{errors.deadline}</p>
          </div>
          <div>
            <label className="stack" htmlFor="f-priority">Priority</label>
            <select id="f-priority" value={form.priority} onChange={set("priority")}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="stack" htmlFor="f-status">Status</label>
            <select id="f-status" value={form.status} onChange={set("status")}>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="actions">
          <button type="button" className="btn" onClick={() => ref.current?.close()}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>Save task</button>
        </div>
      </form>
    </dialog>
  );
}
