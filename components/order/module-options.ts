/** Option lists for the order-form modules. `labelKey` resolves via i18n. */

export const PACKAGING_TYPES = [
  { value: "box", labelKey: "order.pkgBox" },
  { value: "suitcase", labelKey: "order.pkgSuitcase" },
  { value: "plastic", labelKey: "order.pkgPlastic" },
  { value: "crate", labelKey: "order.pkgCrate" },
  { value: "other", labelKey: "order.pkgOther" },
] as const;

export const BUILDING_TYPES = [
  { value: "coliving", labelKey: "order.buildColiving" },
  { value: "apartment", labelKey: "order.buildApartment" },
  { value: "dorm", labelKey: "order.buildDorm" },
  { value: "house", labelKey: "order.buildHouse" },
  { value: "other", labelKey: "order.buildOther" },
] as const;

/** Fixed 4-hour pickup windows. */
export const PICKUP_WINDOWS = [
  "10:00-14:00",
  "11:00-15:00",
  "12:00-16:00",
  "13:00-17:00",
  "14:00-18:00",
] as const;
