# Animation plans

Written by `improve-animations plan` at commit `7747f34` (2026-08-25), from the
`find-animation-opportunities` sweep of the same date. Each plan is self-contained:
an executor needs no other context. Execute with
`improve-animations execute <plan>` or hand a plan file to any agent.

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Collapse the calculator's Advance block](001-calculator-advance-collapse.md) | MEDIUM | DONE (2026-08-25) |
| 002 | [Bring PriceBreakdown onto the disclosure idiom](002-price-breakdown-disclosure-idiom.md) | MEDIUM | DONE (2026-08-25) |
| 003 | [Give every button press feedback](003-button-press-feedback.md) | MEDIUM | DONE (2026-08-25) |
| 004 | [Slide the segmented-control pill](004-segmented-sliding-indicator.md) | LOW | DONE (2026-08-25) |

## Recommended execution order

1. **003** — smallest diff (two class strings + one doctrine line), app-wide lift.
2. **001** — highest-leverage single surface (the landing calculator).
3. **002** — same idiom as 001; doing them together keeps the disclosure story
   consistent across the product.
4. **004** — optional polish; skip freely.

## Dependencies

- None are blocking. 001 and 002 both consume the existing `CollapseHeight`
  (`components/ui/disclosure.tsx`) and do not modify it — they can run in any
  order or in parallel (different files).
- 003 and 004 both add one line to DESIGN.md → Motion; if both run, the two
  doctrine additions coexist (press paragraph after the hover paragraph, segmented
  line after the disclosure bullet). Whoever runs second must not remove the
  first's line.
- Every plan that touches DESIGN.md leaves `.impeccable/design.json` stale on
  purpose; run `/impeccable document` once after the batch to resync the sidecar.
