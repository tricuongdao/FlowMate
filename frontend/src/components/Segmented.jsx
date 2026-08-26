import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Segmented control with a sliding thumb. The thumb animates left/width
 * between buttons: measured in the DOM so labels of different lengths
 * all get a perfect fit. Reduced motion shortens the transition in CSS.
 */
const Segmented = ({ options, value, onChange, label }) => {
  const listRef = useRef(null);
  const [thumb, setThumb] = useState({ left: 3, width: 0 });

  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const btn = list.children[activeIndex];
    if (!btn) return;
    setThumb({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [activeIndex]);

  // Re-measure when fonts finish loading (thumb width depends on text width).
  useEffect(() => {
    if (!listRef.current || typeof document === "undefined") return;
    let alive = true;
    document.fonts?.ready.then(() => {
      if (!alive || !listRef.current) return;
      const btn = listRef.current.children[activeIndex];
      if (btn) setThumb({ left: btn.offsetLeft, width: btn.offsetWidth });
    });
    return () => {
      alive = false;
    };
  }, [activeIndex]);

  return (
    <div className="segmented" role="group" aria-label={label}>
      <span
        className="seg-thumb"
        aria-hidden="true"
        style={{ left: thumb.left, width: thumb.width }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={opt.value === value}
          className={cn("seg-item", opt.count != null && "gap-1.5")}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
          {opt.count != null && (
            <span className="tnum opacity-60">{opt.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default Segmented;
