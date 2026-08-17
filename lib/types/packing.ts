/**
 * Shared shapes for the shipment paperwork: the sender/receiver party, the
 * packages with their items, and the standalone packing list built from them.
 * Pure types + tiny helpers — no store imports, so both the order store and
 * the packing-list store can depend on this without cycles.
 */

export interface Party {
  fullName: string;
  country: string;
  address: string;
  email: string;
  phoneCountry: string;
  phone: string;
}

export interface ItemRow {
  name: string;
  value: number;
  quantity: number;
}

export interface PackageRow {
  packaging: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  items: ItemRow[];
  /** measurement photos — required-ish in the order flow, absent in a standalone list */
  photos?: { weight?: string; length?: string; width?: string; height?: string };
}

export interface ItemsData {
  currency: string;
  packages: PackageRow[];
}

export type ShipmentPurpose =
  | "household"
  | "gift"
  | "commercial"
  | "documents"
  | "sample"
  | "return"
  | "other";

export const PURPOSE_OPTIONS: { value: ShipmentPurpose; labelKey: string }[] = [
  { value: "household", labelKey: "pl.purposeHousehold" },
  { value: "gift", labelKey: "pl.purposeGift" },
  { value: "commercial", labelKey: "pl.purposeCommercial" },
  { value: "documents", labelKey: "pl.purposeDocuments" },
  { value: "sample", labelKey: "pl.purposeSample" },
  { value: "return", labelKey: "pl.purposeReturn" },
  { value: "other", labelKey: "pl.purposeOthers" },
];

export interface PackingListData {
  sender: Party;
  receiver: Party;
  /** yyyy-mm-dd */
  shippingDate: string;
  purpose: ShipmentPurpose;
  purposeOther?: string;
  items: ItemsData;
}

export interface PackingList {
  /** internal id used for routing/edit */
  id: string;
  /** the user-facing code, e.g. RK-PL-483920 — issued once, never changes */
  code: string;
  ownerEmail: string;
  createdAt: number;
  updatedAt: number;
  data: PackingListData;
  /** present when the list is derived from an order (read-only here) */
  source?: { orderId: string; bookingNumber: string | null; draft: boolean };
}

export const emptyParty: Party = {
  fullName: "",
  country: "",
  address: "",
  email: "",
  phoneCountry: "",
  phone: "",
};

export const emptyPackage: PackageRow = {
  packaging: "box",
  weight: undefined as unknown as number,
  length: undefined as unknown as number,
  width: undefined as unknown as number,
  height: undefined as unknown as number,
  items: [{ name: "", value: undefined as unknown as number, quantity: 1 }],
  photos: {},
};

export function summarizeItems(items: ItemsData | undefined) {
  const pkgs = items?.packages ?? [];
  let totalWeight = 0;
  let totalItems = 0;
  let totalValue = 0;
  for (const p of pkgs) {
    totalWeight += Number(p?.weight) || 0;
    for (const it of p?.items ?? []) {
      const q = Number(it?.quantity) || 0;
      totalItems += q;
      totalValue += q * (Number(it?.value) || 0);
    }
  }
  return { packageCount: pkgs.length, totalWeight, totalItems, totalValue };
}
