import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Compact pager: Prev / "n of m" / Next. No page-number soup: with
 * server-side pagination and 6-per-page, relative position is what
 * people actually need.
 */
const TaskListPagination = ({ page, totalPages, onPage }) => {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Task pages" className="mt-2 flex items-center justify-center gap-1">
      <button
        type="button"
        className={cn("icon-btn", page === 1 && "pointer-events-none opacity-40")}
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft className="size-4" />
      </button>

      <span className="tnum px-3 text-xs text-muted" aria-current="page">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        className={cn(
          "icon-btn",
          page === totalPages && "pointer-events-none opacity-40"
        )}
        aria-label="Next page"
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
};

export default TaskListPagination;
