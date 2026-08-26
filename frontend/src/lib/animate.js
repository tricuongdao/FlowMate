/**
 * Motion utilities. House rules (from the motion spec):
 * - transform + opacity only, GPU-composited
 * - strong ease-out cubic-bezier(0.23, 1, 0.32, 1) for entrances,
 *   strong ease-in-out cubic-bezier(0.77, 0, 0.175, 1) for on-screen morphs
 * - UI durations under 300ms
 */

export const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
export const EASE_INOUT = "cubic-bezier(0.77, 0, 0.175, 1)";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Exit animation for a list item: the wrapper's height collapses via WAAPI
 * (the one sanctioned non-transform property: there is no transform way to
 * remove an element's footprint), while the card inside fades and slides.
 * Calls `onDone` when finished; falls back to instant removal when reduced
 * motion is requested or WAAPI is unavailable.
 */
export function collapseAway(element, onDone) {
  if (!element || prefersReducedMotion()) {
    onDone?.();
    return;
  }
  const height = element.offsetHeight;
  element.style.overflow = "hidden";
  const card = element.firstElementChild;
  // Environments without WAAPI (older browsers, jsdom) skip straight
  // to the state change: correctness never depends on the animation.
  if (typeof element.animate !== "function") {
    onDone?.();
    return;
  }
  const animation = element.animate(
    [
      { height: `${height}px`, opacity: 1 },
      { height: "0px", opacity: 1 },
    ],
    { duration: 220, easing: EASE_INOUT, fill: "forwards" }
  );
  if (card && typeof card.animate === "function") {
    card.animate(
      [
        { opacity: 1, transform: "translateX(0)" },
        { opacity: 0, transform: "translateX(-12px) scale(0.98)" },
      ],
      { duration: 180, easing: EASE_OUT, fill: "forwards" }
    );
  }
  const finish = () => {
    animation.removeEventListener("finish", finish);
    onDone?.();
  };
  animation.addEventListener("finish", finish);
}
