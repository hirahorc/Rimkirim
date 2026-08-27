---
name: Rimkirim
description: International moving assistant — a bright, open desk where every number is laid out in plain daylight.
colors:
  background: "#ffffff"
  surface: "#fafafa"
  surface-2: "#f5f5f5"
  surface-3: "#f3f3f3"
  border: "#e5e5e5"
  border-strong: "#d4d4d4"
  foreground: "#1f1f1f"
  muted: "#52525b"
  muted-2: "#64646c"
  brand: "#c1ff00"
  brand-soft: "#ccfa59"
  brand-dim: "#a3d600"
  brand-ink: "#282828"
  success: "hsl(140 100% 27%)" # ≈ #008a2e
  warning: "hsl(31 92% 45%)" # ≈ #dc7609
  danger: "hsl(360 100% 45%)" # ≈ #e60000
  info: "hsl(210 92% 45%)" # ≈ #0973dc
typography:
  display:
    fontFamily: "Space Grotesk, Geist, sans-serif"
    fontSize: "clamp(2rem, 7.5vw, 4.75rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Space Grotesk, Geist, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  page-title:
    fontFamily: "Space Grotesk, Geist, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Space Grotesk, Geist, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Space Grotesk, Geist, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.04em"
  label-form:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.04em"
  micro:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.02em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
    fontFeature: "tabular-nums"
rounded:
  mark: "0.12em"
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.75rem"
  xl: "2.5rem"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
shadow:
  float: "0 4px 24px rgba(0, 0, 0, 0.06)"
  overlay: "0 16px 48px -12px rgba(0, 0, 0, 0.18)"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.md}"
    height: "2.5rem"
    padding: "0 1rem"
  button-primary-hover:
    backgroundColor: "{colors.brand-dim}"
    textColor: "{colors.brand-ink}"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "2.5rem"
    padding: "0 1rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    height: "2.5rem"
    padding: "0 1rem"
  button-dashed:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    height: "2.5rem"
    padding: "0 1rem"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "2.75rem"
    padding: "0 0.75rem"
  badge-brand:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  segment-active:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    shadow: "{shadow.float}"
---

# Design System: Rimkirim

## Overview

**Creative North Star: "The Open Desk"**

Rimkirim is an assistant for one of the most stressful things a person does — moving their whole
life across a border. The interface answers that stress with **daylight**: a bright, uncluttered
desk where every figure is laid out in the open, nothing tucked into shadow, and a single lime
marker tells you which line matters. The customer sits at the desk; Rimkirim absorbs the customs
complexity off-screen.

This is the visual argument for the product's first principle — *harga dibuka sebelum diminta*.
A white page with nothing hidden is not a stylistic preference here, it is the promise rendered.

The system is **precise and calm**. Figures — booking numbers, packing codes, airway bills, rupiah
totals — are set in a monospaced, tabular typeface so they read like instrument readouts and line
up column-perfect. Prose stays warm and plain-spoken ("kamu", no jargon). The palette is white and
soft grey almost everywhere; **Live Lime `#C1FF00` is the one voice that speaks**, and on daylight
it speaks *only as a fill* — a highlighter stroke behind dark ink, never a text colour. That single
constraint is what keeps the accent loud: because lime is rare and always deliberate, it is
impossible to miss.

The look is deliberately **not** a dark control room (that was the previous world, replaced on
purpose) and **not** a gradient-glossy fintech. There are no gradient fills, no glows, no
glassmorphism. Depth is built the honest way: white panels on soft grey, separated by hairline
borders, with exactly one soft shadow reserved for chrome that genuinely floats.

**Key Characteristics:**
- Light-mode only, white canvas, high-contrast dark ink.
- Live Lime as a rare, single accent — **fill only, never text**.
- Monospaced tabular figures for all codes and money; sans for everything else.
- Generous rounding (16px controls, 28px cards, full pills) and hairline borders.
- Flat by default; one floating shadow for lifted chrome.

## Colors

A daylight field with one electric accent and a small, disciplined status set.

### Primary
- **Live Lime** (`#c1ff00`): The single accent voice — the primary button, the hero mark, the
  checked box. Always carries **Ink on Lime** (`#282828`) on top. **Never used as a text colour**:
  on white it measures ~1.1:1 and would be unreadable.
- **Soft Lime** (`#ccfa59`): The pastel companion for larger marked areas — brand chips and the
  hero highlighter — where full-strength lime would shout.
- **Live Lime Dim** (`#a3d600`): Hover for lime fills only; never a resting colour.

### Neutral
- **Daylight** (`#ffffff`): The page canvas — every screen sits on this.
- **Panel 1 / 2 / 3** (`#fafafa` / `#f5f5f5` / `#f3f3f3`): Tonal layering for cards, inputs, and
  nested surfaces. The ladder *darkens* as it comes closer to the viewer — the inverse of a dark
  UI, same semantics.
- **Hairline / Hairline Strong** (`#e5e5e5` / `#d4d4d4`): 1px separators; the stronger tone marks
  inputs, emphasised dividers, and hover borders.
- **Ink** (`#1f1f1f`): Primary text, headings, and key figures.
- **Readout Grey** (`#52525b`): Secondary/body text and descriptions (~7:1 on white).
- **Dim Grey** (`#64646c`): Labels, eyebrows, captions, and de-emphasised meta.

### Status (tint system, used sparingly)
- **Go Green** (`hsl(140 100% 27%)`), **Hold Amber** (`hsl(31 92% 45%)`), **Stop Red**
  (`hsl(360 100% 45%)`), **Info Blue** (`hsl(210 92% 45%)`) — the text hues of Sonner's
  richColors light palette, adopted app-wide so toasts and in-app status surfaces share one
  palette. Info Blue also carries the ops/simulator (demo) chrome.

### Named Rules
**The One-Voice Rule.** Live Lime appears on ≤10% of any given screen — the primary CTA, the one
marked phrase, the checked state. Its rarity is the signal; if two things are lime, neither reads
as the answer. On daylight this budget is *tighter* than it was on black, because a lime fill on
white carries far more visual weight than the same fill on near-black.

**The Marker Rule.** Lime is a **fill behind dark ink**, never ink itself. Emphasis in text is
carried by weight and Ink; when a phrase must be singled out it gets the highlighter treatment
(`.hero-mark` in the hero, `.card-mark` in a card rhythm — one mark per budget, never both in the
same eyeful). Inline links are the one exception to Ink-only text: they are conventional
link blue (`.link-mark`) so they read as links at a glance. This is the load-bearing rule of the
light system.

**The No-Gradient Rule.** Surfaces are solid fills. No gradient backgrounds, no ambient glows, no
glass blur used as *decoration*. Depth comes from panels, hairlines, and the two sanctioned shadows.
The one sanctioned translucency is functional: sticky chrome (the header capsule) is
`bg-background/70` + `backdrop-blur-xl` so the page reads legibly as it scrolls underneath — an
effect doing a specific job, not a texture.

There are exactly **two standing exceptions**, both narrow, both doing a job no solid fill can do.
Neither licenses a third: a new gradient has to earn its place the same way, in writing, at the
point of use.
- **Scrim over photography.** Where text sits on an image — the testimonial hook card's name and
  attribution — a `from-foreground/95 via-foreground/70 to-transparent` ramp buys legibility
  against a backdrop the design does not control. It is a contrast device on imagery, never a
  surface treatment on a panel.
- **`.nav-expat`.** The "Expat Relocation" nav link is gradient *text* (82° `#21b1ec → #d41ce6`),
  lifted from the Figma header, with the gradient painted 3× wider than the label and slid across
  on hover. It is the one place gradient carries identity rather than decoration, and it reserves
  its hover width up front so neighbours never nudge. While hovered the gradient keeps flowing
  (1.8s alternate loop) — a deliberate exception to the one-loop rule, kept because it runs only
  under the pointer, never on idle UI, and stops the moment the hover ends.

**The Tint-15/25 Rule.** *Status* chips use the colour at 15% opacity for the fill, 25% for the
border, full strength for the icon, and the **status ink** (`--*-ink`: the accent color-mixed
80% toward black, warning 70%) for the words — so the label speaks the status hue like the
richColors toasts do, while 12px text still clears AA 4.5:1 on the tint (the raw accents
measure only 2.7–3.8:1 there). **Brand chips are the exception** — a 15% lime wash is
nearly invisible on white, so they use a solid Soft Lime fill with Ink on Lime text.

## Typography

**Display Font:** Space Grotesk (with Geist fallback)
**Body Font:** Geist (with system sans fallback)
**Label/Mono Font:** Geist Mono (with `ui-monospace` fallback)

**Character:** Space Grotesk gives headings — and every label that *names* something — a tight,
geometric, slightly technical confidence; Geist keeps body copy and working form labels quiet and
legible; Geist Mono turns every code and price into an aligned instrument readout. The pairing
reads competent and calm, not corporate. The display voice carried over from the previous visual
world; the body and mono seats moved from Inter / JetBrains Mono to Geist / Geist Mono
deliberately (2026-08), and in the same pass Space Grotesk widened from headings-only into the
brand-label tier (eyebrows, chips, statuses, buttons — see The Brand-Label Rule).

### Hierarchy
- **Display** (Space Grotesk 500, `clamp(2rem, 7.5vw, 4.75rem)` = 32px -> 76px, line-height
  1.05, tracking -0.02em): Hero headline only, set as individually rising words. Medium weight, not
  bold: at 76px the lighter cut reads editorial and confident rather than shouty, and it keeps the
  lime highlighter behind it feeling like a mark rather than a block.
- **Headline** (Space Grotesk 700, `2.25rem`/36px, tracking -0.025em): the largest non-hero
  heading — landing section titles ("Kenapa Rimkirim", "Dua arah, satu tim"), set `text-3xl
  sm:text-4xl`.
- **Page title** (Space Grotesk 700, `1.5rem`/24px, tracking -0.025em): the `h1` of a focused page
  — questionnaire, module hub, "Pesanan Saya", auth, legal, order tracking. A few wider pages
  (check-rates, coming-soon) step to `sm:text-3xl`/30px; treat that as the top of this role, not a
  separate one.
- **Title** (Space Grotesk 600, `1.25rem`/20px, tracking -0.025em): card titles and panel/dialog
  headings. Every 20px display heading carries `tracking-tight` — that is the role's signature, not
  optional.
- **Body** (Geist 400, 1rem / 0.875rem, line-height ~1.6): Descriptions and running copy; reading
  columns cap around `max-w-3xl`, and long-form answers cap tighter at `max-w-[65ch]`.
- **Label — brand** (Space Grotesk 500, 0.75rem, letter-spacing 0.04em, often UPPERCASE): labels
  that *name* something — section and sub-group eyebrows ("Paket 1", the FAQ group titles), chip
  and badge text, status-stepper phase names, the EnvBadge — usually in Dim Grey; chips keep their
  own colour rules. This is the floor for anything that reads as a word; 11px is **not** a step
  (it was drift, now removed).
- **Label — form** (Geist 500, 0.75rem, letter-spacing 0.04em): working labels inside a task —
  field labels, table headers, the date picker's weekday row, dropdown group headings, the auth
  divider word, and readout captions that pair with a mono figure. Same metrics as the brand
  label; only the family differs, so the form plane stays quiet under the brand plane.
- **Micro** (Geist 500, `0.625rem`/10px, the single smallest step): the smallest marks only —
  the chargeable-weight readout labels and the compact carrier monogram. Never body copy, and
  never used where Label (12px) would do. (Stepper phase names are 12px brand labels, not Micro.)
- **Mono** (Geist Mono 500, `tabular-nums`, size follows context from 0.75rem chips to the
  3xl quotation total): Booking numbers, packing codes (`RK-PL-XXXXXX`), airway bills, and all
  IDR/currency amounts.
- **Hollow display** (Space Grotesk 700, `clamp(2rem, 5vw − 2rem, 2.75rem)`,
  `-webkit-text-stroke: 1px` Ink with a transparent fill, guarded by `@supports` so unsupporting
  browsers fall back to the markup's filled muted text): the single decorative role — today only
  the hero's floating verdicts wear it. Outline-only keeps a 44px word visually lighter than the
  12px filled label under it, which is what lets display-size type sit in a gutter without
  competing with the headline. Its hover state is part of the role: the outline fills with ink
  (0.2s colour transition), which doubles as the affordance that the word is a link. Not a step on
  the text ramp: never body copy, never a heading.

### Named Rules
**The Numbers-Are-Mono Rule.** Identifiers (`RK-…`, `RK-PL-…`, AWB) and monetary amounts render in
Geist Mono with `tabular-nums`. Weights, dimensions, quantities, phone dial codes, and dates
stay in the sans font. Prose is never mono; a number that reads as data is never sans.

**The Brand-Label Rule.** A label that *names* something — an eyebrow, a chip, a status, a
button — is set in Space Grotesk (`font-display`); a label that *operates* something — a field
label, a table header, a dropdown group heading, a readout caption — stays in Geist. The split is
by job, not by size: both tiers share the same 12px / 0.04em metrics, so the brand voice comes
from the face alone, and the form plane never competes with it.

## Layout

Mobile-first, single-column by default, expanding to rows at the `sm` (640px) breakpoint — the
primary and effectively only breakpoint. Two container widths carry the whole product:
**`max-w-6xl`** for the marketing shell (header, footer, landing sections) and **`max-w-3xl`** for
focused work and reading (the order flow, tracking detail, legal docs). Horizontal padding steps
`px-4 → sm:px-6`; sections breathe at `py-8 → sm:py-10`.

Density is comfortable, not compact: cards pad `20–24px` (`p-5 → sm:p-6`), vertical rhythm runs on
`space-y-3/4` (12–16px), and related controls sit on a `gap-2` (8px) grid. Multi-step flows use a
numbered stepper across the top; long forms collapse into sections the user can jump between. The
spacing scale is Tailwind's default 4px base.

### Named Rules
**The Coarse-Pointer Rule.** Touch targets are sized by **input method, not viewport width** — a
laptop with a touchscreen needs the bigger target and a narrow desktop window does not. Anything
below ~44px that a finger has to hit gets sized up inside `@media (pointer: coarse)`, so mouse
layouts keep their density. Two utilities, and picking the wrong one is a bug:

- **`.tap-row`** grows the element's *real* height to 44px. Use it for text links and controls that
  sit in a list or a row — footer links, the language toggle, segmented items. Real height is
  required here because invisible hit areas in a dense list overlap and steal each other's taps.
- **`.tap-target`** paints a 44px invisible `::after` over a small control without changing its
  visual size. Only for **isolated** icon buttons with clear space around them (the bell, the
  hamburger, copy). The host must already be positioned.

## Elevation & Depth

**Flat by default, depth through tonal layering and hairlines.** A surface reads as "closer"
because it is a *darker* grey panel (`#ffffff` → `#fafafa` → `#f5f5f5` → `#f3f3f3`) fenced by a
hairline border. On daylight, tonal steps alone are subtle, so **the 1px hairline is the primary
depth device** — more load-bearing here than it was on black.

### Shadow Vocabulary
Exactly two shadows exist. Anything else is a tonal step or a hairline.
- **Float** (`0 4px 24px rgba(0,0,0,0.06)` — `shadow-float`): For chrome that lifts off its own
  track: the header capsule, the selected segment in a segmented control or tab list, the active
  language pill. A lift cue, not decoration.
- **Overlay** (`0 16px 48px -12px rgba(0,0,0,0.18)` — `shadow-overlay`): For portalled surfaces
  that must separate from the whole page behind them: dialogs, the mobile sheet, popovers,
  tooltips, and the landing calculator. Deeper than Float because it has more to clear.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Elevation is only ever `shadow-float` on
lifted chrome or `shadow-overlay` on a portalled surface. If you reach for a drop shadow to
separate two things in the page flow, use a tonal step or a hairline instead.

**The Light-Scrim Rule.** Modal scrims are `bg-foreground/25` with a light backdrop blur. A
near-opaque black veil belongs to a dark UI; on daylight it reads as a blackout and breaks the
sense that the page is still there underneath.

## Motion

**One authored moment, and it belongs to the hero.** Everything else is a 0.2s
`cubic-bezier(0.4, 0, 0.2, 1)` colour/border transition on hover and focus — with one
sanctioned exception:

**Hover moves colour, not geometry.** Hover has exactly three idioms across the app — text
colour, panel fill, hairline darkening — and combinations stay inside the colour channel
(fill *and* text, border *and* text). One element may answer with a single effect only; three
at once reads as a different product. Geometry on hover is not part of the vocabulary: the one
element that moves (the Google-rating link's arrow, a 1px diagonal nudge) is a deliberate
exception written down at the point of use, carried by `motion-safe` and falling back to a
colour shift under `motion-reduce` so the affordance survives with animation off.

**Press is the second sanctioned geometry channel.** Every button scales to 0.98 while held
(`motion-safe:active:scale-[0.98]`, 150ms on the system easing) — feedback for a press the
user is already making, never decoration. Under reduced motion the press answers in colour
only.

**Earned motion.** A milestone the user just reached may play one animation, once: the check
that draws itself on a just-completed module (`check-draw`), the hub progress bar filling to
its new count, a status banner easing in when its state changes (`banner-enter`), the
Delivered node drawing its check. Earned motion marks an achievement at the moment it
happens — it never loops, never decorates idle UI, and never plays on mere page load of an
unchanged state. The arrival flash is the same family: clicking a hero verdict deep-links to its
review card, and the card answers with one box-shadow ring flash (`:target`, 1.2s, colour channel
only) then goes quiet; under reduced motion the flash becomes a still ring while targeted.
0.3–0.5s (the flash, at 1.2s, is the slow end of earned), `--ease-out-soft`, always guarded by
`prefers-reduced-motion`.
The system holds **exactly one** looping animation, named and bounded below; treat any second
one as drift.

- **Entrance** (time-based, on load): the header drops in, hero children cascade up on a
  0.05s-per-item stagger, the headline arrives word by word, and the calculator pops in last.
  Under ~0.7s total.
- **The hero settle** (scroll-linked): across the first 35vh the hero text drifts up 56px at
  full ink, the grid backdrop trails 32px behind it, and the calculator closes a 52px gap —
  a short parallax that reads as depth without costing the page a single pixel of extra scroll.
  Nothing in the settle fades: on this surface the scroll-fade belongs to the floating verdicts
  alone, so the layers separate by *speed*, and the one thing that dims is the one thing that is
  decoration. The headline mark therefore passes behind the translucent capsule fully lit — the
  same moment the lime "Cek Harga" bar produces on every scroll-past, accepted as consistent.
  The range is deliberately shorter than the travel: the hero clears out faster than the thumb
  scrolls, so the calculator owns the screen instead of sharing it.
- **The card rise** (scroll-linked, `view()` timeline, `.testi-card`): a card fades from 0 and lifts
  10px across `entry 0% → entry 45%`, so cards arrive as they enter rather than all at once on
  load. Same guards as the settle — `@supports (animation-timeline: view())` plus
  `prefers-reduced-motion: no-preference`.
- **The disclosure open** (`Disclosure` in `components/ui` — the one accordion idiom, shared by
  the /faq page and the article FAQs so they cannot drift; its controlled sibling
  `CollapseHeight` carries the identical motion to every state-driven collapsible — the package
  rows in the order form and tracking summary, and the article ToC — and marks the closed region
  `inert` so hidden form fields can never be tabbed into): the answer's height is the only
  animated property — no fade, no slide — on the system easing, and the *duration is computed
  from the content height* (Material's `getAutoHeightDuration`: a short panel snaps at ~200ms, a
  long one glides at ~330ms, hard-capped at 340ms — past that a tall panel reads as slow, not
  smooth — so perceived speed stays constant where a fixed 300ms cannot).
  Height lands on `auto` after opening so growing content never clips. The chevron is swapped
  down↔up, never rotated, and it swaps on the click, not after the motion; the open header
  carries no colour change — the icon alone marks the state. Instant under reduced motion.
  Rows keep the panel-fill hover idiom, one step harder on focus-visible.
- **The segmented thumb** slides between segments (`transform`/`width`, 200ms, system easing) —
  the state's spatial story, not decoration; it jumps instantly under reduced motion.
- **The mobile sheet** (below `sm`, every dialog): a vaul bottom sheet on the iOS curve
  (`cubic-bezier(0.32, 0.72, 0, 1)`, 500ms) with a grab handle, drag-to-dismiss on velocity —
  a flick is enough — and damping past the top. The centred modal is a desktop-only shape.
  The sheet carries **no close button**: it dismisses by swipe, scrim tap, or Esc, and an X
  would fight the grab-handle row. The X belongs to the modal presentation (no drag
  affordance) and to the mobile nav slide-over, which has no handle either.
  Dialog actions live in **`DialogFooter`**: stacked full-width on the sheet (primary on
  top — DOM order [secondary, primary] through `flex-col-reverse`), a right-aligned row in
  the modal, with `env(safe-area-inset-bottom)` added below so the bottom button clears the
  home indicator on gesture-nav phones. Never park a button row inside the scroll body.
  Exceptions: media lightboxes (`sheet={false}`) and the login dialog, which owns its own
  full-screen mobile form. Under reduced motion the transition collapses to instant; the drag
  itself is the user's own motion and stays.
- **Popovers and tooltips exit too.** `pop-out` retreats toward the trigger (120ms, the exit
  curve) so no panel ends on a jump cut; the tooltip keeps its 100ms out. And inside a
  skip-delay sweep, the second and later tooltips open **instantly — no delay, no animation**
  (`data-state="instant-open"`): ceremony belongs to the first bubble only.
- **The floating verdicts** (the one idle loop, `.hero-verdict-float`): three one-word customer
  verdicts sit in the page gutters beside the hero headline (`xl` and up — below that the gutter is
  too narrow to hold a word) and drift ±9px on a 7s/8.5s/10s cycle, phase-shifted by negative
  delays so no two words are ever at the same point of their arc. Three different durations, so
  they never pulse in unison; a synchronised set would read as one blinking block rather than three
  separate marks. **This is the system's only looping animation and the only decoration of idle UI.**
  It is granted because the float *is* the idea — static, the three words are just more labels — and
  it is kept survivable by how small it is: 9px over eight seconds is slower than the eye tracks.
  A second loop anywhere is drift, not precedent.
  The words themselves are hollow display type (see Typography), and each carries its own
  scroll-linked travel: `.hero-verdict-drift` reads `--verdict-travel` (14/30/46px, set inline per
  word) against the hero text's 56px, so the three words read as three sheets of glass at different
  depths — the layer that moves less is the layer further away. Float and parallax compose on
  separate elements and separate properties: the loop animates `translate` on an inner div while
  the parallax animates `transform` on the `li` — in Tailwind v4 those are distinct properties,
  which is what lets both run without either winning.
  Each verdict is a link to its source review's card in `#ulasan` (`testimonialAnchor()` builds
  the id on both ends): hover fills the hollow word with ink and steps the caption one grey darker
  — colour channel only — active pushes the caption to ink, and keyboard focus wears the same ring
  as the rating link. The drift keyframe ends in `visibility: hidden` so the faded-out word stops
  being a clickable ghost under the calculator's whitespace.

**The Never-Delay-The-Calculator Rule.** The landing exists to get someone into the rate
calculator, which sits immediately below the fold. Motion may decorate that journey but must
never lengthen it: no pinned/sticky hero, no scroll-jacking, no reveal that has to finish before
the primary action is reachable. This is why the settle is scroll-*linked* rather than a pin.

Implementation notes: scroll-linked motion uses CSS scroll-driven animations
(`animation-timeline: scroll(root block)`), wrapped in `@supports (animation-timeline: scroll())`
— without the guard an unsupporting browser falls back to the document timeline and fires the
whole thing once on load. The whole block is additionally gated on
`prefers-reduced-motion: no-preference`, so reduced-motion users get a static hero, and browsers
without support simply get no parallax.

**The No-Orphan-Layer Rule.** `will-change` is never left on a static style. It promotes a
compositor layer and holds it for the life of the element, so on a one-shot entrance it strands one
layer per node forever. transform/opacity are already compositor-accelerated while an animation
runs, so short entrances need no hint at all; reach for `will-change` only on an element about to
animate repeatedly, and clear it when the animation ends.

**Performance is measured, not assumed.** The header capsule's `backdrop-blur-xl` is always-on over
scrolling content — the usual suspect on low-end devices — but a scroll trace at 4× CPU throttle
held ~16.4ms/frame, inside the 60fps budget, so it stays: it is load-bearing for the floating-glass
identity and it is not slow. Re-profile before touching it, rather than removing a signature effect
on suspicion.

## Shapes

Rounded on a 16px base (`--radius: 1rem`). The scale is
**2xs 4px · xs 8px · sm 12px · md 16px · lg 28px · full**, one role per tier:

- **2xs** — the data fence: near-square corners for containers whose content is all right angles
  (the article table; see Line-item table). Just enough that the hairline doesn't crack.
- **xs** — micro icon chips (24px section chips, mini carrier marks) and micro thumbnails.
- **sm** — nested boxes, dense data strips (`p-3` spec rows, notes), popover item rows, small
  buttons (h-8 and below), calendar cells.
- **md** — the workhorse: inputs, buttons, 40px icon tiles, **functional cards** (the `Card`
  default), popover panels.
- **lg** — the panel tier only: dialogs, sheets, the mobile nav, media frames (article covers),
  and **marketing cards** on landing/articles that opt up explicitly (padding `p-6`+).
- **full** — pills: badges, count chips, segmented controls, numbered markers, the navbar capsule.

Below `xs`, micro radii are bespoke and stated inline where the element's own size dictates them:
the 12–16px flag at `rounded-[2px]`, the highlighter mark at a font-relative `0.12em`, the 20px
checkbox and the tooltip bubble at `6px`, the scrollbar thumb pill. These are component-local fits,
not scale members — do not promote them.
Everything is fenced by **1px hairline borders** (`#e5e5e5`, stepping to `#d4d4d4` for inputs and
emphasis) — borders, not fills or shadows, define the geometry. No sharp 0px corners, no heavy 2px+
strokes.

### Named Rules
**The Step-Down Rule.** A box nested inside another drops one notch: a 28px panel holds 16px
cards, which hold 12px boxes. Matching the parent's radius on a child reads as a mistake, because
the concentric curves no longer share a centre — the inner radius should roughly equal the outer
radius minus the padding between them. The popover is the worked example: an `md` (16px) panel with
`p-1` (4px) wants 12px rows, which is exactly `sm` — so list popovers are always `md` panel +
`sm` item rows.

**The Clearance Rule.** A corner's curve sweeps its radius deep into the box, so **padding must be
at least the radius** or the content crowds the corners — a 28px `lg` card needs ~28px of padding
before anything sits level with its corners. When a compact box can't afford that much padding, the
radius steps down to meet the padding instead (a `p-4` utility card is `rounded-md`, not
`rounded-lg`); never leave a big curve sweeping into a tight box.

**The Clamp Rule.** A border-radius silently collapses to half the shorter side, so any radius at or
above half an element's height turns it into a pill or a circle whether you meant it or not. Check
the box before picking the token: `lg` (28px) circles anything under 56px, `md` (16px) under 32px,
`sm` (12px) under 24px. That is why `xs` exists, and why the 24px section chips use it. When a
circle *is* the intent, say so with `rounded-full` rather than leaving a clamped value that looks
like an accident.

## Components

### Buttons
- **Shape:** `rounded-md` (16px); sizes `sm` (h-2rem), `md` (h-2.5rem, default), `lg` (h-3rem);
  icon-only squares at `icon` (2.5rem), `icon-sm` (2.25rem) and `icon-xs` (1.75rem, icon steps
  down to 14px). Icons auto-sized to 16px, `gap-2` from the label. The small sizes (`sm`,
  `icon-sm`, `icon-xs`) step the corner down to `rounded-sm` (12px) — at h-8 and below, 16px is
  half the height and clamps into an unintended pill (The Clamp Rule).
- **Type:** Space Grotesk (`font-display`) `text-sm font-medium` on every variant — a button names
  an action, so it sits on the brand plane (The Brand-Label Rule).
- **Primary:** Live Lime fill + Ink-on-Lime text, `font-semibold`, flat (no keyline, no glow).
- **Hover / Focus:** Primary shifts to Live Lime Dim; all buttons show a `ring-2
  ring-foreground/60` on `:focus-visible` — the focus ring is **ink, not lime**, because a lime
  ring on white fails the 3:1 non-text contrast requirement.
- **Secondary / Ghost / Dashed / Danger:** Secondary = Panel 2 fill + Hairline-Strong border
  (the former Outline variant was merged into it); Ghost = Dim/Readout text, hover fills Panel 2 —
  it also skins every icon-only button (copy, remove, stepper, calendar nav); Dashed = transparent
  with a dashed Hairline-Strong border and regular-weight Dim text, reserved for the "add something
  that isn't here yet" affordance (add package, add document, upload dropzone); Danger =
  `danger/15` tint + `danger/30` border + Stop Red text.
- **Loading:** the `loading` prop is the one official busy state — a spinning indicator in front
  of the label, `aria-busy`, and the button disables itself so it can't be double-fired. No
  hand-rolled spinners inside buttons.
- **Header icon pills:** the round header trio (menu / account / notifications) is its own
  `IconPillButton` primitive — a 2.25rem `rounded-full` Panel-2 pill with a hairline border,
  echoing the capsule geometry (see Navigation).

**The One-Role-One-Variant Rule.** Five variants, no overlap: one lime voice per screen (brand),
one bordered alternative (secondary), one quiet tertiary (ghost), one dashed "add" affordance,
one destructive tint (danger). A new button style must replace one of these, not join them.

### Chips / Badges
- **Style:** full pill, `px-3 py-1`, Space Grotesk `text-xs font-medium` (The Brand-Label Rule).
  Status variants follow the Tint-15/25 Rule; the **brand variant is a solid Soft Lime fill with
  Ink-on-Lime text** (see Tint-15/25).
- **Count pill:** a compact `rounded-full` Panel-2 chip with Hairline border and Dim-Grey tabular
  number, shown beside group/section headings to declare "how many".

### Cards / Containers
- **Corner Style:** `rounded-md` (16px) — the `Card` default, for every functional card (forms,
  order flow, tracking, lists, empty states). `rounded-lg` (28px) is opted into explicitly by
  marketing cards on landing/articles (testimonials, service cards, the FAQ band, article
  cards/CTA — always with `p-6`+ padding) and otherwise belongs to overlays (dialogs, sheets,
  the mobile nav) and media frames.
- **Background:** Panel 1 (`#fafafa`) on the white canvas; nested strips step to Panel 2/3.
- **Shadow Strategy:** none — separated by a 1px Hairline border.
- **Internal Padding:** `p-5 → sm:p-6` (20–24px). Data-dense comparison cards (the rate list:
  RateCard, SpecialRateCard, their PriceBreakdown rows; the clearance route picker) run one step
  tighter, `p-4 → sm:p-5` (16–20px), so on phones their rhythm stays close to the de-boxed
  record's 16px page inset — and per the Clearance Rule their corner steps down with the padding,
  to `rounded-md` (16px); at `lg` the 28px sweep crowded the carrier logo in the top corner.
  Inside such a card everything shares **one left rail**: a selection control never indents the
  title (the clearance picker's radio sits right of its title for exactly this reason).

### Card grid → scroll strip (signature)
A multi-card row collapses into a horizontal, snapping strip below `sm` instead of stacking into a
long column: `-mx-4 px-4` so it bleeds to the viewport edge while the first card still starts on the
content margin, cards at `w-[78%] shrink-0 snap-start` so **the next card peeks by ~110px** and the
swipe is self-evident, `snap-x snap-mandatory` with `scroll-px-4`, and `.scroll-strip` to hide the
bar and set `overscroll-behavior-x: contain` (otherwise a sideways swipe can trigger the browser's
back gesture). At `sm` it becomes a plain grid — `sm:grid sm:snap-none sm:overflow-visible sm:mx-0`.
The container takes `tabIndex={0}` with `role="group"` and a label, since the cards hold no
focusable children and the overflow would otherwise be unreachable without a pointer.

**Past ~4 cards the peek is not enough.** A strip that runs several viewports long hides its tail
from anyone who does not guess to swipe, so it earns a **position row** below it: one 6px dot per
slide, active in Ink and the rest in Hairline Strong, each dot inside a 24×44 hit target sitting
flush with its neighbours (24px pitch — a 44px pitch reads as six unrelated marks rather than one
row). The dots are real buttons that scroll their slide into view, and the active index is driven
by an `IntersectionObserver` rooted on the strip.

**Cards in a strip share one height.** Unlike the `sm+` masonry, where a card sizes to its own
content, slides stretch to the tallest so the deck reads as one object under the thumb. The slack
is spent at the foot — attribution pinned with `mt-auto` — never by re-centring each card, which
lands the first line at a different height on every swipe.

**Use it only when the cards are supporting content.** Four "why us" reasons are a good strip: they
reward compactness and nobody has to read all of them. A two-card row offering a *choice* — Back For
Good vs Moving Abroad — stays stacked, because hiding half a decision behind a swipe costs more than
the vertical space it saves.

### Inputs / Fields
- **Style:** `h-11` (2.75rem), `rounded-md`, Panel-2 fill, Hairline border, `text-sm`; labels are
  Dim-Grey `text-xs` above the field; errors in Stop Red below.
- **Focus:** border shifts to Ink and a `ring-2 ring-foreground/40` appears (no lift).
- **Disabled:** `opacity-50`, `cursor-not-allowed`.

### Navigation (signature)
- **Header capsule:** the header does not sit on a bar — it is a **floating capsule**. A sticky
  wrapper (`px-3 sm:px-6`, `pt-3`) holds a `max-w-6xl`, 60px, `rounded-full` capsule with a
  hairline border, `bg-background/70`, `backdrop-blur-xl` and `shadow-float`. The page scrolls
  behind it and blurs underneath, so the chrome floats clear of the page edge instead of ruling a
  line across it.
- **Contents:** wordmark left (the dark-ink logo, `rimkirim-logo-dark.png`), nav links center, and
  the language toggle, account/notification controls and the lime "Cek Tarif" CTA right. Small
  icon controls inside the capsule are `rounded-full` to echo its geometry.
- **Nav links:** `rounded-full`, `px-[18px] py-2`, `font-medium`. Inactive is Readout Grey with a
  faint Panel-2 hover; the **active link is a solid Panel-2 pill** with Ink text and
  `aria-current="page"`.
- **Below `lg` (mobile + tablet):** links collapse into a right slide-over sheet — `bg-background`,
  `rounded-l-lg`, `shadow-overlay`, over a `bg-foreground/25` scrim, with full-pill 48px rows.

**The Contrast-Against-Its-Track Rule.** An active item is always the tonal *opposite* of the
track it sits in, never lime. On a Panel-2 track (segmented control, tabs, language toggle) the
active item is white and lifts with `shadow-float`; inside the translucent white header capsule
the active link is a Panel-2 pill instead. Same principle, inverted fill.

### Segmented control (signature)
- A **`rounded-full`** Panel-2 track with a 1px border and `p-1`; the items are `rounded-full` too,
  so a pill item sits concentrically inside a pill track (item radius = track radius − padding) and
  they never read as mismatched — the earlier `rounded-lg` track + `rounded-md` item clashed once
  the item grew tall enough on touch for the track to clamp to a full pill. The active item
  **lifts** — white fill, Ink text, `font-semibold`, `shadow-float` — while inactive items are
  Readout Grey. It does *not* fill with lime: a full-width lime pill is far too much area for a mere
  state, and it would starve the primary CTA of its voice. This is the one shape shared by both the
  `SegmentedRoot` primitive (service, mode, carrier, AWB) and the `Tabs` primitive (surcharge
  dialog), so the two never diverge.

### Status stepper (signature)
- A horizontal phase rail (Review → Quotation → Pickup → In-Transit → Clearance → Delivery →
  Delivered): completed dots are filled Live Lime with an Ink check, the **current dot is framed in
  Ink with a lime core** (a lime hairline would read ~1.5:1 on white and lose the live step), and
  upcoming dots are Hairline on Panel 2. The connecting track is lime up to the current phase.
  "Needs attention" states surface as a Hold-Amber banner below the rail, never by recolouring it.

### Marked text (signature)
- **`.hero-mark`** — the highlighter: Soft Lime fill behind Ink-on-Lime, `0.12em` radius, with
  `box-decoration-break: clone` so the mark survives a line wrap. Reserved for the single hero
  phrase.
- **`.card-mark`** — the same highlighter stroke, for the one marked title inside a card rhythm.
  Identical treatment, kept as its own class precisely so `.hero-mark` stays reserved: the hero
  gets one marked phrase per page, a card section gets one marked title per section, and the two
  budgets never borrow from each other. This is how lime reaches a card without becoming its
  surface.
- **`.link-mark`** — inline links: conventional link blue (`--info`) with a soft underline that
  darkens on hover. Lime is never used to mark a link.
- **Tooltip (`InfoTip`)** — an 18px help-circle trigger (muted, 55% → 100% on hover/focus,
  28px hit target, `cursor: help`) opening an Ink bubble: white 14px text, 6px radius, small
  arrow, soft shadow, `max-width: 16rem`, above by default and shifted/flipped off the viewport
  edge. Motion 100ms in (lift + 0.95 scale) / 100ms out; opens on hover, focus, and tap.

### De-boxed record (signature)
The read-only counterpart to the card. A long reference record — the order summary, the FAQ — is
**not** a stack of Panel-1 cards; it is one continuous document divided by space and hairlines. Each
section is a display-font **Title** (Ink, 20px `tracking-tight` or 16px on dense records) sitting
directly on the page over a `divide-y` hairline list of label/value rows — no container, no icon
chip. Sections are separated by a generous `space-y-10` (40px); rows inside by a 1px hairline. A
sub-group within a section (Sender / Receiver, Paket N) is a 12px uppercase eyebrow.

**The Label-Ramp Rule.** Once the card is gone, the eyebrow is the only grouping cue, so the label
tiers step in darkness, not size: section title **Ink** → sub-group eyebrow **Readout Grey** → row
label **Dim Grey**, with the value in Ink and one step larger than its label. Same-colour parent and
child labels read as one flat list.

**The De-Box Rule.** Reach for a card when content is a *grouped, liftable unit* (a rate option, a
choice). Reach for a de-boxed record when content is a *long read you scan* — cards there just add
walls the eye has to climb. Never nest a card inside the record.

### Line-item table
Tabular data (the items inside a package) is a real semantic **`<table>`** inside a **4px**
(`rounded-[4px]`) hairline-fenced container — never a set of per-row `grid` divs. The fence stays
near-square: a data grid is made of sharp rows and right angles, and any card-scale radius around it
reads as a soft box fighting its own contents; 4px only keeps the hairline from cracking at the
corner. The header sits on Panel 2 with 12px
uppercase Dim-Grey labels; body rows are hairline-separated; the description column flexes and wraps
while every **numeric column is right-aligned, Mono `tabular-nums`, and `whitespace-nowrap`** so a
currency figure never breaks mid-number; a Panel-2 `tfoot` carries the total, aligned under its
column.

**The Real-Table Rule.** Columns must align across header, body, and footer — which independent
per-row grids cannot guarantee, because each row sizes its own tracks and they drift apart the moment
a number grows. If it has columns that must line up, it is a `<table>`.

### Toast
Sonner with **`richColors`** and `theme="light"`, mounted once (`components/ui/toaster.tsx`),
`position="top-center"`. Each type (success / error / warning / info) renders on Sonner's own
richColors pastel (tinted background + border + hued text); the plain `toast()` stays neutral
white. The toast is the **only** status surface that uses Sonner's stock pastels — every in-app
status surface (badges, banners, panels) keeps the token tint system (15/25 chips, 10/40
banners). The two stay in one palette because the status tokens ARE the richColors text hues.
The only local override is the corner: `--radius-sm` (12px — Sonner's 8px default is off-scale;
16px padding keeps the Clearance Rule). Toasts are **non-interactive**: no action buttons — a
control inside a surface that auto-dismisses in seconds is a vanishing target. The toast is the
transient ping; navigation belongs to durable surfaces (the notification bell's rows link to the
same order, permanently).

## Do's and Don'ts

### Do:
- **Do** keep Live Lime to ≤10% of any screen — one CTA, one marked phrase (The One-Voice Rule).
- **Do** express lime as a **fill behind dark ink**; carry text emphasis with Ink + weight
  (The Marker Rule).
- **Do** set every code (`RK-…`, `RK-PL-…`, AWB) and every rupiah amount in Geist Mono with
  `tabular-nums`; keep weights, dimensions, quantities, and dates in Geist.
- **Do** set brand labels — eyebrows, chip and badge text, statuses, buttons — in Space Grotesk,
  and keep form labels (fields, table headers, dropdown groups, readout captions) in Geist
  (The Brand-Label Rule).
- **Do** build depth from the panel ladder (`#ffffff` → `#fafafa` → `#f5f5f5` → `#f3f3f3`) plus 1px
  hairlines; reserve `shadow-float` for chrome that genuinely lifts.
- **Do** use generous rounding (16px controls, 28px cards) and full pills for badges, count chips,
  and segmented controls.

### Don't:
- **Don't** ever set text, an icon, a border, or a focus ring in Live Lime on a light surface — it
  fails contrast. That is what Ink is for.
- **Don't** add gradient fills, ambient glows, or glassmorphism as decoration — this is not a
  gloss-fintech look.
- **Don't** fill a large area (a full-width segment, a whole card) with lime; the accent is a mark,
  not a surface.
- **Don't** put prose in the mono font, or set a data figure in the sans display font.
- **Don't** reintroduce a dark theme — light-mode-only is a committed product decision, so guard
  text contrast in the one theme.
- **Don't** let a second accent colour compete with Live Lime for "the answer"; status colours
  signal state, they don't take the primary voice.
- **Don't** wrap a long read-only record in a stack of cards, or rebuild a data table from per-row
  `grid` divs — use a de-boxed hairline record and a real `<table>` (The De-Box / Real-Table Rules).
