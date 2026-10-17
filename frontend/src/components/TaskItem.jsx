import { cap, deadlineText } from "../utils.js";

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const done = task.status === "completed";
  return (
    <li className={"task" + (done ? " is-done" : "")} data-priority={task.priority}>
      <input
        type="checkbox"
        className="check"
        checked={done}
        onChange={() => onToggle(task)}
        aria-label={`Mark "${task.title}" as ${done ? "pending" : "completed"}`}
      />
      <div>
        <div className="t-title">{task.title}</div>
        {task.description && <p className="t-desc">{task.description}</p>}
        <div className="t-meta">
          <span className="prio">{cap(task.priority)} priority</span>
          <span className={task.is_overdue ? "late" : ""}>{deadlineText(task)}</span>
          <span>{done ? "Completed" : "Pending"}</span>
        </div>
      </div>
      <div className="t-actions">
        <button className="link-btn" type="button" onClick={() => onEdit(task)} aria-label={`Edit "${task.title}"`}>
          Edit
        </button>
        <button className="link-btn del" type="button" onClick={() => onDelete(task)} aria-label={`Delete "${task.title}"`}>
          Delete
        </button>
      </div>
    </li>
  );
}
