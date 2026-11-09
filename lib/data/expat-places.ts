/**
 * Mock address suggestions for Check Rate, standing in for the map search
 * the live page runs (Google Places). As there, an Address is only accepted
 * when it carries a postal code: a whole city or area comes back without one,
 * and picking it asks for something more specific. Swap `searchPlaces` for
 * the real autocomplete; callers only read `Place`.
 */

import { getCountry } from "@/lib/data/countries";

export interface Place {
  id: string;
  /** the main line, e.g. "Bennelong Point" */
  label: string;
  /** the rest, e.g. "Sydney NSW 2000, Australia" */
  detail: string;
  /** absent on a whole city or area, which Check Rate can't price on */
  postalCode?: string;
  lat: number;
  lng: number;
}

type Seed = [label: string, detail: string, postalCode: string | undefined, lat: number, lng: number];

/** a handful of real-looking places per country, cities first */
const SEEDS: Record<string, Seed[]> = {
  AU: [
    ["Sydney", "NSW, Australia", undefined, -33.8688, 151.2093],
    ["Bennelong Point", "Sydney NSW 2000, Australia", "2000", -33.8568, 151.2153],
    ["George Street", "Sydney NSW 2000, Australia", "2000", -33.8708, 151.2073],
    ["Melbourne", "VIC, Australia", undefined, -37.8136, 144.9631],
    ["Collins Street", "Melbourne VIC 3000, Australia", "3000", -37.8159, 144.9669],
    ["Queen Street", "Brisbane City QLD 4000, Australia", "4000", -27.4698, 153.0251],
    ["Hay Street", "Perth WA 6000, Australia", "6000", -31.9535, 115.857],
  ],
  NL: [
    ["Amsterdam", "Netherlands", undefined, 52.3676, 4.9041],
    ["Prinsengracht", "1015 Amsterdam, Netherlands", "1015", 52.3752, 4.8836],
    ["Coolsingel", "3011 Rotterdam, Netherlands", "3011", 51.9225, 4.4792],
    ["Lange Voorhout", "2514 Den Haag, Netherlands", "2514", 52.0834, 4.3136],
    ["Oudegracht", "3511 Utrecht, Netherlands", "3511", 52.0907, 5.1214],
  ],
  DE: [
    ["Berlin", "Germany", undefined, 52.52, 13.405],
    ["Friedrichstraße", "10117 Berlin, Germany", "10117", 52.5163, 13.3889],
    ["Maximilianstraße", "80539 München, Germany", "80539", 48.1391, 11.5802],
    ["Zeil", "60313 Frankfurt am Main, Germany", "60313", 50.1143, 8.6825],
    ["Jungfernstieg", "20354 Hamburg, Germany", "20354", 53.5534, 9.9928],
  ],
  FR: [
    ["Paris", "France", undefined, 48.8566, 2.3522],
    ["Rue de Rivoli", "75001 Paris, France", "75001", 48.8606, 2.3376],
    ["Rue de la République", "69002 Lyon, France", "69002", 45.7615, 4.8357],
    ["La Canebière", "13001 Marseille, France", "13001", 43.2976, 5.3812],
  ],
  GB: [
    ["London", "United Kingdom", undefined, 51.5072, -0.1276],
    ["Baker Street", "London NW1 6XE, United Kingdom", "NW1 6XE", 51.5226, -0.1571],
    ["Deansgate", "Manchester M3 2BW, United Kingdom", "M3 2BW", 53.4808, -2.2489],
    ["Princes Street", "Edinburgh EH2 2ER, United Kingdom", "EH2 2ER", 55.9521, -3.1965],
  ],
  US: [
    ["New York", "NY, USA", undefined, 40.7128, -74.006],
    ["Broadway", "New York, NY 10007, USA", "10007", 40.7128, -74.0059],
    ["Market Street", "San Francisco, CA 94103, USA", "94103", 37.7749, -122.4194],
    ["Pike Street", "Seattle, WA 98101, USA", "98101", 47.6097, -122.3331],
    ["Michigan Avenue", "Chicago, IL 60611, USA", "60611", 41.8925, -87.6244],
  ],
  JP: [
    ["Tokyo", "Japan", undefined, 35.6762, 139.6503],
    ["Shibuya", "Shibuya City, Tokyo 150-0002, Japan", "150-0002", 35.6595, 139.7005],
    ["Umeda", "Kita Ward, Osaka 530-0001, Japan", "530-0001", 34.7025, 135.4959],
    ["Shijo Dori", "Shimogyo Ward, Kyoto 600-8001, Japan", "600-8001", 35.0037, 135.7681],
  ],
  SG: [
    ["Singapore", "Singapore", undefined, 1.3521, 103.8198],
    ["Orchard Road", "Singapore 238879", "238879", 1.3048, 103.8318],
    ["Tanjong Pagar Road", "Singapore 088456", "088456", 1.2786, 103.8441],
    ["Holland Village", "Singapore 278967", "278967", 1.3115, 103.7959],
  ],
  KR: [
    ["Seoul", "South Korea", undefined, 37.5665, 126.978],
    ["Gangnam-daero", "Gangnam-gu, Seoul 06236, South Korea", "06236", 37.4979, 127.0276],
    ["Itaewon-ro", "Yongsan-gu, Seoul 04350, South Korea", "04350", 37.5345, 126.9946],
  ],
  CN: [
    ["Shanghai", "China", undefined, 31.2304, 121.4737],
    ["Nanjing Road", "Huangpu, Shanghai 200001, China", "200001", 31.2354, 121.4767],
    ["Chaoyang", "Beijing 100020, China", "100020", 39.9219, 116.4436],
  ],
  MY: [
    ["Kuala Lumpur", "Malaysia", undefined, 3.139, 101.6869],
    ["Jalan Ampang", "50450 Kuala Lumpur, Malaysia", "50450", 3.1579, 101.7123],
    ["Jalan Tun Razak", "50400 Kuala Lumpur, Malaysia", "50400", 3.1615, 101.7192],
  ],
  AE: [
    ["Dubai", "United Arab Emirates", undefined, 25.2048, 55.2708],
    ["Sheikh Zayed Road", "Trade Centre, Dubai 00000, United Arab Emirates", "00000", 25.2285, 55.2867],
  ],
  CA: [
    ["Toronto", "ON, Canada", undefined, 43.6532, -79.3832],
    ["Yonge Street", "Toronto, ON M5B 1R7, Canada", "M5B 1R7", 43.6561, -79.3802],
    ["Robson Street", "Vancouver, BC V6E 1C3, Canada", "V6E 1C3", 49.2856, -123.1259],
  ],
  NZ: [
    ["Auckland", "New Zealand", undefined, -36.8485, 174.7633],
    ["Queen Street", "Auckland 1010, New Zealand", "1010", -36.8485, 174.7652],
    ["Lambton Quay", "Wellington 6011, New Zealand", "6011", -41.2833, 174.7762],
  ],
  ID: [
    ["Jakarta Selatan", "South Jakarta City, Jakarta, Indonesia", undefined, -6.2615, 106.8106],
    ["Jalan Kemang Raya", "Bangka, Mampang Prapatan, Jakarta Selatan 12730, Indonesia", "12730", -6.2607, 106.8136],
    ["Jalan Senopati", "Selong, Kebayoran Baru, Jakarta Selatan 12110, Indonesia", "12110", -6.2297, 106.8099],
    ["Jalan M.H. Thamrin", "Menteng, Jakarta Pusat 10350, Indonesia", "10350", -6.1944, 106.8229],
    ["BSD City", "Tangerang Selatan, Banten 15345, Indonesia", "15345", -6.3017, 106.6524],
    ["Bali", "Indonesia", undefined, -8.4095, 115.1889],
    ["Jalan Raya Canggu", "Canggu, Badung, Bali 80361, Indonesia", "80361", -8.6478, 115.1385],
    ["Jalan Sunset Road", "Kuta, Badung, Bali 80361, Indonesia", "80361", -8.6862, 115.1745],
    ["Jalan Ir. H. Juanda", "Dago, Bandung 40135, Indonesia", "40135", -6.8848, 107.6131],
    ["Jalan Tunjungan", "Genteng, Surabaya 60275, Indonesia", "60275", -7.2595, 112.7397],
  ],
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function toPlace(country: string, [label, detail, postalCode, lat, lng]: Seed): Place {
  return { id: `${country}-${slug(label)}-${slug(postalCode ?? "area")}`, label, detail, postalCode, lat, lng };
}

/** a stable 5-digit dummy postal code from a string */
function dummyPostal(s: string): string {
  let h = 7;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 90000;
  return String(10000 + h);
}

/**
 * Up to five suggestions for what's typed, in `country`. Countries without
 * seeds answer with the typed place as a whole city (no postal code) and two
 * streets in it, so every country can be tried end to end.
 */
export function searchPlaces(country: string, query: string): Place[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const seeds = SEEDS[country];
  if (seeds) {
    return seeds
      .filter(([label, detail]) => `${label} ${detail}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((s) => toPlace(country, s));
  }
  const name = getCountry(country)?.name ?? country;
  const city = query.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  const postal = dummyPostal(`${country}${city}`);
  return [
    toPlace(country, [city, name, undefined, 0, 0]),
    toPlace(country, ["Main Street", `${city} ${postal}, ${name}`, postal, 0, 0]),
    toPlace(country, ["Station Road", `${city} ${dummyPostal(`${postal}s`)}, ${name}`, dummyPostal(`${postal}s`), 0, 0]),
  ];
}

/** the Address as one line, e.g. "Bennelong Point, Sydney NSW 2000, Australia" */
export function placeLine(p: Place): string {
  return `${p.label}, ${p.detail}`;
}
