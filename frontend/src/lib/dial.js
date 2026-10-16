/**
 * Dial measurement. Everything the instrument reads is derived here, as
 * plain numbers, so the components stay presentational.
 *
 * The dial's domain is a time span. It runs from a little before now to
 * whichever comes first: the last thing due, or the horizon. Past the
 * horizon the dial stops measuring and says so, rather than compressing
 * every real deadline into the last two degrees of the arc.
 */

/** How far back the dial reaches, in hours before now. */
export const LEAD_HOURS = 36;

/** How far forward the dial measures, in days. */
export const HORIZON_DAYS = 30;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Local midnight of the day containing `date`. */
export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Whole days from today's local midnight to `iso`'s. Negative means past. */
export function daysFromToday(iso, now = new Date()) {
  if (!iso) return null;
  const due = startOfDay(iso);
  if (Number.isNaN(due.getTime())) return null;
  return Math.round((due - startOfDay(now)) / DAY);
}

/** True when a task's due date falls strictly before today. */
export function isOverdue(iso, now = new Date()) {
  if (!iso) return false;
  const due = startOfDay(iso);
  if (Number.isNaN(due.getTime())) return false;
  return due < startOfDay(now);
}

/** True when a task is due today or tomorrow — the brass band. */
export function isDueSoon(iso, now = new Date()) {
  const d = daysFromToday(iso, now);
  return d !== null && d >= 0 && d <= 1;
}

/**
 * How a row's due stamp reads. One of "late" | "today" | "soon" | "set" |
 * "done" | "none"; the row and the dial agree because they share this.
 */
export function dueState(task, now = new Date()) {
  if (task.status === "complete") return "done";
  if (!task.dueDate) return "none";
  const d = daysFromToday(task.dueDate, now);
  if (d === null) return "none";
  if (d < 0) return "late";
  if (d === 0) return "today";
  if (d === 1) return "soon";
  return "set";
}

/** The relative half of a due stamp: "3d late", "today", "in 5d". */
export function relativeLabel(iso, now = new Date()) {
  const d = daysFromToday(iso, now);
  if (d === null) return "";
  if (d === 0) return "today";
  if (d === -1) return "1d late";
  if (d < 0) return `${Math.abs(d)}d late`;
  if (d === 1) return "tomorrow";
  return `in ${d}d`;
}

/** The absolute half of a due stamp: "14 Mar". */
export function dayLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d
    .toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      ...(sameYear ? {} : { year: "2-digit" }),
    })
    .toUpperCase();
}

/** The dial's own date readout: "THU 14 MAR". */
export function dialDate(now = new Date()) {
  return now
    .toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    .toUpperCase();
}

/** The dial's own time readout: "14:32". */
export function dialTime(now = new Date()) {
  return now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/* ── Dial geometry ──────────────────────────────────────────────────────── */

/**
 * How close two due instants must be before the dial prints one mark for both.
 * A flat duration, not a fraction of the span: zoom level must not change how
 * many commitments the dial claims to be showing, and two things owed on the
 * same afternoon are still two things. Five hours keeps same-day work distinct
 * while still merging a genuine pile-up.
 */
export const CLUSTER_MS = 5 * HOUR;

/**
 * The dial's domain, clamped to the horizon. `from` is always strictly in
 * the past so the needle is never parked on the left stop.
 */
export function dialDomain(tasks, now = new Date()) {
  const from = now.getTime() - LEAD_HOURS * HOUR;
  const horizon = now.getTime() + HORIZON_DAYS * DAY;

  let latest = from + 1;
  let beyond = 0;
  for (const t of tasks) {
    if (!t.dueDate) continue;
    const ts = new Date(t.dueDate).getTime();
    if (Number.isNaN(ts)) continue;
    if (ts > horizon) {
      beyond += 1;
      continue;
    }
    if (ts > latest) latest = ts;
  }
  return { from, to: Math.max(latest, from + 12 * HOUR), beyond };
}

/** Position of an instant within the domain, as 0…1. */
export function dialPosition(ms, domain) {
  const span = domain.to - domain.from;
  if (span <= 0) return 0;
  return Math.min(1, Math.max(0, (ms - domain.from) / span));
}

/**
 * A point at `angle` degrees (measured anticlockwise from the 3 o'clock
 * direction) on a circle drawn around (cx, cy). SVG's y axis points down,
 * so the sine term is subtracted.
 */
export function pointAt(angle, radius, cx, cy) {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
}

/**
 * An arc of `span` degrees beginning at `start`, drawn as an SVG path.
 * The dial's 180° sweep runs from the 9 o'clock position over the top to
 * the 3 o'clock position; narrower sweeps keep the same centre and pull
 * the two feet up. `large` is derived, never guessed.
 */
export function arcSpan(start, span, radius, cx, cy) {
  const a = pointAt(start, radius, cx, cy);
  const b = pointAt(start + span, radius, cx, cy);
  const large = Math.abs(span) > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${large} 1 ${b.x} ${b.y}`;
}

/**
 * Where the dial's sweep begins, for a given total sweep. Angles are measured
 * anticlockwise from 3 o'clock and `pointAt` flips the sine for SVG's
 * downward y axis, so the top half of the circle is 0…180. A full sweep
 * therefore starts at 0 and a narrower one starts at (180 - sweep) / 2.
 */
export function startAngle(sweep) {
  return (180 - sweep) / 2;
}

/** The angle at `t` (0…1) along a dial of `sweep` degrees. */
export function angleAt(t, sweep) {
  return startAngle(sweep) + sweep * t;
}

/** A point on the dial at `t` (0…1). */
export function arcPoint(t, radius, sweep, cx, cy) {
  return pointAt(angleAt(t, sweep), radius, cx, cy);
}

/** The SVG path for the dial's rail. */
export function arcPath(radius, sweep, cx, cy) {
  return arcSpan(startAngle(sweep), sweep, radius, cx, cy);
}

/** Midnight graduations inside the domain, one per day boundary. */
export function dayGraduations(domain) {
  const out = [];
  const d = startOfDay(new Date(domain.from));
  d.setDate(d.getDate() + 1);
  while (d.getTime() < domain.to) {
    if (d.getTime() > domain.from) {
      out.push({
        ms: d.getTime(),
        // Full "16 OCT" for a label standing on its own, and the bare numeral
        // for one in a row where the month is already established.
        label: d
          .toLocaleDateString(undefined, { day: "numeric", month: "short" })
          .toUpperCase(),
        day: String(d.getDate()).padStart(2, "0"),
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}
