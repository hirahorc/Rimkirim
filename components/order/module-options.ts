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

/** How long the PIC can stand by for a re-pickup if the first attempt fails. */
export const PICKUP_STANDBY = [
  { value: "1", labelKey: "order.puStandby1" },
  { value: "2", labelKey: "order.puStandby2" },
  { value: "3", labelKey: "order.puStandby3" },
  { value: "other", labelKey: "order.puStandbyOther" },
] as const;
