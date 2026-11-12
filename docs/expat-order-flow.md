# Expat Relocation order flow: handoff

A working prototype of the epic *Revamp of the Expat Relocation Customer Web Experience*, built on dummy data with no backend. This page tells dev what is real, what is a stand-in to replace, and where the prototype departs from the epic. Terms follow [CONTEXT.md](../CONTEXT.md); the two architecture decisions are [ADR 0001](adr/0001-expat-order-flow-apart-from-pesan.md) and [ADR 0002](adr/0002-customs-path-recommended-by-ops.md).

To see the open questions in context, add `?review=1` to any page of the flow.

## The flow

| Step | Route | Component |
| --- | --- | --- |
| Check Rate + Select Rate | `/expat-relocation/rates` | `components/expat-order/RatesView.tsx` |
| The plan: Eligibility Check, Personal Information, Packages | `/expat-relocation/plan` | `PlanView.tsx` → `EligibilityStep.tsx`, `DetailsStep.tsx`, `PackingStep.tsx` |
| Booking Summary | `/expat-relocation/booking/[number]` | `BookingView.tsx` |
| Internal ticket + email preview | `/simulator`, tab "Pesanan expat" | `components/tracking/ExpatBookingsTab.tsx` |

The plan is one page: its three parts stand down a single sheet, one open at a time. A finished part folds to a line that says it back and the next opens under it; any part reopens in place ("Edit"), and a part doesn't open until the ones above it are in. There is no stepper and no step in the URL (an old `?step=` link simply opens the plan). One action runs the page, with the estimate beside it: Continue until the last part is in, then Confirm application. It sits under the Selected Service on a wide screen and on a bar at the foot of a phone. Check Rate comes before the plan and isn't one of its parts; from the plan, the way back to it is Back, under the parts. The service is the one thing of Check Rate's that changes on the plan: "Change" on the Selected Service opens Check Rate's own rates in a dialog (a sheet on a phone), and picking one keeps every answer; the origin country and the weight still change on Check Rate only. The structure was chosen from a prototype of three (the plan as one page, one question per screen, or a checklist in any order); the one page won for keeping the estimate and one action in reach on a phone.

The draft lives in `lib/store/useExpatOrderStore.ts` (localStorage key `rimkirim:expat-order`) and survives reloads until it's submitted. Arriving at `/plan` without a Selected Rate sends the customer back to Check Rate; otherwise the plan opens on the first part still to do (the questions, then Personal Information, then the Packages), wherever the draft had reached. Changing the origin country or the weight clears the Selected Rate; changing a side's Address (on Check Rate, or in its card) clears the pin set for the old one, and from Check Rate its Detail Address too, with a notice on the destination's card, whose detail is required.

## Breaking it with real data

In local development every page of the flow carries a small data toggle (`components/expat-order/dev/`, the break-ui skill): **Demo data**, **Worst case** (the longest values each field accepts, an email that can't wrap, sizes typed in the wrong unit), **Empty**, **One**, and **40 packages**. It swaps the stored draft and its booking, so the screens render the data untouched; `?data=worst` on any flow URL does the same, and **Off** puts your own draft back. It never renders outside development. Keep the worst-case dataset as the check for the next change to these screens.

## Feedback

What the flow says back is in DESIGN.md (The expat order flow, "The plan's one action" and "Feedback"). For dev:

- Toasts are Sonner, through the app's one `<Toaster />`; each call that can fire from an effect carries an `id`, so it's said once. They fire in `PlanView.tsx` (what the action waits on, the plan opened without a rate, a service changed, a failed confirm) and `visit.ts` (answers kept from an earlier visit).
- `visit.ts` keeps two facts for the visit in `sessionStorage`, neither of which the order depends on: that the kept-answers toast was settled, and the booking Confirm application just made (so its Booking Summary draws its check once).
- The plan's action finds what's missing in the DOM: a part marks it with `aria-invalid="true"` (a field) or `data-missing` (an answer group, the date field). A new required thing only needs one of those marks to be counted and focused.
- `pace.ts` holds the flow's deliberate floors (Check rate, Confirm application, the estimate settling after the packages change; DESIGN.md, Motion, Pace). Each is `paced(work, floor)`: the work and the floor run together and the longer wins. Today the work is local, so the floor is the whole wait; when the rates and the booking are requests, pass the request as `work` and leave the floor in.
- **Still to build, once the real services are in** (today the rates and the address suggestions are local and instant, so there's nothing to wait on or fail): a loading state on "Check rate" and on the address search, a failed-request message with a way to try again, "no service for this route", and a failed Confirm application that says what the server said (the toast for it is there; `submit()` can only fail on an incomplete draft today).

## Stand-ins to replace

| What | Prototype | Replace with | Where |
| --- | --- | --- | --- |
| Rates | Special Rate from the existing import table; Normal Rates are invented FedEx/UPS services, banded by weight and always dearer per kg than the Special Rate | the rate API | `lib/pricing/expat-rates.ts` |
| Weight rounding | rounded up to the next whole kg before pricing | the real rule | `chargedWeight()` in `expat-rates.ts` |
| Pricing on the Packages | once every package is measured, the Selected Rate's own service is priced again at the packages' chargeable weight (volumetric L × W × H / 5000, as the WNI flow uses); if that service isn't offered at that weight (a Special Rate below its first tier), the Check Rate estimate stands | the rate API, called with the packages | `packedPricing()` in `lib/order/expat-order.ts` |
| Changing the service on the plan | Check Rate's dummy list again, priced at the weight the estimate follows (the packages' once they're all measured, else the weight checked). The order carries the picked service as Check Rate prices it, at the weight checked, so the packages go on repricing it; a Special Rate that only starts above the weight checked is carried at the packages' weight, and if the packages later fall under its first tier the estimate stands at that weight | the rate API, called with the weight in force | `serviceOptions()`, `checkedRate()` in `lib/order/expat-order.ts`; `ServicePicker.tsx` |
| Size and weight check | a side over 300 cm or a package over 500 kg is asked about ("Sizes are in centimetres…"), never refused; both numbers are placeholders | the carriers' real limits, from ops | `ODD_SIDE_CM`, `ODD_WEIGHT_KG` in `PackingStep.tsx` |
| Input bounds | the weights take 7 characters, a value 12, the email 254, the phone 20; none is a business rule | the most a shipment and a package may weigh, from ops | `RatesView.tsx`, `PackingStep.tsx`, `DetailsStep.tsx` |
| Address search | a few seeded places per country; any other country answers with the typed city and two streets. A place without a postal code is refused, as on the live page | Google Places (as live) | `lib/data/expat-places.ts` |
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

- **Final price.** The epic (section 5) says the final price is set at quotation. The team corrected this: the Quotation is still an estimate, and the final price comes on the Invoice, once the packages reach Rimkirim's warehouse and are measured and weighed again. All copy follows the correction. The flow never offers that weighing as a reason to guess, though: the customer's own measurements are still asked for, as their record (the team's call). So a rough figure is "fine for now" (the weight on Check Rate, a package not packed yet), the details can be updated after the team's review, and the lines about the final price name the invoice only.
- **Detail Addresses, in the cards, and no map pin.** The epic asks for a Detail Address field on both sides, each "(required)", pinned on a map. Personal Information has no such field and no map: each side is a card (where from, where to) with a "Change" that turns the card into its own editor on the same page, holding the Address (searched again, inside its country) and the Detail Address. Both Detail Addresses are optional, the team's call, where the epic marks each "(required)": a card without one offers it ("Add detail address", said to be optional), and the plan goes on without it. The team dropped the pin (the map was a stand-in, and the detail carries the unit and landmarks); a pin on an older draft or booking is ignored. Changing an Address here never moves the rate in the prototype (the rate is priced on the origin country and the weight); if the real rate reads the postal code, an Address changed here must reprice. The origin country itself changes on Check Rate only.
- **Required fields.** The epic marks only the Detail Addresses "(required)". Here it's the other way round: the Detail Addresses are optional (above), and the name, email, phone and Pickup Date are required, since the email and phone are needed for the confirmation and the follow-up.
- **Pickup Date.** The epic (section 7) opens the calendar three days out. The team moved it to tomorrow; weekends stay closed.
- **Packages.** Not in the epic. The team added it as the plan's last part, after Personal Information (it first sat before it), with the fields of the WNI flow's Items & Packages module: the values' currency first (the origin country's until it's changed; it sat under the packages, and the team moved it up, since every value typed in a package wears it), then per package, its packaging (Others asks what it's packed in, as free text), the weight and three sides, and each item's description, quantity and value. Weight, sides, description and quantity are required, and so is what it's packed in when the packaging is Others; values are optional. The module's measurement photos, and its warning on confirming without them, are left out, the team's call. The booking carries it in the shared Packing List shape (`ItemsData` in `lib/types/packing.ts`), and the Booking Summary, the email and the ticket show it. Once it's measured, the Selected Service's weight and estimate are the packages' (see Stand-ins).
- **Changing the service on the plan.** Not in the epic, which has the rate picked once, at Select Rate. The team added "Change" to the Selected Service: it opens every rate for the route (each carrier and service, the Special Rate first, then cheapest first) in Check Rate's own rate card, without leaving the plan, and the rate in hand is marked "Selected". Unlike Select Rate, where the epic shows one rate and keeps the rest behind "See more rates", the list opens whole, since the customer is there to compare. Whether a real rate may be repriced on the packages' weight when the service changes is for ops to confirm (`?review=1` says so in the dialog).
- **Personas (Story 1).** The landing page doesn't frame the work and study personas; they appear only as the reason in Q4. Decided by the team with the PM.
- **Passenger Goods.** The epic puts it out of scope. The service covers it, so the landing and the flow explain all three Customs Paths equally, with no choice for the customer (decided with the PM).

## Taken from the live flow (rimkirim.com/relocation)

Not named in the epic, kept because the live flow has them: the Address autocomplete that insists on a postal code, the Selected Service panel beside the plan (its "Change rate" link, dropped at first, is back as "Change", and opens the rates in place instead of going back to Check Rate; the origin country changes on Check Rate only), the surcharge details dialog, and the wording "excludes duties, taxes, and surcharges".

## Copy

All flow copy is in `lib/i18n/messages.ts` under `expatOrder`. The page is English only, like the landing, but the Indonesian keeps the same shape (the `Messages` type enforces it). The epic's question wording is kept verbatim, with two changes: Q1's subtext says "an accurate estimate" where the epic says "quote", since the figure is an Estimate (CONTEXT.md), and the Pickup Date is labelled "Pickup date" where the epic asks "When are you planning to relocate" (the team's call: the date is the day we collect, not the day of the move). Helper lines (the VITAS and ITAS hints, the Q4 subtext, the Pickup Date hint, and every line of the Packages step beyond its field labels) are content additions. The step was first called Packing List; the team renamed it Packages, since a packing list is the customs document (the Commercial Invoice/Packing List). Its packaging names follow the landing's packing guide (cardboard box, suitcase or bag, plastic or bubble wrap, wooden crate, others) over the WNI flow's values, so the data stays the same shape; Others' examples (golf bag, hard case, ski bag, trunk, instrument case) sit in the placeholder and the hint under the free-text field. The customs block inside the flow reads the landing's own `expat.customs` copy, so the two can't disagree.

## The landing page

Every "Check your rate" (`EXPAT_QUOTE_URL` in `lib/data/expat.ts`) opens Check Rate. The landing's pictures of the flow (the closing ticket's three steps, How it works step 01) render the flow's own components (`RateCard`, `CheckCards`, `BookingHead`) inert, with dummy data and on the app's neutrals (`.tone-none`), so a change to the flow shows on the landing too.
