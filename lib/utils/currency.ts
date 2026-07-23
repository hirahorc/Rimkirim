const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Format a number as Indonesian Rupiah, e.g. 2835000 -> "Rp2.835.000". */
export function formatIDR(value: number): string {
  return idr.format(Math.round(value));
}

/** Compact number, e.g. 153.6 -> "153,6". Indonesian decimal comma. */
export function formatNumber(value: number, maxFractionDigits = 1): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}
