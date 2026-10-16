import { useCallback, useMemo, useState } from "react";
import Dial from "./Dial";

/**
 * The landing page's dial. It renders the real component against a fixed set
 * of illustrative entries so a visitor can read the actual instrument before
 * opening an account. The demonstration is labelled as one: it is authored
 * content, not a customer's data, and it must never read as a testimonial.
 *
 * The needle is pinned to a fixed instant rather than the visitor's clock —
 * a demonstration whose reading drifts through the day would show different
 * things to different people, and "overdue" would sometimes be a lie.
 */

const DEMO_NOW = new Date("2026-03-12T14:32:00");

function day(offset) {
  const d = new Date(DEMO_NOW);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString();
}

const DEMO_ENTRIES = [
  { _id: "d1", title: "Invoice 0148 — Halden Studio", status: "active", dueDate: day(-4), completedAt: null },
  { _id: "d2", title: "Return the signed retainer", status: "active", dueDate: day(-1), completedAt: null },
  { _id: "d3", title: "Statistics problem set 6", status: "active", dueDate: day(0), completedAt: null },
  { _id: "d4", title: "Draft the Q1 summary", status: "active", dueDate: day(2), completedAt: null },
  { _id: "d5", title: "Client call — scope revision", status: "active", dueDate: day(2), completedAt: null },
  { _id: "d6", title: "Renew the domain", status: "active", dueDate: day(6), completedAt: null },
  { _id: "d7", title: "Submit timesheet", status: "complete", dueDate: day(-2), completedAt: day(-2) },
  { _id: "d8", title: "Book the studio for Thursday", status: "complete", dueDate: day(-3), completedAt: day(-3) },
];

export default function DemoDial() {
  const [active, setActive] = useState(null);
  const entries = useMemo(() => DEMO_ENTRIES, []);

  // Stable across renders so selecting a mark announces it without giving the
  // dial a new callback identity and re-running its own measurements.
  const handleSelect = useCallback((task) => setActive(task._id), []);

  return (
    <figure className="m-0">
      <Dial tasks={entries} now={DEMO_NOW} onSelect={handleSelect} />

      <figcaption className="hair-t flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="legend text-[var(--on-ground-2)]">
          Demonstration · 8 tasks, 2 closed, 2 late
        </p>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <Key tone="var(--late)" label="Late" />
          <Key tone="var(--brass-bright)" label="Due today or tomorrow" />
          <Key tone="var(--mark)" label="Ahead" />
          <Key tone="var(--mark-dim)" label="Closed" />
        </ul>
      </figcaption>

      {active && (
        <p className="sr-only" role="status">
          {entries.find((e) => e._id === active)?.title}
        </p>
      )}
    </figure>
  );
}

function Key({ tone, label }) {
  return (
    <li className="legend flex items-center gap-1.5 text-[var(--on-ground-2)]">
      <span
        className="h-3 w-[3px] rounded-none"
        style={{ background: tone }}
        aria-hidden="true"
      />
      {label}
    </li>
  );
}
