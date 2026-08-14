/**
 * Real customer reviews pulled from Rimkirim's Google Reviews (aggregate 4.9/5).
 *
 * These are genuine, sourced testimonials — quoted **verbatim**. Do not fix
 * spelling, casing, or punctuation, do not translate them, and do not embellish:
 * the customer's own words (and language) are the evidence. The section chrome is
 * bilingual via i18n; the quotes are not, which is why they live here as data.
 *
 * Every review happens to be an inbound move (overseas → Indonesia), so where the
 * corridor is stated we surface it as a small route chip that ties back to the
 * Back For Good story. `route.label` is the origin as the reviewer named it.
 */
export interface Testimonial {
  name: string;
  rating: number;
  quote: string;
  /** origin of the shipment, when the review names it; destination is Indonesia */
  route?: { code: string; label: string };
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "daelyn",
    rating: 5,
    quote:
      "great service! i received all of my belongings from bristol to jakarta much faster than i expected. everything arrived safely and was intact. i'm very satisfied with the service.",
    route: { code: "GB", label: "Bristol" },
  },
  {
    name: "Elita Nuraeny",
    rating: 5,
    quote:
      "Amazing service! My parcel arrived safely (and quickly!) from Adelaide to Jakarta without hassle. Moving between countries can be a challenging and stressful time, and Rimkirim team is very professional, attentive, and helpful throughout the process. I am grateful for their quick response and attention to details. Highly recommended!",
    route: { code: "AU", label: "Adelaide" },
  },
  {
    name: "Ellisa Ratnasari",
    rating: 5,
    quote:
      "Membantu pengiriman utk back for good secara detail dan end to end dr awal persiapan pengiriman sampai paket dgn selamat sampai di rumah 👍",
  },
  {
    name: "Ratna sari",
    rating: 5,
    quote:
      "Everything was great! Our package arrived in good condition and ontime from CZ to Bali. The team was assisting from the beginning to the end amazingly.",
    route: { code: "CZ", label: "Ceko" },
  },
  {
    name: "Irma Rahmawati",
    rating: 5,
    quote:
      "Pakai rimkirim untuk pengiriman dari Inggris ke Indonesia. Customer service responnya cepat dan baik. Memberikan informasi yang cukup sehingga membantu kami menghindari masalah yang mungkin timbul terkait aturan bea cukai.",
    route: { code: "GB", label: "Inggris" },
  },
  {
    name: "Blandina Pella",
    rating: 5,
    quote:
      "Rate harganya bersaing. Customer Service responsif. Penanganan cepat dan bertanggung jawab. No Fussy, No drama.\n\n1 Agustus barang dikirim dari NY, 8 Agustus sudah keluar dari Bea Cukai Indonesia. Sampai di rumah JKT 20 Agustus. Semoga ke depannya lebih cepat dalam proses di Indonesia.\n\nAll in all a very recommended logistic provider.",
    route: { code: "US", label: "New York" },
  },
];

/** Aggregate rating shown as the section's credibility anchor. */
export const RATING_SCORE = 4.9;
