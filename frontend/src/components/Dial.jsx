import { useEffect, useMemo, useRef, useState } from "react";
import {
  angleAt,
  arcPoint,
  arcSpan,
  CLUSTER_MS,
  dayGraduations,
  dialDate,
  dialDomain,
  dialPosition,
  dialTime,
  relativeLabel,
  startAngle,
} from "@/lib/dial";

/**
 * The dial. The instrument's primary read: one arc, a graduation per day, a
 * hollow frame per commitment, and a red needle at now. Everything left of
 * the needle is late and prints in signal red.
 *
 * Two forms, one grammar. A wide column gets the arc. A narrow one gets a
 * stick gauge — the same chapter ring ruled straight — because a wide arc
 * squeezed into a phone column collides its own labels and spills its plate.
 * Both read the same domain, the same clusters and the same needle.
 */

const ARC_SWEEP = 180;
const ARC_R = 190;
const ARC_CX = 240;
const ARC_CY = 220;
const ARC_PAD_X = 22;
const ARC_TOP = 26;
const ARC_LABEL_OUT = 12;
const ARC_LABEL_IN = 19;
const STEM_IN = 24;
const MINOR_OUT = 6;

/**
 * The centre block sits above the needle's pivot. A needle is a straight line
 * from the pivot, so anything printed below it is crossed at some hour of the
 * day; printing the reading above the pivot means the needle can never cross
 * it, at any time. The viewBox is cropped at the arc's feet so the dial and
 * the registers beneath it share one baseline.
 */
const CENTRE_NOW = -127;
const CENTRE_DATE = -103;
const CENTRE_TIME = -79;

const STICK_H = 176;
const STICK_RAIL = 116;
const STICK_PAD = 14;

/**
 * The width below which the arc can no longer hold its proportions. Measured
 * across the app's real columns rather than picked: at this width the arc
 * renders ~490px wide against a 190-unit radius, which is the smallest it
 * still reads as a dial. See frontend/tools/measure.mjs.
 */
const ARC_MIN_W = 560;

const STROKE = 1.5;

const TONE = {
  late: "var(--late)",
  soon: "var(--brass-bright)",
  done: "var(--mark-dim)",
  set: "var(--mark)",
};

/** Merge tasks sitting within `tolerance` of each other on the dial. */
function cluster(tasks, tolerance) {
  const placed = tasks
    .filter((t) => t.dueDate)
    .map((t) => ({ task: t, ms: new Date(t.dueDate).getTime() }))
    .filter((p) => !Number.isNaN(p.ms))
    .sort((a, b) => a.ms - b.ms);

  const groups = [];
  for (const p of placed) {
    const last = groups[groups.length - 1];
    if (last && p.ms - last.ms <= tolerance) last.items.push(p.task);
    else groups.push({ ms: p.ms, items: [p.task] });
  }
  return groups;
}

/** The tone a cluster prints in. Late outranks everything, then closed. */
function groupTone(items) {
  if (items.some((t) => t._tone === "late")) return "late";
  if (items.every((t) => t.status === "complete")) return "done";
  if (items.some((t) => t._tone === "today" || t._tone === "soon")) return "soon";
  return "set";
}

/**
 * Graduation labels, thinned to fit and pulled in from the ends. A label
 * landing within `min` of the previous one is dropped, keeping the numeral
 * legible at the cost of a day it does not name; a label whose anchor falls
 * outside the plate's own bounds is clamped back inside them.
 */
function fitLabels(graduations, domain, sweep, anchorR, minGap, lo, hi) {
  const out = [];
  let lastX = -Infinity;
  for (const g of graduations) {
    const t = dialPosition(g.ms, domain);
    const p = arcPoint(t, anchorR, sweep, ARC_CX, ARC_CY);
    const x = Math.min(Math.max(p.x, lo), hi);
    if (x - lastX < minGap) continue;
    out.push({ ...g, t, x, y: p.y });
    lastX = x;
  }
  return out;
}

export default function Dial({ tasks = [], now, onSelect }) {
  const [narrow, setNarrow] = useState(false);
  const [needleT, setNeedleT] = useState(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      // The column below this width cannot show the arc's 2:1 sweep without
      // flattening it into a line, so the dial switches to the stick gauge
      // rather than shrinking badly. The threshold is a measured quantity, not
      // a guess: see frontend/tools/measure.mjs.
      setNarrow(entry.contentRect.width < ARC_MIN_W);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const domain = useMemo(() => dialDomain(tasks, now), [tasks, now]);
  const graduations = useMemo(() => dayGraduations(domain), [domain]);
  const nowT = dialPosition(now.getTime(), domain);

  const groups = useMemo(() => {
    const merged = cluster(tasks, CLUSTER_MS);
    // The late count is derived here as well as in the page: the dial colours
    // its own marks, so it needs the same reading the rows use.
    return merged.map((g) => ({
      ...g,
      items: g.items.map((t) => ({
        ...t,
        _tone: t.status === "complete" ? "done" : toneForDue(t.dueDate, now),
      })),
    }));
  }, [tasks, now]);

  // Park the needle at the left stop, then sweep it to now. One authored
  // moment, on arrival only: the needle must not swing back and re-sweep
  // every time the reading is recomputed (a resize, or a click on a mark).
  const sweptRef = useRef(false);
  const prevTRef = useRef(null);
  const [snap, setSnap] = useState(false);

  useEffect(() => {
    // A large jump in the reading — coming back to a tab an hour later — is a
    // change of position, not an event to animate. Anything under a fiftieth
    // of the dial is the ordinary 30-second tick and does sweep.
    const prev = prevTRef.current;
    prevTRef.current = nowT;
    setSnap(prev !== null && Math.abs(nowT - prev) > 0.02);

    if (sweptRef.current) {
      setNeedleT(nowT);
      return;
    }
    sweptRef.current = true;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setNeedleT(nowT);
      return;
    }
    const id = requestAnimationFrame(() => setNeedleT(nowT));
    return () => cancelAnimationFrame(id);
  }, [nowT]);

  const dialLabel = `Time dial. Now is ${dialTime(now)}, ${dialDate(
    now
  )}. ${groups.length} dated ${
    groups.length === 1 ? "task" : "tasks"
  } on the dial${
    domain.beyond ? `, ${domain.beyond} beyond the 30 day horizon` : ""
  }.`;

  return (
    <div className="dial" ref={wrapRef}>
      {narrow ? (
        <StickGauge
          domain={domain}
          graduations={graduations}
          groups={groups}
          nowT={needleT}
          now={now}
          onSelect={onSelect}
          label={dialLabel}
        />
      ) : (
        <ArcDial
          domain={domain}
          graduations={graduations}
          groups={groups}
          nowT={needleT}
          now={now}
          onSelect={onSelect}
          label={dialLabel}
          snap={snap}
        />
      )}
    </div>
  );
}

function toneForDue(iso, now) {
  const d = new Date(iso);
  const days = Math.round(
    (new Date(d).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) /
      86_400_000
  );
  if (days < 0) return "late";
  if (days <= 1) return "soon";
  return "set";
}

/* ── The arc: the dial's full form ───────────────────────────────────────── */

function ArcDial({ domain, graduations, groups, nowT, now, onSelect, label, snap }) {
  const w = ARC_CX * 2;
  const labelR = ARC_R + ARC_LABEL_OUT + 6;
  const labels = fitLabels(graduations, domain, ARC_SWEEP, labelR, 34, 6, w - 6);
  const a0 = startAngle(ARC_SWEEP);
  const angle = angleAt(nowT, ARC_SWEEP);

  const feet = {
    a: arcPoint(0, ARC_R, ARC_SWEEP, ARC_CX, ARC_CY),
    b: arcPoint(1, ARC_R, ARC_SWEEP, ARC_CX, ARC_CY),
    ia: arcPoint(0, ARC_R * 0.4, ARC_SWEEP, ARC_CX, ARC_CY),
    ib: arcPoint(1, ARC_R * 0.4, ARC_SWEEP, ARC_CX, ARC_CY),
  };

  const timeGrads = [];
  for (let i = 1; i < 40; i += 1) timeGrads.push(i / 40);

  // The needle is a full-radius line pivoted on the dial centre; the anchor
  // is that same line's tip after the same rotation, so the two can never
  // disagree about where the needle points.
  const pivot = { x: w / 2, y: ARC_CY };
  const theta = ((angle - 90) * Math.PI) / 180;
  const anchor = {
    x: pivot.x + ARC_R * Math.sin(theta),
    y: pivot.y - ARC_R * Math.cos(theta),
  };

  return (
    <svg
      className="dial__svg"
      viewBox={`0 0 ${w + ARC_PAD_X * 2} ${ARC_CY}`}
      role="img"
      aria-label={label}
      data-sweep={ARC_SWEEP}
    >
      <defs>
        <linearGradient id="fm-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--mark)" stopOpacity="0.055" />
          <stop offset="100%" stopColor="var(--mark)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={`translate(${ARC_PAD_X} ${ARC_TOP})`}>
        {/* The recessed face the measurements are printed on */}
        <path
          d={`M ${feet.a.x} ${feet.a.y} A ${ARC_R} ${ARC_R} 0 0 1 ${feet.b.x} ${
            feet.b.y
          } L ${feet.ib.x} ${feet.ib.y} A ${ARC_R * 0.4} ${ARC_R * 0.4} 0 0 0 ${
            feet.ia.x
          } ${feet.ia.y} Z`}
          fill="url(#fm-face)"
        />

        {/* Time graduations, and the rail they hang from */}
        {timeGrads.map((t) => {
          const a = arcPoint(t, ARC_R, ARC_SWEEP, ARC_CX, ARC_CY);
          const b = arcPoint(t, ARC_R + MINOR_OUT * 0.55, ARC_SWEEP, ARC_CX, ARC_CY);
          return (
            <line
              key={t}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--mark-dim)"
              strokeWidth={STROKE}
            />
          );
        })}
        <path
          d={arcSpan(a0, ARC_SWEEP, ARC_R, ARC_CX, ARC_CY)}
          fill="none"
          stroke="var(--mark-dim)"
          strokeWidth={STROKE}
        />

        {/* Late zone: the arc behind the needle */}
        {nowT > 0.004 && (
          <>
            <path
              d={arcSpan(a0, ARC_SWEEP * nowT, ARC_R, ARC_CX, ARC_CY)}
              fill="none"
              stroke="var(--late)"
              strokeWidth={STROKE * 1.7}
            />
            <path
              d={arcSpan(a0, ARC_SWEEP * nowT, ARC_R * 0.4, ARC_CX, ARC_CY)}
              fill="none"
              stroke="var(--late)"
              strokeWidth={STROKE}
              opacity="0.45"
            />
          </>
        )}

        {/* Day graduations, thinned so the numerals stay legible */}
        {labels.map((g) => {
          const a = arcPoint(g.t, ARC_R, ARC_SWEEP, ARC_CX, ARC_CY);
          const b = arcPoint(g.t, ARC_R - ARC_LABEL_IN, ARC_SWEEP, ARC_CX, ARC_CY);
          return (
            <g key={g.ms}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--mark)"
                strokeWidth={STROKE}
                opacity="0.6"
              />
              <text
                x={g.x}
                y={g.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fig"
                fontSize="7.5"
                letterSpacing="0.08em"
                fill="var(--on-ground-2)"
              >
                {g.label}
              </text>
            </g>
          );
        })}

        {/* Applied frames: one mark per cluster of commitments */}
        {groups.map((group) => {
          const t = dialPosition(group.ms, domain);
          const tone = groupTone(group.items);
          const n = group.items.length;
          const a = arcPoint(t, ARC_R, ARC_SWEEP, ARC_CX, ARC_CY);
          const b = arcPoint(t, ARC_R - STEM_IN, ARC_SWEEP, ARC_CX, ARC_CY);
          const rad = Math.atan2(b.y - ARC_CY, b.x - ARC_CX);
          const perp = { x: -Math.sin(rad), y: Math.cos(rad) };
          const half = 5 + Math.min(n, 5) * 1.7;
          const title = group.items.map((x) => x.title).join(" · ");
          const single = n === 1 ? group.items[0] : null;
          const caption = `${title} — ${
            n > 1 ? `${n} due ` : "due "
          }${relativeLabel(new Date(group.ms).toISOString(), now)}`;
          return (
            <g
              key={group.ms}
              style={single && onSelect ? { cursor: "pointer" } : undefined}
              onClick={single && onSelect ? () => onSelect(single) : undefined}
            >
              <title>{caption}</title>
              {n > 1 && (
                <line
                  x1={b.x - perp.x * half}
                  y1={b.y - perp.y * half}
                  x2={b.x + perp.x * half}
                  y2={b.y + perp.y * half}
                  stroke={TONE[tone]}
                  strokeWidth={6}
                />
              )}
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={TONE[tone]}
                strokeWidth={n > 1 ? 2.4 : 3.6}
              />
            </g>
          );
        })}

        {/* The needle. Red, on this instrument, means now. The pivot is
            written into the SVG transform so the rotation centre is the dial's
            own centre, never the line's bounding box. */}
        <g
          className={snap ? "needle no-anim" : "needle"}
          transform={`rotate(${angle - 90} ${pivot.x} ${pivot.y})`}
        >
          <line
            x1={pivot.x}
            y1={pivot.y}
            x2={pivot.x}
            y2={pivot.y - ARC_R}
            stroke="var(--late)"
            strokeWidth="1.4"
          />
        </g>
        {nowT > 0.004 && (
          <circle
            cx={anchor.x}
            cy={anchor.y}
            r="3.4"
            fill="var(--late)"
            stroke="var(--dial)"
            strokeWidth="1.3"
          />
        )}
        <circle cx={pivot.x} cy={pivot.y} r="2.2" fill="var(--mark-dim)" />

        {/* The centre: the reading, printed above the needle's pivot so a
            needle parked at any hour passes beneath it. */}
        <text
          x={pivot.x}
          y={ARC_CY + CENTRE_NOW}
          textAnchor="middle"
          className="legend"
          fill="var(--on-ground-2)"
          fontSize="8.5"
        >
          Now
        </text>
        <text
          x={pivot.x}
          y={ARC_CY + CENTRE_DATE}
          textAnchor="middle"
          className="struck"
          fill="var(--on-ground)"
          fontSize="27"
        >
          {dialDate(now)}
        </text>
        <text
          x={pivot.x}
          y={ARC_CY + CENTRE_TIME}
          textAnchor="middle"
          className="fig"
          fill="var(--on-ground-2)"
          fontSize="13"
          letterSpacing="0.08em"
        >
          {dialTime(now)}
        </text>
      </g>
    </svg>
  );
}

/* ── The stick gauge: the same ring, ruled straight ──────────────────────── */

function StickGauge({ domain, graduations, groups, nowT, now, onSelect, label }) {
  const w = 320;
  const inner = w - STICK_PAD * 2;
  const xAt = (t) => STICK_PAD + inner * t;

  // Same thinning rule as the arc, with the ends clamped inside the frame and
  // the month named once so a numeral is never mistaken for a bare day.
  const labels = (() => {
    const out = [];
    let lastX = -Infinity;
    for (const g of graduations) {
      const t = dialPosition(g.ms, domain);
      const x = Math.min(Math.max(xAt(t), 12), w - 12);
      if (x - lastX < 28) continue;
      out.push({ ...g, x, first: out.length === 0 });
      lastX = x;
    }
    return out;
  })();

  const timeGrads = [];
  for (let i = 0; i <= 24; i += 1) timeGrads.push(i / 24);

  return (
    <svg
      className="dial__svg"
      viewBox={`0 0 ${w} ${STICK_H}`}
      role="img"
      aria-label={label}
    >
      {/* The rail */}
      <line
        x1={STICK_PAD}
        y1={STICK_RAIL}
        x2={w - STICK_PAD}
        y2={STICK_RAIL}
        stroke="var(--mark-dim)"
        strokeWidth={STROKE}
      />

      {/* Time graduations above the rail */}
      {timeGrads.map((t) => (
        <line
          key={t}
          x1={xAt(t)}
          y1={STICK_RAIL}
          x2={xAt(t)}
          y2={STICK_RAIL - 5}
          stroke="var(--mark-dim)"
          strokeWidth={STROKE}
        />
      ))}

      {/* Late zone */}
      {nowT > 0.004 && (
        <line
          x1={STICK_PAD}
          y1={STICK_RAIL}
          x2={xAt(nowT)}
          y2={STICK_RAIL}
          stroke="var(--late)"
          strokeWidth={2.5}
        />
      )}

      {/* Day graduations below the rail, extending down toward the register */}
      {graduations.map((g) => {
        const t = dialPosition(g.ms, domain);
        return (
          <line
            key={g.ms}
            x1={xAt(t)}
            y1={STICK_RAIL}
            x2={xAt(t)}
            y2={STICK_RAIL + 9}
            stroke="var(--mark)"
            strokeWidth={STROKE}
            opacity="0.5"
          />
        );
      })}
      {labels.map((g) => (
        <text
          key={`l${g.ms}`}
          x={g.x}
          y={STICK_RAIL + 21}
          textAnchor="middle"
          className="fig"
          fontSize="7.5"
          letterSpacing="0.08em"
          fill="var(--on-ground-2)"
        >
          {g.first ? g.label : g.day}
        </text>
      ))}

      {/* Commitments, hung above the rail as frames */}
      {groups.map((group) => {
        const t = dialPosition(group.ms, domain);
        const tone = groupTone(group.items);
        const n = group.items.length;
        const h = 16 + Math.min(n, 6) * 4;
        const title = group.items.map((x) => x.title).join(" · ");
        const single = n === 1 ? group.items[0] : null;
        return (
          <g
            key={group.ms}
            style={single && onSelect ? { cursor: "pointer" } : undefined}
            onClick={single && onSelect ? () => onSelect(single) : undefined}
          >
            <title>{`${title} — ${
              n > 1 ? `${n} due ` : "due "
            }${relativeLabel(new Date(group.ms).toISOString(), now)}`}</title>
            <line
              x1={xAt(t)}
              y1={STICK_RAIL}
              x2={xAt(t)}
              y2={STICK_RAIL - h}
              stroke={TONE[tone]}
              strokeWidth={n > 1 ? 5 : 3}
            />
            <rect
              x={xAt(t) - 4}
              y={STICK_RAIL - h - 5}
              width="8"
              height="4"
              fill="none"
              stroke={TONE[tone]}
              strokeWidth="1.4"
            />
          </g>
        );
      })}

      {/* The needle */}
      <line
        className="needle"
        x1={xAt(nowT)}
        y1={STICK_RAIL + 16}
        x2={xAt(nowT)}
        y2={STICK_RAIL - 46}
        stroke="var(--late)"
        strokeWidth="1.4"
        style={{ transition: "none" }}
      />
      <circle cx={xAt(nowT)} cy={STICK_RAIL} r="2.6" fill="var(--late)" />

      {/* The reading, printed above the rail where the arc prints it inside */}
      <text
        x={STICK_PAD}
        y={30}
        className="struck"
        fill="var(--on-ground)"
        fontSize="24"
      >
        {dialDate(now)}
      </text>
      <text
        x={STICK_PAD}
        y={50}
        className="fig"
        fill="var(--on-ground-2)"
        fontSize="12"
        letterSpacing="0.08em"
      >
        {dialTime(now)}
      </text>

      {/* The ends of the scale, named */}
      <text
        x={STICK_PAD}
        y={STICK_H - 6}
        className="legend"
        fill="var(--on-ground-2)"
        fontSize="8"
      >
        Late
      </text>
      <text
        x={w - STICK_PAD}
        y={STICK_H - 6}
        textAnchor="end"
        className="legend"
        fill="var(--on-ground-2)"
        fontSize="8"
      >
        +30d
      </text>
    </svg>
  );
}
