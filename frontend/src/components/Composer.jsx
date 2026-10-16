import { useMemo, useRef, useState } from "react";
import { dialDate } from "@/lib/dial";
import { useCreateTask } from "@/lib/tasks";

/**
 * The composer, wound by hand. One crown: a title, an optional date set on a
 * real minute track, and the single brass action. The track is a native range
 * input underneath, so it is keyboard- and screen-reader-operable for free;
 * the graduations and the brass marker are drawn on top of it.
 *
 * The stops run across the horizon in even steps, with two extra stops parked
 * past the ends: "no date", which is where most captures land, and "beyond".
 */

const STOPS = 29; // 0 = no date, 1 = today … 28 = +27 days

function stopLabel(i) {
  if (i === 0) return { day: "NONE", rel: "no date" };
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + (i - 1));
  const day = d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
  const rel =
    i === 1
      ? "today"
      : i === 2
        ? "tomorrow"
        : `in ${i - 1}d`;
  return { day, rel, iso: toIsoDay(d) };
}

function toIsoDay(d) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function Composer() {
  const [title, setTitle] = useState("");
  const [stop, setStop] = useState(0);
  const inputRef = useRef(null);
  const createTask = useCreateTask();

  const labels = useMemo(() => Array.from({ length: STOPS }, (_, i) => stopLabel(i)), []);
  const current = labels[stop];

  const submit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    createTask.mutate(
      { title: trimmed, ...(current.iso ? { dueDate: current.iso } : {}) },
      {
        onSuccess: () => {
          setTitle("");
          setStop(0);
          inputRef.current?.focus();
        },
      }
    );
  };

  return (
    <form className="plate" onSubmit={submit} aria-label="Add a task">
      <div className="flex items-center gap-2 p-2 pl-3.5">
        <input
          ref={inputRef}
          type="text"
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          aria-label="Task title"
          className="min-w-0 flex-1 bg-transparent py-1 text-[0.9375rem] outline-none placeholder:text-[color-mix(in_oklab,var(--on-ground-2)_80%,transparent)]"
        />
        <button
          type="submit"
          disabled={!title.trim() || createTask.isPending}
          className="btn btn-crown h-8 shrink-0 px-3.5 text-xs"
        >
          {createTask.isPending ? "Saving" : "Add"}
        </button>
      </div>

      <div className="hair-t track">
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="legend text-[var(--on-ground-2)]">
            Due date
          </span>
          <span className="fig text-xs text-[var(--on-ground)]">
            {stop === 0 ? "—" : `${current.day} · ${current.rel}`}
          </span>
        </div>

        <div className="track__rail">
          <span className="track__line" aria-hidden="true" />
          {labels.map((_, i) => (
            <span
              key={i}
              className="track__grad"
              data-major={i % 7 === 1}
              style={{ left: `${(i / (STOPS - 1)) * 100}%` }}
              aria-hidden="true"
            />
          ))}
          <span
            className="track__marker"
            style={{ left: `${(stop / (STOPS - 1)) * 100}%` }}
            aria-hidden="true"
          />
          <input
            type="range"
            min={0}
            max={STOPS - 1}
            step={1}
            value={stop}
            onChange={(e) => setStop(Number(e.target.value))}
            aria-label="Due date"
            aria-valuetext={stop === 0 ? "No due date" : `${current.day}, due ${current.rel}`}
            className="track__input"
          />
          <span className="track__focus" aria-hidden="true" />
        </div>

        {/* Two ends of a scale, not a caption: the secondary tone is already
            the hierarchy, so no alpha is applied on top of it. */}
        <div className="track__readout legend text-[var(--on-ground-2)]">
          <span>No date</span>
          <span>{dialDate()}</span>
          <span>+27d</span>
        </div>
      </div>
    </form>
  );
}
