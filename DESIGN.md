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
  warning: "hsl(22 95% 52%)" # ≈ #fb5a0f, orange not amber: tinted amber read as cardboard
  danger: "hsl(360 100% 45%)" # ≈ #e60000
  info: "hsl(210 92% 45%)" # ≈ #0973dc
  accent: "#9c26f5" # Move Purple: "your move" surfaces, inline links, the Expat nav
  accent-ink: "color-mix(in srgb, #9c26f5 80%, black)"
  # expat chapter tones (data-tone): hue / wash / tone-ink, see The Chapter Rule
  expat-sky: "#21b1ec" # wash #c8e8fb, ink #0e668a
  expat-violet: "#7a66e9" # wash #dfdefd, ink #5c4db3
  expat-magenta: "#d41ce6" # wash #fadafc, ink #a213b0
  dusk: "#4a1e67" # the expat ticket; dusk-soft #ead6fc for its secondary words
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
- Light-mode only, white canvas, high-contrast dark ink. The expat landing alone walks its own
  identity hues as chapter tints (Expat chapters).
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
- **Go Green** (`hsl(140 100% 27%)`), **Stop Red** (`hsl(360 100% 45%)`), **Info Blue**
  (`hsl(210 92% 45%)`) — the text hues of Sonner's richColors light palette, adopted app-wide so
  toasts and in-app status surfaces share one palette. Info Blue also carries the ops/simulator
  (demo) chrome.
- **Hold Orange** (`hsl(22 95% 52%)`): the warning hue, deliberately *orange* rather than
  Sonner's amber — tinted amber at 10–15% read as cardboard next to the purple. Ink at 68%
  toward black.
- **Move Purple** (`#9c26f5`, `--accent`): the second sanctioned colour. Where lime says *press
  this*, purple says *this waits on you* — the attention banner, the "perlu tindakan kamu" strip,
  the docs-to-upload strip, the quotation-pending chip, the in-progress module tile. It is also
  the inline link hue and the Expat nav gradient's far end, so the two jobs share one family.
  Ink at 80% toward black (`--accent-ink`) for words on its own tint.

### Expat chapters (the expat landing only)
The expat landing walks its own identity, the `.nav-expat` gradient (sky `#21b1ec` to magenta
`#d41ce6`), down the page as solid stops, never as a gradient fill:

| Chapter | Hue | Sections | Wash (band) | Tone ink |
| --- | --- | --- | --- | --- |
| Sky | `#21b1ec` | hero, reviews, what you can ship | `#c8e8fb` | `#0e668a` |
| Violet (the gradient's midpoint) | `#7a66e9` | who does what, why Rimkirim, pricing | `#dfdefd` | `#5c4db3` |
| Magenta | `#d41ce6` | how it works, customs | `#fadafc` | `#a213b0` |
| Dusk | `#4a1e67` | the closing ticket | — | `#ead6fc` (soft) |

The FAQ sits outside the chapters, on the daylight neutrals: reference text, not a stop on the trip.

Departure in daylight blue, arrival at dusk: the page reads as the trip it sells.

**The Chapter Rule.** A section joins a chapter with `data-tone`, and the chapter **re-points the
neutrals** rather than painting components one by one. Inside it:

- `--muted` and `--muted-2` become greys tinted from the hue, never a washed-out generic grey.
- The hairlines and the Panel 1–3 ladder take the hue, in a desk pair and a band pair, each
  pitched at the old hairline's step from its own ground (about 1.25 and 1.45:1).
- A band's ground is the chapter's wash.

`--tone-ink` (`text-tone-ink`, `bg-tone-ink`) is the hue deep enough to carry 12px words. It is
for the few marks that should speak the chapter: eyebrows, the item icons, the "we take care of"
ticks, the hero board's label. Outside a chapter it falls back to Readout Grey, so a shared
component reads right anywhere.

Every value is an oklab mix of the hue with white, black or the old neutral, and every text pair
is checked on its real ground. An in-browser audit of all 37 distinct pairs on the page passes
AA, and the lowest is the blue link on the sky panel, at 4.98:1. Ink stays the heading and body
colour.

**No tone is lime, so no tone competes with the door.** The One-Voice Rule holds: lime is still
the only "press this" on every chapter, and it reads loudest on dusk, violet's near-complement.
The tones are atmosphere and wayfinding, never state, so the app's status meanings are
untouched. The rest of the product stays on daylight neutrals.

**Every "Check your rate" is the primary button.** The hero's lime `lg` with its arrow appears in the hero,
under the comparison, under pricing, under the steps and on the ticket, always worded "Check
your rate" (never "quote": the figure it opens is an Estimate, CONTEXT.md). The bar keeps the `sm`
size its height allows (its hit area is 44px all the same, `.tap-target`), and waits until the
hero's pair has scrolled away. On a phone every one
is full width, as the hero's is. It is one door, Check Rate, repeated wherever a reader might
decide, so a second lime "Check your rate" never splits the voice. A different action never takes
lime.

### Named Rules
**The One-Voice Rule.** Live Lime appears on ≤10% of any given screen — the primary CTA, the one
marked phrase, the checked state. Its rarity is the signal; if two things are lime, neither reads
as the answer. On daylight this budget is *tighter* than it was on black, because a lime fill on
white carries far more visual weight than the same fill on near-black.
One list is exempt, after the live rimkirim.com page: the Check Rate results (The offer card),
where every card carries its own lime order button. Each card is a whole offer read on its own,
and the list is a choice among equals, so one button per card is the answer each time, not a
competing voice. It licenses nothing else: any other list of options keeps one lime action.

**The Marker Rule.** Lime is a **fill behind dark ink**, never ink itself. Emphasis in text is
carried by weight and Ink; when a phrase must be singled out it gets the highlighter treatment
(`.hero-mark` in the hero, `.card-mark` in a card rhythm — one mark per budget, never both in the
same eyeful). Inline links are the one exception to Ink-only text: they are conventional
link blue (`.link-mark`) so they read as links at a glance. This is the load-bearing rule of the
light system.

**The No-Gradient Rule.** Surfaces are solid fills. No gradient backgrounds, no ambient glows, no
glass blur used as *decoration*. Depth comes from panels, hairlines, and the two sanctioned shadows.
The one sanctioned translucency is functional: sticky chrome (the header capsule) is
`bg-background/85` + `backdrop-blur-xl` so the page reads legibly as it scrolls underneath — an
effect doing a specific job, not a texture.

There are exactly **four standing exceptions**, each narrow, each doing a job no solid fill can do.
None licenses a fifth: a new gradient has to earn its place the same way, in writing, at the
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
  under the pointer, never on idle UI, and stops the moment the hover ends. The hover is a
  link's and a mouse's only (`a.nav-expat`, inside `(hover: hover) and (pointer: fine)`): the
  expat bar wears the same gradient on its service name, which is a label, so there it stays
  still (a label that stirs under the pointer promises a click that does nothing), and on touch
  nothing is left flowing after a tap.
- **The journey's stage** (`.jr-sky`, `.jr-dusk`, `.jr-grain`, expat "How it works"): the ground
  the step illustrations stand on is the page's own trip, two soft radial washes in the chapter
  hues over the magenta wash, daylight sky (`#21b1ec`) top left at step 01, dusk magenta
  (`#d41ce6`) top right by 04, cross-fading as the steps play, under a fine SVG grain at 11%
  multiply. It is a stage for illustration, the way the scrim serves photography, never a panel
  behind text; every word on it sits on a white card except the chat's small label. The
  parcels on its doorstep are kraft brown, the one colour outside the palette, because a
  cardboard box is the brown of cardboard.
  The section scenes (below, Motion) stand on the same ground, still: `.scene-day` is the
  chapter's wash a step deeper than its band (so a stage reads as a stage on a band as well as
  on the desk) with the trip's two ends as blooms, sky top left and magenta bottom right. On the
  closing ticket the ticket is the ground. Same job, same limits: illustration only, every word
  on a white card. This
  extends the exception to the page's illustrations; it does not license a gradient anywhere
  else.
- **`.offer-special`,** the Special Rate card's border (The offer card): a 1px border that runs
  from Stop Red at the tab to the Hairline across the card (90°, `danger` 70% → `danger` 22%
  into the hairline at 45% → `border`), lifted from the live rimkirim.com card. It is a stroke,
  not a surface: the card's face stays solid white, and the fade says where the offer is marked
  (the tab) without boxing the whole card in red.

**The Tint-15 Rule.** *Status* chips use the colour at 15% opacity for the fill (banners and
strips step down to 10%), full strength for the icon, and the **status ink** (`--*-ink`: the
accent color-mixed 80% toward black, warning 68%) for the words — so the label speaks the
status hue like the richColors toasts do, while 12px text still clears AA 4.5:1 on the tint
(the raw accents measure only 2.7–3.8:1 there). There is **no border** on a tint: the wash *is*
the edge (The Stroke Rule). **Brand chips are the exception** — a 15% lime wash is nearly
invisible on white, so they use a solid Soft Lime fill with Ink on Lime text. Neutral chips are
`foreground/10`, a translucent grey, so they still read on the Panel 2 field and not only on a
white card.

**The Whose-Move Rule.** Colour on a shipment answers one question: *whose move is it?*
- **Lime** — press this. The one primary action on the screen; never a state.
- **Move Purple** — waits on *you*. Anything the customer must do before the shipment can
  continue: approve the quotation, confirm Barpin, choose after a failed pickup, upload a
  document, fix a revision. Banner, strip, chip, and tile all speak it, so the eye learns one
  hue means "my turn".
- **Hold Orange** — held, or the clock is running. Nothing to do yet but worth knowing: a
  rejected clearance being refiled, an expiring or expired quotation, a blocked pre-clearance,
  an NPD round. Time pressure keeps the clock glyph orange even on a purple surface.
- **Go Green / Info Blue** — progress, no verdict about you. Routine phases are blue, terminal
  good news is green.
- **Stop Red** — cancelled. Terminal bad news only. The one red that is not a verdict is the
  Special Rate tab on the Check Rate card (The offer card), the live page's offer mark; it never
  sits on a shipment.
- A **voucher** is a record, never a move: its lifecycle (reserved → redeemed → finalized, or
  released) reads in Info Blue on the timeline and as neutral mono text in the summary. The
  discount line is the one place it earns Go Green ink — a deduction, not a struck-out price.
A state that is purple and orange at once has been diagnosed wrong: pick the one the customer
can act on. Gojek's red-and-green everything is the anti-reference — there every surface has a
colour, so no colour means anything.

**The Stroke Rule.** *A line marks something you can act on; tone marks a container.* Strokes
belong to inputs, secondary/dashed buttons, the segmented control, the stepper's rings, and the
hover edge of a card that is itself a link. Everything else — cards on the field, chips, banners,
strips, tiles, nested boxes — is a tint or a panel with no outline. This is what lets a screen
carry six status surfaces without turning into a wireframe: the rule keeps the stroke budget
for the things that need a "this is pressable" cue.

**The Field.** Signed-in app pages (Kiriman Saya, an order's tracking page, the order-form hub)
wrap their content in `data-field`, which drops the page canvas to **Panel 2** (`#f5f5f5`) and
turns every `Card` into a **white plane with no outline** — separation comes from the tone step,
not a hairline. The header capsule and footer stay white chrome. Marketing and reading pages
keep the daylight canvas with Panel-1 cards and hairlines: there, cards are few and the line is
cheap. A landing's bands borrow the field's card treatment for their own sheet (The Band Rule). `Card` reads its surface through `--card-surface` / `--card-border` so a tinted caller
(`bg-accent/10`, `border-transparent`) still wins the class merge inside the field.

**The Attached-Strip Rule.** *Information or an action that belongs to a card is worn by that
card, not stacked beside it.* A strip (`CardStrip`) bleeds through the card's padding to its
edge and shares its radius: the **head** says why you are looking at this card (the order's
attention state, as the head of the live panel it explains, or of the status card when no panel
exists; a cancelled order's red notice, as the head of its status card), the **foot** says what
to do next (documents still to upload, under the stepper; on a Kiriman Saya card, the state that
waits on you, holds you, or ended the shipment). The
sentence *is* the headline — no "needs attention" label above it; the tint already says that.
One card, one silhouette: the page never shows a purple box floating above the purple-badged
card it is talking about. Gojek's voucher callout is the reference; its tinted head over a
white body is one expression, not the only one — the tone and the attachment are the rule, the
shape may vary. The seam is a **shoulder**: the card's white plane curves back over the strip
(16px, the card's own radius), so the tint shows in the corner curves and the card reads as one
sheet laid on the strip. Words on the purple head are set in the raw hue, not the ink — the
one place Move Purple speaks at full strength (Figma *Customer Revamp*, node 191:2097).

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
  lime highlighter behind it feeling like a mark rather than a block. One other use, at its top size
  only (4.75rem, line-height 1.05, in the chapter's ink): the one number of What you can send's
  books tile (0%), the bento's stat, a figure rather than a headline.
- **Headline** (Space Grotesk 700, `2.25rem`/36px, tracking -0.025em): the largest non-hero
  heading — landing section titles ("Kenapa Rimkirim", "Dua arah, satu tim"), set `text-3xl
  sm:text-4xl`.
- **Page title** (Space Grotesk 700, `1.5rem`/24px, tracking -0.025em): the `h1` of a focused page
  — questionnaire, module hub, "Kiriman Saya", auth, legal, order tracking. A few wider pages
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
  sit in a list or a row — footer links, list rows. Segmented controls (the language toggle) are
  **exempt**: real height deforms a compact pill into a tall oval, so they stay compact and carry a
  focus ring instead. Real height is
  required here because invisible hit areas in a dense list overlap and steal each other's taps.
- **`.tap-target`** paints a 44px invisible `::after` over a small control without changing its
  visual size. Only for **isolated** icon buttons with clear space around them (the bell, the
  hamburger, copy). The host must already be positioned.

**The Band Rule.** A long landing must never read as one long section, and on daylight a hairline
alone cannot stop the eye: the old alternate band, `bg-surface/40`, measured about `#fdfdfd`,
which is white. So a landing alternates two grounds:

- **The open desk:** white and de-boxed, with no container and no hairline at its edges.
- **The band** (`.band`): the section laid on its own sheet with the `lg` card corner. The sheet
  is its chapter's wash (The Chapter Rule), or Panel 2 on a page without chapters. It sits in
  from the viewport by one inset at every width, 8px on a phone and 12px from `sm`, so its
  corners always clear the screen's edge and the desk shows around it. The closing ticket takes
  the same inset on a phone.

**The section shell** (`.section-shell`): every landing section's content column, `max-w-6xl`
with the 16px/24px gutter. Inside a band the sheet's own inset comes off the column, so a band's
content starts on exactly the desk's content edge and nothing jogs sideways at a transition. A
strip that bleeds (the reviews, the pickup photos) bleeds to the band's edge, not the screen's.

**The rhythm.** Three intervals, each clearly bigger than the next: a section's own padding
(64px on a phone, 80px from `sm`), a sub-section inside it (a hairline with 48–64px above and
40–48px under it, and its head one step down the scale: 20–24px against the section's 30–36px),
then heading to content (32px on a phone, 48px from `sm`). Groups inside sit at 16–24px.

**No band colour on the desk.** A container inside a desk section is never tinted with a band's
wash: it is de-boxed between hairlines, or a white plane, or at most the chapter's Panel 2. A
tinted panel on the desk reads as a second, narrower band and stutters against the real one.

**Caps are for eyebrows.** Tracked uppercase is the section eyebrow's alone. Group heads, card
labels, column headers and field labels are sentence case in the display face, semibold, so the
one tracked line per section still means "a new section starts here".

Inside a band, a `Card` is a white plane with no outline, as in the field (The Field). Anything
that would itself sit at the sheet's own tone, such as a photo slot, steps up to white so it
never melts into the sheet.

The tone step is the whole separator. There is no hairline on either side, no shadow, and no
entrance animation: every section arriving the same way reads as a template and makes the reader
wait for the words. Two bands in a row stay two sheets, with a 12px strip of desk between them.
A thin strip that is not a section, like the carrier logos, never becomes a stripe of its own: it
closes the band it proves. On the expat page the carriers are one line under the band's last
hairline: their label beside the marks from `lg` (over them below), set from the left in the
pickups' own label since both prove the same promise, the marks spread across the rest of the
line; never a centred label over marks pushed to the band's two edges.

**Each section in the viewport.** The hero owns the first screen from `lg`: it fills the viewport
under the bar, less a 1.5rem peek of the reviews' sheet (capped for very tall screens). Short
sections (pricing, the FAQ, the closing ticket) fit one desktop screen; long ones (what you can
send, who does what, the comparison, customs) read as a scroll with their own landmarks, a
sub-head between hairlines every screen or so. No section is forced to a full screen: snapping a
long page into screens hides content behind its own crop.

The expat page runs:

1. Hero (desk, sky)
2. Reviews (band, sky)
3. What you can send (desk, sky)
4. Who does what, closed by the pickups and the carriers (band, violet)
5. Why Rimkirim, the comparison table (desk, violet)
6. Pricing (band, violet)
7. How it works (desk, magenta)
8. What to expect at customs (band, magenta), once the reader has seen how a shipment runs
9. FAQ (desk, neutral): on the content edge like the rest, the head and the way to ask in a
   column of their own from `lg` (sticky; below `lg` the way to ask comes after the questions,
   where "still have a question?" belongs), the questions beside it ruled one from the next,
   each one step up the scale (`Disclosure strong`)
10. The dusk ticket (see Components)

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
only. A button's transition names what it moves (`color`, `background-color`, `border-color`,
`opacity`, `scale`), never `all`: under `all` the focus ring faded in over the same 150ms, and
keyboard focus has to land at once.

**A press answers at once.** A finger gets no hover and no tap flash (the browser's highlight is
off), and a control that only changes when the finger lifts reads as lag. So everything tappable
that isn't a button answers the press itself, in colour, with the look its hover has: a choice
card and a picker's field dip to the next panel, a disclosure row and a picker's row take their
hover fill, a bento tile and a folded part of the plan tint under the whole card or line, a
link darkens (`.link-mark:active`). Hover styles themselves stay a mouse's: Tailwind's
`hover:` is already gated on `(hover: hover)`, and a hand-written `:hover` is wrapped the same
way, or it stays lit after a tap until something else is tapped.

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
The system holds **exactly one looping animation per landing**, each named and bounded below: the
home hero's floating verdicts and the expat hero's departure board. Treat any other loop as drift.

- **Entrance** (time-based, on load): the header drops in, hero children cascade up on a
  0.05s-per-item stagger, the headline arrives word by word, and the calculator pops in last.
  Under ~0.7s total. The expat hero, which has more to say and a pile of photos beside it,
  arrives **in tiers** instead, so the eye is led rather than hit with everything at once
  (`ExpatHero`, `TIERS`; `.hero-in` with its start in `--at`), with one rule over the order:
  **the way in never waits for the rest.** The top photo stands from the first paint (it is the
  page's largest paint, so nothing holds it back), and the lime "Check your rate" rises at 0.3s,
  the secondary "See how it works" a beat after it, while the headline is still landing word by
  word (the board, then `Words` at its own pace). Then the subtitle (0.45s); the two prints
  behind the top one dealt out from under it (0.55s; `.deck-deal`, each starting tucked in at
  the top print's own place and sliding to where it rests, on `translate` and `rotate` so it
  never fights the cards' own `transform`, and never on opacity, so nothing fades in); the
  marked phrase taped on as its words land (`TapeMark`: each line's strip pulled across left to
  right, 460ms, 170ms apart, as WAAPI on the words' own clock so it lands with them however late
  the page hydrates); and last the pile's satellite dropping onto it (`.hero-drop`, 1.05s). The
  door is up by 0.85s and the last piece has landed by 1.6s. The tiers fill `backwards` only,
  so a risen button's press scale still works. Under reduced motion all of it simply stands.
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
  The rise has two sanctioned relatives, both *explanation*, both on the same guards and the same
  `view()` machinery, and neither licenses a third:
  - **The step rail** (`.how-step`, landing "Cara kerjanya", and on the expat page the closing
    "What happens next"; the expat "How it works" is the journey, below): the hairline above each step draws
    left→right (`scaleX`, origin left) and the step's text rises 10px under it, on the step's own
    named timeline across `cover 0–25%`. On one row (`lg`) the range shifts 3% per step so 01→05
    arrive in the order they happen; stacked, each step enters on its own and needs no offset.
    Tuned so the last step is fully drawn before its row reaches mid-screen: text being read is
    never half-faded. The expat ticket's tear line is the same rail, dashed (`.ticket-tear`). It
    draws by `clip-path` on the departure board's route keyframes, because `scaleX` would
    stretch the dashes, and in the rails' own range, so it lands just before the stub's steps.
  - **The build** (`.build-seq` on the container, `.build-row` + `--i` on each item; formerly
    `.proof-row`): rows lift 6px (lines and small pieces, not objects, so less than a card's
    10px) on their container's one timeline, staggered 5% apart in the order a thing is put
    together. The home page's worked example builds its sum (chargeable weight, base, surcharge,
    total).
  Without support or under reduced motion both are simply static: the hairline is already drawn.
- **The disclosure open** (`Disclosure` in `components/ui` — the one accordion idiom, shared by
  the /faq page and the article FAQs so they cannot drift; its controlled sibling
  `CollapseHeight` carries the identical motion to every state-driven collapsible — the package
  rows in the order form and tracking summary, and the article ToC — and marks the closed region
  `inert` so hidden form fields can never be tabbed into): the answer's height is the only
  animated property — no fade, no slide — on the hover scale's strong ease-out (`--ease-hover`,
  not the system easing: that one eases in, so the answer hesitated at the click, an eighth of
  the way open a fifth of the way through its time, where this one is two thirds open), and the
  *duration is computed from the content height* (Material's `getAutoHeightDuration`: a short
  panel snaps at ~200ms, a long one glides, hard-capped at 300ms, the budget for any UI motion,
  so perceived speed stays constant where a fixed duration cannot).
  Height lands on `auto` after opening so growing content never clips. The chevron is swapped
  down↔up, never rotated (every disclosure, the customs cards' document lists on a phone
  included), and it swaps on the click, not after the motion; the open header
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
  **A picker is a sheet there too** (`Picker` in `ui/popover.tsx`: the country, dial code and
  currency lists, any searchable `SelectField`): under its field the panel showed seven rows of
  two hundred, where the keyboard comes up. As a sheet the list fills up to 85dvh, each row a
  full 44px, the search on top and not focused on open, so the list is seen before the keyboard
  rises. From `sm` it stays the popover. A short select (a handful of options) stays under its
  field at every width.
  Dialog actions live in **`DialogFooter`**: stacked full-width on the sheet (primary on
  top — DOM order [secondary, primary] through `flex-col-reverse`), a right-aligned row in
  the modal, with `env(safe-area-inset-bottom)` added below so the bottom button clears the
  home indicator on gesture-nav phones. Never park a button row inside the scroll body —
  every action dialog in the app now follows this (reschedule, drop-off, new AWB, quotation
  approval, packing-list delete, photo warning, booking agreement, questionnaire outcome).
  Even the revision choice list graduated to the footer: RevisionDialog rows only *select*
  (a radiogroup with a note field), and the request fires from an explicit `DialogFooter`
  CTA — regressing an order is never one tap. A dialog whose list still *is* the action row
  keeps the footerless body with the safe-area bottom. The booking agreement's hint +
  checkbox sit in their own block above the footer; only buttons live in `DialogFooter`.
  Exceptions: media lightboxes (`sheet={false}`), info-only dialogs with zero buttons, and
  the login dialog, which owns its own full-screen mobile form.
  **Dialog anatomy is tokenized, not restated.** The numbers live in the primitives
  (`components/ui/dialog.tsx`) and consumers only compose them: `DialogHeader` owns
  `p-5 pb-4 sm:p-6 sm:pb-4`; `DialogBody` owns the scrollable middle with `px-5 sm:px-6`
  (footerless bodies add `pb-dialog-safe sm:pb-6`); `DialogFooter` owns the action row and
  the `--spacing-dialog-safe` bottom inset (`calc(1.25rem + env(safe-area-inset-bottom))`,
  a `@theme` token — the only place that value exists); `DialogTitle` owns the icon slot
  (a bare `<Icon />` as first child auto-lays-out as the size-5 glyph beside the words).
  Writing these paddings by hand at a call site is a smell: extend the primitive instead. Under reduced motion the transition collapses to instant; the drag
  itself is the user's own motion and stays.
- **Popovers and tooltips exit too.** `pop-out` retreats toward the trigger (120ms) so no panel
  ends on a jump cut; the tooltip keeps its 100ms out. Every exit (popover, tooltip, the dialog's
  panel and overlay, the mobile nav sheet) is shorter than its entrance and on the same ease-out
  (`--ease-out-soft`), never an ease-in: an exit that gathers speed first reads as the interface
  hesitating after Esc or a click. And inside a
  skip-delay sweep, the second and later tooltips open **instantly — no delay, no animation**
  (`data-state="instant-open"`): ceremony belongs to the first bubble only.
- **The floating verdicts** (the one idle loop, `.hero-verdict-float`): three one-word customer
  verdicts sit in the page gutters beside the hero headline (`xl` and up — below that the gutter is
  too narrow to hold a word) and drift ±9px on a 7s/8.5s/10s cycle, phase-shifted by negative
  delays so no two words are ever at the same point of their arc. Three different durations, so
  they never pulse in unison; a synchronised set would read as one blinking block rather than three
  separate marks. **This is the home page's only looping animation and its only decoration of idle
  UI.** It is granted because the float *is* the idea — static, the three words are just more
  labels — and it is kept survivable by how small it is: 9px over eight seconds is slower than the
  eye tracks. A second loop on the page is drift, not precedent.
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

- **The departure board** (`RouteBoard`, `.board-*`, the expat hero's eyebrow; the expat page's one
  loop): the eyebrow is an airport departures row, `[flag] GBR ─✈─ IDN [flag]`, in split-flap
  tiles (24×32 ink tiles, 2xs corner, Geist Mono white, a lighter upper leaf and a dark seam that
  cuts the letter). Every 3.6s the origin flips to the next country (GBR, NLD, DEU, AUS, USA, FRA,
  JPN, SGP): the three tiles flip in on `rotateX`, 50ms apart, 320ms each on `--ease-out-soft` (the
  headline words' own move), the flag crossfades, then the dashed route redraws left to right
  (`clip-path`) with the plane at its tip, 900ms on `--ease-in-out-strong`, a token added for
  things that travel across the screen rather than enter it. The plane's horizontal travel is one
  keyframe interval on the line's curve, so its nose always leads the line's tip, and the flight
  is level: the route is straight dashes, and a plane lifting off them read as leaving its own
  route behind. It is granted for the same reason as the verdicts: the cycling *is*
  the idea ("from wherever you are moving, to Indonesia, by air"), said without copy. It runs only
  while on screen and while the tab is visible, never under reduced motion (the first route stands,
  drawn, its plane landed), and assistive tech hears one sentence, "Expat relocation to
  Indonesia", not a ticker.
- **The deck's satellite** (`ClearedNotice`, expat hero): the stageshow framing for an
  image-led hero, the real photo pile as the hero object and one satellite, a WhatsApp message
  from Rimkirim at a notification's true scale (the page's chat card in small: the app icon,
  the name, "WhatsApp · now", one line of news), saying "your boxes" have cleared customs and
  the next stop is your door. The photos are the trip's start, boxes ready for pickup; the
  message is its end, so the pair tells door to door without a word of copy. It speaks to the
  visitor, never about the shipment in a photo, so no claim rides on a real picture. From `lg`
  it hangs off the top print's top-left corner, a little under half outside, over the gap to
  the copy; below `lg`, where the pile fills the column, it sits inside the top print like a
  banner on a lock screen. `shadow-overlay`, white, no pointer events: decorative, and it never
  takes a click from the pile. It drops in last (Entrance) and then holds.
- **The photo deck** (`.photo-deck`, expat hero): real shipment photos as a pile of prints, one
  5:4 card on top and two peeking behind it (rotated ±3–4°, offsets in % of the card so the pile
  keeps its shape at every width; the same 5:4 on phone and desktop). Click or tap sends the top
  card to the back, and the top print can be dragged: held, it follows the finger one to one,
  leaning 0.03° for every pixel it is pulled, so the pile answers while the gesture is still
  being made (no transition while held; `PhotoDeck` writes the print's own `transform`). Let go
  40px to the side, or flicked faster than 0.11px/ms however short the pull, it goes on (left
  for the next photo, right for the one before); short of that it settles home; a second finger
  put down mid-drag is ignored. Either way it leaves from where it was let go, on the same
  transform and opacity transitions on the hover scale (below) as a click, so a quick second
  click retargets mid-flight instead of restarting. The
  prev/next buttons are the keyboard and screen-reader way in, and a keyboard press swaps
  instantly. **Hover fans the pile open** (±7°): the second written-down exception to "hover moves
  colour, not geometry", after the rating arrow, kept because it is how a mouse discovers there is
  more to see. Gated to fine pointers, so a tap never leaves it open, and off under reduced motion,
  where swaps are instant as well.
- **The door's arrow** (`DoorButton` + `.door-shaft`, the expat hero's "Check your rate"): the
  button is the house lime and steps to Live Lime Dim under a mouse like any other; only its
  arrow answers, taking one step forward the way an inchworm walks. The head moves on first,
  so the shaft stretches behind it, then the tail catches up and the arrow stands 4 units
  (about 2.7px) on, split 40/60. Leaving, it steps back, tail first, split 45/55. On the hover
  scale (below), read from its tokens: 300ms on, 240ms back, every phase on `--ease-hover`,
  and each move is its own WAAPI animation started from wherever the arrow is, so a pointer
  that leaves mid-step turns it round without a jump (a reversed timeline would start the
  return on its slow end). At rest it is lucide's
  arrow exactly, as on every other button. **The fourth written-down exception** to "hover
  moves colour, not geometry", after the rating arrow, the photo deck's fan and the pickup
  slices, and the smallest: it moves a glyph, never the button. Fine pointers only; on touch,
  from the keyboard and under reduced motion it stays still, and every press is the house 0.98.
  Only on the hero: the page's other "Check your rate" buttons stay plain, so it stays a moment
  rather than a habit.
- **The pickup slices** (`.pickup-slices`, expat "Who does what"): six real pickup photos in one
  row, one open at its full 4:5 and the rest slivers sharing what is left, so the row always fills
  its width. The open print wears its route as an ink label (the departure board's tile), flat
  flag and country to flat flag and Indonesia, fading in once the print has opened; ink, because a
  flat flag with a white field vanishes into a white label; the photos are never narrated, and what each
  shows is alt text for screen readers. Resting a mouse on a sliver for 90ms opens it, and so do click, tap and Enter: a
  `flex` transition on the hover scale (below), which retargets on a quick sweep. **Hover
  opening a print** is the third written-down exception to "hover moves colour, not geometry",
  kept because the row is built to be swept, and a mouse finds the next photo by pointing at it.
  Mouse only, after the intent delay, so a pass across the row on the way elsewhere does not
  ripple it. A keyboard press opens instantly, and reduced motion drops the transition. Below
  `sm` six slivers have no room, so phones get the house scroll strip with its position row.
- **The journey** (`JourneySteps` + `JourneyScenes`, `.jr-*`, expat "How it works"): the four steps
  as the trip they describe, each illustrated by its moment built from the site's own pieces and
  framed as a product shot, not a screenshot in a box (the stageshow rules, installed as the
  `stageshow` skill): one hero surface inset a gutter from the top and sides of the stage and
  running off its bottom, so only filler is cropped, and at most one satellite. 01 is Check Rate
  filling itself in, centred a gutter from either side: From beside To on one row as the real
  form sets them, each Address under its country, then the estimated weight, and "A few minutes"
  over it, a chip centred on its top edge, half outside, its ring running while the form fills and
  closing into a check once full; once full, the estimate rises from the crop below, drawn by the
  order flow's own rate card (`RateCard`, shown and inert, `stacked` and `plain`), the crop falling
  under its price beside the steps and, where the stage stands over them (below `lg`) and would
  cut through a line of type, the card dissolving into the stage's foot instead; 02 is two cards
  at one width in the order the team works, the packing list checked line by line (a phone marked
  "Likely taxed", the wine to "Take out"), then the quotation rising from the crop under it and
  building to its total, marked an estimate whose final price comes on the invoice; 03 is the tracking card, GBR to IDN on the departure
  board's tiles with the plane flying the route as the hero's board flies it (a straight dashed
  line drawn left to right on the tiles' centre line, lucide's plane level at its tip, turned to
  fly east, landing flush with the route's end, on the board's 900ms) over the legs' timeline; 04
  is the doorstep, drawn in a reference's own pixels so nothing stretches: a panelled front door
  nearly the stage's height (a white casing with rounded head corners, a step and a rebate inside
  it, the slab in the chapter's ink darkening toward the floor, two tall panels above and two
  short below, each sunk behind a groove with its field lit at the top and left, a brushed letter
  plate between them, a lever handle with its keyhole, two hinges, the house number on a plaque,
  the sill it stands on), two kraft parcels landing forward on the floor by it in one oblique view
  (their whole footprint in the floor's band, in front of the wall's line, their shadows a tight
  one where they meet the floor, the footprint softened and a cast to the right), the small one
  set back on the big one's lid, each with its AWB lying on its lid and the same width of tape
  whatever its size, and the WhatsApp thread as the satellite, its avatar Rimkirim's own app icon
  (the one lime in the illustrations: it is the brand's mark, not a "press this").
  Every size is in em, a share of the stage's width (2.85cqw), so a scene scales as one
  picture; below 30rem the stage turns portrait (4:5) and the scenes take a compact layout at
  3.9cqw, never squeezed, so their type stays at 10px or more. Things arrive by moving (a hero
  rises from the crop on the travel curve, chips and bubbles land from just above), and the
  stage changes scene like a conveyor: the done scene travels up and out while the next builds
  in its place, the other way round when stepping back. The scenes share one stage, beside the
  steps from `lg` and above them on a phone, on the travelling ground described under The
  No-Gradient Rule.
  When the section is 30% in view it **reveals** once (head, stage, steps, button rising 1rem on a
  70ms stagger), then **plays the steps 1 to 4, once**: the active step's tile fills with tone ink
  and flips in on the board's move (`board-flip`, without the seam, which strikes through a 28px
  tile), a highlight **glides** to it (`transform` + `height`, 450ms on `--ease-hover`, a strong
  ease-out, so it moves the moment the step changes), the 2px rail fills to it, the stage
  cross-fades (420ms) and its scene **builds** piece by piece (each piece names its entrance and
  its start). Each step holds 5.2s; the round control on the stage wears the hold as a ring, and
  the rail runs on toward the next step in step with it, a dot with a soft halo at its tip, from
  the active tile's lower edge to the next tile's upper edge, so the reader can see the next move
  coming and the step moves on the moment the run touches it. The step it reaches answers with a
  **pulse**, a ring of the chapter's ink swelling out of its tile and fading (`.jr-pulse`, 750ms,
  just after the flip), and the next run sets off a beat later (`--run-delay`, 650ms), its head
  fading in at the tile's foot rather than popping up the instant the last run lands; the run
  takes the rest of the hold, so it still lands as the timer ring closes. Reached by its run, a
  step's fill takes the run's place at once (`data-snap`), so the stretch just drawn never empties
  and refills; only a jump (a click, a replay) grows the fill. Below `lg`, where the steps sit
  under the stage and out of sight while the scene plays, the stage carries the progress itself:
  one segment per step level with the control, the past ones full, the active one filling over its
  hold on the ring's clock and pausing with it, as a story's bars do. After 04 it rests on the
  doorstep. A scene rebuilds each time it comes up while the steps play.
  **A click (or Enter) on a step takes over**: that step comes up and the playing stops. A step
  chosen by hand is a question, so it is answered at once: the stage turns to it in 240ms on the
  hover curve (`.jr-root[data-manual]`) and its scene stands built, where the tour's builds
  itself over two and a half seconds; chosen from the keyboard, nothing moves at all
  (`data-instant`). A step chosen in the beat before the tour starts keeps its place. The
  control pauses, resumes and replays (WCAG 2.2.2: content that moves on its own for more than
  five seconds must be pausable); playing on from a step chosen by hand builds the scene on
  stage as the tour would have. The playing holds while a mouse rests on the stage (only
  the stage: the section fills the screen, so a pointer parked anywhere on it would stop it
  for good), while the section is off screen and while the tab is hidden. It is not a loop: one
  pass, then still. Scenes are `aria-hidden`; the steps' words carry the meaning, and each row
  is a button laid over it so the title stays a heading. Under reduced motion nothing reveals,
  plays or glides: step 01 stands, built, and a click switches instantly; without script every
  scene stands built.
- **The section scenes** (`SceneStage` + `SectionScenes`, expat pricing, who does what, and the
  closing stub): each section that describes a screen the visitor never sees
  shows it, framed and built as the journey's scenes are, from the same pieces (`SceneParts`:
  the filler line, the flag, the chat card) on the same ground, so the page's
  illustrations are one figure language. One hero surface a gutter from the top and sides, off the
  bottom, at most one satellite. Pricing is two pieces as the warehouse weighs them before the
  invoice ("Weighed at our warehouse", the readout: real, by size, charged), a box charged by its
  size beside a suitcase charged by its weight, then the charged weight, the one big number; it replaced the line
  drawings of the size guide, whose rule and tip are now the caption under it.
  Who does what is the team on WhatsApp after reviewing the packing list (the wine to take out,
  the new phone likely taxed), then confirming the pickup on the day the customer chose, on the
  customer's phone: the
  stageshow kit's iPhone 18 Pro (`IPhone`, its `pro` frame ported, the screen at true points,
  status bar, island and home indicator the phone's own), pinned a gutter from the stage's top and
  running off its foot, so the crop falls on the chat's empty wallpaper (WhatsApp sets a short
  chat from the top). Inside the screen it is WhatsApp's own light theme: the chat's wallpaper
  colour without its doodles, white and WhatsApp-green bubbles with the iOS tail, the time in the
  bubble, the blue read ticks, the packing list as a document message; the one stretch of the page
  in another product's colours, because it is that product on a phone, and only inside the screen.
  It ends on "Pickup confirmed". The phone is four fifths of a wide stage and nearly all of a compact
  one, so its 17pt type reads at 12 to 15px; the stage is portrait (8/9, 4/5 on a phone), beside
  the two lists, stacked, and held still as they scroll (`lg:sticky`).
  Pricing, What you can ship, Who does what and the customs section each reveal once as the
  journey does (`.jr-reveal`, `useSectionReveal`): the head, the illustration, then the section's
  own pieces one by one (Pricing's four factors in the order a price is built from them, its
  promise and its button; What you can ship's six cards in reading order, what it all travels in,
  then what to check before sending;
  Who does what's two lists; the customs section's three routes, the rates, what catches people
  out, then the way to ask), each rising 1rem on a 70ms stagger, when the section's top is 30% up the viewport, since
  a band as tall as Who does what (the pickups and the carriers follow its lists) would leave its
  head on screen and unseen waiting for 30% of it to show.
  A section the reader is already on as the page comes up is not revealed at all (a link to
  something in it, such as the order flow's packing guide at `#packing`, or a reload scrolled to
  it or past it): the server painted it standing, so it stands (`alreadyThere`,
  `data-revealed="instant"`; the journey too). And the page lands on a fragment at once rather
  than travelling to it from the top: smooth scrolling waits for `html[data-landed]`, which
  `ScrollLanding` sets once the page has loaded, so same-page anchors still travel.
  The closing stub gives each step its screen, white cards straight on the ticket (the ticket is
  their ground, so no stage of their own), their column's width, fading out at the foot over their
  empty end on an eased mask (`.scene-fade`, square at the foot, since a dissolving edge has no
  corner to round): the order flow's own three screens, drawn by its own components, shown and
  inert and on the app's neutrals so the picture can't drift from the product (Check Rate's lead
  rate card, the Eligibility Check's first question answered, the Booking Summary's head). Three in a row from `lg`, a row each beside its words on a tablet, the house scroll
  strip on a phone.
  Each **builds once** when 40% in view (a hero rises from the crop, rows lift in reading order,
  fields type, values rise, a pressed answer's fill comes up under its one label, `jr-press` and `jr-ink`), then stands still: no loop, no player, no control,
  because none runs past about three seconds. The closing stub's three build as one set, 150ms
  apart, when the stub comes into view, so on a phone the slide peeking from the strip is
  already built.
  Scenes are `aria-hidden`; the section's words carry the meaning. Each scene names its compact
  container query, where the gutter tightens and its type stays at 10px or more. Under reduced
  motion, and without script, every scene stands built.

**The hover scale.** Every microinteraction that *moves* something under a mouse answers on one
clock, so the page feels made by one hand: arriving `--dur-hover` (300ms), leaving
`--dur-hover-out` (240ms), anything trailing the pointer `--dur-follow` (450ms), all on
`--ease-hover` (`cubic-bezier(0.23, 1, 0.32, 1)`, a strong ease-out: a move starts at speed and
settles soft). Today: the hero's door arrow (`DoorButton` reads the tokens), the photo pile's
fan and swaps, the pickup slices, the review cards, What you can ship's cards (`.ship-card`: the
drawing lifts 4px off its ground and the ground under it draws in to 0.88; a card opened beside
the open one slides the caret across on `--dur-follow`), the WhatsApp phone's and the pricing calculator's cards
(`SceneStage glint`, after x.ai's product cards: the scene leans in to 1.02 and one glint of light
crosses the card, on the way in only; the lean on `--dur-hover`/`--dur-hover-out`, the glint, which
crosses rather than settles, on `--dur-follow`). The curve also carries two answers to a click:
the disclosure open (its duration its own, from the content's height) and the journey's stage
when a step is chosen by hand (`--dur-hover-out`). A new one joins the scale, never its own numbers. Colour-only hovers keep the system's 0.2s; entrances,
builds and the journey keep their own, longer, timing, because they are read, not answered.

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
- **md** — the workhorse: inputs, buttons, 40px icon tiles, popover panels, and compact utility
  cards that can't afford `lg` clearance (they opt *down* explicitly).
- **lg** — the soft tier: **cards** (the `Card` default), dialogs, sheets, the mobile nav, media
  frames (article covers), and marketing cards. The big corner costs clearance — see the
  Clearance Rule's vertical-padding contract below.
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

**The Clearance Rule.** A corner's curve sweeps its radius deep into the box, so square-edged
content needs **vertical padding at least the radius** or it crowds the corners — a 28px `lg` card
wants `pt-7` (28px) above a heading and `pb-7` below a table. The exception is a **concentric
edge**: an element that echoes the curve may sit at standard padding (`py-5 → sm:py-6`) because
its own roundness clears the sweep. Concretely: the top edge is exempt when its first element is a
pill, badge, or circle (avatar chip, count pill, segmented control); the bottom edge is exempt when
its last element is a button. One exempt edge does not exempt the other — a card opening with a
heading and closing with a button runs `pt-7 … pb-5 sm:pb-6`. When a compact box can't afford
clearance at all, the radius steps down to meet the padding instead (a `p-4` utility card is
`rounded-md`, not `rounded-lg`); never leave a big curve sweeping into a tight box.

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
One written-down adjustment, not a sixth variant: on the expat hero, the secondary beside the
lime door ("See how it works") drops the chapter's tinted panel for a transparent fill and an
Ink hairline (hover: Ink at 5%), because next to lime a sky-tinted panel read as a second colour;
in ink it stays neutral and lime stays the one colour in the action row.

### Chips / Badges
- **Style:** full pill, `px-3 py-[0.3125rem]`, Space Grotesk `text-xs font-medium` (The
  Brand-Label Rule), **no border** — the extra 1px of vertical padding buys the stature the
  hairline used to. Status variants follow the Tint-15 Rule; `accent` is the "your move" variant;
  the **brand variant is a solid Soft Lime fill with Ink-on-Lime text**.
- **Count pill:** a compact `rounded-full` Panel-2 chip with Dim-Grey tabular number, shown
  beside group/section headings to declare "how many".
- **Status semantics:** The Whose-Move Rule — a status that *asks something of the customer*
  (quotation pending, Barpin confirm, SPTNP due, a module being filled) speaks Move Purple; a
  hold (expired quotation, NPD, in-revision, blocked) speaks Hold Orange; routine progress speaks
  Info Blue; terminal good news is Go Green, terminal bad news Stop Red. Lime never marks a
  status — it would read as "the answer" an inch from a purple row saying "your move".

### Icons
- **Two weights, two jobs.** Small inline metadata (a 14–16px calendar beside a date, the
  copy glyph, a chevron, the field icons in a form) is **Lucide line**. Anything that sits *in a
  coloured surface* — the icon of an attention banner or strip, a module tile, a timeline
  event dot, the glyph of a stat tile — is **Heroicons solid** (`@heroicons/react/24/solid`),
  a single-colour filled glyph at 18–20px. A solid glyph reads at a glance on a tint where a 2px
  outline dissolves into it; a line glyph stays quiet beside text where a solid one would
  shout. Never duotone.
- The set is swappable: the solid imports are the only coupling, so a licensed set (Central
  filled, say) can replace Heroicons by changing the import line.

### Cards / Containers
- **Corner Style:** `rounded-lg` (28px) — the `Card` default, for functional and marketing cards
  alike. Compact data-dense cards (rate comparison rows, spec strips) opt *down* to `rounded-md`
  explicitly because their padding can't afford the clearance.
- **Background:** Panel 1 (`#fafafa`) on the white canvas, separated by a 1px Hairline border;
  **inside the field** (The Field), Daylight white with a transparent border on the Panel 2
  canvas. Nested strips step to Panel 2 in both.
- **Shadow Strategy:** none — the canvas/plane tone step does the separating.
- **Strips (head / foot):** `CardStrip` — full-bleed to the card's edge, `rounded-t-md` or
  `rounded-b-md` to match, `inset` naming the host's padding — at the tone's 10%, no outline,
  solid glyph at `size-5` in the raw hue, words in the ink (The Attached-Strip Rule). The
  attention state is `AttentionStrip`, always a head; a foot with an `href` is one tap target.
- **Internal Padding:** horizontal `px-5 → sm:px-6` (20–24px); vertical follows the Clearance
  Rule's contract — `pt-7`/`pb-7` (28px) on a square edge, standard `py-5 → sm:py-6` on a
  concentric edge (pill/badge/circle on top, button on the bottom). Data-dense comparison cards
  (the clearance route picker) run one step
  tighter, `p-4 → sm:p-5` (16–20px), so on phones their rhythm stays close to the de-boxed
  record's 16px page inset — and per the Clearance Rule their corner steps down with the padding,
  to `rounded-md` (16px); at `lg` the 28px sweep crowded the carrier logo in the top corner.
  Inside such a card everything shares **one left rail**: a selection control never indents the
  title (the clearance picker's radio sits right of its title for exactly this reason).
- **The expat review card** (`ExpatReviews`, `.review-card`): the band's white plane, as any
  card in a band. The reviewer's avatar is a coin: their own colour (by name, from the page's
  palette, never lime or a status colour), a white rim, and their origin's flag tucked on its
  corner, so the route reads before the words do. Under a mouse it answers the way
  stripe.com's bento cards do: the card paints nothing itself, its white face and a 1px edge
  behind it are layers a few pixels larger than the card, clipped back to its box at rest, and
  both clips open, so the card grows 6px up and down and 5px to the sides with nothing inside it
  scaled or moved; the edge fades up as the band's hairline lit by a soft light of the expat
  colours, sky into magenta, centred where the pointer is and following it a beat behind, so the
  ring glows nearest the hand. On the hover scale (Motion): opening at `--dur-hover`, closing at
  `--dur-hover-out`, the light trailing at `--dur-follow` (Stripe's own run at 800ms and 1s; on
  this page that read slow beside the hero).
  **Two written-down exceptions**: geometry on hover (the face grows, its words stay put), and
  a gradient, kept to a 1px ring under the pointer only, the expat identity's own sweep (as in
  `.nav-expat`). From `sm`, fine pointers only, never under reduced motion.
- **The expat item cards** (`WhatYouCanShip`, after sendmybag.com's "What you can send", in ops'
  outline of three parts). First, one card per kind of thing customers send most (clothes and
  personal items, books, home and kitchen, sports and hobbies, anything else), each a tile on the
  chapter's Panel 3, filled and with no hairline, so it reads off the white desk, with the `lg`
  corner, three across from `lg`, two from `sm`; clothes, what's sent most, takes two columns, so
  no row is left with a hole. Every tile shares that one ground except **anything else**, the one
  that asks rather than tells, set apart on the chapter's wash (its record player is cream and
  black, so nothing in it is lost in the wash); no other tile, the books stat included, gets a
  ground of its own. Every tile shows the things themselves, drawn in the round (`ShipObjects`,
  below), so the bento says "what you can send" at a glance; beside them three say their one thing
  in a picture of its own kind (`ShipTiles`), and none of those sits beside or over another at
  three across or at two: clothes listed in the Packages step's own package
  (the hero, hung off the tile's right edge beside its words from `md`, inset and fading out at
  its foot over the rows still to fill when stacked), the folded clothes, trainers and a cap set
  before it on a stage of their own, past the fade, low enough that no listed row is covered; the
  books' one number (0%, page text at the Display role's top size, not a picture) with the books
  stacked in the corner beside it; and what people
  ask about as white chips, a record player in the corner, which gives way to the chips on a tile
  under 20rem. The two between them stand alone, each one group centred over its words: the home's
  things (the lamp at the back, the pot, the bowls in front over the lamp's base and the pot's
  handle) and the hobby things (an acoustic guitar leaning up to the right, a racket crossed
  behind it, a shuttlecock and a golf ball in front), with no measure drawn on them: the size rule
  is a fact in the card's details. Text in a picture is pinned at 1:1, so a wider tile shows more ground, never larger
  type, and each picture builds once as the grid comes into view, one small beat a tile, 110ms
  apart (`SceneStage`). Then its name at the Title role, then
  one Dim Grey line that says what's in it, held to two lines from `sm` so a row's titles share a
  line. The toggle at the foot names what the details hold ("Weight, packing and duty",
  never "Show more"), with the disclosure's swapped chevron, and the whole card is its hit area.
  The details open under the card's row as one white panel across the grid (dense placement, so
  it lands under the right row at any column count), edged and pointed at its card by a caret in
  the chapter's hue, as is the open card's edge; inside, each fact is a brand label, the rule in a
  few words at the Title role, and why in Body, columns split by hairlines from `md`, so the panel
  reads as a short spec, not a paragraph; it ends on one link (the price check, or WhatsApp with
  the message already written). One card is open at a time; the panel's height moves as the
  disclosure's does, but a card opened beside the open one takes its panel's place at once and the
  caret slides across. On a phone the tiles stack, the picture over the words, rather than
  becoming a strip: each answers a question every visitor has, so none may hide behind a swipe. The two
  parts after the cards each open under a full-width hairline with a sub-head a step under the
  section's (24px, 30px from `sm`). Second, the packing guide (`#packing`, where the order flow
  links): that the customer packs everything, then what it all travels in (suitcases, boxes,
  special packaging): the one rule that prices every piece, then three columns open on the desk, split by
  hairlines from `md` (nothing in them opens, so they are not cards), each set as a fact in the
  cards' details is: its name as the brand label in the chapter's ink, its own rule at the Title
  role ("Double-wall, up to 25 kg"), why in Dim Grey, so no two lines in a column speak at the
  same level; its drawing at 120 × 80, two thirds of
  a card's, since it's what things travel in, not what you send; what a piece packed any other way
  loses (its claim at the declared value) on one line under all three, and furniture's own steps
  closed in the disclosure's **tile** (`Disclosure tile`: Panel 3 like the item tiles, a sofa in a
  white square, the title over one line that says what's inside, the chevron in a white ring), so
  it reads as something to open rather than a line of text; still a `<details>`, so the order
  flow's `#packing-furniture` opens it. Its six steps are numbered in How it works' tiles. Third, what to check before
  sending, a Panel 2 block: what can go once the team has looked (each thing in a 2px warning
  ring, the warning glyph on its head) beside what can't go at all (each struck through by the
  no-entry sign, a 2px Stop Red ring and slash), side by side from `lg`, over the one place that
  asks for a photo or a list. Seven things that can't go read as four and three: down two columns
  on a phone and from `lg`, across four between, never a row with one left over.
- **The customs routes** (`ExpatCustoms`, from ops' import summary, the source of truth for the
  service): the three ways belongings clear Indonesian customs, as three white planes side by
  side on the magenta band from `lg` (stacked below it, never two and one), **set as equals**:
  ops recommends the path at review and the customer decides (docs/adr/0002), so no glyph, colour
  or weight on a card says one path is the better one. Each is built the same way: the path's
  name at the Title role, its Indonesian term on a quiet italic line under it ("Relocation
  goods", *Barang Pindahan*), then the same two facts under a hairline, "For" (who it's for) and
  "Duty and tax" (what it pays), the explanation, the documents needed with a document glyph
  (what we do to help, "We'll send you a template", on a Dim Grey line under the document's
  name), and a note at the foot. Only the words differ. From `lg` the three share their rows
  (`grid-rows-subgrid`), so a "For" that runs to two lines moves the others with it: the duty
  and tax answers, the explanations, the lists and the notes each start on one line. Each card
  carries its own rules as ops wrote them (the timing, what isn't covered, the NPWP), so nothing
  under the cards repeats them. Under them, one Dim Grey line for all three lists, that customs
  may ask for more, then one more white plane for the only route with no exemption: what a
  personal shipment pays, a real table (what's inside, its duty as the one number at the Title
  role, the tax on top), its title and footnote in the left third from `lg`, then one WhatsApp
  link.
- **The bento's things** (`ShipObjects`, on every item tile): the things people send drawn in the
  round, as the doorstep's door is (plain SVG, after a reference: a 3D render of the bento):
  every surface its own gradient lit from the top left, matte, a soft blurred shadow in the
  chapter's ink where each thing meets the floor and a thin one where it rests on another, no
  outline. A round foot stands on a level ellipse; a box (the books, the record player) on its
  own footprint, softened and cast to the right as the doorstep's parcels' are, since a level
  ellipse parts from a side that climbs away. Several things are staged as one group, back to
  front, each over the one behind it, never set apart in a row. Painted and dyed things (the pot's enamel, the denim, a cap, a book's cloth, a guitar's
  top) take the chapter's hue pulled toward its ink (`color-mix`, so they read as paint, not
  plastic); everything else is the colour of the thing: cream ceramic and knit, white leather,
  brass, wood, a black record. Anything with depth is in the doorstep's projection made steeper
  (0.6 up for each one across), so a book's cover or a turntable's deck reads as one; what lies on
  a deck is drawn in plan and sheared onto it. The bento's one lime is the books' ribbon, the
  brand's mark, not a "press this" (The One-Voice Rule); the record's label is the chapter's
  blue. Under a mouse the things lift off their shadows (`.ship-art-lift`, `.ship-art-ground`).
  Decorative: the tile's words carry the meaning.
- **The item drawings** (`ShipArt`, on what it all travels in): flat
  things on one ground line in one 168 × 112 frame, in the chapter's hue in three values, its ink
  in two, its wash (`.ship-art`, all mixed from the chapter) and the doorstep's kraft;
  anything with depth in the doorstep's projection, the far face up and to the right. Each is
  scaled from its measured ink to stand the same height (88 of the frame's 112, or as wide as 160
  for a long thing) and set flush left, its ground as wide as it is, so a row of
  cards matches and every drawing starts where its card's words do. No outline, no gradient, no shadow but the ground's.
  Decorative: the card's words carry the meaning.

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
lands the first line at a different height on every swipe. **One written-down exception:** the
expat reviews, which run from two lines to a customer photo and a page of words, so one shared
height left the short ones with a hollow taller than their quote. There each slide keeps its own
height, top-aligned, so every first line still lands at the same height on every swipe.

**Use it only when the cards are supporting content.** Four "why us" reasons are a good strip: they
reward compactness and nobody has to read all of them. A two-card row offering a *choice* — Back For
Good vs Moving Abroad — stays stacked, because hiding half a decision behind a swipe costs more than
the vertical space it saves.

### Inputs / Fields
- **Style:** `h-11` (2.75rem), `rounded-md`, Panel-2 fill, Hairline border, `text-sm`; labels are
  Dim-Grey `text-xs` above the field; errors in Stop Red below.
- **Under a finger, 16px:** every text field, a picker's search included, sets `text-base` on
  `pointer: coarse`. iOS zooms the page into any field set smaller and never zooms back out;
  the answer is the type size, never `maximum-scale`.
- **Focus:** border shifts to Ink and a `ring-2 ring-foreground/40` appears (no lift).
- **Disabled:** `opacity-50`, `cursor-not-allowed`.

### Navigation (signature)
- **Header capsule:** the header does not sit on a bar — it is a **floating capsule**. A sticky
  wrapper (`px-3 sm:px-6`, `pt-3`) holds a `max-w-6xl`, 60px, `rounded-full` capsule with a
  hairline border, `bg-background/85` (thicker than the reference's /55: display type scrolling
  underneath must stay legible), `backdrop-blur-xl` and `shadow-float`. The page scrolls
  behind it and blurs underneath, so the chrome floats clear of the page edge instead of ruling a
  line across it.
- **Contents:** wordmark left (the dark-ink logo, `rimkirim-logo-dark.png`), nav links center, and
  the language toggle, account/notification controls and the lime CTA right. Small
  icon controls inside the capsule are `rounded-full` to echo its geometry.

**The Two-Registers Rule.** The header is shared chrome for two audiences and it changes register
at login. **Signed out (Persuade):** the lime CTA is "Cek Tarif", visible at every width — on
phones the capsule is the only place a first-timer reaches the calculator without opening the
sheet. **Signed in (Operate):** the sales CTA steps aside and nothing takes its place — the
bell is the door to the customer's shipments, so the capsule carries no "Kiriman Saya" button
(one door, not two); the mobile sheet keeps its link. The account trigger is
the customer's initial in a `size-9` Panel-2 chip (IconPillButton geometry), never an anonymous
silhouette, and the mobile sheet opens its signed-in block with the same identity row. The nav IA
lives once, in `lib/nav-links.ts`, shared by capsule and sheet. Internal tools (the ops simulator)
never sit among customer rows: fenced below a hairline and dressed in ops Info Blue. The nav-expat
gradient keeps its bright stops by deliberate call: it is the brand's one loud voice, and its
vividness outranks the AA contrast number on this single decorative link.
- **Nav links:** `rounded-full`, `px-[18px] py-2`, `font-medium`. Inactive is Readout Grey with a
  faint Panel-2 hover; the **active link is a solid Panel-2 pill** with Ink text and
  `aria-current="page"`.
- **Below `lg` (mobile + tablet):** links collapse into a right slide-over sheet — `bg-background`,
  `rounded-l-lg`, `shadow-overlay`, over a `bg-foreground/25` scrim, with full-pill 48px rows.

**The Contrast-Against-Its-Track Rule.** An active item is always the tonal *opposite* of the
track it sits in, never lime. On a Panel-2 track (segmented control, tabs, language toggle) the
active item is white and lifts with `shadow-float`; inside the translucent white header capsule
the active link is a Panel-2 pill instead. Same principle, inverted fill.

**The expat landing wears its own chrome.** `/expat-relocation` swaps the capsule and the site
footer for `ExpatHeader` / `ExpatFooter` (`isExpatRoute`), after the live rimkirim.com/relocation
page: a plain full-width sticky bar (solid `bg-background`, hairline below, no blur: glass is for
chrome that floats, and through a bar this wide the content only ghosted, a grey slab over the
dusk ticket even at /95) holding the wordmark, a hairline divider and the service
name in the `.nav-expat` gradient, and one lime "Check your rate" that opens the order flow, like
every other rate button on the page. On the landing it waits, hidden and inert, while the hero's
own pair is in view, and arrives (a fade and a 4px rise on the hover curve) once it has scrolled
away, so two limes saying the same thing never show at once; it gives way again to the closing
ticket's button, the page's last ask (`data-door` marks both). Past the mid-page buttons it
stays: a button coming and going all the way down would be its own noise. Inside the flow it gives way to
"Need help?". The page is English only (LanguageProvider
forces the locale on this route, whatever the visitor saved), so neither bar nor footer carries a
language switch. No site menu, no sign-in, no bell: expat orders run in their own flow, not the
account system. The logo stays on the page, so the only door back to the main site is the footer's
two service links (Back For Good, Moving Abroad); the footer also carries contacts and legal.
Under 350px the divider and name drop out, because beside the button they would clip; the hero
eyebrow names the service right below.

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
  "Needs attention" states surface as a banner below the rail — Move Purple when the move is the
  customer's, Hold Orange when the shipment is held — never by recolouring the rail.
- **The phase miniature** (the stepper at list density, on each Kiriman Saya card): seven flat
  segments, one per phase, speaking the same encoding — completed segments lime fenced in Live
  Lime Dim, the **current segment taller and framed in Ink with a lime core**, upcoming ones
  Hairline-Strong-fenced on Panel 2. The fences are load-bearing: bare lime or pale grey pills
  measure ~1.2:1 on daylight and vanish. The bar always pairs with an `sr-only` "Langkah N dari
  7"; it is never the only carrier of journey position.

### Marked text (signature)
- **`.hero-mark`** — the highlighter: Soft Lime fill behind Ink-on-Lime, `0.12em` radius, with
  `box-decoration-break: clone` so the mark survives a line wrap. Reserved for the single hero
  phrase. The expat hero does not use it: its marked phrase is taped on (below).
- **The tape (`TapeMark`, `.tape-strip`)** — the expat hero's marked phrase, so the two landings
  never share a highlight: a strip of Soft Lime packing tape behind each line the phrase wraps
  to, serrated at both ends where it was torn off the roll (a zig-zag mask, teeth 0.16em apart),
  a plastic sheen along its top edge, each strip a degree or so askew (-1.4°, 0.9°, -0.6°) while
  the words stay level, with a sliver of page between one line's tape and the next. The tape is
  what seals every box the page is about. Lines are measured from the phrase's own line boxes
  (re-read on resize), so a strip follows whatever wrap the viewport makes. On load each strip
  is pulled across left to right, one line after the other (Motion, Entrance). Words on the tape
  are Ink-on-Lime, as on the highlighter. Reserved for the expat hero's one phrase.
- **`.card-mark`** — the same highlighter stroke, for the one marked title inside a card rhythm.
  Identical treatment, kept as its own class precisely so `.hero-mark` stays reserved: the hero
  gets one marked phrase per page, a card section gets one marked title per section, and the two
  budgets never borrow from each other. This is how lime reaches a card without becoming its
  surface.
- **`.link-mark`** — inline links: conventional link blue (`--info`, mixed 8% toward black so it
  clears 4.5:1 on `--surface`; 20% inside a band, whose tinted wash would drop it to about 4.1:1)
  with a soft underline that darkens on hover (a mouse's only) and under a press; keyboard focus
  wears the buttons' ink ring as an outline (2px, ink at 60%, 2px off the text). Lime is never used
  to mark a link. On touch, a link that stands alone on its line also wears `.tap-row`, or
  `.tap-target` where the taller row would push its neighbours apart.
- **Tooltip (`InfoTip`)** — an 18px help-circle trigger (muted, 70% → 100% on hover/focus,
  28px hit target on mouse and 44px on touch, `cursor: help`) opening an Ink bubble: white 14px text, 6px radius, small
  arrow, soft shadow, `max-width: 16rem`, above by default and shifted/flipped off the viewport
  edge. Motion 100ms in (lift + 0.95 scale) / 100ms out; opens on hover, focus, and tap.

### The comparison lane (signature)
The expat "Why Rimkirim" table, Rimkirim against the typical options. It stays a real table at
every width from `md`, and Rimkirim is a **lane laid across a ruled sheet**: one continuous card
on the chapter's Panel 2 with the `lg` corner, rising above the header rule and running below the
last row. Panel 2, not the band's wash: the table sits on the desk between two violet bands, and a
wash-coloured lane would run the chapter together into one long violet stretch. On a phone the
table becomes rows read down: the label, the lane's answer on its Panel 2 tile, then "Typical
options:" under it in `muted-2`, under the lane's `tone-ink` head with the wordmark.

- **The head:** `tone-ink` with the white wordmark and the page's "Door to door, by air" in a
  brand badge, the section's one lime mark (lime is at its loudest on violet). Phones keep the
  wordmark only.
- **The cells:** each answer leads with a short headline in the display face, so the lane reads as
  the pitch on its own, then the sentence in the chapter's muted ink. Row hairlines turn white
  inside the lane, so the rows read through it without ruling it.
- **The foot:** "Check your rate" lives at the bottom of the lane from `md`; a phone, whose lane is too
  narrow for the button, keeps it under the table.
- **The typical column** sits plain on the desk, smaller and in `muted-2`, under a note on what it
  summarises. No ticks, no crosses, no names: the lane does the highlighting, not a verdict.
- Under a fine pointer a row lights up across the table in the colour channel (label and headline
  to `tone-ink`, the typical answer to ink), so the eye can follow one aspect across the width.

### The dusk ticket (signature)
The expat landing ends on a ticket, the page's one dark surface. It is `bg-dusk` (`#4a1e67`)
with white words and the `lg` corner, and it sits inside the text column.

- **Above the tear line, the ask:** the closing headline at up to 48px, one line under it in
  `text-dusk-soft`, and the lime "Check your rate", which is at its loudest on dusk.
- **The tear line:** a dashed hairline at white 25%, inset to the text, with a 24px notch punched
  out of each edge where the desk shows through. The notches are white circles, so the ticket
  must sit on the white desk.
- **Below it, the stub:** what happens next, on the step rail in white at 20%, each step with its
  screen above its words (The section scenes, Motion): white cards straight on the dusk, fading
  out at the foot, the chapter's magenta for their accents. On a phone the stub is the house scroll strip,
  so it stays one row tall under the ask.

Dusk is the deep end of the route the page walks from sky through violet to magenta, so
arriving here reads as landing. It is dark because the last ask should not look like one more
section.

**One per landing, and only for the closing ask.** It is not a dark theme and does not license
dark sections. The home landing's ink testimonial hook card is the only other dark surface.

### The offer card (the Check Rate result)
`OfferCard`, after the live rimkirim.com rate card, is the one card both Check Rate pages show:
Back For Good's Cek Tarif (the special rate per tier, and the Advance carrier quotes) and the
expat flow's rates. It is a full `rounded-lg` card at the standard `px-5 → sm:px-6` padding.

- **Left, the service:** the carrier's logo (with Cheapest or Fastest beside it on Advance), the
  service in `muted`, the route as flags and ISO codes ("GB to ID"), then the transit days with
  "clearance process excluded" wrapping as a sentence (the days never break from their unit),
  and the weight band the price holds for.
- **Right, the price:** the price per kg as the card's one big figure (mono, `text-2xl`), the
  total under it, "Starting from … for 21 kg" for a tier or "Estimated … for 30 kg" for the
  weight entered, then "Excludes duties, taxes and surcharges." with the link to the surcharge
  details. The column stops at 21rem, so the excludes line wraps before it crowds the service.
  A phone stacks the two sides.
- **Between the price and the button,** what the card needs: Advance's price breakdown as a fold
  running to the card's edges between two hairlines, or Malaysia's regions table.
- **The foot:** the lime order button across the card ("Lanjut pesan", "Pilih FedEx", "Select
  this rate"), absent when ordering is blocked.
- **A Special Rate** wears a tab on the card's top edge (a pill in Stop Red ink on its 9% tint
  with a `danger/45` hairline, `-top-3.5` at the padding's left) and the `.offer-special` border
  that fades from red at the tab to the hairline (The No-Gradient Rule's fourth exception). The
  red here marks an offer, as on the live page, and nothing else on the card turns red.
- **Stacked** (the landing's small pictures of the card), it stays one column at any width, the
  tab rides the carrier's row and the days share the route's line, so the price clears the
  picture's fade.

### The expat order flow
The order flow under `/expat-relocation` (rates, plan, booking) is the app, not the landing: it
sits on **the field** (`data-field`, Panel 2 under white cards with no outline, The Stroke Rule),
on daylight neutrals, as every order screen does. The landing's chapter tones, bands and dusk
ticket stay on the landing; the flow shares the system's corners, type and buttons, and nothing
else of the landing's dress, so no field or panel takes a chapter's tint. It speaks English only,
like the landing, and keeps the landing's bar, which trades the lime "Check your rate" for a quiet
"Need help?" on WhatsApp, since each screen's own action is its one lime.

- **The plan, one page:** the Eligibility Check, Your details and the Packages are three parts
  down a single sheet, a white card each, one open at a time; there is no stepper and no page
  between them. Each part's head carries a dot in the status stepper's encoding (done is lime
  with an Ink check, the one in hand Ink-framed with a lime core, one still ahead Hairline on
  Panel 2 with its number), its title, and one line under it: what it asks while open or ahead
  (whole, never cut), itself said back once it's folded ("Alex Morgan · +61 412 345 678 · Pickup
  Mon, 16 Nov"), in two lines at most (`line-clamp-2`), the date in its short form so it's the
  last thing to go. A
  finished part folds (the disclosure's height motion) and the next opens under it, brought to
  the top; a folded part reopens from its whole line, marked "Edit" (or "Open", if it's still to
  do); a part whose earlier parts aren't in stands at 60% and doesn't open. Check Rate comes
  before the plan and isn't one of its parts; the way back to it is the quiet Back under them.
- **The plan's one action:** a single lime button runs the page, reading Continue until the last
  part is in, then Confirm application; it waits (Panel fill) while the part in hand is
  incomplete, and one line says why. On a wide screen it sits under the Selected Service,
  sticky beside the parts. On a phone it rides a bar fixed to the foot of the screen
  (`bg-background/95`, hairline above, padded for the home indicator) with the estimate beside
  it, so the price and the way on are always under a thumb; the reason it waits is read at the
  foot of the open part there. An amount is never cut: when the estimate and the button can't
  share the line (a 320px phone, a nine-figure estimate, "Confirm application"), the bar wraps
  and the button takes the line under the estimate, full width.
- **Check Rate:** one white card, Moving from beside Moving to, then the weight and the button
  under a hairline. Fields are the system's Panel 2 inputs.
- **The rate card:** the offer card (below), the same one Back For Good's Cek Tarif shows, with
  "Estimated … for 30 kg" under the price for the charged weight. Every card carries the lime
  "Select this rate" (The One-Voice Rule's one list); on the field the plain cards are white with
  no outline, and a Special Rate wears the red tab and its fading border.
- **Choice cards** (the Eligibility Check): white planes with a hairline that frame in Ink (2px,
  as a doubled hairline) when chosen. A single choice shows the stepper's dot (Ink ring, lime
  core); a multiple choice shows the system checkbox (lime with an Ink tick). Neither fills with
  lime. Follow-ups sit on Panel 2 under the answer that asks them.
- **The address cards** (Your details): where from and where to are two Panel 2 cards side by
  side from sm, each with its country, its Address and its Detail Address once given, and a
  quiet "Change". Change turns the card into its own editor in place: a white plane with a
  hairline (so its Panel 2 fields read), across both columns, holding the Address search
  (inside its country) and the Detail Address, then Cancel and a secondary "Save address"
  (never lime: the page's one lime is the plan's action). Nothing is a page away and nothing
  is kept until Save. Each side's Detail Address is required and no field on the page asks for
  it, so until it's in the card asks: a white "Add detail address" button and a line saying
  what it's for. There is no map and no pin.
- **Notices, not errors:** the packing notice (you pack everything yourself) stands under the
  first question for every customer, so it wears the info tint, as the changed-address notice
  does; ticking furniture only adds to its words and points its link at furniture's own steps.
  Nothing in the flow turns a customer away, so no verdict
  there wears Stop Red (the Special Rate tab is an offer mark, not a verdict). Field errors appear once a field is left, never on every keystroke.
- **The Packages step:** inside the step's white card, each package is a Panel 2 block with no
  outline (`rounded-md`, a notch down from the card, The Step-Down Rule), whose head opens and
  closes it with the swapped chevron and names it in one line while closed. Inside: its
  packaging (Others opens what it's packed in beside it from sm, its examples in the placeholder
  and the hint, as the Eligibility Check's Others does under its answer), the weight and three sides with their units worn in the inputs and one line on what
  it's charged on, and the items as rows between hairlines (de-boxed, so no third tone). There are no
  measurement photos. "Add a package" is the dashed button across the card. The values' currency is
  chosen above the packages, with no hint under it (every value typed in a package wears it as
  its prefix, so it comes first); the totals (packages, chargeable weight, declared value) sit
  under a hairline below; the price never
  repeats there, since the Selected Service beside it carries it. Declared values read as a code
  and an amount ("AUD 300") to match the inputs' prefix. Past three packages the finished ones
  open folded, so a house listed package by package is a screen of lines, not dozens of forms;
  the ones still to fill stay open. A size or weight that reads like the wrong unit (a side over
  3 m, a package over 500 kg) is asked about in the info tint under the measures, never refused.
- **Selected Service:** a white card beside the plan, sticky from lg; on a phone a
  strip over the parts that opens to the rest: the service on a line of its own so its name reads
  whole, then the Special Rate mark and the price under it. Once the packages are measured,
  the weight and estimate are theirs, and the weight says "from your packages". "Change", a
  text link beside the title, opens the rates without leaving the plan: a dialog (the mobile
  sheet on a phone) of Check Rate's own rate cards, hairlined on the dialog's surface. The rate
  in hand is framed in Ink (2px, as a chosen answer is) and marked "Selected" beside its
  carrier, with no button; every other card carries "Select this rate", and picking one closes
  the dialog.
- **The Booking Summary:** a white card with the received head (the success check, who the
  summary went to) over the booking number on a Panel 2 strip with its copy button, then the
  summary as label-and-value rows between hairlines. What happens next, the other answers and
  the documents sit in a side card.
- **The customs block in the flow** reads the landing's own Customs copy, folded into a
  Disclosure: each path's name and the same two facts, as equals, the same for every customer.
  It never reflects their answers (docs/adr/0002).
- **On the landing,** the pictures of the flow render these components inside `.tone-none`,
  which hands the neutrals back inside a chapter, so the picture shows the product as it is.

### De-boxed record (signature)
The read-only counterpart to the card. A long reference record — the order summary, the FAQ — is
**not** a stack of Panel-1 cards; it is one continuous document divided by space and hairlines. Each
section is a display-font **Title** (Ink, 20px `tracking-tight` or 16px on dense records) sitting
directly on the page over a `divide-y` hairline list of label/value rows — no container, no icon
chip. Sections are separated by a generous `space-y-10` (40px); rows inside by a 1px hairline. A
sub-group within a section (Sender / Receiver, Paket N) is a 12px uppercase eyebrow. A repeating,
collapsible sub-group family (the packages) gets a **group head row** first — the family name with
a count pill on the left, the expand/collapse control anchored right on the same line, mirroring
the order form's packages header — so the one control that acts on the whole family never floats
in a ledger row of its own.

**The Label-Ramp Rule.** Once the card is gone, the eyebrow is the only grouping cue, so the label
tiers step in darkness, not size: section title **Ink** → sub-group eyebrow **Readout Grey** → row
label **Dim Grey**, with the value in Ink and one step larger than its label. Same-colour parent and
child labels read as one flat list.

**The De-Box Rule.** Reach for a card when content is a *grouped, liftable unit* (a rate option, a
choice). Reach for a de-boxed record when content is a *long read you scan* — cards there just add
walls the eye has to climb. Never nest a card inside the record.

### Line-item table
Tabular data (the items inside a package) is a real semantic **`<table>`** — never a set of
per-row `grid` divs. It ships in two dressings, chosen by the surface it sits in:
- **Fenced** (standalone contexts — the article table): a **4px** (`rounded-[4px]`)
  hairline-fenced container. The fence stays near-square: a data grid is made of sharp rows and
  right angles, and any card-scale radius around it reads as a soft box fighting its own contents;
  4px only keeps the hairline from cracking at the corner. The header sits on Panel 2 with 12px
  uppercase Dim-Grey labels; a Panel-2 `tfoot` carries the total.
- **De-boxed** (inside a hairline ledger — the order record's items table): no fence, no Panel-2
  fills; the table speaks the surrounding ledger's language — a plain `border-t` opens it, 12px
  Dim-Grey headers, hairline-separated rows, a hairline `tfoot`. A fence inside a de-boxed record
  would nest a box in the record (the De-Box Rule).
In both dressings the description column flexes and wraps while every **numeric column is
right-aligned, Mono `tabular-nums`, and `whitespace-nowrap`** so a currency figure never breaks
mid-number, and the total aligns under its column.

**The Real-Table Rule.** Columns must align across header, body, and footer — which independent
per-row grids cannot guarantee, because each row sizes its own tracks and they drift apart the moment
a number grows. If it has columns that must line up, it is a `<table>`.

### Toast
Sonner with **`richColors`** and `theme="light"`, mounted once (`components/ui/toaster.tsx`),
`position="top-center"`. Each type (success / error / warning / info) renders on Sonner's own
richColors pastel (tinted background + border + hued text); the plain `toast()` stays neutral
white. The toast is the **only** status surface that uses Sonner's stock pastels — every in-app
status surface (badges, banners, panels) keeps the token tint system (15% chips, 10% banners,
no border — The Tint-15 Rule). The two stay in one palette because the status tokens ARE the
richColors text hues, with the one deliberate divergence that warning is Hold Orange, not
Sonner's amber.
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
  text contrast in the one theme. A dark surface is not a theme: there are exactly two, the
  testimonial hook card and the expat dusk ticket, each once on its page.
- **Don't** let a landing's sections run together on hairlines and near-white tints; alternate
  the open desk with bands (The Band Rule).
- **Don't** let Move Purple compete with Live Lime for "the answer"; purple says *whose move*,
  lime says *press here*. A purple button, or a lime banner, is a category error.
- **Don't** float an attention notice as its own card above the card it explains — attach it as
  that card's head, and let the sentence be the headline (The Attached-Strip Rule).
- **Don't** outline a chip, banner, strip, or tint box. A stroke means "you can act on this";
  spend it on inputs and secondary buttons (The Stroke Rule).
- **Don't** put a line icon inside a coloured surface, or a solid one beside inline metadata —
  the two weights have two jobs (Icons).
- **Don't** wrap a long read-only record in a stack of cards, or rebuild a data table from per-row
  `grid` divs — use a de-boxed hairline record and a real `<table>` (The De-Box / Real-Table Rules).
