import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/context";
import { useTasks } from "@/lib/tasks";
import { DATE_FILTERS, STATUS_TABS, TASKS_PER_PAGE } from "@/lib/data";
import { dueState } from "@/lib/dial";
import { useNow } from "@/lib/useNow";
import CaseBack from "@/components/CaseBack";
import Dial from "@/components/Dial";
import Registers from "@/components/Registers";
import ChapterRing from "@/components/ChapterRing";
import Composer from "@/components/Composer";
import Rack from "@/components/Rack";
import EmptyRack from "@/components/EmptyRack";
import RackPager from "@/components/RackPager";

/**
 * The instrument. One screen, two columns on a desk and one on a phone:
 * the dial and its registers on the left, the composer and the register of
 * entries on the right. Scope controls sit above both because they govern
 * both — narrowing the date scope narrows the dial as well as the rack.
 */
export default function HomePage() {
  const { user } = useAuth();
  const now = useNow();
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);

  // Debounce typing into the query: the API is not hit per keystroke.
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // Any change of scope puts the register back to its first page.
  useEffect(() => {
    setPage(1);
  }, [status, dateFilter, search]);

  const { isPending, isFetching, tasks, pagination, activeCount, completeCount } =
    useTasks({ status, filter: dateFilter, search, page });

  // Late is the one reading that has to be counted from the rows themselves:
  // the API has no overdue filter, so the dial and the register agree only if
  // both derive it from the same list.
  const lateCount = useMemo(
    () => tasks.filter((t) => dueState(t, now) === "late").length,
    [tasks, now]
  );

  const counts = {
    all: activeCount + completeCount,
    active: activeCount,
    complete: completeCount,
  };

  const tabOptions = STATUS_TABS.map((t) => ({ ...t, count: counts[t.value] }));
  const emptyScope = search ? "search" : status;

  return (
    <div className="min-h-dvh">
      <CaseBack />

      <main className="mx-auto w-full max-w-[86rem] px-4 pb-16 sm:px-6">
        {/* Signature + scope controls: these govern the dial and the rack alike */}
        <div className="enter mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="struck text-[1.75rem] sm:text-[2.1rem]">
              {greeting()}, {firstName(user?.name)}.
            </h1>
            <p className="mt-1 text-[0.9375rem] text-[var(--on-ground-2)]">
              {summaryLine({ active: activeCount, complete: completeCount, late: lateCount })}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="legend mb-1.5 block text-[var(--on-ground-2)]">
                Find
              </span>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search…"
                aria-label="Search tasks"
                className="field h-9 w-full px-3 text-sm sm:w-52"
              />
            </label>

            <label className="block">
              <span className="legend mb-1.5 block text-[var(--on-ground-2)]">
                Scope
              </span>
              <select
                aria-label="Filter by date"
                className="field h-9 cursor-pointer px-2.5 text-sm text-[var(--on-ground-2)]"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                {DATE_FILTERS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] xl:items-start xl:gap-8 xl:pb-6">
          {/* The working side. It leads on a phone, because that is where the
              work is done; on a desk the dial takes the left column and the
              reading order still starts there. */}
          <section
            className="enter order-1 xl:order-2"
            style={{ "--i": 2 }}
            aria-label="Task register"
          >
            <ChapterRing
              label="Filter by status"
              value={status}
              onChange={setStatus}
              options={tabOptions}
            />

            <div className="mt-3">
              <Composer />
            </div>

            <div className="mt-5">
              <Rack
                tasks={tasks}
                isLoading={isPending}
                now={now}
                empty={<EmptyRack scope={emptyScope} />}
              />

              <RackPager
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                limit={TASKS_PER_PAGE}
                onPage={setPage}
              />
            </div>
          </section>

          {/* The measuring side */}
          <section
            className="plate enter order-2 xl:order-1 xl:sticky xl:top-6"
            style={{ "--i": 1 }}
            aria-label="Time dial"
          >
            <Dial tasks={tasks} now={now} />
            <div className="hair-t">
              <Registers
                active={activeCount}
                late={lateCount}
                complete={completeCount}
              />
            </div>
          </section>
        </div>

        <p className="sr-only" role="status">
          {isFetching && !isPending
            ? "Updating tasks…"
            : `${tasks.length} task${tasks.length === 1 ? "" : "s"} shown`}
        </p>
      </main>
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────────────────── */

function firstName(fullName) {
  return fullName?.split(" ")[0] || "there";
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Morning";
  if (h < 18) return "Afternoon";
  return "Evening";
}

function summaryLine({ active, complete, late }) {
  if (late === 1) return "1 task past due.";
  if (late > 1) return `${late} tasks past due.`;
  if (active === 0 && complete === 0) return "Nothing set yet.";
  if (active === 0) return "Everything closed.";
  if (complete > 0) return `${active} open, ${complete} closed.`;
  return `${active} open.`;
}
