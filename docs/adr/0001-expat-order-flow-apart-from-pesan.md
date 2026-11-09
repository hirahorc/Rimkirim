# The Expat Relocation order flow lives apart from `/pesan`

Expat Relocation gets its own order flow under `/expat-relocation` (rates, plan, booking) with its own store, rather than a third service inside the Back For Good flow at `/cek-tarif` and `/pesan`. The two flows disagree at their core: Back For Good's questionnaire can rule a customer ineligible and then asks them to choose a clearance path, while the expat flow never turns anyone away and never shows or asks for a Customs Path; it also ends at a Booking Summary instead of a module hub. Grafting it onto `/pesan` would mean an `if expat` at every step. What the two share stays shared: the pure pricing, country and dial-code modules in `lib/`, and the UI primitives.

## Consequences

Two order flows exist side by side and will drift unless shared rules (chargeable weight, special-rate lookup) stay in `lib/` and are called from both.
