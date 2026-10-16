import { useEffect, useState } from "react";

/**
 * The running time. The instrument's needle has to track real time without
 * re-rendering the register on every tick, so this refreshes on a coarse
 * interval and again whenever the tab is brought back to the front — the
 * two moments the reading can have gone stale.
 */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [intervalMs]);

  return now;
}
