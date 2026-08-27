/** Major currencies for declaring item values in the order form. */
export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "CNY", symbol: "CN¥", name: "Chinese Yuan" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
];

const EUROZONE = new Set([
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT",
  "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

const BY_COUNTRY: Record<string, string> = {
  GB: "GBP", AU: "AUD", NZ: "NZD", JP: "JPY", SG: "SGD", MY: "MYR", CN: "CNY",
  HK: "HKD", KR: "KRW", AE: "AED", SA: "SAR", US: "USD", CA: "CAD", CH: "CHF",
  SE: "SEK", TH: "THB", TR: "TRY", ID: "IDR",
};

/** Best-guess default currency for an origin country (fallback USD). */
export function defaultCurrencyFor(countryCode: string | undefined): string {
  if (!countryCode) return "USD";
  if (BY_COUNTRY[countryCode]) return BY_COUNTRY[countryCode];
  if (EUROZONE.has(countryCode)) return "EUR";
  return "USD";
}

/** Format an amount in a given currency code. Pass the UI locale where the
 *  figure sits beside other localized numerals (the order record) so one view
 *  never mixes decimal conventions; callers that omit it keep en-US. */
const currencyFormats = new Map<string, Intl.NumberFormat>();
export function formatCurrency(
  amount: number,
  code: string,
  locale: "id" | "en" = "en",
): string {
  const tag = locale === "id" ? "id-ID" : "en-US";
  try {
    const key = `${tag}:${code}`;
    let fmt = currencyFormats.get(key);
    if (!fmt) {
      fmt = new Intl.NumberFormat(tag, {
        style: "currency",
        currency: code,
        maximumFractionDigits: 2,
      });
      currencyFormats.set(key, fmt);
    }
    return fmt.format(amount);
  } catch {
    return `${code} ${amount.toLocaleString(tag)}`;
  }
}
