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
    fontSize: "clamp(2.25rem, 6vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
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
(`.hero-mark`) or a lime underline stroke (`.link-mark`). This is the load-bearing rule of the
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
- **Display** (Space Grotesk 700, `clamp(2.25rem, 6vw, 3.75rem)`, line-height 1.05, tracking
  -0.02em): Hero headline only. Often set as individually rising words.
- **Headline** (Space Grotesk 700, `clamp(1.5rem, 3vw, 1.875rem)`, tracking tight): Page/section
  titles (questionnaire, module hub, "Pesanan Saya").
- **Title** (Space Grotesk 600, ~1.125rem, tracking tight): Card titles and panel headings.
- **Body** (Inter 400, 1rem / 0.875rem, line-height ~1.6): Descriptions and running copy; reading
  columns cap around `max-w-3xl`.
- **Label** (Inter 500, 0.75rem, letter-spacing 0.04em, often UPPERCASE): Eyebrows, field labels,
  captions, table headers — always in Dim Grey.
- **Micro** (Inter 500, ~9–11px; 0.625rem / 10px is the norm): The smallest labels only —
  status-stepper phase names (10px → 11px at `sm`), count-pill / eyebrow captions (11px), the
  chargeable-weight readout labels, the carrier monogram (9px). Never body copy.
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

## Shapes

Generously rounded on a 16px base (`--radius: 1rem`): inputs and buttons at `rounded-md` (16px),
cards and dialogs at `rounded-lg` (28px), small nested boxes at `rounded-sm` (12px), and the hero
container at `rounded-xl` (40px). Badges, count chips, segmented controls, and numbered markers are
full **pills** (`rounded-full`). The highlighter mark uses a font-relative `0.12em` so its corners
scale with the text it marks. Everything is fenced by **1px hairline borders** (`#e5e5e5`, stepping
to `#d4d4d4` for inputs and emphasis) — borders, not fills or shadows, define the geometry. No sharp
0px corners, no heavy 2px+ strokes.

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
- **Mobile (`< md`):** links collapse into a right slide-over sheet — `bg-background`,
  `rounded-l-lg`, `shadow-overlay`, over a `bg-foreground/25` scrim, with full-pill 48px rows.

**The Contrast-Against-Its-Track Rule.** An active item is always the tonal *opposite* of the
track it sits in, never lime. On a Panel-2 track (segmented control, tabs, language toggle) the
active item is white and lifts with `shadow-float`; inside the translucent white header capsule
the active link is a Panel-2 pill instead. Same principle, inverted fill.

### Segmented control (signature)
- A `rounded-lg` Panel-2 track with a 1px border and `p-1`; the active item **lifts** — white fill,
  Ink text, `font-semibold`, `shadow-float` — while inactive items are Readout Grey. It does *not*
  fill with lime: a full-width lime pill is far too much area for a mere state, and it would starve
  the primary CTA of its voice. Used for Base/Advance mode, service toggle, carrier switcher, tab
  lists, and the AWB service choice.

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
- **`.link-mark`** — inline links: Ink text with a 2px Live Lime underline stroke (hover → Lime
  Dim). Lime marks the link without ever colouring the words.

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
