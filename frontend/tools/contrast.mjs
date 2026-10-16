// Contrast audit for the Chronometer palette (development only).
//
// Two failure modes this tool exists to catch, both of which shipped once:
//   1. A token pair nobody computed — brass text on a light ground.
//   2. An opacity-modified colour, where the token is fine but the composited
//      result is not. `opacity-70` on a legend is a different colour.
//
// Every value here is read from the same hex the stylesheet declares. When a
// token changes, change it here too; a pair that is not listed is a pair
// nobody is checking.
const HEX = /^#([0-9a-fA-F]{6})$/;

/** Accept a hex string or an already-composited [r,g,b] triple. */
function parseHex(h) {
  if (Array.isArray(h)) return h;
  const m = HEX.exec(String(h).trim());
  if (!m) throw new Error(`not a hex colour: ${h}`);
  const s = m[1];
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}

/** Composite a foreground at `alpha` over an opaque background. */
const over = (fg, alpha, bg) => fg.map((v, i) => v * alpha + bg[i] * (1 - alpha));

const lum = (rgb) =>
  rgb
    .map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    })
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);

const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/* ── The palette, exactly as index.css declares it ───────────────────────── */
const D = {
  ground: "#0e1216",
  plate: "#161c21",
  dial: "#12181d",
  onGround: "#e8e4da",
  onGround2: "#98a1a8",
  late: "#e05a44",
  brass: "#b5863c",
  brassBright: "#d4a24e",
  brassText: "#dfae5c",
  crownText: "#17130a",
};
const L = {
  ground: "#e8e4da",
  plate: "#fbf9f4",
  dial: "#ece8dd",
  field: "#f2efe6",
  onGround: "#14181c",
  onGround2: "#565b60",
  late: "#b23a27",
  brass: "#8a6a2a",
  brassText: "#7d5a24",
  crownText: "#fdfbf6",
  crown: "#82621f",
};

// The selector ring has its own ground: a dial tint over the plate's own
// surface, at the alpha index.css declares. Derived here so the index's
// fill can be judged against what it actually sits on.
D.ringGround = over(parseHex(D.dial), 0.7, parseHex(D.plate));
L.ringGround = over(parseHex(L.plate), 0.35, parseHex(L.ground));

const BODY = 4.5; // text below 18.66px bold / 24px regular
const LARGE = 3; // larger text, and non-text graphics
/** A redundant cue only has to be perceptible, not readable. */
const INDEX_BAR = 1.7;

/** [label, fg | null, bg, fgBase, alpha] — alpha means the fg is composited. */
const PAIRS = [
  // ── Dark dial ────────────────────────────────────────────────────────────
  ["DARK   body on ground", D.onGround, D.ground],
  ["DARK   body on plate", D.onGround, D.plate],
  ["DARK   secondary on ground", D.onGround2, D.ground],
  ["DARK   secondary on plate", D.onGround2, D.plate],
  ["DARK   secondary on dial", D.onGround2, D.dial],
  ["DARK   late stamp on ground", D.late, D.ground],
  ["DARK   late stamp on plate", D.late, D.plate],
  ["DARK   late stamp on dial", D.late, D.dial],
  ["DARK   brass text on ground", D.brassText, D.ground],
  ["DARK   brass text on plate", D.brassText, D.plate],
  ["DARK   crown lettering on crown", D.crownText, D.brass],
  // 24px seven-segment readings: large text, so 3:1 is the bar.
  ["DARK   register reading (large) on plate", D.brassBright, D.plate, null, null, LARGE],
  ["DARK   late register reading (large) on plate", D.late, D.plate, null, null, LARGE],
  // Non-text graphics: the needle carries meaning, so 3:1 is its bar. The
  // arc rail is a decorative scale and is reported separately below.
  ["DARK   needle on dial", D.late, D.dial, null, null, LARGE],

  // ── Light dial ───────────────────────────────────────────────────────────
  ["LIGHT  body on ground", L.onGround, L.ground],
  ["LIGHT  body on plate", L.onGround, L.plate],
  ["LIGHT  secondary on ground", L.onGround2, L.ground],
  ["LIGHT  secondary on plate", L.onGround2, L.plate],
  ["LIGHT  secondary on dial", L.onGround2, L.dial],
  ["LIGHT  placeholder on field", L.onGround2, L.field],
  ["LIGHT  late stamp on ground", L.late, L.ground],
  ["LIGHT  late stamp on plate", L.late, L.plate],
  ["LIGHT  brass text on ground", L.brassText, L.ground],
  ["LIGHT  brass text on plate", L.brassText, L.plate],
  ["LIGHT  crown lettering on crown", L.crownText, L.crown],
  ["LIGHT  register reading (large) on plate", L.brassText, L.plate, null, null, LARGE],
  ["LIGHT  late register reading (large) on plate", L.late, L.plate, null, null, LARGE],
  ["LIGHT  needle on dial", L.late, L.dial, null, null, LARGE],

  // ── Declared decorative ──────────────────────────────────────────────────
  // The arc rail and the hairlines are scale marks and dividers, not
  // information: nothing is read from them, and WCAG's 3:1 applies to
  // graphical objects required to understand content. Reported, never gating.
  ["RAIL   arc rail on dial (decorative)", null, D.dial, D.onGround, 0.28, null],
  ["RAIL   arc rail on light dial (decorative)", null, L.dial, L.onGround, 0.24, null],

  // ── The applied index ────────────────────────────────────────────────────
  // A selector mark is read against the stop it sits on, not against the
  // plate behind the control. The ring has its own ground, so the pair that
  // matters is fill-vs-ring, and the bar is a "can you see it at all" bar
  // rather than the 3:1 for meaningful graphics: the index is a redundant
  // cue, since the pressed stop also carries aria-pressed and a colour shift.
  ["DARK   index fill vs ring ground", null, D.ringGround, D.brass, 0.4, INDEX_BAR],
  ["LIGHT  index fill vs ring ground", null, L.ringGround, L.brass, 0.48, INDEX_BAR],
];

/**
 * Composited values the system is not allowed to ship. These are not
 * assertions about current code; they are the known-bad results of putting an
 * opacity modifier on a text token, kept so the numbers stay on the record.
 * Nothing in `src/` may produce one. Emptying this list would mean forgetting
 * why the legends carry no alpha.
 */
const BANNED = [
  ["--on-ground-2 at 70% on the dark plate (register head, track readout)", D.onGround2, 0.7, D.plate, 3.89],
  ["--on-ground-2 at 70% on the dark ground", D.onGround2, 0.7, D.ground, 4.08],
];

let failed = 0;
for (const [name, fgHex, bgHex, fgBase, alpha, bar = BODY] of PAIRS) {
  const bg = parseHex(bgHex);
  const fg = fgHex ? parseHex(fgHex) : over(parseHex(fgBase), alpha, bg);
  const r = ratio(fg, bg);
  const decorative = bar === null;
  const passes = decorative || r >= bar;
  if (!passes) failed += 1;
  const verdict = decorative
    ? "decorative"
    : passes
      ? r >= BODY
        ? "pass"
        : "large-only"
      : "FAIL";
  console.log(
    `${r.toFixed(2).padStart(7)}:1  ${verdict.padEnd(11)} ${name}${
      !decorative && bar !== BODY ? `  (bar ${bar})` : ""
    }`
  );
}

console.log("\nBanned composited values (must not appear in src/):");
for (const [name, base, alpha, bgHex, recorded] of BANNED) {
  const bg = parseHex(bgHex);
  const r = ratio(over(parseHex(base), alpha, bg), bg);
  const agrees = Math.abs(r - recorded) < 0.01;
  console.log(
    `  ${r.toFixed(2).padStart(6)}:1  ${agrees ? "recorded" : "DRIFTED "}  ${name}`
  );
  if (!agrees) failed += 1;
}

console.log(`\n${PAIRS.length} pairs checked, ${failed} below their bar`);
if (failed) process.exitCode = 1;
