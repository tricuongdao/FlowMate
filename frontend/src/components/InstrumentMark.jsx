/**
 * The case mark. A gauge needle swung to the lower left and a brass hub —
 * the instrument's own geometry reduced to a 24-unit token, drawn once and
 * reused at every size. Authored SVG, one stroke weight, no icon-library
 * substitute anywhere in the app.
 */
export default function InstrumentMark({ className, brass = true }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.4" />
      <circle
        cx="12"
        cy="12"
        r="6.5"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.45"
      />
      <path
        d="M12 12 L6.6 15.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="12"
        r="1.7"
        fill={brass ? "var(--brass-bright)" : "currentColor"}
      />
    </svg>
  );
}
