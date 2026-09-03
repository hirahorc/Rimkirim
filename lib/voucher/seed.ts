import type { Campaign } from "./engine";

/**
 * The three pilot schemes from "Strategi Voucher Rimkirim v2" (names are the
 * document's illustrative ones, not real partners). Fees are demo values.
 */
export const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: "cmp-bima25",
    code: "BIMA25",
    name: "Bima Anargya",
    kind: "kol",
    segment: "bfg",
    percent: 5,
    maxDiscount: 900_000,
    usageLimit: 25,
    validFrom: Date.UTC(2026, 0, 1),
    validUntil: Date.UTC(2026, 11, 31, 23, 59, 59),
    feeIdr: 7_500_000,
    active: true,
  },
  {
    id: "cmp-ppilondon",
    code: "PPILONDON",
    name: "PPI London",
    kind: "community",
    segment: "bfg",
    percent: 5,
    maxDiscount: 900_000,
    usageLimit: 15,
    validFrom: Date.UTC(2026, 0, 1),
    validUntil: Date.UTC(2026, 11, 31, 23, 59, 59),
    feeIdr: 0,
    active: true,
  },
  {
    id: "cmp-bfguk26farrel",
    code: "BFGUK26FARREL",
    name: "Farrel Nugraha · BFG UK 2026",
    kind: "seasonal",
    segment: "bfg",
    percent: 25,
    maxDiscount: 5_000_000,
    minWeightKg: 25,
    usageLimit: 20,
    validFrom: Date.UTC(2026, 4, 1),
    validUntil: Date.UTC(2026, 9, 31, 23, 59, 59),
    feeIdr: 15_000_000,
    active: true,
  },
];
