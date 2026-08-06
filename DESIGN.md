---
name: Rimkirim
description: International moving assistant — a calm, high-contrast control room for cross-border personal shipping.
colors:
  background: "#0a0a0a"
  surface: "#141414"
  surface-2: "#1c1c1c"
  surface-3: "#242424"
  border: "#2a2a2a"
  border-strong: "#3a3a3a"
  foreground: "#fafafa"
  muted: "#b7b7bd"
  muted-2: "#8a8a92"
  brand: "#c1ff00"
  brand-dim: "#a3d600"
  brand-ink: "#0a0a0a"
  success: "#4ade80"
  warning: "#fbbf24"
  danger: "#f87171"
  info: "#60a5fa"
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
  sm: "0.5625rem"
  md: "0.625rem"
  lg: "0.75rem"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
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
    backgroundColor: "rgba(193, 255, 0, 0.15)"
    textColor: "{colors.brand}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
---

# Design System: Rimkirim

## Overview

**Creative North Star: "The Calm Control Room"**

Rimkirim is an assistant for one of the most stressful things a person does — moving their
whole life across a border. The interface answers that stress with the opposite of drama: a
dark, high-contrast control room where every number is legible, every state is obvious, and a
single lime signal tells you exactly where to look. The customer is at the console; Rimkirim
absorbs the customs complexity behind the panels.

The system is **precise and technical** without being cold. Figures — booking numbers, packing
codes, airway bills, rupiah totals — are set in a monospaced, tabular typeface so they read like
instrument readouts and line up column-perfect. Prose stays warm and plain-spoken ("kamu", no
jargon). The palette is almost entirely near-black and grey; **Live Lime `#C1FF00` is the one
voice that speaks**, reserved for the primary action, the active state, and the number that
matters. That restraint is the whole point: because lime is rare, it is impossible to miss.

The look is deliberately **not** a pastel SaaS template and **not** a gradient-glossy fintech.
There are no gradient fills, no glows, no glassmorphism — those were tried and removed on
purpose. Depth is built the honest way: solid panels stacked in tonal steps (`#0a0a0a` → `#141414`
→ `#1c1c1c` → `#242424`) separated by hairline borders. Warmth comes from generous spacing and a
human voice, not from decoration.

**Key Characteristics:**
- Dark-mode only, near-black canvas, x.ai-grade text contrast.
- Live Lime as a rare, single accent — action and emphasis, never area.
- Monospaced tabular figures for all codes and money; sans for everything else.
- Flat surfaces, tonal layering, hairline borders — depth without shadow.
- Soft ~10px corners and pill badges; calm, instrument-like components.

## Colors

A near-monochrome dark field with one electric accent and a small, disciplined status set.

### Primary
- **Live Lime** (`#c1ff00`): The single accent voice — primary buttons, active toggle/segment
  states, focus rings, and the one number or word being emphasized. On fills it carries
  **Ink on Lime** (`#0a0a0a`) text.
- **Live Lime Dim** (`#a3d600`): Hover state for lime fills only; never a resting color.

### Neutral
- **Control-Room Black** (`#0a0a0a`): The page canvas — every screen sits on this.
- **Panel 1 / 2 / 3** (`#141414` / `#1c1c1c` / `#242424`): Tonal layering for cards, inputs, and
  nested surfaces. Higher number = closer to the viewer. This ladder *is* the depth system.
- **Hairline / Hairline Strong** (`#2a2a2a` / `#3a3a3a`): 1px separators; the stronger tone marks
  inputs, emphasized dividers, and hover borders.
- **Signal White** (`#fafafa`): Primary text and key figures.
- **Readout Grey** (`#b7b7bd`): Secondary/body text and descriptions.
- **Dim Grey** (`#8a8a92`): Labels, eyebrows, captions, and de-emphasized meta.

### Status (tint system, used sparingly)
- **Go Green** (`#4ade80`): Success, complete, approved.
- **Hold Amber** (`#fbbf24`): Attention/warning — pending approval, needs a fix, in progress.
- **Stop Red** (`#f87171`): Errors, destructive actions, field validation.
- **Info Blue** (`#60a5fa`): Neutral information; also the ops/simulator (demo) chrome.

### Named Rules
**The One-Voice Rule.** Live Lime appears on ≤10% of any given screen — primary CTA, active
state, and the single emphasized figure. Its rarity is the signal; if two things are lime,
neither reads as the answer.

**The No-Gradient Rule.** Surfaces are solid tonal fills. No gradient backgrounds, no ambient
glows, no glass blur behind content. Depth comes from stacked panels and hairlines, never from a
gradient.

**The Tint-15/25 Rule.** Status and accent chips use the color at 15% opacity for the fill, 25%
for the border, and full strength for the text/icon (e.g. `bg-brand/15 border-brand/25
text-brand`). Consistent tint math keeps every badge in the same key.

## Typography

**Display Font:** Space Grotesk (with Inter fallback)
**Body Font:** Inter (with system sans fallback)
**Label/Mono Font:** JetBrains Mono (with `ui-monospace` fallback)

**Character:** Space Grotesk gives headings a tight, geometric, slightly technical confidence;
Inter keeps body text quiet and legible; JetBrains Mono turns every code and price into an
aligned instrument readout. The pairing reads competent and calm, not corporate.

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
- **Micro** (Inter 500, 0.625rem / 10px): The smallest labels only — status-stepper phase names,
  compliance micro-notes, secondary meta in dense selects. Never body copy.
- **Mono** (JetBrains Mono 500, `tabular-nums`, size follows context from 0.75rem chips to the
  3xl quotation total): Booking numbers, packing codes (`RK-PL-XXXXXX`), airway bills, and all
  IDR/currency amounts.

### Named Rules
**The Numbers-Are-Mono Rule.** Identifiers (`RK-…`, `RK-PL-…`, AWB) and monetary amounts render
in JetBrains Mono with `tabular-nums`. Weights, dimensions, quantities, phone dial codes, and
dates stay in the sans font. Prose is never mono; a number that reads as data is never sans.

## Layout

Mobile-first, single-column by default, expanding to rows at the `sm` (640px) breakpoint — the
primary and effectively only breakpoint. Two container widths carry the whole product: **`max-w-6xl`**
for the marketing shell (header, footer, landing sections) and **`max-w-3xl`** for focused work
and reading (the order flow, tracking detail, legal docs). Horizontal padding steps `px-4 → sm:px-6`;
sections breathe at `py-8 → sm:py-10`.

Density is comfortable, not compact: cards pad `20–24px` (`p-5 → sm:p-6`), vertical rhythm runs on
`space-y-3/4` (12–16px), and related controls sit on a `gap-2` (8px) grid. Multi-step flows use a
numbered stepper across the top; long forms collapse into sections the user can jump between. The
spacing scale is Tailwind's default 4px base.

## Elevation & Depth

**Flat by default, depth through tonal layering.** The system almost never uses shadow. A surface
reads as "closer" because it is a lighter tonal panel (`#141414` → `#1c1c1c` → `#242424`) fenced by
a hairline border, not because it floats. Nested content (a bullet box inside a card, a totals strip)
steps up one tonal notch rather than casting a shadow.

### Shadow Vocabulary
- **Hero lift** (`box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4)` — Tailwind `shadow-2xl
  shadow-black/40`): The single sanctioned shadow, on the landing calculator card, to seat it as
  the page's focal instrument. Do not generalize it to every card.
- **Focus glow** (`box-shadow: 0 0 0 2px rgba(193,255,0,0.25)` — `ring-2 ring-brand/25`): The
  interactive "depth" cue. Inputs and buttons don't lift; they light up a lime ring on focus.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. The only elevation is the hero
calculator's lift and the lime focus ring on interactive fields. If you reach for a drop shadow to
separate two things, use a tonal step or a hairline instead.

## Shapes

Soft, consistent corners on a ~10px base (`--radius: 0.625rem`): inputs and buttons at `rounded-md`
(10px), cards and dialogs at `rounded-lg` (12px), and small nested boxes at `rounded-sm` (9px).
Badges, count chips, the segmented control, and the numbered surcharge markers are full **pills**
(`rounded-full`). Everything is fenced by **1px hairline borders** (`#2a2a2a`, stepping to `#3a3a3a`
for inputs and emphasis) — borders, not fills or shadows, define the geometry. No sharp 0px corners,
no heavy 2px+ strokes; the silhouette stays calm and rounded.

## Components

### Buttons
- **Shape:** `rounded-md` (10px); sizes `sm` (h-2rem), `md` (h-2.5rem, default), `lg` (h-3rem);
  icon-only is a 2.5rem square. Icons auto-sized to 16px, `gap-2` from the label.
- **Primary:** Live Lime fill + Ink-on-Lime text, `font-semibold`, with a faint lime keyline
  (`0 0 0 1px rgba(193,255,0,0.2)`).
- **Hover / Focus:** Primary shifts to Live Lime Dim and blooms a soft lime glow
  (`0 0 24px -4px rgba(193,255,0,0.5)`); all buttons show a `ring-2 ring-brand/60` on
  `:focus-visible`.
- **Secondary / Outline / Ghost / Danger:** Secondary = Panel 2 fill + Hairline-Strong border;
  Outline = transparent + Hairline-Strong border; Ghost = Dim/Readout text, hover fills Panel 2;
  Danger = `danger/15` tint + `danger/30` border + Stop Red text.

### Chips / Badges
- **Style:** full pill, `px-3 py-1`, `text-xs font-medium`, following the Tint-15/25 Rule
  (`bg-<color>/15`, `border-<color>/25`, full-strength text). Variants: brand, neutral, success,
  warning, info, danger.
- **Count pill:** a compact `rounded-full` Panel-2 chip with Hairline border and Dim-Grey
  tabular number, shown beside group/section headings to declare "how many".

### Cards / Containers
- **Corner Style:** `rounded-lg` (12px).
- **Background:** Panel 1 (`#141414`) on the black canvas; nested strips step to Panel 2/3.
- **Shadow Strategy:** none (see Elevation) — separated by a 1px Hairline border.
- **Internal Padding:** `p-5 → sm:p-6` (20–24px).

### Inputs / Fields
- **Style:** `h-11` (2.75rem), `rounded-md`, Panel-2 fill, Hairline border, `text-sm`; labels are
  UPPERCASE-ish Dim-Grey `text-xs` above the field; errors in Stop Red below.
- **Focus:** border shifts to `brand/70` and a `ring-2 ring-brand/25` lime glow appears (no lift).
- **Disabled:** `opacity-50`, `cursor-not-allowed`.

### Navigation
- **Header:** sticky, `bg-background/80` with `backdrop-blur`, hairline bottom border; wordmark
  left, quiet Readout-Grey text links center (hover → Signal White), and the lime "Cek Tarif" CTA
  plus account/notification controls right. Links are hidden below `md`.

### Segmented control (signature)
- A `rounded-lg` Panel-2 track with a 1px border and `p-1`; the active item is a Live Lime fill with
  Ink text and `font-semibold`, inactive items are Readout Grey. Used for Base/Advance mode, service
  toggle, carrier switcher, and the AWB service choice.

### Status stepper (signature)
- A horizontal phase rail (Review → Quotation → Pickup → In-Transit → Clearance → Delivery →
  Delivered): completed dots are filled Live Lime with a check, the current dot is a lime ring, and
  upcoming dots are Hairline on Panel 2. The connecting track is lime up to the current phase.
  "Needs attention" states surface as a Hold-Amber banner below the rail, never by recoloring the
  rail.

## Do's and Don'ts

### Do:
- **Do** keep Live Lime to ≤10% of any screen — one CTA, one active state, one emphasized figure
  (The One-Voice Rule).
- **Do** set every code (`RK-…`, `RK-PL-…`, AWB) and every rupiah amount in JetBrains Mono with
  `tabular-nums`; keep weights, dimensions, quantities, and dates in Inter.
- **Do** build depth from the tonal panel ladder (`#0a0a0a` → `#141414` → `#1c1c1c` → `#242424`)
  plus 1px hairlines, and light interactive fields with the lime focus ring.
- **Do** use soft ~10px corners (`rounded-md`/`lg`) and full pills for badges, count chips, and
  segmented controls.
- **Do** tint status and accent chips at 15% fill / 25% border / 100% text (The Tint-15/25 Rule).

### Don't:
- **Don't** add gradient fills, ambient glows, or glassmorphism — they were removed deliberately;
  this is not a gloss-fintech look.
- **Don't** drift toward pastel or soft generic-SaaS templates; hold the near-black, high-contrast
  control-room key.
- **Don't** put prose in the mono font, or set a data figure in the sans display font.
- **Don't** introduce a light theme — dark-mode-only is a committed product decision, so guard text
  contrast in the one theme.
- **Don't** let a second accent color compete with Live Lime for "the answer"; status colors signal
  state, they don't take the primary voice.
