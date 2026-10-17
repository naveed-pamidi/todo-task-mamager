import { useEffect, useRef, useState } from "react";
import { cap, fmtDMY } from "../utils.js";
import { DocIcon, EyeIcon, KebabIcon, PencilIcon, TrashIcon } from "./Icons.jsx";

export default function TaskRow({ task, onToggle, onEdit, onDelete }) {
  const done = task.status === "completed";
  const [menu, setMenu] = useState(false);
  const wrap = useRef(null);

  useEffect(() => {
    if (!menu) return;
    const away = (e) => !wrap.current?.contains(e.target) && setMenu(false);
    const esc = (e) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [menu]);

  const run = (fn) => () => {
    setMenu(false);
    fn(task);
  };

  return (
    <tr className={done ? "is-done" : ""}>
      <td className="td-title">
        <div className="cell-title">{task.title}</div>
        {task.description && <div className="cell-desc" title={task.description}>{task.description}</div>}
      </td>
      <td data-label="Priority"><span className={`pill ${task.priority}`}>{cap(task.priority)}</span></td>
      <td data-label="Status"><span className={`pill ${task.status}`}>{done ? "Completed" : "Pending"}</span></td>
      <td data-label="Date Created">{fmtDMY(task.created_at)}</td>
      <td data-label="Due Date" className={task.is_overdue ? "late" : ""}>
        {task.deadline ? fmtDMY(task.deadline) : "No deadline"}
        {task.is_overdue && " (overdue)"}
      </td>
      <td>
        <div className="row-actions">
          <button
            className="ib blue" type="button"
            onClick={() => onToggle(task)}
            title={done ? "Mark as pending" : "Mark as completed"}
            aria-label={`${done ? "Mark as pending" : "Mark as completed"}: ${task.title}`}
          >
            <DocIcon />
          </button>
          {done ? (
            <button className="ib gray" type="button" onClick={() => onEdit(task)} title="View task" aria-label={`View ${task.title}`}>
              <EyeIcon />
            </button>
          ) : (
            <>
              <button className="ib purple" type="button" onClick={() => onEdit(task)} title="Edit task" aria-label={`Edit ${task.title}`}>
                <PencilIcon />
              </button>
              <button className="ib pink" type="button" onClick={() => onDelete(task)} title="Delete task" aria-label={`Delete ${task.title}`}>
                <TrashIcon />
              </button>
            </>
          )}
          <div className="menu-wrap" ref={wrap}>
            <button className="kebab" type="button" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} aria-label={`More actions for ${task.title}`}>
              <KebabIcon />
            </button>
            {menu && (
              <div className="menu" role="menu">
                <button role="menuitem" onClick={run(onToggle)}>{done ? "Mark as pending" : "Mark as completed"}</button>
                <button role="menuitem" onClick={run(onEdit)}>Edit task</button>
                <button role="menuitem" className="danger" onClick={run(onDelete)}>Delete task</button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
