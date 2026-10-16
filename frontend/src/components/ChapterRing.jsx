import { useEffect, useRef, useState } from "react";

/**
 * The chapter ring. Three selector stops with an applied brass index marking
 * the live position — a selector wheel, not a tab bar. The index is measured
 * from the DOM so stops of unequal label length all get a true fit, and it is
 * re-measured once webfonts land, because a condensed face changes the widths.
 */
export default function ChapterRing({ options, value, onChange, label }) {
  const listRef = useRef(null);
  const [index, setIndex] = useState({ left: 0, width: 0 });

  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );

  useEffect(() => {
    const measure = () => {
      const list = listRef.current;
      const stop = list?.children[activeIndex];
      if (!stop) return;
      setIndex({ left: stop.offsetLeft, width: stop.offsetWidth });
    };
    measure();
    if (typeof document === "undefined") return;
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) measure();
    });
    return () => {
      alive = false;
    };
  }, [activeIndex, options]);

  return (
    <div className="chapter-ring" role="group" aria-label={label} ref={listRef}>
      <span
        className="chapter-ring__index"
        aria-hidden="true"
        style={{ left: index.left, width: index.width }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={opt.value === value}
          // The stop prints its count above its name, so the reading order is
          // visual only; the accessible name states both parts in words.
          aria-label={
            opt.count == null ? opt.label : `${opt.label}, ${opt.count}`
          }
          className="chapter-ring__stop"
          onClick={() => onChange(opt.value)}
        >
          <span className="chapter-ring__count" aria-hidden="true">
            {opt.count ?? "—"}
          </span>
          <span className="legend" aria-hidden="true">
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}
