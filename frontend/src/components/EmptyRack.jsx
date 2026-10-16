import { arcPath } from "@/lib/dial";

/**
 * Empty states. The mark is the dial's own arc with nothing applied to it:
 * graduations and rail, no indices, no needle. A stopped instrument is a
 * more honest picture of an empty rack than a drawing of a clipboard.
 */
const COPY = {
  all: {
    title: "No tasks yet",
    body: "Type a title above. A date is optional.",
  },
  active: {
    title: "Nothing open",
    body: "Everything you set has been closed.",
  },
  complete: {
    title: "Nothing closed yet",
    body: "Closed tasks land here with the day you closed them.",
  },
  search: {
    title: "No match",
    body: "Try another word, or clear the search.",
  },
};

const W = 240;
const CX = 120;
const R = 104;

export default function EmptyRack({ scope = "all" }) {
  const copy = COPY[scope] ?? COPY.all;

  return (
    <div className="px-6 py-14 text-center">
      <svg
        viewBox={`0 0 ${W} ${W * 0.62}`}
        className="mx-auto mb-5 block w-[9.5rem]"
        aria-hidden="true"
      >
        <path
          d={arcPath(R, 180, CX, R)}
          fill="none"
          stroke="var(--mark-dim)"
          strokeWidth="1.4"
        />
        {Array.from({ length: 19 }, (_, i) => i / 18).map((t) => {
          const rad = Math.PI * (1 - t);
          const a = { x: CX + R * Math.cos(rad), y: R - R * Math.sin(rad) };
          const major = Math.abs(t * 18 - Math.round(t * 18 / 3) * 3) < 0.01;
          const len = major ? 11 : 5;
          const b = {
            x: CX + (R - len) * Math.cos(rad),
            y: R - (R - len) * Math.sin(rad),
          };
          return (
            <line
              key={t}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--mark-dim)"
              strokeWidth={major ? 1.4 : 1}
              opacity={major ? 0.9 : 0.5}
            />
          );
        })}
        <circle cx={CX} cy={R} r="2" fill="var(--mark-dim)" />
      </svg>

      <h3 className="struck text-lg">{copy.title}</h3>
      <p className="mx-auto mt-1.5 max-w-[34ch] text-sm leading-relaxed text-[var(--on-ground-2)]">
        {copy.body}
      </p>
    </div>
  );
}
