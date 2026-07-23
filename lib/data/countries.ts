/**
 * Country list for the origin/destination selectors.
 * Each country is tagged with a shipping `zone` used by the mock corridor
 * rate table. Flag emoji is derived from the ISO-3166 alpha-2 code.
 *
 * `priority: true` marks Rimkirim's Tier-2 focus markets, floated to the top.
 */

export type Zone =
  | "ASEAN"
  | "EAST_ASIA"
  | "SOUTH_ASIA"
  | "OCEANIA"
  | "EUROPE"
  | "MIDDLE_EAST"
  | "AFRICA"
  | "NORTH_AMERICA"
  | "LATIN_AMERICA";

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  zone: Zone;
  priority?: boolean;
}

export const INDONESIA: Country = { code: "ID", name: "Indonesia", zone: "ASEAN" };

export const COUNTRIES: Country[] = [
  // Tier-2 focus markets
  { code: "AU", name: "Australia", zone: "OCEANIA", priority: true },
  { code: "NL", name: "Netherlands", zone: "EUROPE", priority: true },
  { code: "DE", name: "Germany", zone: "EUROPE", priority: true },
  { code: "FR", name: "France", zone: "EUROPE", priority: true },
  { code: "JP", name: "Japan", zone: "EAST_ASIA", priority: true },

  // ASEAN / SE Asia
  { code: "SG", name: "Singapore", zone: "ASEAN" },
  { code: "MY", name: "Malaysia", zone: "ASEAN" },
  { code: "TH", name: "Thailand", zone: "ASEAN" },
  { code: "VN", name: "Vietnam", zone: "ASEAN" },
  { code: "PH", name: "Philippines", zone: "ASEAN" },
  { code: "BN", name: "Brunei Darussalam", zone: "ASEAN" },
  { code: "KH", name: "Cambodia", zone: "ASEAN" },
  { code: "LA", name: "Laos", zone: "ASEAN" },
  { code: "MM", name: "Myanmar", zone: "ASEAN" },
  { code: "TL", name: "Timor-Leste", zone: "ASEAN" },

  // East Asia
  { code: "CN", name: "China", zone: "EAST_ASIA" },
  { code: "HK", name: "Hong Kong", zone: "EAST_ASIA" },
  { code: "TW", name: "Taiwan", zone: "EAST_ASIA" },
  { code: "KR", name: "South Korea", zone: "EAST_ASIA" },
  { code: "MO", name: "Macau", zone: "EAST_ASIA" },
  { code: "MN", name: "Mongolia", zone: "EAST_ASIA" },

  // South Asia
  { code: "IN", name: "India", zone: "SOUTH_ASIA" },
  { code: "PK", name: "Pakistan", zone: "SOUTH_ASIA" },
  { code: "BD", name: "Bangladesh", zone: "SOUTH_ASIA" },
  { code: "LK", name: "Sri Lanka", zone: "SOUTH_ASIA" },
  { code: "NP", name: "Nepal", zone: "SOUTH_ASIA" },
  { code: "MV", name: "Maldives", zone: "SOUTH_ASIA" },

  // Oceania
  { code: "NZ", name: "New Zealand", zone: "OCEANIA" },
  { code: "FJ", name: "Fiji", zone: "OCEANIA" },
  { code: "PG", name: "Papua New Guinea", zone: "OCEANIA" },

  // Europe
  { code: "GB", name: "United Kingdom", zone: "EUROPE" },
  { code: "IE", name: "Ireland", zone: "EUROPE" },
  { code: "BE", name: "Belgium", zone: "EUROPE" },
  { code: "LU", name: "Luxembourg", zone: "EUROPE" },
  { code: "CH", name: "Switzerland", zone: "EUROPE" },
  { code: "AT", name: "Austria", zone: "EUROPE" },
  { code: "IT", name: "Italy", zone: "EUROPE" },
  { code: "ES", name: "Spain", zone: "EUROPE" },
  { code: "PT", name: "Portugal", zone: "EUROPE" },
  { code: "SE", name: "Sweden", zone: "EUROPE" },
  { code: "NO", name: "Norway", zone: "EUROPE" },
  { code: "DK", name: "Denmark", zone: "EUROPE" },
  { code: "FI", name: "Finland", zone: "EUROPE" },
  { code: "PL", name: "Poland", zone: "EUROPE" },
  { code: "CZ", name: "Czechia", zone: "EUROPE" },
  { code: "HU", name: "Hungary", zone: "EUROPE" },
  { code: "GR", name: "Greece", zone: "EUROPE" },
  { code: "RO", name: "Romania", zone: "EUROPE" },
  { code: "RU", name: "Russia", zone: "EUROPE" },
  { code: "TR", name: "Türkiye", zone: "EUROPE" },
  { code: "UA", name: "Ukraine", zone: "EUROPE" },

  // Middle East
  { code: "AE", name: "United Arab Emirates", zone: "MIDDLE_EAST" },
  { code: "SA", name: "Saudi Arabia", zone: "MIDDLE_EAST" },
  { code: "QA", name: "Qatar", zone: "MIDDLE_EAST" },
  { code: "KW", name: "Kuwait", zone: "MIDDLE_EAST" },
  { code: "BH", name: "Bahrain", zone: "MIDDLE_EAST" },
  { code: "OM", name: "Oman", zone: "MIDDLE_EAST" },
  { code: "JO", name: "Jordan", zone: "MIDDLE_EAST" },
  { code: "IL", name: "Israel", zone: "MIDDLE_EAST" },
  { code: "EG", name: "Egypt", zone: "MIDDLE_EAST" },

  // North America
  { code: "US", name: "United States", zone: "NORTH_AMERICA" },
  { code: "CA", name: "Canada", zone: "NORTH_AMERICA" },
  { code: "MX", name: "Mexico", zone: "NORTH_AMERICA" },

  // Latin America
  { code: "BR", name: "Brazil", zone: "LATIN_AMERICA" },
  { code: "AR", name: "Argentina", zone: "LATIN_AMERICA" },
  { code: "CL", name: "Chile", zone: "LATIN_AMERICA" },
  { code: "CO", name: "Colombia", zone: "LATIN_AMERICA" },
  { code: "PE", name: "Peru", zone: "LATIN_AMERICA" },

  // Africa
  { code: "ZA", name: "South Africa", zone: "AFRICA" },
  { code: "NG", name: "Nigeria", zone: "AFRICA" },
  { code: "KE", name: "Kenya", zone: "AFRICA" },
  { code: "MA", name: "Morocco", zone: "AFRICA" },
  { code: "GH", name: "Ghana", zone: "AFRICA" },
  { code: "TZ", name: "Tanzania", zone: "AFRICA" },
];

/** Everything selectable when the endpoint is NOT locked to Indonesia. */
export const ALL_COUNTRIES: Country[] = [INDONESIA, ...COUNTRIES];

const byCode = new Map(ALL_COUNTRIES.map((c) => [c.code, c]));

export function getCountry(code: string | undefined | null): Country | undefined {
  if (!code) return undefined;
  return byCode.get(code);
}

/** Regional-indicator flag emoji from an ISO alpha-2 code. */
export function flagEmoji(code: string): string {
  if (!code || code.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  const base = "A".charCodeAt(0);
  const chars = code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(A + (c.charCodeAt(0) - base)));
  return chars.join("");
}

export const ZONE_LABEL: Record<Zone, string> = {
  ASEAN: "Asia Tenggara",
  EAST_ASIA: "Asia Timur",
  SOUTH_ASIA: "Asia Selatan",
  OCEANIA: "Oseania",
  EUROPE: "Eropa",
  MIDDLE_EAST: "Timur Tengah",
  AFRICA: "Afrika",
  NORTH_AMERICA: "Amerika Utara",
  LATIN_AMERICA: "Amerika Latin",
};
