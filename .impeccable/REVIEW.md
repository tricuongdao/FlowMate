# Finish review record

The visual work was reviewed by an independent reviewer that did not build it
(`impeccable` finish reviewer, run as the shipped degraded reviewer standalone).
Three rounds. This file exists so the findings and their resolutions survive the
session that produced them.

Commit under review: `e7c6082`.

## Dispositions

| Round | Disposition | Scope |
|---|---|---|
| 1 | `fix` | 8 material findings + 2 challenged |
| 2 (verdict) | `fix` | 7 resolved, 2 partials, 1 withdrawn, 1 confirmed |
| 3 (verdict) | **`ship`** | Both open items resolved. No open defects. |

The `ship` is scoped to the fixes scored in the verdict passes and the surfaces
judged from the captures listed below — not a blank cheque on the whole
product. The unverified list at the end of this file still stands.

## Round 1 findings and how each closed

| # | Finding | Outcome |
|---|---|---|
| 1 | The 1440px fold rendered the stick gauge, not the arc the contract promises | **Resolved.** Root cause was arithmetic: a 72rem container with a 1.15fr column gave the dial 571px, under its threshold. Container to 86rem, split to 1.3fr/1fr, two-column breakpoint to 1200px. Threshold is now a named `ARC_MIN_W = 560` with its measurement recorded. |
| 2 | The arc was clipped and the registers painted over the dial footprint | **Withdrawn by the reviewer.** The SVG sits a constant 58px above the plate's bottom at every width; the viewBox is deliberately cropped at the arc's own feet so dial and registers share one baseline. |
| 3 | Contrast: `#d64b36` on `#161c21` = 4.02:1 for the 11px late stamps | **Resolved.** Dark `--late` to `#e05a44`: 5.12 / **4.68** / 4.87:1 on ground, plate, dial. |
| 4 | Needle visibility and geometry | **Resolved.** Centre block moved above the needle's pivot, because a needle is a straight line from the pivot and anything printed below it is crossed at some hour — at noon it was crossing the date. |
| 5 | The strike colour contradicted the decision card | **Resolved by amending the record.** The build's brass stands, because red is reserved for now and late; `decision-direction.json` now says so and why. |
| 6 | Auth plate legends were sentence case | **Withdrawn.** Verified in the live DOM: all four report `textTransform: uppercase`. The reviewer had read a capture made before the change. |
| 7 | Browser surfaces fell through to platform defaults | **Resolved.** `caret-color` takes the signal red; `accent-color` takes the brass; the light search field no longer overrides its own colour. |
| 8 | Landing scaffold: three equal number-plus-heading-plus-body cards | **Resolved.** One ruled record now. The numbering stays because the sequence is the content, which is the craft floor's own carve-out. |

## Round 2 findings

| Item | Outcome |
|---|---|
| Light-dial brass text at 3.47:1 | **Resolved.** Brass split into `--brass-bright` (fill and mark) and `--brass-text` (every brass word). Recorded as **The Metal-Is-Not-A-Letter Rule** in both DESIGN.md and the sidecar. Dark 9.26:1 and 8.47:1; light 4.92:1 and 5.94:1. |
| `opacity-70` legends composited to 3.89:1 dark and 2.96:1 light | **Resolved.** The alpha is gone; the token carries the hierarchy. Register head now measures 6.54:1 on the plate. |
| Chapter-ring index read as a bare rule | **Unresolved in round 2, fixed in round 3.** See below. |
| Documentation drift between DESIGN.md and the sidecar | **Found by us, not the reviewer.** Two of us checks it now: `tools/doccheck.mjs`. |
| Decorative rail at 2.24:1 / 1.66:1 | **Position confirmed by both.** A scale the graduations hang from, not information; the informational layer is the day numerals, minted from `--on-ground-2` at 6.5–7.1:1. Stated, not silently passing. |

## Round 3

**The index fill.** The reviewer was right and the first fix was only half a
fix. At 26% the dark composite measured 1.70:1 and the light 1.52:1 — still
nothing. Three changes:

1. The ring got its own ground. A 60% dial tint over the plate composites to
   the plate in both themes, which is why the whole control read as frameless.
   Dark now 70% dial; light has its own rule at 35% plate over the ground.
2. The fill rose to 40% dark and 48% light — a deliberate asymmetry, since the
   light ring has far less headroom to darken and needs a heavier mix for the
   same perceptible step.
3. It is gated as **fill vs ring ground**, not vs the plate, with the bar at
   1.7:1 and a comment recording why the bar is not 3:1: the index is a
   redundant cue, because the pressed stop also carries `aria-pressed` and its
   own colour shift.

Measured: dark **1.90:1**, light **1.85:1**.

The reviewer then measured the same thing from the render and agreed: dark
composites to `#2d3233` on a ring ground of `#11161b`, which is 2.27:1 where
the fill renders at full strength, and both ring grounds now match their
predicted values exactly (`#11161b` dark, `#efebe3` light). Its verdict on the
1.7:1 bar: a redundant cue gated at the text bar would be a gate measuring the
wrong thing.

One observation it recorded without reopening the finding: the dark ring ground
sits at 1.06:1 against the plate, below the ~1.5:1 it would want for a panel
legible *by tone alone*. It is not a defect, because the ring is identified by
its hairline border and its three stop dividers rather than by its ground. If
the control ever needs to read as a panel without its border, that ratio is the
thing to raise.

**The light-dial strike** was unverifiable because no capture in the set
contained a closed row on the light dial. `app-light-full.png` and
`app-mobile-light.png` now do, and the signature was confirmed from a magnified
crop: the brass rule runs unbroken across the full 140px title at the text's own
baseline offset, sits *darker* than the lettering it crosses (L 0.159 against
0.394), and so reads as applied over the text rather than as part of it.
Measured strike 3.96:1 against the ground and 4.78:1 against the plate. Its
verdict was that the weight is right and should not be pushed louder — reaching
3:1 against the ground would need a deeper brass or a red, and red is reserved
for now and late, so the current value is the correct resolution of that
constraint rather than a compromise.

## Capture set

| File | Viewport | Dial | Why it exists |
|---|---|---|---|
| `app-desktop-fold.png` | 1440x900 | dark | The FIRST VIEWPORT the contract promises |
| `app.png` | 1440 full | dark | Full page, sticky dial, long register |
| `app-narrow.png` | 768 full | dark | The stacked layout, arc at full column width |
| `app-mobile.png` | 390 full | dark | The stick gauge |
| `app-light.png` | 1440x900 | light | The silvered dial |
| `app-light-full.png` | 1440 full | light | The only full light page containing a closed row |
| `app-mobile-light.png` | 390 full | light | Stick gauge on the light dial |
| `landing.png` / `landing-light.png` | 1440 full | both | Specification sheet |
| `landing-mobile.png` | 390 full | dark | |
| `auth-register.png` / `auth-mobile.png` | 1440x900 / 390 | dark | Movement card and form |
| `notfound.png` | 1440x800 | dark | Off-scale reading |

## Reproducing the checks

```bash
cd frontend
npm run build
node tools/measure.mjs    # the width the dial actually receives, per breakpoint
node tools/contrast.mjs   # 32 gated pairs; exits non-zero on any failure
node tools/doccheck.mjs   # DESIGN.md frontmatter and sidecar against index.css
```

## Not verified, and staying that way

- **Motion.** Stills cannot show the needle's entrance sweep, the chapter
  ring's index slide, the strike drawing across a row, or the exit collapse.
  These are source-verified only.
- **Real-device rendering.** Every capture came from headless Chrome at 1x
  device scale. Subpixel behaviour, iOS Safari's viewport handling, and the
  seven-segment face's legibility on a low-DPI phone screen are untested.
- **The signature's feel.** Whether the dial reads in two seconds is the
  product's central claim and it was judged from stills by its builder, which
  is the weakest form of that evidence available.

## Coverage notes, not defects

- The light dial has no 1440x900 above-the-fold capture. `app-light-full.png`
  supersedes it for the rows that were missing, so the gap is only a
  convenience for future reviews.
- Several captures were re-taken mid-cycle as fixes landed, so an earlier
  reading of any given file may describe a state that no longer exists. The
  shipped artifact is the set as it stands now.
- **The needle's motion has two regimes and the rule is "how far the reading
  moved", not "how long since it last moved."** A 30-second tick under a
  fiftieth of the dial sweeps; a jump larger than that, such as returning to a
  tab an hour later, snaps. That is deliberate, but it is the kind of rule that
  reads as a bug if it is undocumented, so it is recorded here and in the
  comment beside `ARC_MIN_W` and the sweep effect in `Dial.jsx`.
