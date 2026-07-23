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
  // ---- Tier-2 focus markets (priority) ----
  { code: "AU", name: "Australia", zone: "OCEANIA", priority: true },
  { code: "NL", name: "Netherlands", zone: "EUROPE", priority: true },
  { code: "DE", name: "Germany", zone: "EUROPE", priority: true },
  { code: "FR", name: "France", zone: "EUROPE", priority: true },
  { code: "JP", name: "Japan", zone: "EAST_ASIA", priority: true },

  // ---- ASEAN / SE Asia ----
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

  // ---- East Asia ----
  { code: "CN", name: "China", zone: "EAST_ASIA" },
  { code: "HK", name: "Hong Kong", zone: "EAST_ASIA" },
  { code: "MO", name: "Macau", zone: "EAST_ASIA" },
  { code: "TW", name: "Taiwan", zone: "EAST_ASIA" },
  { code: "KR", name: "South Korea", zone: "EAST_ASIA" },
  { code: "KP", name: "North Korea", zone: "EAST_ASIA" },
  { code: "MN", name: "Mongolia", zone: "EAST_ASIA" },

  // ---- South & Central Asia ----
  { code: "IN", name: "India", zone: "SOUTH_ASIA" },
  { code: "PK", name: "Pakistan", zone: "SOUTH_ASIA" },
  { code: "BD", name: "Bangladesh", zone: "SOUTH_ASIA" },
  { code: "LK", name: "Sri Lanka", zone: "SOUTH_ASIA" },
  { code: "NP", name: "Nepal", zone: "SOUTH_ASIA" },
  { code: "BT", name: "Bhutan", zone: "SOUTH_ASIA" },
  { code: "MV", name: "Maldives", zone: "SOUTH_ASIA" },
  { code: "AF", name: "Afghanistan", zone: "SOUTH_ASIA" },
  { code: "KZ", name: "Kazakhstan", zone: "SOUTH_ASIA" },
  { code: "UZ", name: "Uzbekistan", zone: "SOUTH_ASIA" },
  { code: "TM", name: "Turkmenistan", zone: "SOUTH_ASIA" },
  { code: "KG", name: "Kyrgyzstan", zone: "SOUTH_ASIA" },
  { code: "TJ", name: "Tajikistan", zone: "SOUTH_ASIA" },

  // ---- Oceania ----
  { code: "NZ", name: "New Zealand", zone: "OCEANIA" },
  { code: "FJ", name: "Fiji", zone: "OCEANIA" },
  { code: "PG", name: "Papua New Guinea", zone: "OCEANIA" },
  { code: "SB", name: "Solomon Islands", zone: "OCEANIA" },
  { code: "VU", name: "Vanuatu", zone: "OCEANIA" },
  { code: "NC", name: "New Caledonia", zone: "OCEANIA" },
  { code: "PF", name: "French Polynesia", zone: "OCEANIA" },
  { code: "WS", name: "Samoa", zone: "OCEANIA" },
  { code: "TO", name: "Tonga", zone: "OCEANIA" },
  { code: "KI", name: "Kiribati", zone: "OCEANIA" },
  { code: "FM", name: "Micronesia", zone: "OCEANIA" },
  { code: "MH", name: "Marshall Islands", zone: "OCEANIA" },
  { code: "NR", name: "Nauru", zone: "OCEANIA" },
  { code: "PW", name: "Palau", zone: "OCEANIA" },
  { code: "TV", name: "Tuvalu", zone: "OCEANIA" },
  { code: "CK", name: "Cook Islands", zone: "OCEANIA" },
  { code: "GU", name: "Guam", zone: "OCEANIA" },

  // ---- Europe ----
  { code: "GB", name: "United Kingdom", zone: "EUROPE" },
  { code: "IE", name: "Ireland", zone: "EUROPE" },
  { code: "BE", name: "Belgium", zone: "EUROPE" },
  { code: "LU", name: "Luxembourg", zone: "EUROPE" },
  { code: "CH", name: "Switzerland", zone: "EUROPE" },
  { code: "AT", name: "Austria", zone: "EUROPE" },
  { code: "LI", name: "Liechtenstein", zone: "EUROPE" },
  { code: "IT", name: "Italy", zone: "EUROPE" },
  { code: "ES", name: "Spain", zone: "EUROPE" },
  { code: "PT", name: "Portugal", zone: "EUROPE" },
  { code: "AD", name: "Andorra", zone: "EUROPE" },
  { code: "MC", name: "Monaco", zone: "EUROPE" },
  { code: "MT", name: "Malta", zone: "EUROPE" },
  { code: "SM", name: "San Marino", zone: "EUROPE" },
  { code: "VA", name: "Vatican City", zone: "EUROPE" },
  { code: "SE", name: "Sweden", zone: "EUROPE" },
  { code: "NO", name: "Norway", zone: "EUROPE" },
  { code: "DK", name: "Denmark", zone: "EUROPE" },
  { code: "FI", name: "Finland", zone: "EUROPE" },
  { code: "IS", name: "Iceland", zone: "EUROPE" },
  { code: "EE", name: "Estonia", zone: "EUROPE" },
  { code: "LV", name: "Latvia", zone: "EUROPE" },
  { code: "LT", name: "Lithuania", zone: "EUROPE" },
  { code: "PL", name: "Poland", zone: "EUROPE" },
  { code: "CZ", name: "Czechia", zone: "EUROPE" },
  { code: "SK", name: "Slovakia", zone: "EUROPE" },
  { code: "HU", name: "Hungary", zone: "EUROPE" },
  { code: "SI", name: "Slovenia", zone: "EUROPE" },
  { code: "HR", name: "Croatia", zone: "EUROPE" },
  { code: "BA", name: "Bosnia and Herzegovina", zone: "EUROPE" },
  { code: "RS", name: "Serbia", zone: "EUROPE" },
  { code: "ME", name: "Montenegro", zone: "EUROPE" },
  { code: "MK", name: "North Macedonia", zone: "EUROPE" },
  { code: "AL", name: "Albania", zone: "EUROPE" },
  { code: "XK", name: "Kosovo", zone: "EUROPE" },
  { code: "GR", name: "Greece", zone: "EUROPE" },
  { code: "BG", name: "Bulgaria", zone: "EUROPE" },
  { code: "RO", name: "Romania", zone: "EUROPE" },
  { code: "MD", name: "Moldova", zone: "EUROPE" },
  { code: "UA", name: "Ukraine", zone: "EUROPE" },
  { code: "BY", name: "Belarus", zone: "EUROPE" },
  { code: "RU", name: "Russia", zone: "EUROPE" },
  { code: "CY", name: "Cyprus", zone: "EUROPE" },
  { code: "TR", name: "Türkiye", zone: "EUROPE" },
  { code: "GE", name: "Georgia", zone: "EUROPE" },
  { code: "AM", name: "Armenia", zone: "EUROPE" },
  { code: "AZ", name: "Azerbaijan", zone: "EUROPE" },

  // ---- Middle East ----
  { code: "AE", name: "United Arab Emirates", zone: "MIDDLE_EAST" },
  { code: "SA", name: "Saudi Arabia", zone: "MIDDLE_EAST" },
  { code: "QA", name: "Qatar", zone: "MIDDLE_EAST" },
  { code: "KW", name: "Kuwait", zone: "MIDDLE_EAST" },
  { code: "BH", name: "Bahrain", zone: "MIDDLE_EAST" },
  { code: "OM", name: "Oman", zone: "MIDDLE_EAST" },
  { code: "YE", name: "Yemen", zone: "MIDDLE_EAST" },
  { code: "JO", name: "Jordan", zone: "MIDDLE_EAST" },
  { code: "LB", name: "Lebanon", zone: "MIDDLE_EAST" },
  { code: "SY", name: "Syria", zone: "MIDDLE_EAST" },
  { code: "IQ", name: "Iraq", zone: "MIDDLE_EAST" },
  { code: "IR", name: "Iran", zone: "MIDDLE_EAST" },
  { code: "IL", name: "Israel", zone: "MIDDLE_EAST" },
  { code: "PS", name: "Palestine", zone: "MIDDLE_EAST" },

  // ---- North America ----
  { code: "US", name: "United States", zone: "NORTH_AMERICA" },
  { code: "CA", name: "Canada", zone: "NORTH_AMERICA" },
  { code: "MX", name: "Mexico", zone: "NORTH_AMERICA" },

  // ---- Latin America & Caribbean ----
  { code: "GT", name: "Guatemala", zone: "LATIN_AMERICA" },
  { code: "BZ", name: "Belize", zone: "LATIN_AMERICA" },
  { code: "SV", name: "El Salvador", zone: "LATIN_AMERICA" },
  { code: "HN", name: "Honduras", zone: "LATIN_AMERICA" },
  { code: "NI", name: "Nicaragua", zone: "LATIN_AMERICA" },
  { code: "CR", name: "Costa Rica", zone: "LATIN_AMERICA" },
  { code: "PA", name: "Panama", zone: "LATIN_AMERICA" },
  { code: "CU", name: "Cuba", zone: "LATIN_AMERICA" },
  { code: "JM", name: "Jamaica", zone: "LATIN_AMERICA" },
  { code: "HT", name: "Haiti", zone: "LATIN_AMERICA" },
  { code: "DO", name: "Dominican Republic", zone: "LATIN_AMERICA" },
  { code: "PR", name: "Puerto Rico", zone: "LATIN_AMERICA" },
  { code: "TT", name: "Trinidad and Tobago", zone: "LATIN_AMERICA" },
  { code: "BS", name: "Bahamas", zone: "LATIN_AMERICA" },
  { code: "BB", name: "Barbados", zone: "LATIN_AMERICA" },
  { code: "CO", name: "Colombia", zone: "LATIN_AMERICA" },
  { code: "VE", name: "Venezuela", zone: "LATIN_AMERICA" },
  { code: "GY", name: "Guyana", zone: "LATIN_AMERICA" },
  { code: "SR", name: "Suriname", zone: "LATIN_AMERICA" },
  { code: "EC", name: "Ecuador", zone: "LATIN_AMERICA" },
  { code: "PE", name: "Peru", zone: "LATIN_AMERICA" },
  { code: "BR", name: "Brazil", zone: "LATIN_AMERICA" },
  { code: "BO", name: "Bolivia", zone: "LATIN_AMERICA" },
  { code: "PY", name: "Paraguay", zone: "LATIN_AMERICA" },
  { code: "CL", name: "Chile", zone: "LATIN_AMERICA" },
  { code: "AR", name: "Argentina", zone: "LATIN_AMERICA" },
  { code: "UY", name: "Uruguay", zone: "LATIN_AMERICA" },

  // ---- Africa ----
  { code: "EG", name: "Egypt", zone: "AFRICA" },
  { code: "MA", name: "Morocco", zone: "AFRICA" },
  { code: "DZ", name: "Algeria", zone: "AFRICA" },
  { code: "TN", name: "Tunisia", zone: "AFRICA" },
  { code: "LY", name: "Libya", zone: "AFRICA" },
  { code: "SD", name: "Sudan", zone: "AFRICA" },
  { code: "SS", name: "South Sudan", zone: "AFRICA" },
  { code: "ET", name: "Ethiopia", zone: "AFRICA" },
  { code: "ER", name: "Eritrea", zone: "AFRICA" },
  { code: "DJ", name: "Djibouti", zone: "AFRICA" },
  { code: "SO", name: "Somalia", zone: "AFRICA" },
  { code: "KE", name: "Kenya", zone: "AFRICA" },
  { code: "UG", name: "Uganda", zone: "AFRICA" },
  { code: "TZ", name: "Tanzania", zone: "AFRICA" },
  { code: "RW", name: "Rwanda", zone: "AFRICA" },
  { code: "BI", name: "Burundi", zone: "AFRICA" },
  { code: "NG", name: "Nigeria", zone: "AFRICA" },
  { code: "GH", name: "Ghana", zone: "AFRICA" },
  { code: "CI", name: "Côte d'Ivoire", zone: "AFRICA" },
  { code: "SN", name: "Senegal", zone: "AFRICA" },
  { code: "ML", name: "Mali", zone: "AFRICA" },
  { code: "BF", name: "Burkina Faso", zone: "AFRICA" },
  { code: "NE", name: "Niger", zone: "AFRICA" },
  { code: "TD", name: "Chad", zone: "AFRICA" },
  { code: "GN", name: "Guinea", zone: "AFRICA" },
  { code: "BJ", name: "Benin", zone: "AFRICA" },
  { code: "TG", name: "Togo", zone: "AFRICA" },
  { code: "SL", name: "Sierra Leone", zone: "AFRICA" },
  { code: "LR", name: "Liberia", zone: "AFRICA" },
  { code: "GM", name: "Gambia", zone: "AFRICA" },
  { code: "MR", name: "Mauritania", zone: "AFRICA" },
  { code: "CM", name: "Cameroon", zone: "AFRICA" },
  { code: "GA", name: "Gabon", zone: "AFRICA" },
  { code: "CG", name: "Congo", zone: "AFRICA" },
  { code: "CD", name: "DR Congo", zone: "AFRICA" },
  { code: "AO", name: "Angola", zone: "AFRICA" },
  { code: "ZM", name: "Zambia", zone: "AFRICA" },
  { code: "ZW", name: "Zimbabwe", zone: "AFRICA" },
  { code: "MW", name: "Malawi", zone: "AFRICA" },
  { code: "MZ", name: "Mozambique", zone: "AFRICA" },
  { code: "BW", name: "Botswana", zone: "AFRICA" },
  { code: "NA", name: "Namibia", zone: "AFRICA" },
  { code: "ZA", name: "South Africa", zone: "AFRICA" },
  { code: "LS", name: "Lesotho", zone: "AFRICA" },
  { code: "SZ", name: "Eswatini", zone: "AFRICA" },
  { code: "MG", name: "Madagascar", zone: "AFRICA" },
  { code: "MU", name: "Mauritius", zone: "AFRICA" },
  { code: "SC", name: "Seychelles", zone: "AFRICA" },
  { code: "CV", name: "Cape Verde", zone: "AFRICA" },
  { code: "CF", name: "Central African Republic", zone: "AFRICA" },
  { code: "GQ", name: "Equatorial Guinea", zone: "AFRICA" },
  { code: "GW", name: "Guinea-Bissau", zone: "AFRICA" },
  { code: "ST", name: "São Tomé and Príncipe", zone: "AFRICA" },
  { code: "KM", name: "Comoros", zone: "AFRICA" },

  // ---- Additional territories & small states ----
  { code: "AG", name: "Antigua and Barbuda", zone: "LATIN_AMERICA" },
  { code: "DM", name: "Dominica", zone: "LATIN_AMERICA" },
  { code: "GD", name: "Grenada", zone: "LATIN_AMERICA" },
  { code: "KN", name: "Saint Kitts and Nevis", zone: "LATIN_AMERICA" },
  { code: "LC", name: "Saint Lucia", zone: "LATIN_AMERICA" },
  { code: "VC", name: "Saint Vincent and the Grenadines", zone: "LATIN_AMERICA" },
  { code: "AW", name: "Aruba", zone: "LATIN_AMERICA" },
  { code: "CW", name: "Curaçao", zone: "LATIN_AMERICA" },
  { code: "KY", name: "Cayman Islands", zone: "LATIN_AMERICA" },
  { code: "BM", name: "Bermuda", zone: "NORTH_AMERICA" },
  { code: "GL", name: "Greenland", zone: "NORTH_AMERICA" },
  { code: "FO", name: "Faroe Islands", zone: "EUROPE" },
  { code: "GI", name: "Gibraltar", zone: "EUROPE" },
  { code: "JE", name: "Jersey", zone: "EUROPE" },
  { code: "GG", name: "Guernsey", zone: "EUROPE" },
  { code: "IM", name: "Isle of Man", zone: "EUROPE" },
  { code: "AS", name: "American Samoa", zone: "OCEANIA" },
  { code: "WF", name: "Wallis and Futuna", zone: "OCEANIA" },
  { code: "NU", name: "Niue", zone: "OCEANIA" },
  { code: "MP", name: "Northern Mariana Islands", zone: "OCEANIA" },
  { code: "RE", name: "Réunion", zone: "AFRICA" },
  { code: "TC", name: "Turks and Caicos Islands", zone: "LATIN_AMERICA" },
  { code: "VG", name: "British Virgin Islands", zone: "LATIN_AMERICA" },
  { code: "AI", name: "Anguilla", zone: "LATIN_AMERICA" },
  { code: "MS", name: "Montserrat", zone: "LATIN_AMERICA" },
  { code: "SX", name: "Sint Maarten", zone: "LATIN_AMERICA" },
  { code: "FK", name: "Falkland Islands", zone: "LATIN_AMERICA" },
];

/** Everything selectable when the endpoint is NOT locked to Indonesia. */
export const ALL_COUNTRIES: Country[] = [INDONESIA, ...COUNTRIES];

const byCode = new Map(ALL_COUNTRIES.map((c) => [c.code, c]));

export function getCountry(code: string | undefined | null): Country | undefined {
  if (!code) return undefined;
  return byCode.get(code);
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
