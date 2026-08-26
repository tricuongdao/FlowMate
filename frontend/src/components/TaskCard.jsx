import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { formatDay, isOverdue } from "@/lib/data";
import { collapseAway } from "@/lib/animate";
import { useDeleteTask, useUpdateTask } from "@/lib/tasks";

/** Round checkbox with an SVG check that draws itself when completed. */
function CheckToggle({ checked, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? "Mark as ongoing" : "Mark as completed"}
      className={cn(
        "grid size-7 shrink-0 cursor-pointer place-items-center rounded-full border transition-[border-color,background-color,transform] duration-150 ease-out active:scale-90",
        checked
          ? "border-flow-500 bg-flow-500 text-white dark:border-flow-400 dark:bg-flow-400 dark:text-[#06281c]"
          : "border-border text-transparent hover:border-flow-500 hover:bg-flow-500/10"
      )}
    >
      <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
        <path
          d="M3.5 8.5l3 3 6-6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="check-path"
          data-checked={checked}
        />
      </svg>
    </button>
  );
}

const TaskCard = ({ task, index }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const wrapRef = useRef(null);
  const exitingRef = useRef(false);

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const isComplete = task.status === "complete";
  const overdue = !isComplete && isOverdue(task.dueDate);

  /** Play the exit collapse first, then let the mutation remove it. */
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
    <li ref={wrapRef} className="mb-3">
      <article
        className={cn(
          "card group px-4 py-3.5",
          "transition-[opacity,transform,box-shadow,border-color] duration-200 ease-out",
          isComplete && "opacity-[0.72]",
          "task-enter"
        )}
        style={{ "--i": Math.min(index, 8) }}
      >
        <div className="flex items-start gap-3.5">
          <div className="pt-0.5">
            <CheckToggle checked={isComplete} onClick={toggleComplete} />
          </div>

          <div className="min-w-0 flex-1">
            {editing ? (
              <input
                autoFocus
                aria-label="Edit task title"
                className="field w-full px-2.5 py-1.5 text-[0.9375rem]"
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
                className="block w-full cursor-text truncate text-left text-[0.9375rem] leading-snug"
                title="Double-click to edit"
              >
                <span
                  className="strike"
                  data-on={isComplete}
                  style={{ "--strike": isComplete ? 1 : 0 }}
                >
                  {task.title}
                </span>
              </button>
            )}

            {/* Metadata row */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {task.dueDate && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1",
                    overdue ? "text-due-600 dark:text-due-400" : "text-muted"
                  )}
                >
                  <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="3" width="12" height="11" rx="2" />
                    <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" strokeLinecap="round" />
                  </svg>
                  Due {formatDay(task.dueDate)}
                </span>
              )}
              {overdue && (
                <span className="badge-overdue inline-flex items-center rounded-full bg-danger-500/10 px-2 py-0.5 font-medium text-danger-600 dark:bg-danger-400/15 dark:text-danger-400">
                  Overdue
                </span>
              )}
              {isComplete && task.completedAt && (
                <span className="inline-flex items-center gap-1 text-flow-700 dark:text-flow-400">
                  <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 8.5l3 3 6-6.5" />
                  </svg>
                  Done {formatDay(task.completedAt)}
                </span>
              )}
              <span className="text-muted/70 tnum">Created {formatDay(task.createdAt)}</span>
            </div>
          </div>

          {/* Actions: hover-revealed on pointer devices, always visible on touch */}
          <div
            className={cn(
              "flex shrink-0 gap-0.5 pt-0.5 transition-opacity duration-150",
              "sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
              editing && "sm:opacity-100"
            )}
          >
            {!editing ? (
              <>
                <button
                  type="button"
                  aria-label={`Edit "${task.title}"`}
                  className="icon-btn"
                  onClick={startEdit}
                >
                  <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11.3 2.1a1.6 1.6 0 012.3 2.3L5 13l-3.1.8L2.7 10.7z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label={`Delete "${task.title}"`}
                  className="icon-btn hover:!text-danger-500"
                  onClick={handleDelete}
                >
                  <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 4h11M5.5 4V2.8c0-.4.4-.8.8-.8h3.4c.4 0 .8.4.8.8V4M6.5 7v4.5M9.5 7v4.5M4 4l.7 9c0 .6.5 1 1 1h4.6c.5 0 1-.4 1-1L12 4" />
                  </svg>
                </button>
              </>
            ) : (
              <span className="self-center pr-1 text-xs text-muted">Esc to cancel</span>
            )}
          </div>
        </div>
      </article>
    </li>
  );
};

export default TaskCard;
