import { cn } from "@/lib/utils";

/**
 * The register's pager. An instrument states its position as a fraction of
 * the whole, so the readout is "03/07" rather than a row of page buttons.
 */
export default function RackPager({ page, totalPages, onPage, totalItems, limit }) {
  if (totalPages <= 1) return null;

  const pad = (n) => String(n).padStart(2, "0");
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalItems ?? page * limit);

  return (
    <nav
      aria-label="Task pages"
      className="mt-3 flex items-center justify-between gap-3"
    >
      <span className="fig text-xs text-[var(--on-ground-2)]">
        {pad(from)}–{pad(to)}
        {totalItems ? ` of ${totalItems}` : ""}
      </span>

      <span className="flex items-center gap-1">
        <button
          type="button"
          className={cn("icon-btn", page === 1 && "pointer-events-none opacity-35")}
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
        >
          <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3.5L5.5 8l4.5 4.5" />
          </svg>
        </button>
        <span className="fig px-1.5 text-xs text-[var(--on-ground)]" aria-current="page">
          {pad(page)}/{pad(totalPages)}
        </span>
        <button
          type="button"
          className={cn(
            "icon-btn",
            page === totalPages && "pointer-events-none opacity-35"
          )}
          aria-label="Next page"
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
        >
          <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3.5L10.5 8L6 12.5" />
          </svg>
        </button>
      </span>
    </nav>
  );
}
