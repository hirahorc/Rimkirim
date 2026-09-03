import { buildQuotation, type Order, type Quotation } from "@/lib/store/useOrderStore";
import {
  applyVoucherToQuotation,
  findCampaign,
  type ApplyOutcome,
  type Campaign,
  type VoucherRedemption,
} from "./engine";

export interface Estimate {
  quotation: Quotation;
  outcome: ApplyOutcome;
  campaign?: Campaign;
}

/**
 * The customer's own preview of the quotation ops will issue: the same
 * `buildQuotation` over the same packages, the same voucher rules on top.
 * Identical unless the courier re-weighs at pickup.
 *
 * `null` until the items module is complete (and a rate exists) — an
 * estimate without packages would just be the calculator's guess again.
 *
 * The draft's voucher is still `pending`; the engine only discounts a
 * `reserved` one, so it is previewed as if reserved. Nothing is persisted.
 */
export function estimateOrder(input: {
  modules: Order["modules"];
  selectedRate: Order["selectedRate"];
  voucher: VoucherRedemption | null;
  campaigns: Campaign[];
  now: number;
}): Estimate | null {
  const { modules, selectedRate, voucher, campaigns, now } = input;
  if (!selectedRate || modules.items.status !== "complete") return null;
  const base = buildQuotation({ modules, selectedRate });
  const preview =
    voucher && (voucher.state === "pending" || voucher.state === "reserved")
      ? { ...voucher, state: "reserved" as const }
      : null;
  const campaign = preview ? findCampaign(campaigns, preview.code) : undefined;
  const { quotation, outcome } = applyVoucherToQuotation(base, preview, campaign, now);
  return { quotation, outcome, campaign };
}
