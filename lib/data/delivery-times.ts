/**
 * How long a shipment to Indonesia takes, as OPS set it out in their ETA
 * infographic ("How long will my shipment to Indonesia take?", shared
 * 2026-11-17): international transit 4–8 days, customs clearance 4–10
 * working days, then domestic delivery by region, the three added up. It
 * covers shipments from Europe, Australia and New Zealand, the Americas and
 * six Asian countries. Both "How long" answers (/faq's Back For Good tab and
 * the expat page) quote it; the regions live here so a change from OPS is
 * made once.
 */

interface Txt {
  id: string;
  en: string;
}

/**
 * Domestic delivery after clearance, by region. Days, not working days: the
 * infographic keeps "working days" for clearance alone. Fastest first, which
 * also puts the commonest destinations on top (the infographic's own order
 * is Jabodetabek, Jawa, Sumatera, Kalimantan, Sulawesi, Papua & Maluku,
 * Bali, Nusa Tenggara). "Jawa" there means Java outside Jabodetabek
 * (confirmed 2026-11-17), so the label says so.
 */
const DOMESTIC: { region: Txt; min: number; max: number }[] = [
  { region: { id: "Jabodetabek", en: "Greater Jakarta (Jabodetabek)" }, min: 2, max: 4 },
  { region: { id: "Jawa (di luar Jabodetabek)", en: "Rest of Java" }, min: 4, max: 5 },
  { region: { id: "Bali", en: "Bali" }, min: 5, max: 7 },
  { region: { id: "Sumatera", en: "Sumatra" }, min: 7, max: 8 },
  { region: { id: "Sulawesi", en: "Sulawesi" }, min: 12, max: 13 },
  { region: { id: "Kalimantan", en: "Kalimantan" }, min: 13, max: 14 },
  { region: { id: "Nusa Tenggara", en: "Nusa Tenggara" }, min: 13, max: 14 },
  { region: { id: "Papua dan Maluku", en: "Papua and Maluku" }, min: 19, max: 20 },
];

/** the regions as an answer's table rows, both languages */
export const DOMESTIC_DELIVERY_ROWS: { label: Txt; value: Txt }[] = DOMESTIC.map((r) => ({
  label: r.region,
  value: { id: `${r.min}–${r.max} hari`, en: `${r.min}–${r.max} days` },
}));
