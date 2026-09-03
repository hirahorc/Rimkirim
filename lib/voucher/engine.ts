/**
 * Voucher engine — pure rules, no store access (mock; numbers are demo-only).
 *
 * A voucher is a campaign tag first and a discount second: every code is
 * unique to one KOL / community chapter / seasonal push so a redemption
 * attributes the shipment to its source. Rules follow "Strategi Voucher
 * Rimkirim v2":
 *   - percentage off the transportation cost (`quotation.baseRate`), capped
 *     by `maxDiscount`; surcharge, tax, warehouse are never discounted
 *   - capacity: reserved + redeemed ≤ usageLimit
 *   - new customers only: one voucher per identity, on the first shipment
 *   - campaign validity gates entry; a reserved code stays honoured
 *   - the minimum weight is checked only when the quotation is issued
 *
 * Counts are always derived from the orders (never stored on a campaign)
 * so the attribution table can't drift from the shipments it describes.
 */
import type { Order, OrderStatus, Quotation } from "@/lib/store/useOrderStore";

export type CampaignKind = "kol" | "community" | "seasonal";

export interface Campaign {
  id: string;
  /** Uppercase, no spaces: BIMA25, PPILONDON, BFGUK26FARREL. */
  code: string;
  /** Who distributes it — the KOL, the chapter, or "Rimkirim" itself. */
  name: string;
  kind: CampaignKind;
  /** Pilot covers Back For Good only. */
  segment: "bfg";
  /** Percent off the base rate (0–100). */
  percent: number;
  /** IDR cap per redemption. */
  maxDiscount: number;
  /** Chargeable-kg floor, checked at quotation time (seasonal tier). */
  minWeightKg?: number;
  usageLimit: number;
  validFrom: number;
  validUntil: number;
  /** What the KOL/partner was paid (IDR) — the numerator of real CAC. */
  feeIdr: number;
  active: boolean;
}

export type VoucherState =
  | "pending" // typed on the draft, not yet counted
  | "reserved" // order submitted, slot held
  | "redeemed" // package picked up
  | "finalized" // delivered
  | "reversed" // cancelled after redemption
  | "released"; // dropped before redemption

export type ReleaseReason =
  | "expired"
  | "cancelled"
  | "removed"
  | "min-weight"
  | "capacity";

/** The redemption record carried on an order. */
export interface VoucherRedemption {
  code: string;
  campaignId: string;
  state: VoucherState;
  /** IDR, known once a quotation has been issued with it (else null). */
  discount: number | null;
  releaseReason?: ReleaseReason;
  /** Timestamp of the last state change. */
  at: number;
}

export type VoucherError =
  | "not-found"
  | "inactive"
  | "not-started"
  | "expired"
  | "sold-out"
  | "not-first-shipment"
  | "already-used"
  | "wrong-segment";

/** States that occupy a capacity slot. */
export const COUNTED_STATES: ReadonlySet<VoucherState> = new Set([
  "reserved",
  "redeemed",
  "finalized",
]);

/** Phases at or after "picked up". */
export const POST_PICKUP: ReadonlySet<OrderStatus> = new Set([
  "in-transit",
  "clearance",
  "delivery",
  "delivered",
]);

export function normalizeCode(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

export function findCampaign(
  campaigns: Campaign[],
  code: string,
): Campaign | undefined {
  const c = normalizeCode(code);
  return campaigns.find((k) => k.code === c);
}

/** Has this shipment ever been picked up — even if it was cancelled later. */
export function hasReachedPickup(o: Order): boolean {
  return (
    POST_PICKUP.has(o.status) ||
    o.timeline.some((e) => POST_PICKUP.has(e.type as OrderStatus))
  );
}

/**
 * The voucher as it stands *now*: a reservation whose quotation lapsed is
 * released, even though the persisted record hasn't been rewritten yet.
 * All reads go through here; stores materialise it on their next write.
 */
export function effectiveVoucher(
  o: Pick<Order, "voucher" | "status" | "quotation">,
  now: number,
): VoucherRedemption | null {
  const v = o.voucher;
  if (!v) return null;
  if (
    v.state === "reserved" &&
    (o.status === "review" || o.status === "quotation") &&
    o.quotation &&
    o.quotation.validUntil < now
  ) {
    return { ...v, state: "released", releaseReason: "expired", discount: null };
  }
  return v;
}

/** New-customer + one-per-identity check across the user's other orders. */
export function eligibility(
  email: string | null,
  orders: Order[],
  excludeId: string,
  now: number,
): VoucherError | null {
  if (!email) return null;
  const mine = orders.filter(
    (o) => o.ownerEmail === email && o.id !== excludeId,
  );
  if (mine.some(hasReachedPickup)) return "not-first-shipment";
  if (
    mine.some((o) => {
      const v = effectiveVoucher(o, now);
      return v !== null && COUNTED_STATES.has(v.state);
    })
  ) {
    return "already-used";
  }
  return null;
}

/** Slots held by this campaign (reserved + redeemed + finalized). */
export function usedSlots(
  campaignId: string,
  orders: Order[],
  now: number,
  excludeId?: string,
): number {
  let n = 0;
  for (const o of orders) {
    if (o.id === excludeId) continue;
    const v = effectiveVoucher(o, now);
    if (v && v.campaignId === campaignId && COUNTED_STATES.has(v.state)) n++;
  }
  return n;
}

export type ValidateResult =
  | { ok: true; campaign: Campaign; code: string }
  | { ok: false; error: VoucherError };

/** Entry-time validation (also re-run at submit, when the slot is taken). */
export function validateCode(input: {
  raw: string;
  campaigns: Campaign[];
  orders: Order[];
  email: string | null;
  order: Pick<Order, "id" | "context">;
  now: number;
}): ValidateResult {
  const { campaigns, orders, email, order, now } = input;
  const code = normalizeCode(input.raw);
  const campaign = findCampaign(campaigns, code);
  if (!campaign) return { ok: false, error: "not-found" };
  if (!campaign.active) return { ok: false, error: "inactive" };
  if (order.context?.service !== campaign.segment) {
    return { ok: false, error: "wrong-segment" };
  }
  if (now < campaign.validFrom) return { ok: false, error: "not-started" };
  if (now > campaign.validUntil) return { ok: false, error: "expired" };
  if (usedSlots(campaign.id, orders, now, order.id) >= campaign.usageLimit) {
    return { ok: false, error: "sold-out" };
  }
  const who = eligibility(email, orders, order.id, now);
  if (who) return { ok: false, error: who };
  return { ok: true, campaign, code };
}

export function computeDiscount(
  baseRate: number,
  c: Pick<Campaign, "percent" | "maxDiscount">,
): number {
  return Math.max(
    0,
    Math.min(Math.round((baseRate * c.percent) / 100), c.maxDiscount),
  );
}

export type ApplyOutcome = "applied" | "min-weight" | "none";

/**
 * Fold a reserved voucher into a freshly built quotation. Campaign validity
 * is deliberately not re-checked — a reservation is honoured to the end.
 */
export function applyVoucherToQuotation(
  q: Quotation,
  v: VoucherRedemption | null,
  c: Campaign | undefined,
  now: number,
): { quotation: Quotation; voucher: VoucherRedemption | null; outcome: ApplyOutcome } {
  const bare: Quotation = {
    ...q,
    discount: 0,
    voucherCode: null,
    total: q.baseRate + q.surchargeTotal,
  };
  if (!v || v.state !== "reserved" || !c) {
    return { quotation: bare, voucher: v, outcome: "none" };
  }
  if (c.minWeightKg && q.chargeableKg < c.minWeightKg) {
    return {
      quotation: bare,
      voucher: { ...v, state: "released", releaseReason: "min-weight", discount: null, at: now },
      outcome: "min-weight",
    };
  }
  const discount = computeDiscount(q.baseRate, c);
  return {
    quotation: {
      ...q,
      discount,
      voucherCode: v.code,
      total: q.baseRate - discount + q.surchargeTotal,
    },
    voucher: { ...v, discount, at: now },
    outcome: "applied",
  };
}

/**
 * Forward-only lifecycle on a status change. The ops "set to" control can
 * jump backwards; a finalized voucher must never be re-redeemed on the way
 * back up, so anything not listed here is a no-op.
 */
export function transitionVoucher(
  v: VoucherRedemption | null,
  to: OrderStatus,
  now: number,
): VoucherRedemption | null {
  if (!v) return null;
  const go = (state: VoucherState, releaseReason?: ReleaseReason) => ({
    ...v,
    state,
    at: now,
    ...(releaseReason ? { releaseReason } : {}),
  });
  if (v.state === "reserved") {
    if (to === "delivered") return go("finalized");
    if (POST_PICKUP.has(to)) return go("redeemed");
    if (to === "cancelled") return go("released", "cancelled");
    return v;
  }
  if (v.state === "redeemed") {
    if (to === "delivered") return go("finalized");
    if (to === "cancelled") return go("reversed");
    return v;
  }
  if (v.state === "finalized" && to === "cancelled") return go("reversed");
  return v;
}

export type ApprovalTier =
  | "marketing-lead"
  | "head-of-marketing"
  | "finance-director";

/** Who signs off, from maximum campaign exposure (% of last verified quarterly GP). */
export function approvalTier(exposure: number): ApprovalTier {
  if (exposure <= 12_700_000) return "marketing-lead";
  if (exposure <= 63_500_000) return "head-of-marketing";
  return "finance-director";
}

export interface CampaignStats {
  reserved: number;
  /** ever redeemed — includes finalized */
  redeemed: number;
  finalized: number;
  reversed: number;
  released: number;
  remaining: number;
  exposure: number;
  /** fee ÷ redeemed; null until the first redemption */
  cac: number | null;
  tier: ApprovalTier;
}

export function campaignStats(
  c: Campaign,
  orders: Order[],
  now: number,
): CampaignStats {
  let reserved = 0;
  let redeemed = 0;
  let finalized = 0;
  let reversed = 0;
  let released = 0;
  for (const o of orders) {
    const v = effectiveVoucher(o, now);
    if (!v || v.campaignId !== c.id) continue;
    switch (v.state) {
      case "reserved":
        reserved++;
        break;
      case "redeemed":
        redeemed++;
        break;
      case "finalized":
        redeemed++;
        finalized++;
        break;
      case "reversed":
        reversed++;
        break;
      case "released":
        released++;
        break;
    }
  }
  const exposure = c.maxDiscount * c.usageLimit;
  return {
    reserved,
    redeemed,
    finalized,
    reversed,
    released,
    remaining: Math.max(0, c.usageLimit - reserved - redeemed),
    exposure,
    cac: redeemed > 0 ? Math.round(c.feeIdr / redeemed) : null,
    tier: approvalTier(exposure),
  };
}
