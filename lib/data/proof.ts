/**
 * Operational numbers the landing quotes as proof. Every value here must come
 * from Rimkirim's own records — marketing fills them in before launch.
 *
 * `null` means "not confirmed yet" and the landing renders nothing for it: an
 * empty slot is better than an invented number (PRODUCT.md, Evidence on Hand).
 */
export interface RouteDuration {
  /** ISO country code of the foreign endpoint */
  country: string;
  /** door-to-door days, pickup to delivery, customs included */
  min: number;
  max: number;
}

export const PROOF: {
  /** completed shipments to date, rounded down (shown as "{n}+") */
  movesCompleted: number | null;
  /** the year the count starts from */
  since: number | null;
  /** a handful of the busiest corridors */
  durations: RouteDuration[];
} = {
  // TODO(angka asli): jumlah kiriman selesai dan tahun mulai
  movesCompleted: null,
  since: null,
  // TODO(angka asli): durasi rata-rata per rute, mis. { country: "GB", min: 12, max: 20 }
  durations: [],
};
