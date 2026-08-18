/**
 * Real customer reviews pulled from Rimkirim's Google Reviews (aggregate 4.9/5).
 *
 * These are genuine, sourced testimonials — quoted **verbatim**. Do not fix
 * spelling, casing, or punctuation, do not translate them, and do not embellish:
 * the customer's own words (and language) are the evidence. The section chrome is
 * bilingual via i18n; the quotes are not, which is why they live here as data.
 *
 * Every review happens to be an inbound move (overseas → Indonesia), so where the
 * corridor is stated we surface the origin, which ties back to the Back For Good
 * story. `origin` is an i18n key under `testimonial.origins` (not literal text) so
 * country names localise — "Ceko"/"Inggris" become "Czechia"/"England" in English.
 */
export interface Testimonial {
  name: string;
  rating: number;
  quote: string;
  /** i18n key under `testimonial.origins`; destination is always Indonesia */
  origin?: string;
  /**
   * DUMMY placeholder — i18n key under `testimonial.affiliations` for the
   * alumni/affiliation line under the name. These are fabricated (a plausible
   * institution near the origin) and NOT sourced from the reviews; swap for
   * real, consented attributions before relying on them.
   */
  affiliation?: string;
  /**
   * Praise phrases to highlight inside the quote. Each MUST be an exact,
   * verbatim substring of `quote` — the renderer only wraps matches in a
   * highlighter mark, never rewrites the text, so the review stays verbatim.
   */
  highlights?: string[];
  /** The one review that becomes the section's hook card (photo + big quote). */
  featured?: boolean;
  /**
   * Public path to the customer's photo (e.g. "/testimonials/elita.jpg").
   * Only add a REAL photo of THIS customer with their explicit consent — the
   * hook card is social proof, never stock imagery. Until then the card shows
   * a non-human placeholder.
   */
  photo?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "daelyn",
    rating: 5,
    quote:
      "great service! i received all of my belongings from bristol to jakarta much faster than i expected. everything arrived safely and was intact. i'm very satisfied with the service.",
    origin: "bristol",
    affiliation: "bristol",
    highlights: ["faster than i expected", "everything arrived safely and was intact", "very satisfied"],
    featured: true,
    // NOTE: supplied by marketing as an illustrative graduation image (Bristol),
    // not a verified photo of this reviewer — swap for a consented photo before
    // presenting it as such.
    photo: "/testimonials/daelyn.jpg",
  },
  {
    name: "Elita Nuraeny",
    rating: 5,
    quote:
      "Amazing service! My parcel arrived safely (and quickly!) from Adelaide to Jakarta without hassle. Moving between countries can be a challenging and stressful time, and Rimkirim team is very professional, attentive, and helpful throughout the process. I am grateful for their quick response and attention to details. Highly recommended!",
    origin: "adelaide",
    affiliation: "adelaide",
    highlights: ["arrived safely (and quickly!)", "very professional, attentive, and helpful", "Highly recommended!"],
  },
  {
    name: "Nurul",
    rating: 5,
    quote:
      "The delivery is smooth and really from door to door (Germany-Indonesia). I don't expect all my belongings are safely landed. Thanks, Rimkirim Team!",
    origin: "germany",
    affiliation: "munich",
    highlights: ["smooth and really from door to door", "safely landed"],
  },
  {
    name: "Ratna sari",
    rating: 5,
    quote:
      "Everything was great! Our package arrived in good condition and ontime from CZ to Bali. The team was assisting from the beginning to the end amazingly.",
    origin: "czechia",
    affiliation: "charles",
    highlights: ["Everything was great!", "good condition and ontime", "assisting from the beginning to the end amazingly"],
  },
  {
    name: "Irma Rahmawati",
    rating: 5,
    quote:
      "Pakai rimkirim untuk pengiriman dari Inggris ke Indonesia. Customer service responnya cepat dan baik. Memberikan informasi yang cukup sehingga membantu kami menghindari masalah yang mungkin timbul terkait aturan bea cukai.",
    origin: "england",
    affiliation: "manchester",
    highlights: ["responnya cepat dan baik", "membantu kami menghindari masalah"],
  },
  {
    name: "Blandina Pella",
    rating: 5,
    quote:
      "Rate harganya bersaing. Customer Service responsif. Penanganan cepat dan bertanggung jawab. No Fussy, No drama.\n\n1 Agustus barang dikirim dari NY, 8 Agustus sudah keluar dari Bea Cukai Indonesia. Sampai di rumah JKT 20 Agustus. Semoga ke depannya lebih cepat dalam proses di Indonesia.\n\nAll in all a very recommended logistic provider.",
    origin: "newYork",
    affiliation: "kbri",
    highlights: ["harganya bersaing", "Penanganan cepat dan bertanggung jawab", "No Fussy, No drama", "very recommended logistic provider"],
  },
];

/** Aggregate rating shown as the section's credibility anchor. */
export const RATING_SCORE = 4.9;
