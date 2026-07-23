/**
 * Mock 3PL vendors / services used for the Advance-mode comparison cards.
 * Each vendor has a rate multiplier applied to the zone base per-kg rate,
 * plus an ETA modifier (days added/removed vs the zone's baseline ETA).
 *
 * This is placeholder data — a real carrier rate API would replace it.
 */

export interface Vendor {
  id: string;
  carrier: string;
  service: string;
  /** short code, e.g. "IP", "IE" */
  code: string;
  /** multiplier on the zone base per-kg rate */
  rateMultiplier: number;
  /** days added to (or subtracted from) the zone baseline ETA */
  etaModifier: number;
  accent: string; // brand-ish color for the card chip
}

export const VENDORS: Vendor[] = [
  {
    id: "fedex-ip",
    carrier: "FedEx",
    service: "International Priority",
    code: "IP",
    rateMultiplier: 1.28,
    etaModifier: -2,
    accent: "#4d148c",
  },
  {
    id: "fedex-ie",
    carrier: "FedEx",
    service: "International Economy",
    code: "IE",
    rateMultiplier: 1.0,
    etaModifier: 0,
    accent: "#ff6600",
  },
  {
    id: "dhl-exp",
    carrier: "DHL",
    service: "Express Worldwide",
    code: "EW",
    rateMultiplier: 1.22,
    etaModifier: -1,
    accent: "#ffcc00",
  },
  {
    id: "aramex-pr",
    carrier: "Aramex",
    service: "Priority Parcel",
    code: "PP",
    rateMultiplier: 0.92,
    etaModifier: 1,
    accent: "#e10600",
  },
];
