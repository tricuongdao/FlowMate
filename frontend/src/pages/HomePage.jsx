import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/context";
import { useTasks } from "@/lib/tasks";
import { DATE_FILTERS, STATUS_TABS } from "@/lib/data";
import Header from "@/components/Header";
import AddTask from "@/components/AddTask";
import Segmented from "@/components/Segmented";
import TaskList from "@/components/TaskList";
import TaskEmptyState from "@/components/TaskEmptyState";
import TaskListPagination from "@/components/TaskListPagination";

/**
 * Home: greeting, composer, scope controls (status tabs / search /
 * date scope), then the list. Search is debounced at the page level so
 * the API isn't hit per keystroke; page state resets when scope changes.
 */
const HomePage = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);

  // Debounce search input → query value (250ms).
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // Reset to page 1 whenever the scope shifts under the user.
  useEffect(() => {
    setPage(1);
  }, [status, dateFilter, search]);

  const params = { status, filter: dateFilter, search, page };
  const { isPending, isFetching, tasks, pagination, activeCount, completeCount } =
    useTasks(params);

  const counts = {
    all: activeCount + completeCount,
    active: activeCount,
    complete: completeCount,
  };

  const tabOptions = STATUS_TABS.map((tab) => ({
    ...tab,
    count: counts[tab.value],
  }));

  const searching = !!search;

  return (
    <div className="min-h-dvh">
      <div className="backdrop-aurora" aria-hidden="true" />
      <Header />

      <main className="mx-auto w-full max-w-2xl px-4 pb-20 sm:px-6">
        <section className="page-enter mt-10 mb-8">
          <h1 className="display text-[2rem] font-semibold sm:text-[2.4rem]">
            {greeting()}, {firstName(user?.name)}.
          </h1>
          <p className="mt-1 text-[15px] text-muted">{summaryLine(counts)}</p>
        </section>

        <AddTask />

        {/* Scope controls */}
        <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-3">
          <Segmented
            label="Filter by status"
            value={status}
            onChange={setStatus}
            options={tabOptions}
          />
          <div className="flex items-center gap-2">
            <label className="relative">
              <span className="sr-only">Search tasks</span>
              <svg
                viewBox="0 0 16 16"
                className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.5 10.5L14 14" />
              </svg>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search…"
                className="field h-9 w-40 pl-8 pr-3 text-sm sm:w-48"
              />
            </label>
            <DateScopeSelect value={dateFilter} onChange={setDateFilter} />
          </div>
        </div>

        <TaskList
          tasks={tasks}
          isLoading={isPending}
          empty={<TaskEmptyState scope={searching ? "search" : status} />}
        />

        {(pagination.hasNextPage || pagination.hasPrevPage) && (
          <TaskListPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPage={setPage}
          />
        )}

        {/* Live region: screen readers hear list updates without visual noise */}
        <p className="sr-only" role="status">
          {isFetching && !isPending
            ? "Updating tasks…"
            : `${tasks.length} task${tasks.length === 1 ? "" : "s"} shown`}
        </p>
      </main>
    </div>
  );
};

/* ── helpers ─────────────────────────────────────────────────────────── */

function firstName(fullName) {
  return fullName?.split(" ")[0] || "there";
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function summaryLine({ active, complete }) {
  if (active === 0 && complete === 0)
    return "A clean slate. Add your first task below.";
  if (active === 0) return "Everything's done. Enjoy the clear deck.";
  const noun = active === 1 ? "task" : "tasks";
  return complete > 0
    ? `${active} ongoing ${noun}, ${complete} done.`
    : `${active} ongoing ${noun} in your flow.`;
}

function DateScopeSelect({ value, onChange }) {
  return (
    <select
      aria-label="Filter by date"
      className="field h-9 cursor-pointer px-2.5 text-sm text-muted"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {DATE_FILTERS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default HomePage;
