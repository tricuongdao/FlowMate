---
name: Flow Mate
description: A task list that measures your commitments against time, on one dial.
colors:
  ground: "#0e1216"
  plate: "#161c21"
  dial: "#12181d"
  steel: "#e8e4da"
  steel-2: "#d9d3c5"
  on-ground: "#e8e4da"
  on-ground-2: "#98a1a8"
  mark: "#e8e4da"
  late: "#e05a44"
  late-deep: "#b23a27"
  brass: "#b5863c"
  brass-bright: "#d4a24e"
  brass-text: "#dfae5c"
  ink: "#14181c"
  ground-light: "#e8e4da"
  plate-light: "#fbf9f4"
  dial-light: "#ece8dd"
  on-ground-2-light: "#565b60"
typography:
  display:
    fontFamily: "Archivo Narrow, Helvetica Neue Condensed, Arial Narrow, sans-serif"
    fontSize: "2.4rem"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Archivo Narrow, Helvetica Neue Condensed, Arial Narrow, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Archivo Narrow, Helvetica Neue Condensed, Arial Narrow, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Archivo Narrow, Helvetica Neue Condensed, Arial Narrow, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Archivo Narrow, Helvetica Neue Condensed, Arial Narrow, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.16em"
  figure:
    fontFamily: "Plex Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    fontFeature: "tnum"
  reading:
    fontFamily: "Segment, Plex Mono, ui-monospace, monospace"
    fontSize: "1.5rem"
    fontWeight: 400
    fontFeature: "tnum"
rounded:
  case: "3px"
  index: "1px"
  pill: "999px"
spacing:
  hair: "1px"
  tight: "0.4375rem"
  base: "0.625rem"
  group: "1rem"
  block: "1.5rem"
  section: "4rem"
components:
  crown:
    backgroundColor: "{colors.brass-bright}"
    textColor: "#17130a"
    rounded: "{rounded.case}"
    padding: "0 1.25rem"
    height: "2.75rem"
  crown-light:
    backgroundColor: "{colors.brass-text}"
    textColor: "#fdfbf6"
  pusher:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.on-ground}"
    rounded: "{rounded.case}"
    padding: "0 1.25rem"
    height: "2.75rem"
  field:
    backgroundColor: "{colors.dial}"
    textColor: "{colors.on-ground}"
    rounded: "{rounded.case}"
    padding: "0.625rem 0.75rem"
  plate:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.on-ground}"
    rounded: "{rounded.case}"
  chapter-ring:
    backgroundColor: "{colors.dial}"
    textColor: "{colors.on-ground}"
    rounded: "{rounded.case}"
  register:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.on-ground}"
    padding: "0.5rem 0.75rem 0.5625rem"
---

# Design System: Flow Mate

## Overview

**Creative North Star: "The Instrument on the Desk"**

Flow Mate is drawn as a mid-century precision timekeeping instrument. Not a screen that reports on time — an object that measures it. The dial is the product: one arc spanning a thirty-day horizon, a graduation at every day boundary, a hollow frame applied where each commitment falls due, and a single red needle standing at now. Everything behind that needle prints red, because that is the one fact this instrument exists to tell you plainly.

The system is built from a small number of real materials rather than a large number of decorative ones. A dark case holds a steel plate; the plate holds a recessed dial; the dial carries printed markings and applied indices. Brass is the only metal, and it appears only where the instrument acts or where a task is settled. Red means now, and nothing else is permitted to mean anything. The palette is Restrained by construction: neutrals carry the entire surface, and the two signal colours together occupy a few percent of any screen.

Two forms, one grammar. A wide column gets the arc. A narrow one gets a stick gauge — the same chapter ring ruled straight — because a 2:1 arc squeezed into a phone column collides its own numerals and spills its plate. Anyone who has read one can read the other. The instrument's geometry governs layout, not just colour: the chapter ring selects, the registers count, the minute track sets a date, and the rack holds entries at a fixed datum.

Every figure on the instrument is set in a tabular mono so columns align to the decimal, and the three register readings use a genuine seven-segment face. Nothing here is a mood board of instrumentation; the markings are computed from the data and they move when the data moves.

**Key Characteristics:**
- One arc measures, one needle marks now, and late is the only thing that raises its voice.
- Elevation is declared once as a border, never as border plus shadow.
- Corners are 3px, or 1px on a row index. Nothing is a pill except a scrollbar thumb.
- Brass means the instrument acts or a task is settled. Red means now.
- Two dial forms — arc and stick — sharing one grammar, chosen by available width.
- Dark is native. Light is the same movement with a silvered dial, not an inversion.

## Colors

The palette is a dark instrument case, a steel plate, and two signal metals. Warm off-white is the printing; red and brass are the only chroma.

### Primary
- **Signal Red** (#e05a44): the needle, the late zone on the arc, an overdue due stamp, the cursor selection, and the focus ring. It marks the present moment and everything behind it. It is tuned to clear 4.5:1 as small text on the ground, a plate, and the dial recess alike, because an overdue stamp is 11px and must be read rather than merely noticed. On the light dial it deepens to **Oxidised Red** (#b23a27) to hold contrast against the plate.
- **Instrument Brass** (#b5863c) is the metal and the fill: the crown's gradient, the chapter ring's applied index, the completion strike, a closed row's index, and the arc's due-soon stems. It is a surface, never a letter.
- **Bright Brass** (#d4a24e) is the mark at its brightest — the minute-track marker, the logo hub, and the arc's due-soon tone.
- **Brass Lettering** (#dfae5c): brass as text. The metal above is too light to read on this ground, so every brass word — the sequence numerals, the "today" band of a due stamp, a closed register reading, the sign-in link — takes this value instead. On the light dial it becomes **Deep Brass** (#7d5a24): the same relationship inverted with the ground, darker than the fill rather than lighter.

### Neutral
- **Case Black** (#0e1216): the ground the whole instrument sits in.
- **Plate Steel** (#161c21): panels lifted out of the case — the dial housing, the composer, the scroll-revealed tiles.
- **Recess Black** (#12181d): the dial itself, a cut rather than a panel.
- **Printing Ivory** (#e8e4da): all primary type, applied indices, and hand-set marks.
- **Dimmed Ivory** (#98a1a8): secondary type, legends, day graduations, and the closed state of a mark. On the light dial it becomes **Slate Grey** (#565b60) rather than a straight inversion, because there it also prints placeholder text and has to clear 4.5:1 as body copy.
- **Hairline** (`rgb(232 228 218 / 0.13)`): every rule, border, and divider, always 1px.
- **Slate Ink** (#14181c): the light dial's primary type, the same role Printing Ivory fills on the dark one.

### Named Rules
**The Metal-Is-Not-A-Letter Rule.** Brass has two values because it has two jobs: a fill, and text. `--brass-bright` is never used as a letter colour and `--brass-text` is never used as a fill, in either dial. A brass word that uses the metal's own value will read at roughly 3.5:1 on the light dial, which is why the split exists.

**The One Voice Rule.** Red means now and brass means the instrument acts. Neither colour is ever used decoratively, and no third accent is introduced. If an element is neither the present moment nor a control nor a settled task, it is neutral.

**The Uncoloured Debt Rule.** An entry is not coloured before it is owed. A task due in nine days is printed in ivory, exactly like a task due in nine months. Colour is earned by the passage of a day, never by proximity to one.

**The Recess Rule.** Depth is tonal, not shadowed. The dial is darker than its plate; the plate is lighter than the case. A panel that is lighter than what contains it reads as raised; a panel that is darker reads as cut. Both are 1px hairline bounded, and neither carries a drop shadow outside the case back.

## Typography

**Display Font:** Archivo Narrow (with Helvetica Neue Condensed, Arial Narrow, sans-serif)
**Body Font:** Archivo Narrow — one condensed grotesque carries every letter on the instrument. There is no second text face.
**Label/Mono Font:** IBM Plex Mono, self-hosted as "Plex Mono" (with ui-monospace fallback)
**Reading Font:** DSEG7 Classic, self-hosted as "Segment" (with Plex Mono fallback)

**Character:** A condensed engineering grotesque prints the instrument's legends and its entry text; a technical mono prints every figure it reports. The pairing reads as a machined face rather than a typeset page: narrow, evenly weighted, and utterly unornamented. The seven-segment face is used exactly once, for the three register readings, because that is the one place a real instrument would use one.

### Hierarchy
- **Display** (700, 2.4–3.4rem, line-height 1.02, tracking -0.02em): The landing page's one headline and the auth page's statement. Sentence case, always two lines or fewer.
- **Headline** (700, 1.9–2.3rem, line-height 1.15): Section heads on the specification sheet.
- **Title** (700, 1.05–1.75rem): The page greeting, tile heads, and empty-state titles.
- **Body** (400, 0.9375–1.0625rem, line-height 1.45–1.6): Entry text and all prose. Prose is capped at 68ch (`.prose-measure`); never wider.
- **Label** (600, 0.6875rem, tracking 0.16em, uppercase): Every legend on the instrument — column heads, field names, register names, scope names, the maker's mark. The `.legend` class.
- **Figure** (400, 0.6875–0.9375rem, tabular): Every number the instrument reports — due stamps, counts, paging, day graduations, the running time. The `.fig` class.
- **Reading** (400, 1.5rem, tabular): The three subdial counts only. The `.seg` class.

### Named Rules
**The Tabular Rule.** Any figure that sits in a column, changes in place, or is compared against another figure is set in Plex Mono with tabular numerals. Proportional figures are never used for data.

**The No-Second-Face Rule.** There is one text family. Emphasis comes from size, weight, and colour — never from switching to a serif, an italic, or a display face.

**The Legend Case Rule.** Labels are uppercase and tracked. Sentences are never set in caps, and a legend never exceeds three words.

## Layout

A single centred column, `max-width: 86rem`, with `1rem` gutters rising to `1.5rem` at `640px`. The app splits into two columns at `1200px` — the measuring side on the left at `1.3fr`, the working side on the right at `1fr`, `2rem` apart. Below that breakpoint the two stack into one column, and the working side leads: on a phone you capture and close before you measure.

The split sits at `1200px` rather than a conventional `1024px` because the measuring column has to clear the dial's own minimum width. At `1024px` a two-column split leaves the dial `532px`, which is below the width at which the arc holds its proportions, and the instrument would drop to the stick gauge on a large laptop. Below `1200px` the dial takes the full column width (a measured `718px` at a `768px` viewport) and renders the arc; at and above `1200px` the measuring column measures `676px` at a `1280px` viewport and `731px` at `1440px`. Both are measured facts, reproducible with `frontend/tools/measure.mjs`.

The measuring column is sticky (`top: 1.5rem`) at the two-column breakpoint only, so the dial stays in view while a long register scrolls past it.

Spacing rhythm is governed by one relationship: more space above a heading than below it. Section padding is `4rem` vertically; group separation is `1.5rem`; the gap between a control and its own label is `0.375rem`. The register is the dense exception — rows are `0.4375rem` of vertical padding on a `1px` rule, because a rack is meant to be read in one downward glance.

**The Rack Rule.** Entries sit on a fixed column grid — `1.5rem` index, flexible title, `5.25rem` due stamp, `3.5rem` actions — so every row's datum lines agree down the page. Below `432px` the stamp drops under the title and the grid collapses to one flexible column.

**The Quiet Luxury Rule.** Density buys the right to whitespace, never the reverse. The register runs tight; the space around it is generous.

## Elevation & Depth

There are no drop shadows anywhere in the product. Depth is entirely tonal and bounded by hairlines: the case is darkest, a plate is lighter, a dial recess darker again. The only inset shadows in the system are two 1px edge highlights that make a plate read as a machined surface — a light line along its top inside edge and a dark one along its bottom. The one exception is the dial, which carries a single soft radial pool of light rising from its lower edge, drawn in ink on the light dial and in ivory on the dark one, so the recess reads as a cut under crystal rather than a flat fill.

### Named Rules
**The Declare-Once Rule.** A surface declares its elevation either as a border or as a shadow, never both. A 1px hairline under a wide soft shadow is a ghost card and is forbidden.

**The No-Float Rule.** Nothing is positioned over content. The case back scrolls with the page rather than hovering above it. There is no glass, no backdrop blur, and no floating bar.

## Shapes

The corner is `3px`. That is the entire radius language: tight enough to read as a machined edge, present enough to avoid looking like a spreadsheet. Two exceptions exist and both are deliberate — the row index is `1px`, because it is an applied mark rather than a container, and scrollbar thumbs are fully rounded, because that is what a scrollbar thumb is.

Forms are rectangular and datum-aligned. Every mark on the dial is drawn perpendicular to its own radius: graduations point outward, task stems point inward, and each stem's cap runs across its tip. The completion strike is a 1.5px brass rule drawn across the entry at the text's own baseline offset, not a rounded highlight.

**The No-Capsule Rule.** Pills belong to small controls in other people's design systems. Nothing in this one is a pill — not a status, not a count, not an overdue marker.

## Components

### Buttons
- **Shape:** machined edge (3px radius), uppercase, tracked 0.04em, 600 weight.
- **Crown** — the one brass control: `linear-gradient(180deg, #d4a24e, #b5863c)`, `#17130a` lettering, `0 1px 0 rgb(255 255 255 / 0.35)` inset highlight. It is the only element on any page permitted to be brass-filled.
- **Pusher** — flat plate steel with a hairline, for a secondary action of equal weight.
- **Etch** — a bare label that gains a `8%` foreground wash on hover. No border in any state.
- **Hover / Focus:** hover shifts background or border only. Focus is a 2px red outline at 2px offset, reset to a 2px radius. Active presses translate 1px down; nothing scales.
- **Disabled:** `opacity: 0.45` with `cursor: not-allowed`. Never a colour change.

### Cards / Containers
- **Corner Style:** machined edge (3px).
- **Background:** plate steel on the case; the dial recess for a dial housing.
- **Shadow Strategy:** none. See Elevation & Depth.
- **Border:** 1px hairline, always.
- **Internal Padding:** `0.5rem` for a rack row, `0.75rem` for a track, `1.75rem–2.25rem` for a plate that holds prose.

### Inputs / Fields
- **Style:** a recessed fill at 70% dial weight, 1px hairline, 3px radius, `0.625rem 0.75rem` padding.
- **Focus:** the hairline turns brass and a 3px brass-tinted ring appears at 22% opacity. The field never changes size on focus.
- **Error:** `aria-invalid="true"` turns the hairline red and the focus ring red-tinted. The message sits directly beneath in red at 0.75rem with `role="alert"`.

### Navigation
The case back: a 3.5rem band, hairline-bottomed, carrying the maker's mark and the case number on the left, and the dial switch, the user's name, and sign-out on the right. It scrolls with the page rather than floating. Links are etched labels that gain a foreground wash; no underline appears on hover. The whole header collapses to the mark plus controls below `640px`, dropping the case number and the user's name.

### The Dial (signature component)
The instrument's primary read, and the reason the product exists. A 480-unit arc spanning 180°, pivoted at the centre of a 524×220 field. Day graduations run outward at every midnight inside the domain; task marks are applied inward as hollow frames hung from stems, sized by how many tasks share that instant. Two tasks merge into one mark only when they fall within five hours of each other — a flat duration, not a fraction of the span, so zoom level cannot change how many commitments the dial claims to be showing.

The needle is a full-radius line pivoted on the dial centre, and its anchor dot is that same line's tip after the same rotation, so the two can never disagree. The reading — `Now`, the date, and the running time — is printed above the pivot, never below it: a needle is a straight line from the pivot, so anything printed beneath it is crossed at some hour of the day, and printing above means it can never be crossed at any hour. The viewBox is cropped at the arc's feet so the dial and the registers beneath it share one baseline.

Graduation numerals are thinned by a minimum pixel gap and clamped inside the plate, so a dense horizon prints fewer honest numerals rather than a smear. Below `560px` of available width the arc cannot hold its 2:1 sweep and is replaced by the stick gauge: the same rail, graduations, frames, and needle, ruled straight.

### The Register (signature component)
The rack of entries. A printed head row names each column once. Each row is a `1px`-ruled grid carrying an applied index (which is also the completion control), the entry's free text, and a two-line due stamp — the day above, the relative reading below, coloured by state. Row actions are hidden until hover on pointer devices and always present on touch and keyboard focus.

### The Minute Track (signature component)
The composer's due-date control. A horizontal rail with 30 graduations, a brass marker at the current stop, and a native range input laid transparently over it so the control is keyboard- and screen-reader-operable without any custom handling. The readout beneath names the stop in words.

## Do's and Don'ts

### Do:
- **Do** draw the arc from the data. Every mark on the dial is computed from a real task's due date, and the needle tracks real time.
- **Do** print every figure in Plex Mono with tabular numerals, so columns align to the decimal.
- **Do** keep red for now and late, and brass for controls and settled tasks, and let everything else be neutral ivory.
- **Do** declare elevation once — a 1px hairline or an inset edge highlight, never a drop shadow.
- **Do** keep corners at 3px, or 1px on an applied mark.
- **Do** hold prose to 68ch and give more space above a heading than below it.
- **Do** switch to the stick gauge rather than shrinking the arc below `560px` of width.
- **Do** tune any text colour to clear 4.5:1 against the surface it actually prints on — the ground, a plate, or the dial recess — and verify it with `frontend/tools/contrast.mjs`, not by eye.
- **Do** check the composited colour, not the token, whenever an opacity or alpha modifier sits on text. `--on-ground-2` clears 6.54:1 on a plate; the same token at `opacity-70` clears 3.89:1 and is not permitted.
- **Do** use `--brass-text` for every brass word and `--brass-bright` for every brass fill.
- **Do** respect `prefers-reduced-motion` by landing the needle immediately, and `prefers-reduced-transparency` by removing any blur.
- **Do** give browser surfaces the palette: `caret-color` takes the signal red so a focused empty field still shows a cursor, `accent-color` takes the brass, and selection takes red on white.

### Don't:
- **Don't** use red or brass decoratively. There is no third accent, and a coloured element that means nothing is a defect.
- **Don't** colour a task before it is due. Proximity to a deadline is not urgency.
- **Don't** add a pill, a badge with a full radius, or a rounded status chip.
- **Don't** put a 1px border under a soft shadow, or introduce a shadow that is not an inset edge.
- **Don't** set a legend in sentence case, or a sentence in caps.
- **Don't** use an emoji or a glyph where an icon belongs; icons are authored SVG in one stroke weight.
- **Don't** introduce a second text family, an italic, or a serif.
- **Don't** float a bar over content, add glass, or add backdrop blur.
- **Don't** add a horizontal gradient, a glow, or a coloured halo. A zero-offset coloured shadow is decoration, not depth.
- **Don't** let a task entry carry a coloured left or right border above 1px.
