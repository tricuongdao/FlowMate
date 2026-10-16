import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { dayLabel, dueState, relativeLabel } from "@/lib/dial";
import { collapseAway } from "@/lib/animate";
import { useDeleteTask, useUpdateTask } from "@/lib/tasks";

/**
 * One entry in the rack. A ruled row with an applied index at the left —
 * which is also the completion control — the free text of the entry, and a
 * decimal-stopped due stamp at the right. Closing an entry draws a strike
 * across it in brass; the row settles rather than disappearing.
 */
export default function RackRow({ task, index, now }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const wrapRef = useRef(null);
  const exitingRef = useRef(false);

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const isComplete = task.status === "complete";
  const state = dueState(task, now);

  /** Strike the row out first, then let the mutation remove it. */
  const handleDelete = () => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    collapseAway(wrapRef.current, () => deleteTask.mutate(task._id));
  };

  const toggleComplete = () =>
    updateTask.mutate({
      id: task._id,
      status: isComplete ? "active" : "complete",
    });

  const startEdit = () => {
    setDraft(task.title);
    setEditing(true);
  };

  const commitEdit = () => {
    const title = draft.trim();
    setEditing(false);
    if (!title || title === task.title) return;
    updateTask.mutate({ id: task._id, title });
  };

  return (
    <li ref={wrapRef} className="enter" style={{ "--i": Math.min(index, 6) }}>
      <div className="rack-row">
        <button
          type="button"
          role="checkbox"
          aria-checked={isComplete}
          data-checked={isComplete}
          aria-label={isComplete ? "Mark as ongoing" : "Mark as completed"}
          className="rack-index"
          onClick={toggleComplete}
        >
          <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true">
            <path
              d="M3 8.5l3 3 7-7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="rack-check"
            />
          </svg>
        </button>

        <div className="min-w-0">
          {editing ? (
            <input
              autoFocus
              aria-label="Edit task title"
              className="field px-2 py-1 text-[0.9375rem] leading-snug"
              value={draft}
              maxLength={200}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  setDraft(task.title);
                  setEditing(false);
                }
              }}
            />
          ) : (
            <button
              type="button"
              onDoubleClick={startEdit}
              title="Double-click to rename"
              className={cn(
                "rack-title block w-full cursor-text",
                isComplete && "text-[var(--on-ground-2)]"
              )}
            >
              <span className="strike" data-struck={isComplete}>
                {task.title}
              </span>
            </button>
          )}
        </div>

        <div className="rack-stamp self-start pt-0.5" data-state={state}>
          {task.dueDate ? (
            <>
              <span className="rack-stamp__day fig">
                {dayLabel(task.dueDate)}
              </span>
              <span className="rack-stamp__rel">
                {isComplete
                  ? task.completedAt
                    ? `closed ${dayLabel(task.completedAt)}`
                    : "closed"
                  : relativeLabel(task.dueDate, now)}
              </span>
            </>
          ) : (
            <span className="rack-stamp__day fig opacity-60">
              {isComplete && task.completedAt
                ? `closed ${dayLabel(task.completedAt)}`
                : "—"}
            </span>
          )}
        </div>

        <div className="rack-acts self-start pt-1">
          {editing ? (
            <span className="legend pr-1 pt-1 text-[var(--on-ground-2)]">
              Esc
            </span>
          ) : (
            <>
              <button
                type="button"
                aria-label={`Rename "${task.title}"`}
                className="icon-btn"
                onClick={startEdit}
              >
                <svg
                  viewBox="0 0 16 16"
                  className="size-3.5"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11.3 2.1a1.6 1.6 0 012.3 2.3L5 13l-3.1.8L2.7 10.7z" />
                </svg>
              </button>
              <button
                type="button"
                aria-label={`Delete "${task.title}"`}
                className="icon-btn btn-danger"
                onClick={handleDelete}
              >
                <svg
                  viewBox="0 0 16 16"
                  className="size-3.5"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.5 4h11M5.5 4V2.8c0-.4.4-.8.8-.8h3.4c.4 0 .8.4.8.8V4M6.5 7v4.5M9.5 7v4.5M4 4l.7 9c0 .6.5 1 1 1h4.6c.5 0 1-.4 1-1L12 4" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
