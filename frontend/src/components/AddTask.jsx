import { useRef, useState } from "react";
import { useCreateTask } from "@/lib/tasks";

/**
 * Composer: input + optional due date + submit.
 * Optimistic create lands instantly at the top of the list; the composer
 * clears immediately so a follow-up thought isn't blocked behind the API.
 */
const AddTask = () => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueOpen, setDueOpen] = useState(false);
  const inputRef = useRef(null);
  const createTask = useCreateTask();

  const submit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    createTask.mutate(
      { title: trimmed, ...(dueDate ? { dueDate } : {}) },
      {
        onSuccess: () => {
          setTitle("");
          setDueDate("");
          setDueOpen(false);
          inputRef.current?.focus();
        },
      }
    );
  };

  return (
    <form onSubmit={submit} aria-label="Add a task">
      <div className="card flex items-center gap-2 p-2 pl-4 focus-within:border-flow-500/60 focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-flow-500)_14%,transparent)] transition-[border-color,box-shadow] duration-150">
        <input
          ref={inputRef}
          type="text"
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          aria-label="Task title"
          className="min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-muted/70"
        />

        {dueOpen ? (
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date"
            className="field shrink-0 px-2 py-1.5 text-xs text-muted [color-scheme:light] dark:[color-scheme:dark]"
          />
        ) : (
          <button
            type="button"
            className="icon-btn shrink-0"
            aria-label="Add a due date"
            onClick={() => setDueOpen(true)}
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="2" y="3" width="12" height="11" rx="2" />
              <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" strokeLinecap="round" />
            </svg>
          </button>
        )}

        <button
          type="submit"
          disabled={!title.trim() || createTask.isPending}
          className="btn btn-primary h-9 shrink-0 px-4 text-sm"
        >
          Add
        </button>
      </div>
    </form>
  );
};

export default AddTask;
