# Expat Relocation order flow: handoff

A working prototype of the epic *Revamp of the Expat Relocation Customer Web Experience*, built on dummy data with no backend. This page tells dev what is real, what is a stand-in to replace, and where the prototype departs from the epic. Terms follow [CONTEXT.md](../CONTEXT.md); the two architecture decisions are [ADR 0001](adr/0001-expat-order-flow-apart-from-pesan.md) and [ADR 0002](adr/0002-customs-path-recommended-by-ops.md).

To see the open questions in context, add `?review=1` to any page of the flow.

## The flow

| Step | Route | Component |
| --- | --- | --- |
| Check Rate + Select Rate | `/expat-relocation/rates` | `components/expat-order/RatesView.tsx` |
| Eligibility Check | `/expat-relocation/plan` | `PlanView.tsx` → `EligibilityStep.tsx` |
| Personal Information | `/expat-relocation/plan?step=details` | `PlanView.tsx` → `DetailsStep.tsx` |
| Booking Summary | `/expat-relocation/booking/[number]` | `BookingView.tsx` |
| Internal ticket + email preview | `/simulator`, tab "Pesanan expat" | `components/tracking/ExpatBookingsTab.tsx` |

The draft lives in `lib/store/useExpatOrderStore.ts` (localStorage key `rimkirim:expat-order`) and survives reloads until it's submitted. Arriving at `/plan` without a Selected Rate sends the customer back to Check Rate; arriving at the details with questions unanswered sends them back to the questions. Changing the origin country or the weight clears the Selected Rate; changing either Address clears that side's Detail Address and pin, with a notice.

## Stand-ins to replace

| What | Prototype | Replace with | Where |
| --- | --- | --- | --- |
| Rates | Special Rate from the existing import table; Normal Rates are invented FedEx/UPS services, banded by weight and always dearer per kg than the Special Rate | the rate API | `lib/pricing/expat-rates.ts` |
| Weight rounding | rounded up to the next whole kg before pricing | the real rule | `chargedWeight()` in `expat-rates.ts` |
| Address search | a few seeded places per country; any other country answers with the typed city and two streets. A place without a postal code is refused, as on the live page | Google Places (as live) | `lib/data/expat-places.ts` |
| Map pin | a drawn map with dummy coordinates | the real map | `components/expat-order/MapPinDialog.tsx` |
| Ticket registration | pushed into localStorage | the internal system's API | `submit()` in `useExpatOrderStore.ts` |
| Confirmation email | previewed in the simulator only | the mail service; the template is email-safe HTML (tables, inline styles) | `components/expat-order/BookingEmail.tsx` |
| Booking number | `RK` + 8 characters, made in the browser | issued by the server | `lib/utils/order-ids.ts` |

## The Customs Category rule (dummy, for ops to confirm)

One pure function, `customsCategory()` in `lib/order/expat-order.ts`, read top down, first match wins:

| # | When | Flag |
| --- | --- | --- |
| 1 | the reason is Others | `personal_shipment` |
| 2 | working or student, no visa | `needs_review` |
| 3 | a visa, but neither a VITAS nor an ITAS | `needs_review` |
| 4 | already in Indonesia, however long | `needs_review` |
| 5 | the rest: working or student, abroad, with a VITAS or ITAS | `eligible_pindahan` |

Q1 (what's shipping), the arrival date and the length of stay never move the flag; ops weighs them. The flag is never rendered to the customer, on the Booking Summary or in the email. It shows only on the internal ticket. At review ops recommends the most favourable Customs Path the documents allow, and the customer decides (ADR 0002).

## Where the prototype departs from the epic

- **Final price.** The epic (section 5) says the final price is set at quotation. The team corrected this: the Quotation is still an estimate, and the final price comes on the Invoice, once the packages reach Rimkirim's warehouse and are measured and weighed again. All copy follows the correction.
- **Required fields.** The epic marks only the two Detail Addresses "(required)". Every Personal Information field is required here, since the email and phone are needed for the confirmation and the follow-up.
- **Pickup Date.** The epic (section 7) opens the calendar three days out. The team moved it to tomorrow; weekends stay closed.
- **Personas (Story 1).** The landing page doesn't frame the work and study personas; they appear only as the reason in Q4. Decided by the team with the PM.
- **Passenger Goods.** The epic puts it out of scope. The service covers it, so the landing and the flow explain all three Customs Paths equally, with no choice for the customer (decided with the PM).

## Taken from the live flow (rimkirim.com/relocation)

Not named in the epic, kept because the live flow has them: the Address autocomplete that insists on a postal code, the Selected Service panel beside the plan (read only: the team dropped its "Change rate" link, and the origin card in Personal Information has no "Change" either, so the origin changes on Check Rate only), the surcharge details dialog, and the wording "excludes duties, taxes, and surcharges".

## Copy

All flow copy is in `lib/i18n/messages.ts` under `expatOrder`. The page is English only, like the landing, but the Indonesian keeps the same shape (the `Messages` type enforces it). The epic's question wording is kept verbatim, with one change: Q1's subtext says "an accurate estimate" where the epic says "quote", since the figure is an Estimate (CONTEXT.md). Helper lines (the VITAS and ITAS hints, the Q4 subtext, the Pickup Date hint) are content additions. The customs block inside the flow reads the landing's own `expat.customs` copy, so the two can't disagree.

## The landing page

Every "Check your rate" (`EXPAT_QUOTE_URL` in `lib/data/expat.ts`) opens Check Rate. The landing's pictures of the flow (the closing ticket's three steps, How it works step 01) render the flow's own components (`RateCard`, `CheckCards`, `BookingHead`) inert, with dummy data and on the app's neutrals (`.tone-none`), so a change to the flow shows on the landing too.
