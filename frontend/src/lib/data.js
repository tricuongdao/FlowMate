/** Status selector stops. Counts come from the server envelope, not the client. */
export const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Ongoing" },
  { value: "complete", label: "Closed" },
];

/** Named date scopes understood by GET /api/tasks?filter= */
export const DATE_FILTERS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

/** Rows per page. The API caps this at 50. */
export const TASKS_PER_PAGE = 12;
