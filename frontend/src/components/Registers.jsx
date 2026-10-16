import { cn } from "@/lib/utils";

/**
 * The three subdial registers. These are counts, not statistics: an
 * instrument prints its readings in a row of registers, and on this
 * instrument the reading that matters is how many are late.
 */
export default function Registers({ active, late, complete, className }) {
  const dials = [
    { key: "active", n: active, label: "Open", tone: "neutral" },
    { key: "late", n: late, label: "Late", tone: "late" },
    { key: "done", n: complete, label: "Closed", tone: "done" },
  ];

  return (
    <div
      className={cn("flex items-stretch", className)}
      role="group"
      aria-label="Register readings"
    >
      {dials.map((d) => (
        <div key={d.key} className="register" data-tone={d.tone}>
          <span className="register__n seg fig">
            {String(d.n ?? 0).padStart(2, "0")}
          </span>
          <span className="legend text-[var(--on-ground-2)]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
