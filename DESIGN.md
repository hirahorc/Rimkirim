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
  success: "#16a34a"
  warning: "#b45309"
  danger: "#dc2626"
  info: "#2563eb"
typography:
  display:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: "clamp(2rem, 7.5vw, 4.75rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  page-title:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.04em"
  micro:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.02em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
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
- **Go Green** (`#16a34a`), **Hold Amber** (`#b45309`), **Stop Red** (`#dc2626`),
  **Info Blue** (`#2563eb`) — tuned for a light canvas; the previous dark-mode pastels wash out on
  white. Info Blue also carries the ops/simulator (demo) chrome.

### Named Rules
**The One-Voice Rule.** Live Lime appears on ≤10% of any given screen — the primary CTA, the one
marked phrase, the checked state. Its rarity is the signal; if two things are lime, neither reads
as the answer. On daylight this budget is *tighter* than it was on black, because a lime fill on
white carries far more visual weight than the same fill on near-black.

**The Marker Rule.** Lime is a **fill behind dark ink**, never ink itself. Emphasis in text is
carried by weight and Ink; when a phrase must be singled out it gets the highlighter treatment
(`.hero-mark`). Inline links are the one exception to Ink-only text: they are conventional
link blue (`.link-mark`) so they read as links at a glance. This is the load-bearing rule of the
light system.

**The No-Gradient Rule.** Surfaces are solid fills. No gradient backgrounds, no ambient glows, no
glass blur used as *decoration*. Depth comes from panels, hairlines, and the two sanctioned shadows.
The one sanctioned translucency is functional: sticky chrome (the header capsule) is
`bg-background/70` + `backdrop-blur-xl` so the page reads legibly as it scrolls underneath — an
effect doing a specific job, not a texture.

**The Tint-15/25 Rule.** *Status* chips use the colour at 15% opacity for the fill, 25% for the
border, and full strength for the text/icon. **Brand chips are the exception** — a 15% lime wash is
nearly invisible on white, so they use a solid Soft Lime fill with Ink on Lime text.

## Typography

**Display Font:** Space Grotesk (with Inter fallback)
**Body Font:** Inter (with system sans fallback)
**Label/Mono Font:** JetBrains Mono (with `ui-monospace` fallback)

**Character:** Space Grotesk gives headings a tight, geometric, slightly technical confidence;
Inter keeps body text quiet and legible; JetBrains Mono turns every code and price into an aligned
instrument readout. The pairing reads competent and calm, not corporate. These three carried over
unchanged from the previous visual world — the palette moved, the voice did not.

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
- **Body** (Inter 400, 1rem / 0.875rem, line-height ~1.6): Descriptions and running copy; reading
  columns cap around `max-w-3xl`, and long-form answers cap tighter at `max-w-[65ch]`.
- **Label** (Inter 500, 0.75rem, letter-spacing 0.04em, often UPPERCASE): Eyebrows, field labels,
  captions, count pills, table headers — always in Dim Grey. This is the floor for anything that
  reads as a word; 11px is **not** a step (it was drift, now removed).
- **Micro** (Inter 500, `0.625rem`/10px, the single smallest step): the smallest marks only —
  status-stepper phase names, the chargeable-weight readout labels, the compact carrier monogram.
  Never body copy, and never used where Label (12px) would do.
- **Mono** (JetBrains Mono 500, `tabular-nums`, size follows context from 0.75rem chips to the
  3xl quotation total): Booking numbers, packing codes (`RK-PL-XXXXXX`), airway bills, and all
  IDR/currency amounts.

### Named Rules
**The Numbers-Are-Mono Rule.** Identifiers (`RK-…`, `RK-PL-…`, AWB) and monetary amounts render in
JetBrains Mono with `tabular-nums`. Weights, dimensions, quantities, phone dial codes, and dates
stay in the sans font. Prose is never mono; a number that reads as data is never sans.

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

**Earned motion.** A milestone the user just reached may play one animation, once: the check
that draws itself on a just-completed module (`check-draw`), the hub progress bar filling to
its new count, a status banner easing in when its state changes (`banner-enter`), the
Delivered node drawing its check. Earned motion marks an achievement at the moment it
happens — it never loops, never decorates idle UI, and never plays on mere page load of an
unchanged state. 0.3–0.5s, `--ease-out-soft`, always guarded by `prefers-reduced-motion`.

- **Entrance** (time-based, on load): the header drops in, hero children cascade up on a
  0.05s-per-item stagger, the headline arrives word by word, and the calculator pops in last.
  Under ~0.7s total.
- **The hero settle** (scroll-linked): across the first 45vh the hero text drifts up 40px and
  dims to 0.4, the grid backdrop trails 32px behind it, and the calculator closes a 28px gap —
  a short parallax that reads as depth without costing the page a single pixel of extra scroll.

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

Generously rounded on a 16px base (`--radius: 1rem`). The scale is
**xs 8px · sm 12px · md 16px · lg 28px · xl 40px · full**: 24px icon chips at `rounded-xs`, small
nested boxes at `rounded-sm`, inputs / buttons / 40px icon tiles at `rounded-md`, cards and dialogs
at `rounded-lg`. `xl` is reserved for a future full-bleed container and is currently unused.
Badges, count chips, segmented controls, and numbered markers are full **pills** (`rounded-full`).
The highlighter mark uses a font-relative `0.12em` so its corners scale with the text it marks.
Everything is fenced by **1px hairline borders** (`#e5e5e5`, stepping to `#d4d4d4` for inputs and
emphasis) — borders, not fills or shadows, define the geometry. No sharp 0px corners, no heavy 2px+
strokes.

### Named Rules
**The Step-Down Rule.** A box nested inside another drops one notch: a 28px card holds 16px panels,
which hold 12px boxes. Matching the parent's radius on a child reads as a mistake, because the
concentric curves no longer share a centre — the inner radius should roughly equal the outer radius
minus the padding between them.

**The Clamp Rule.** A border-radius silently collapses to half the shorter side, so any radius at or
above half an element's height turns it into a pill or a circle whether you meant it or not. Check
the box before picking the token: `lg` (28px) circles anything under 56px, `md` (16px) under 32px,
`sm` (12px) under 24px. That is why `xs` exists, and why the 24px section chips use it. When a
circle *is* the intent, say so with `rounded-full` rather than leaving a clamped value that looks
like an accident.

## Components

### Buttons
- **Shape:** `rounded-md` (16px); sizes `sm` (h-2rem), `md` (h-2.5rem, default), `lg` (h-3rem);
  icon-only is a 2.5rem square. Icons auto-sized to 16px, `gap-2` from the label.
- **Primary:** Live Lime fill + Ink-on-Lime text, `font-semibold`, flat (no keyline, no glow).
- **Hover / Focus:** Primary shifts to Live Lime Dim; all buttons show a `ring-2
  ring-foreground/60` on `:focus-visible` — the focus ring is **ink, not lime**, because a lime
  ring on white fails the 3:1 non-text contrast requirement.
- **Secondary / Outline / Ghost / Danger:** Secondary = Panel 2 fill + Hairline-Strong border;
  Outline = transparent + Hairline-Strong border; Ghost = Dim/Readout text, hover fills Panel 2;
  Danger = `danger/15` tint + `danger/30` border + Stop Red text.

### Chips / Badges
- **Style:** full pill, `px-3 py-1`, `text-xs font-medium`. Status variants follow the Tint-15/25
  Rule; the **brand variant is a solid Soft Lime fill with Ink-on-Lime text** (see Tint-15/25).
- **Count pill:** a compact `rounded-full` Panel-2 chip with Hairline border and Dim-Grey tabular
  number, shown beside group/section headings to declare "how many".

### Cards / Containers
- **Corner Style:** `rounded-lg` (28px).
- **Background:** Panel 1 (`#fafafa`) on the white canvas; nested strips step to Panel 2/3.
- **Shadow Strategy:** none — separated by a 1px Hairline border.
- **Internal Padding:** `p-5 → sm:p-6` (20–24px).

### Card grid → scroll strip (signature)
A multi-card row collapses into a horizontal, snapping strip below `sm` instead of stacking into a
long column: `-mx-4 px-4` so it bleeds to the viewport edge while the first card still starts on the
content margin, cards at `w-[78%] shrink-0 snap-start` so **the next card peeks by ~110px** and the
swipe is self-evident, `snap-x snap-mandatory` with `scroll-px-4`, and `.scroll-strip` to hide the
bar and set `overscroll-behavior-x: contain` (otherwise a sideways swipe can trigger the browser's
back gesture). At `sm` it becomes a plain grid — `sm:grid sm:snap-none sm:overflow-visible sm:mx-0`.
The container takes `tabIndex={0}` with `role="group"` and a label, since the cards hold no
focusable children and the overflow would otherwise be unreachable without a pointer.

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
- **`.link-mark`** — inline links: conventional link blue (`--info`) with a soft underline that
  darkens on hover. Lime is never used to mark a link.
- **Tooltip (`InfoTip`)** — an 18px help-circle trigger (muted, 55% → 100% on hover/focus,
  28px hit target, `cursor: help`) opening an Ink bubble: white 14px text, 8px radius, small
  arrow, soft shadow, `max-width: 15rem`, above by default and shifted/flipped off the viewport
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
Tabular data (the items inside a package) is a real semantic **`<table>`** inside a `rounded-md`
hairline-fenced container — never a set of per-row `grid` divs. The header sits on Panel 2 with 12px
uppercase Dim-Grey labels; body rows are hairline-separated; the description column flexes and wraps
while every **numeric column is right-aligned, Mono `tabular-nums`, and `whitespace-nowrap`** so a
currency figure never breaks mid-number; a Panel-2 `tfoot` carries the total, aligned under its
column.

**The Real-Table Rule.** Columns must align across header, body, and footer — which independent
per-row grids cannot guarantee, because each row sizes its own tracks and they drift apart the moment
a number grows. If it has columns that must line up, it is a `<table>`.

## Do's and Don'ts

### Do:
- **Do** keep Live Lime to ≤10% of any screen — one CTA, one marked phrase (The One-Voice Rule).
- **Do** express lime as a **fill behind dark ink**; carry text emphasis with Ink + weight
  (The Marker Rule).
- **Do** set every code (`RK-…`, `RK-PL-…`, AWB) and every rupiah amount in JetBrains Mono with
  `tabular-nums`; keep weights, dimensions, quantities, and dates in Inter.
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
