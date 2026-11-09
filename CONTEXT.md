# Rimkirim

Rimkirim ships people's personal belongings across borders and takes customs off their hands. This glossary covers the customer-facing web: the services, the rate check and the order flows.

## Services

**Expat Relocation**:
The import service for foreigners relocating to Indonesia to work or study, with its own landing page and its own order flow.
_Avoid_: Relocation (alone), expat moving

**Back For Good**:
The import service for Indonesians coming home for good after working or studying abroad.
_Avoid_: BFG (in copy), returning home

## Check Rate

**Check Rate**:
The first step of an order, where the customer enters where they're moving from, where to, and an estimated weight, and gets an estimated price.
_Avoid_: Calculator, quote (for this step)

**Address**:
The place picked from map suggestions at Check Rate on each side of the move, specific enough to carry a postal code; it's what the rate is priced on, and the Detail Address completes it later.
_Avoid_: City, location, detail address (at Check Rate)

**Special Rate**:
A per-country price per kg, tiered by weight and run by one carrier, that Rimkirim publishes for some countries; when the customer's country has one, it is the rate shown first.
_Avoid_: Promo rate, special price

**Normal Rate**:
A carrier's standard price per kg for the route; the cheapest one is shown first when the country has no Special Rate.
_Avoid_: 3PL rate, regular rate

**Estimate**:
The price shown at Check Rate for the entered weight, and priced again on the Packing List's chargeable weight once every package is measured; the first of two estimates before the Invoice.
_Avoid_: Quote, price (unqualified)

**Quotation**:
The team's estimate of the shipping cost, sent after reviewing a booking and its Packing List; still not the final price, and never a promise on duty or tax, which only customs decides.
_Avoid_: Final price, official price, quote (for the Check Rate figure)

**Packing List**:
The itemised list of what's in each package (items, quantities, values, and each package's packaging, weight and size), given in the flow between the Eligibility Check and Personal Information, that the team reviews before pickup to flag Take Outs and potential duty and tax.
_Avoid_: Item list, inventory, manifest

**Packing Guide**:
Rimkirim's rules for how the customer packs every item, furniture included, based on FedEx's packing guidelines; the customer always packs, Rimkirim never packs or repacks, and a damaged piece not packed to it can't be claimed at its declared value.
_Avoid_: Packing criteria, packing requirements, packing tips

**Take Out**:
An item the customer removes from the shipment before pickup on the team's advice, because it can't be sent or would likely be taxed.
_Avoid_: Removed item, excluded item

**Potential Duty**:
The team's read, from the Packing List, of which items customs is likely to tax; guidance only, since customs alone sets duty and tax.
_Avoid_: Duty estimate, tax quote

**Invoice**:
The final price, issued once the packages reach Rimkirim's warehouse and have been measured and weighed again.
_Avoid_: Final quotation, bill

**Selected Rate**:
The one rate the customer picks at Check Rate, Special or Normal, which the order carries from then on.
_Avoid_: Chosen plan, package

## Eligibility and customs

**Eligibility Check**:
The four questions after Check Rate (what's shipping, where the customer is, their visa, why they're relocating) that route an order to a customs channel without ever turning the customer away.
_Avoid_: Questionnaire, qualification, screening

**Customs Category**:
The provisional internal flag an order carries from its Eligibility Check answers: `eligible_pindahan`, `personal_shipment` or `needs_review`. Never shown to the customer; it's ops' starting point at review, not the Customs Path itself.
_Avoid_: Clearance type, eligibility result, channel (in copy)

**Customs Path**:
One of the three ways Expat Relocation belongings clear Indonesian customs: Relocation Goods, Passenger Goods or Personal Shipment, each with the documents it needs. The web explains all three but never asks the customer to pick; at review ops recommends the most favourable one their documents allow, and the customer decides.
_Avoid_: Clearance option, route (for customs)

**Relocation Goods**:
Used personal belongings that enter Indonesia duty-free as _barang pindahan_, for fresh arrivals on a work or study visa.
_Avoid_: Moving goods, household goods

**Passenger Goods**:
Belongings flown in separately from the traveller, cleared as _barang penumpang_ with a duty-free allowance per person per arrival.
_Avoid_: Unaccompanied baggage, luggage

**Personal Shipment**:
The customs path for belongings that don't qualify as Relocation Goods: cleared as _barang kiriman_, with duty and tax paid in full.
_Avoid_: Regular shipment, courier shipment

## Personal Information

**Detail Address**:
The full street address, pinned on a map, that the customer gives in Personal Information for pickup abroad and delivery in Indonesia.
_Avoid_: Full address, street address

**Arrival Date**:
The day a customer still abroad expects to land in Indonesia, asked in the Eligibility Check; recorded for ops, never a gate.
_Avoid_: Moving date, relocation date

**Pickup Date**:
The weekday, tomorrow at the earliest, when Rimkirim collects the belongings at the origin Detail Address; asked in Personal Information as "When are you planning to relocate".
_Avoid_: Relocation date, moving date, departure date
