/**
 * Per-carrier brand accent + short monogram for the `CarrierMark` chip.
 * These are NOT official carrier logos — just a branded monogram tile (initials
 * on the carrier's accent color) to give each carrier a bit of visual identity.
 */
export interface CarrierBrand {
  /** short monogram shown in the tile */
  mark: string;
  /** tile background */
  bg: string;
  /** tile foreground (text) */
  fg: string;
  /** small accent dot color (for compact spots like the modal switcher) */
  dot: string;
}

const BRANDS: Record<string, CarrierBrand> = {
  FedEx: { mark: "FX", bg: "#4d148c", fg: "#ffffff", dot: "#7b2ff7" },
  DHL: { mark: "DHL", bg: "#ffcc00", fg: "#1a1a1a", dot: "#ffcc00" },
  UPS: { mark: "UPS", bg: "#3b2416", fg: "#ffb500", dot: "#ffb500" },
  Aramex: { mark: "AX", bg: "#e10600", fg: "#ffffff", dot: "#e10600" },
};

/** Official carrier logo files (public/carriers) with their intrinsic aspect
 *  ratio (viewBox width ÷ height) — the input to optical-balance sizing: wide
 *  wordmarks render shorter, compact badges taller, so every mark lands at
 *  roughly equal presence. `capScale` lifts Rayspeed's cap-height back to the
 *  group's (its mixed-case ascenders/descenders inflate the box). */
export interface CarrierLogoInfo {
  src: string;
  aspect: number;
  capScale?: number;
}

export const CARRIER_LOGOS: Record<string, CarrierLogoInfo> = {
  DHL: { src: "/carriers/dhl.svg", aspect: 6.92 },
  FedEx: { src: "/carriers/fedex.svg", aspect: 3.36 },
  UPS: { src: "/carriers/ups.svg", aspect: 0.843 },
  Aramex: { src: "/carriers/aramex.svg", aspect: 6.15 },
  "SF Express": { src: "/carriers/sf-express.svg", aspect: 1 },
  "Rayspeed Asia": { src: "/carriers/rayspeed.svg", aspect: 6.92, capScale: 1.27 },
};

export function carrierLogo(carrier: string): CarrierLogoInfo | undefined {
  return CARRIER_LOGOS[carrier];
}

export function carrierBrand(carrier: string): CarrierBrand {
  return (
    BRANDS[carrier] ?? {
      mark: carrier.slice(0, 2).toUpperCase(),
      bg: "#2a2a2a",
      fg: "#ffffff",
      dot: "#8a8a8a",
    }
  );
}
