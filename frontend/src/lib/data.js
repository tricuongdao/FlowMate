/** Status tabs: counts come from the server envelope, not client filtering. */
export const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Ongoing" },
  { value: "complete", label: "Completed" },
];

/** Named date scopes understood by GET /api/tasks?filter= */
export const DATE_FILTERS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

export const TASKS_PER_PAGE = 6;

/**
 * Format a date for card metadata: "Aug 23" (or "Aug 23, 2025" when the
 * year isn't the current one). Tabular-friendly, locale-aware month names.
 */
export function formatDay(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/** True when `iso` falls strictly before today's local midnight. */
export function isOverdue(iso) {
  if (!iso) return false;
  const due = new Date(iso);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}
