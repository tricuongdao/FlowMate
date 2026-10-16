/**
 * Documentation drift check (development only).
 *
 * DESIGN.md is normative for the tokens; .impeccable/design.json restates them
 * for tooling. The document reference requires the sidecar's narrative to be
 * pulled from DESIGN.md verbatim, so the two can silently disagree without
 * anyone noticing. This reports any disagreement between:
 *   - the hex values in DESIGN.md's frontmatter and index.css's token blocks
 *   - the named rules, do's, and don'ts counts in both documents
 *
 * Run:  node tools/doccheck.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const design = read("DESIGN.md");
const css = read("frontend/src/index.css");
const sidecar = JSON.parse(read(".impeccable/design.json"));

const problems = [];

/* ── Frontmatter hexes must exist in the stylesheet ─────────────────────── */
const front = design.split("---")[1] ?? "";
const frontHexes = new Set(
  (front.match(/#[0-9a-fA-F]{6}/g) ?? []).map((h) => h.toLowerCase())
);
const cssHexes = new Set(
  (css.match(/#[0-9a-fA-F]{6}/g) ?? []).map((h) => h.toLowerCase())
);
for (const h of frontHexes) {
  if (!cssHexes.has(h)) problems.push(`frontmatter hex not in index.css: ${h}`);
}

/* ── Sidecar colours must exist in the stylesheet ───────────────────────── */
for (const [key, meta] of Object.entries(sidecar.extensions.colorMeta)) {
  if (!cssHexes.has(meta.canonical.toLowerCase())) {
    problems.push(`sidecar colour "${key}" (${meta.canonical}) not in index.css`);
  }
}

/* ── Narrative counts must agree ────────────────────────────────────────── */
const countRules = (s) => (s.match(/^\*\*The .+? Rule\.\*\*/gm) ?? []).length;
const body = design.split("## Do's and Don'ts")[1] ?? "";
const dosBlock = body.split("### Don't:")[0] ?? "";
const dontBlock = body.split("### Don't:")[1] ?? "";
const countItems = (s) => (s.match(/^- \*\*/gm) ?? []).length;

const mdRules = countRules(design);
const mdDos = countItems(dosBlock);
const mdDonts = countItems(dontBlock);

if (mdRules !== sidecar.narrative.rules.length) {
  problems.push(
    `named rules: DESIGN.md has ${mdRules}, sidecar has ${sidecar.narrative.rules.length}`
  );
}
if (mdDos !== sidecar.narrative.dos.length) {
  problems.push(
    `dos: DESIGN.md has ${mdDos}, sidecar has ${sidecar.narrative.dos.length}`
  );
}
if (mdDonts !== sidecar.narrative.donts.length) {
  problems.push(
    `donts: DESIGN.md has ${mdDonts}, sidecar has ${sidecar.narrative.donts.length}`
  );
}

/* ── Every token the sidecar names as a CSS variable must be declared ───── */
// `--i` is an inline per-element custom property (a stagger index) rather than
// a design token, and `---` is a frontmatter fence; both are excluded by
// requiring a letter after the dashes and a declaration, not an assignment.
const declared = new Set(
  (css.match(/^\s*--[a-z][a-z0-9-]*(?=\s*:)/gm) ?? []).map((s) => s.trim())
);
const referenced = new Set(
  (
    css.match(/var\(\s*(--[a-z][a-z0-9-]*)/g) ?? []
  ).map((s) => s.replace(/var\(\s*/, ""))
);
// `--i` is the entrance stagger index. It is set inline by the component that
// renders the item, so it is deliberately undeclared: the declaration would be
// a lie about where the value comes from.
const INLINE_PROPS = new Set(["--i"]);
for (const token of referenced) {
  if (INLINE_PROPS.has(token)) continue;
  if (!declared.has(token)) problems.push(`token referenced but never declared: ${token}`);
}

console.log(`frontmatter hexes: ${frontHexes.size}`);
console.log(`sidecar colours:   ${Object.keys(sidecar.extensions.colorMeta).length}`);
console.log(`named rules:       DESIGN.md ${mdRules} / sidecar ${sidecar.narrative.rules.length}`);
console.log(`dos:               DESIGN.md ${mdDos} / sidecar ${sidecar.narrative.dos.length}`);
console.log(`donts:             DESIGN.md ${mdDonts} / sidecar ${sidecar.narrative.donts.length}`);
console.log(`declared tokens:   ${declared.size}`);

if (problems.length) {
  console.log("\nDRIFT:");
  for (const p of problems) console.log(`  - ${p}`);
  process.exitCode = 1;
} else {
  console.log("\nno drift");
}
