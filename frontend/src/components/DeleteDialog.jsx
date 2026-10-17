import { useEffect, useRef } from "react";

export default function DeleteDialog({ task, onClose, onConfirm }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="delete-title">
      <h3 id="delete-title">Delete this task?</h3>
      <p className="muted">"{task.title}" will be removed permanently.</p>
      <div className="actions">
        <button type="button" className="btn" onClick={() => ref.current?.close()}>Keep task</button>
        <button type="button" className="btn btn-danger" onClick={() => onConfirm(task)}>Delete task</button>
      </div>
    </dialog>
  );
}
