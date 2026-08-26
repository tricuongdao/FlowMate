import { useEffect, useRef, useState } from "react";

/**
 * Reveal-on-scroll. Adds `is-visible` once the element enters the viewport.
 * Isolated to one element so React StrictMode double-invokes are harmless.
 * Falls back to visible when IntersectionObserver is unavailable.
 */
export function useReveal(options) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px", ...options }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [visible, options]);

  return [ref, visible];
}
