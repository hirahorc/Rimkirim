# 004 — Slide the segmented-control pill instead of teleporting it

- **Status**: TODO (optional — lowest leverage of the four; skip guilt-free)
- **Commit**: 7747f34
- **Severity**: LOW
- **Category**: Physicality / spatial consistency
- **Estimated scope**: 3 files (1 new hook + 2 components), ~60 lines

## Problem

The segmented controls (calculator's Back For Good / Moving Abroad and Base /
Advance toggles; the pill variant of Tabs) mark the active segment with a lifted
pill (`bg-background` + `shadow-float`) applied per-item. On change, the pill
*teleports*: it crossfades out of one segment and into another with no travel, so
the control loses the spatial story of one thumb sliding along a track.

```tsx
/* components/ui/toggle-group.tsx:31-39 — current SegmentedItem (excerpt) */
    className={cn(
      "tap-row flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all",
      "text-muted hover:text-foreground",
      // the selected segment lifts off the track instead of filling with lime:
      // on daylight a full lime pill is far too much area for a mere state
      "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:font-semibold data-[state=on]:shadow-float",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
```

```tsx
/* components/ui/tabs.tsx:47 — current pill TabsTrigger active styles (excerpt) */
"… data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-float"
```

## Target

One absolutely-positioned indicator pill per track (childless, out of flow — its
`width` animation costs no sibling layout), positioned by CSS vars the track
measures onto itself. Motion: `transition: transform, width` at **200ms** on the
Tailwind default easing `cubic-bezier(0.4, 0, 0.2, 1)` (the system easing —
`components/ui/disclosure.tsx:19` names the same curve), gated `motion-safe`.
Under reduced motion the indicator jumps instantly — exactly today's behavior.
Text/font state styles stay on the items; only `bg-background` + `shadow-float`
move to the indicator.

## Repo conventions to follow

- Shared UI primitives live flat in `components/ui/` (`disclosure.tsx`,
  `route-arrow.tsx`) — the new hook goes there too.
- The system easing is Tailwind's default `ease` (`cubic-bezier(0.4, 0, 0.2, 1)`);
  do not introduce a new token.
- `motion-safe:` gating with today's behavior as the reduced-motion fallback: see
  `TestimonialSection.tsx` rating-link arrow.

## Steps

1. Create `components/ui/use-segmented-indicator.ts`:

   ```tsx
   "use client";

   import * as React from "react";

   /**
    * Positions a segmented track's sliding indicator: measures the active item
    * (Radix: [data-state="on"] in toggle groups, [data-state="active"] in tabs)
    * and mirrors its box onto CSS vars on the track (--seg-x, --seg-w). The
    * first measure runs in a layout effect, before paint, so mount never
    * animates; state flips re-measure via MutationObserver and size changes via
    * ResizeObserver. With no active item the width collapses to 0 (hidden).
    */
   export function useSegmentedIndicator<T extends HTMLElement>(
     activeSelector: string,
   ) {
     const ref = React.useRef<T>(null);

     React.useLayoutEffect(() => {
       const root = ref.current;
       if (!root) return;
       const measure = () => {
         const active = root.querySelector<HTMLElement>(activeSelector);
         if (!active) {
           root.style.setProperty("--seg-w", "0px");
           return;
         }
         root.style.setProperty("--seg-x", `${active.offsetLeft}px`);
         root.style.setProperty("--seg-w", `${active.offsetWidth}px`);
       };
       measure();
       const mo = new MutationObserver(measure);
       mo.observe(root, { subtree: true, attributeFilter: ["data-state"] });
       const ro = new ResizeObserver(measure);
       ro.observe(root);
       for (const child of Array.from(root.children)) ro.observe(child);
       return () => {
         mo.disconnect();
         ro.disconnect();
       };
     }, [activeSelector]);

     return ref;
   }
   ```

2. `components/ui/toggle-group.tsx` — rework `SegmentedRoot`:
   - `import { useSegmentedIndicator } from "./use-segmented-indicator";`
   - Call `const ref = useSegmentedIndicator<HTMLDivElement>('[data-state="on"]');`
     inside the component and merge it with the forwarded ref (use a small
     callback ref that assigns both, or switch the component to use the hook's ref
     when no ref is forwarded — nothing in the repo currently forwards a ref to
     `SegmentedRoot`; verify with grep and, if so, pass `ref={ref}` directly and
     drop `forwardRef` is NOT allowed — keep `forwardRef`, merge refs).
   - Add `relative` to the root className (the indicator and `offsetLeft` both
     resolve against it).
   - Render the indicator as the **first child**, before `{props.children}` — being
     first and absolute keeps item text painting above it without z-index:

   ```tsx
   <span
     aria-hidden
     className="pointer-events-none absolute inset-y-1 left-0 rounded-full bg-background shadow-float motion-safe:transition-[transform,width] motion-safe:duration-200"
     style={{
       width: "var(--seg-w, 0px)",
       transform: "translateX(var(--seg-x, 0px))",
     }}
   />
   ```

   (Note: Radix `ToggleGroupPrimitive.Root` renders its children normally — the
   `className`/`children` pass-through already in place keeps working. Insert the
   indicator inside the Root, before `{children}` — this requires destructuring
   `children` out of props.)
   - On `SegmentedItem`, delete `data-[state=on]:bg-background` and
     `data-[state=on]:shadow-float`; keep `data-[state=on]:text-foreground` and
     `data-[state=on]:font-semibold` and everything else.

3. `components/ui/tabs.tsx` — same treatment for the **pill variant only**:
   - In `TabsList`, when `variant === "pill"`: add `relative` to the className,
     call `useSegmentedIndicator<HTMLDivElement>('[data-state="active"]')`, merge
     the ref, and render the identical indicator `<span>` first. The underline
     variant is untouched (its darkened rule segment is a color change and stays).
   - In `TabsTrigger` pill classes, delete `data-[state=active]:bg-background` and
     `data-[state=active]:shadow-float`; keep the text/font state styles.

4. `DESIGN.md` → Motion: after the disclosure-open bullet, add one line:

   > **The segmented thumb** slides between segments (`transform`/`width`, 200ms,
   > system easing) — the state's spatial story, not decoration; it jumps
   > instantly under reduced motion.

   Do NOT edit `.impeccable/design.json` — report it stale instead.

## Boundaries

- Do NOT touch the underline Tabs variant, `LanguageToggle`, nav links, or any
  call site of these components.
- Do NOT change Radix behavior props (`type`, roving focus) or any text styles.
- Do NOT add dependencies; no new easing/duration tokens.
- If `SegmentedRoot`/`TabsList` don't match the excerpts (drift since 7747f34),
  STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` → clean. `npm run build` → succeeds.
- **Feel check** (dev server, landing calculator):
  - Toggle Base ↔ Advance: the pill *travels* between segments in ~200ms; it must
    arrive exactly under the label with no overshoot and no visible resize lag.
  - Click rapidly back and forth: the pill retargets mid-flight (CSS transitions
    retarget; keyframes would restart — confirm it never snaps to an endpoint).
  - Resize the window across the `sm` breakpoint: the pill stays glued to the
    active label (ResizeObserver re-measure).
  - First paint (hard reload): the pill is already in place — no slide-in from 0.
  - Arrow-key through the group (Radix roving focus) and confirm selection changes
    still move the pill.
  - DevTools → Rendering → `prefers-reduced-motion: reduce`: the pill jumps with
    no travel.
- **Done when**: the pill slides on both segmented controls and pill tabs, mount
  and reduced-motion never animate, and `tsc`/build pass.
