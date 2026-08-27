const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Format a number as Indonesian Rupiah, e.g. 2835000 -> "Rp2.835.000". */
export function formatIDR(value: number): string {
  return idr.format(Math.round(value));
}

/** Compact number, e.g. 153.6 -> "153,6" (id) or "153.6" (en). Rupiah amounts
 *  stay id-ID everywhere (formatIDR); bare measurements follow the UI locale. */
// Intl constructors are the expensive kind, and this runs a dozen times per
// card render — cache one formatter per locale+digits like formatIDR does
const numberFormats = new Map<string, Intl.NumberFormat>();
export function formatNumber(
  value: number,
  maxFractionDigits = 1,
  locale: "id" | "en" = "id",
): string {
  const key = `${locale}:${maxFractionDigits}`;
  let fmt = numberFormats.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      maximumFractionDigits: maxFractionDigits,
    });
    numberFormats.set(key, fmt);
  }
  return fmt.format(value);
}
