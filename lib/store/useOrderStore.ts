"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import {
  makeBookingNumber,
  makeEventId,
  makeOrderId,
  makePackingCode,
} from "@/lib/utils/order-ids";
import {
  totalChargeableWeight,
  chargeableWeight,
} from "@/lib/utils/chargeable-weight";
import {
  assessShipmentSurcharges,
  type SurchargeLine,
} from "@/lib/pricing/surcharge-engine";
import { ACTION_ATTENTION } from "@/lib/order/attention";
import {
  applyVoucherToQuotation,
  effectiveVoucher,
  findCampaign,
  transitionVoucher,
  validateCode,
  type VoucherError,
  type VoucherRedemption,
} from "@/lib/voucher/engine";
import { useAuthStore } from "./useAuthStore";
import { useVoucherStore } from "./useVoucherStore";

export type Citizenship = "indonesian" | "foreigner";
export type ClearanceKind = "personal" | "passenger";
export type ModuleId = "customerInfo" | "items" | "compliance" | "pickup";
export type ModuleStatus = "not-started" | "in-progress" | "complete";

/** Corridor context carried in from the rate flow. */
export interface OrderContext {
  service: "bfg" | "moving-abroad";
  originCountry: string; // ISO code (foreign side for BFG, "ID" for Moving Abroad)
  destCountry: string; // "ID" for BFG, foreign side for Moving Abroad
}

/** The rate the user picked on /cek-tarif, used for the order's shipping total. */
export interface SelectedRate {
  /** IDR per chargeable kg */
  perKg: number;
  /** carrier + service (or "Special Rate") */
  label: string;
  /** display-only extras for the receipt strip; absent on older drafts */
  total?: number;
  etaMin?: number;
  etaMax?: number;
}

/** One package row's surcharge breakdown, frozen into the quotation snapshot. */
export interface QuotationPackage {
  /** 1-based package index */
  index: number;
  /** actual weight (kg) and dimensions (cm), for the row heading */
  weightKg: number;
  length: number;
  width: number;
  height: number;
  chargeableKg: number;
  /** every surcharge triggered, highest first, `applied` flag on the charged one */
  triggered: SurchargeLine[];
  /** amount actually charged for this row (applied × 1; rows are single packages) */
  appliedTotal: number;
}

/**
 * The official quotation issued by ops (mock — numbers are demo-only).
 *
 * The payable total is base rate − voucher discount + the one charged surcharge
 * per package. Tax and warehouse fields are **informational only** and
 * deliberately excluded from `total`:
 * clearance handling, insurance and pickup are free, taxes are settled by Indonesian
 * Customs, and warehouse only accrues if the goods sit past the free window.
 */
export interface Quotation {
  total: number; // IDR — base − discount + surcharge, the amount approved
  perKg: number; // IDR charged per chargeable kg
  chargeableKg: number;
  baseRate: number; // round(perKg × chargeableKg)
  /** voucher discount off the base rate only (0 when none applied) */
  discount: number;
  /** the campaign code behind `discount` (null when none applied) */
  voucherCode: string | null;
  surchargeTotal: number; // Σ charged surcharge across packages
  packages: QuotationPackage[];
  // --- informational, NOT part of `total` ---
  /** declared goods value (in `declaredCurrency`) — the tax basis */
  declaredValue: number;
  declaredCurrency: string;
  /** always zero here; final tax is determined by Indonesian Customs */
  taxes: { importDuty: number; vat: number; incomeTax: number };
  warehousePerKgPerDay: number; // IDR 2,000
  warehouseFreeDays: number; // first 3 days free
  warehousePerDay: number; // round(perKgPerDay × chargeableKg)
  validUntil: number;
  issuedAt: number;
}

const QUOTATION_VALID_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** The pending ops actions that the ops panel can offer (extensible per step). */
export type OpsNoticeAction =
  | "book-pickup"
  | "issue-awb"
  | "confirm-drop-off";

/** A signal that a customer action needs a follow-up action from the ops side. */
export interface OpsNotice {
  /** i18n key describing what the customer did / what ops should do next. */
  messageKey: string;
  action: OpsNoticeAction;
}

/** Who caused a failed pickup attempt. */
export type PickupFailCause = "customer" | "carrier";

/** A failed pickup attempt, attributed to the customer or the carrier (FedEx). */
export interface PickupFail {
  at: number;
  cause: PickupFailCause;
}

/** Ops asking the customer to drop the package at a FedEx location instead. */
export interface DropOffInstruction {
  requestedAt: number;
  /** requestedAt + 2 days — missing this deadline changes the AWB. */
  deadline: number;
  /** when the customer confirmed the drop-off (null = not yet). */
  fulfilledAt: number | null;
  expired: boolean;
}

/** How the customer wants the re-issued shipment handled after a new AWB. */
export type AwbService = "pickup" | "drop-off";

/** The customer's choice when requesting a new AWB (service + new date). */
export interface AwbRequest {
  service: AwbService;
  /** ISO date string (yyyy-mm-dd) chosen for the new attempt. */
  date: string;
}

/** The new pickup slot the customer picks when rescheduling a failed pickup. */
export interface PickupSchedule {
  /** ISO date string (yyyy-mm-dd) for the new attempt. */
  date: string;
  /** One of the fixed pickup windows, e.g. "10:00-14:00". */
  time: string;
}

/** Customer-fault failures allowed before the customer must request a new AWB. */
export const MAX_CUSTOMER_PICKUP_FAILS = 3;

/** Number of active days on a drop-off instruction before the AWB changes. */
export const DROP_OFF_DEADLINE_DAYS = 2;

/**
 * Sub-states of the BFG import clearance phase, modeled on the real customs flow
 * (see the clearance MD): pre-clearance → Barpin confirmation → submission to
 * Bea Cukai + FedEx → BC review, which either issues an NPD (document request,
 * up to 3 rounds) or a final result: SPPB / SPPBL (released), SPTNP (released
 * after the customer pays tax), or Reject (restart from the beginning).
 */
export type ClearanceStep =
  | "pre-clearance"
  | "barpin-confirm"
  | "submitted"
  | "bc-review"
  | "npd"
  | "sppb"
  | "sppbl"
  | "sptnp"
  | "reject";

/** Ops may raise up to this many NPD (document-request) rounds. */
export const MAX_NPD_ROUNDS = 3;

/** Final "released" results — clearance is done, order can move to delivery. */
export const CLEARANCE_RELEASED: ClearanceStep[] = ["sppb", "sppbl", "sptnp"];

/**
 * The linear "spine" the sub-stepper renders. NPD and the specific end result
 * are overlays on the BC / result nodes, not separate spine nodes.
 */
export const CLEARANCE_SPINE = [
  "pre",
  "barpin",
  "submit",
  "bc",
  "result",
] as const;
export type ClearanceSpineNode = (typeof CLEARANCE_SPINE)[number];

/** Which spine node a given clearance step lights up. */
export function clearanceSpineIndex(step: ClearanceStep): number {
  switch (step) {
    case "pre-clearance":
    case "reject":
      return 0;
    case "barpin-confirm":
      return 1;
    case "submitted":
      return 2;
    case "bc-review":
    case "npd":
      return 3;
    case "sppb":
    case "sppbl":
    case "sptnp":
      return 4;
  }
}

/** i18n key for the timeline event of each clearance sub-state. */
export const CLEARANCE_STEP_EVENT: Record<ClearanceStep, string> = {
  "pre-clearance": "order.evClPreClearance",
  "barpin-confirm": "order.evClBarpin",
  submitted: "order.evClSubmitted",
  "bc-review": "order.evClBcReview",
  npd: "order.evClNpd",
  sppb: "order.evClSppb",
  sppbl: "order.evClSppbl",
  sptnp: "order.evClSptnp",
  reject: "order.evClReject",
};

/** Attention overlay (i18n key) shown while sitting on a clearance sub-state. */
const CLEARANCE_STEP_ATTENTION: Partial<Record<ClearanceStep, string>> = {
  "barpin-confirm": "order.attClearanceBarpin",
  npd: "order.attNpd",
  sppb: "order.attClearanceReleased",
  sppbl: "order.attClearanceReleasedExtra",
  sptnp: "order.attClearanceTax",
  reject: "order.attClearanceReject",
};

/** Demo FedEx airway bill, 12 digits, re-generated whenever the AWB changes. */
export function makeAwb(): string {
  const group = () =>
    String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `${group()} ${group()} ${group()}`;
}

/** Loose package shape as saved by the Items module (for weight math + value). */
interface Pkg {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  quantity?: number;
  /** declared contents — value is in the shipment's chosen currency */
  items?: { value?: number; quantity?: number }[];
}

/** Warehouse fee: IDR/kg/day, charged only after the free window. */
const WAREHOUSE_PER_KG_PER_DAY = 2000;
const WAREHOUSE_FREE_DAYS = 3;

/** Build a demo quotation from the order's selected rate + item dimensions. */
export function buildQuotation(
  order: Pick<Order, "modules" | "selectedRate">,
): Quotation {
  const itemsData = order.modules.items.data as
    | { currency?: string; packages?: Pkg[] }
    | undefined;
  const packages = itemsData?.packages ?? [];

  // each package row is a single physical package (quantity 1) for weight + surcharge
  const dimsPkgs = packages.map((p) => ({
    weight: Number(p?.weight) || 0,
    length: Number(p?.length) || 0,
    width: Number(p?.width) || 0,
    height: Number(p?.height) || 0,
    quantity: 1,
  }));

  const chargeableKg = totalChargeableWeight(dimsPkgs);
  const perKg = order.selectedRate?.perKg ?? 135000;
  const baseRate = Math.round(perKg * chargeableKg);

  // per-package surcharge breakdown (only the highest per package is charged)
  const shipment = assessShipmentSurcharges(dimsPkgs);
  const surchargeTotal = shipment.appliedTotal;
  const quotationPackages: QuotationPackage[] = shipment.packages.map((r, i) => {
    const src = dimsPkgs[i];
    return {
      index: r.index,
      weightKg: src.weight,
      length: src.length,
      width: src.width,
      height: src.height,
      chargeableKg: chargeableWeight(src),
      triggered: r.triggered,
      appliedTotal: r.appliedTotal,
    };
  });

  // voucher-agnostic: the discount is folded in by quoteWithVoucher
  const discount = 0;
  const total = baseRate - discount + surchargeTotal;

  // declared value (Σ item value × qty) drives the tax basis; taxes stay zero
  const declaredValue = packages.reduce((sum, p) => {
    const contents = Array.isArray(p?.items) ? p.items : [];
    return (
      sum +
      contents.reduce(
        (s, it) => s + (Number(it?.value) || 0) * (Number(it?.quantity) || 0),
        0,
      )
    );
  }, 0);
  const declaredCurrency = itemsData?.currency || "USD";

  const now = Date.now();
  return {
    total,
    perKg,
    chargeableKg,
    baseRate,
    discount,
    voucherCode: null,
    surchargeTotal,
    packages: quotationPackages,
    declaredValue,
    declaredCurrency,
    taxes: { importDuty: 0, vat: 0, incomeTax: 0 },
    warehousePerKgPerDay: WAREHOUSE_PER_KG_PER_DAY,
    warehouseFreeDays: WAREHOUSE_FREE_DAYS,
    warehousePerDay: Math.round(WAREHOUSE_PER_KG_PER_DAY * chargeableKg),
    validUntil: now + QUOTATION_VALID_MS,
    issuedAt: now,
  };
}

export interface QuestionnaireAnswers {
  shippingPersonal?: boolean; // (a) both services
  citizenship?: Citizenship; // (b) BFG only
  livedLongEnough?: boolean; // (c) BFG only
  canApplySKP?: boolean; // (d) BFG only
  hasPackingCode?: boolean; // (e) both services
  packingCode?: string;
  /** the code that last validated OK, so a reload doesn't ask to search again */
  packingCodeVerified?: string;
  /** Moving Abroad only — info for the Rimkirim team, no branching. */
  arrivedAtDestination?: boolean;
}

export interface ModuleState {
  status: ModuleStatus;
  // lean, loosely-typed draft data per module (validated in the form components)
  data?: Record<string, unknown>;
}

type Modules = Record<ModuleId, ModuleState>;

const emptyModules: Modules = {
  customerInfo: { status: "not-started" },
  items: { status: "not-started" },
  compliance: { status: "not-started" },
  pickup: { status: "not-started" },
};

/** Linear post-submit phase a shipment moves through (terminal: cancelled/delivered). */
export type OrderPhase =
  | "review"
  | "quotation"
  | "pickup"
  | "in-transit"
  | "clearance"
  | "delivery"
  | "delivered"
  | "cancelled";

/** "draft" = still being filled in the /pesan flow; otherwise a live phase. */
export type OrderStatus = "draft" | OrderPhase;

/** What a timeline entry represents. */
export type TimelineEventType =
  | "created"
  | "submitted"
  | "resubmitted"
  | "quotation"
  | "pickup"
  | "in-transit"
  | "clearance"
  | "delivery"
  | "delivered"
  | "cancelled"
  | "attention"
  | "attention-cleared"
  | "awb"
  | "voucher";

export interface TimelineEvent {
  id: string;
  at: number;
  type: TimelineEventType;
  /** i18n key rendered as the event line (phase/status or the attention key). */
  messageKey: string;
}

/** The `order.*` i18n key for each phase/cancel event line. */
const PHASE_EVENT_KEY: Partial<Record<OrderStatus, string>> = {
  quotation: "order.evQuotation",
  pickup: "order.evPickup",
  "in-transit": "order.evInTransit",
  clearance: "order.evClearance",
  delivery: "order.evDelivery",
  delivered: "order.evDelivered",
  cancelled: "order.evCancelled",
};

function makeEvent(
  type: TimelineEventType,
  messageKey: string,
  at = Date.now(),
): TimelineEvent {
  return { id: makeEventId(), at, type, messageKey };
}

/** Strictly-increasing timestamp so the timeline/bell ordering is deterministic
 *  even when events land within the same millisecond. */
function nextEventAt(order: Order): number {
  const last = order.timeline[order.timeline.length - 1];
  return Math.max(Date.now(), (last?.at ?? 0) + 1);
}

/** Timeline line for each voucher state a status change can produce. */
const VOUCHER_EVENT_KEY: Partial<Record<VoucherRedemption["state"], string>> = {
  redeemed: "order.evVoucherRedeemed",
  released: "order.evVoucherReleased",
  reversed: "order.evVoucherReversed",
  // finalized rides on the delivered line
};

/** Build the quotation and fold the order's reserved voucher into it. */
function quoteWithVoucher(
  order: Order,
  at: number,
): { quotation: Quotation; voucher: VoucherRedemption | null; events: TimelineEvent[] } {
  const base = buildQuotation(order);
  const v = effectiveVoucher(order, Date.now());
  const campaign = v
    ? useVoucherStore.getState().campaigns.find((c) => c.id === v.campaignId) ??
      findCampaign(useVoucherStore.getState().campaigns, v.code)
    : undefined;
  const r = applyVoucherToQuotation(base, v, campaign, at);
  const events: TimelineEvent[] = [];
  if (r.outcome === "applied") {
    events.push(makeEvent("voucher", "order.evVoucherApplied", at + 1));
  } else if (r.outcome === "min-weight") {
    events.push(makeEvent("voucher", "order.evVoucherMinWeight", at + 1));
  }
  return { quotation: r.quotation, voucher: r.voucher, events };
}

export interface Order {
  id: string;
  ownerEmail: string | null;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;

  /** i18n key of an active "needs your attention" overlay (set by the ops
   *  simulator in later steps); null = everything is on track. */
  attention: string | null;
  /** Chronological activity log, oldest first. Drives the tracking timeline
   *  and the notification bell. */
  timeline: TimelineEvent[];
  /** The ops-issued quotation (null until ops issues one). */
  quotation: Quotation | null;
  /** Module flagged for a fix in the needs-revision flow (null = no revision). */
  revisionModule: ModuleId | null;
  /** Optional note from ops explaining what needs fixing (null = none). */
  revisionNote: string | null;
  /** Pending ops action surfaced on the ops panel (null = nothing to do).
   *  Set when the customer acts in a way that requires ops follow-up. */
  opsNotice: OpsNotice | null;
  /** The FedEx airway bill. Unlike the stable booking number, this can be
   *  re-issued when pickups keep failing or a drop-off deadline is missed. */
  awb: string | null;
  /** Failed pickup attempts, oldest first, with fault attribution. */
  pickupFails: PickupFail[];
  /** True while the customer must choose re-pickup or drop-off after a failure. */
  pickupChoicePending: boolean;
  /** Active drop-off instruction (null = normal pickup flow). */
  dropOff: DropOffInstruction | null;
  /** The customer's pending new-AWB request (service + date), null = none. */
  awbRequest: AwbRequest | null;
  /** Current clearance sub-state (null when not in the clearance phase). */
  clearanceStep: ClearanceStep | null;
  /** Pre-Clearance "belum bisa masuk clearance" — goods partial / delayed. */
  clearanceBlocked: boolean;
  /** How many NPD (document-request) rounds Bea Cukai has raised (0–3). */
  npdRound: number;
  /** When the customer confirmed the Barpin data (null = not yet). */
  barpinConfirmedAt: number | null;
  /** When the customer paid the SPTNP tax (null = not required / not yet). */
  taxPaidAt: number | null;
  /** The campaign voucher attached to this order (null = none). */
  voucher: VoucherRedemption | null;

  context: OrderContext | null;
  selectedRate: SelectedRate | null;
  answers: QuestionnaireAnswers;
  clearance: ClearanceKind | null;
  modules: Modules;
  bookingNumber: string | null;
  generatedPackingCode: string | null;
}

/** Stashed order start so a logged-out user resumes it after signing in. */
export interface PendingStart {
  context: OrderContext;
  rate: SelectedRate | null;
}

interface OrderStoreState {
  orders: Order[];
  /** The pre-hub draft (questionnaire/clearance stage). An order does not
   *  exist in `orders` until the customer reaches the module hub — entering
   *  the eligibility questionnaire must not create an order. Promoted into
   *  `orders` by ensureBookingNumber (hub entry). At most one. */
  draftOrder: Order | null;
  /** The order currently being created/edited in the /pesan flow. */
  activeDraftId: string | null;
  /** Flat mirrors of the active draft — kept so existing selectors keep working. */
  context: OrderContext | null;
  selectedRate: SelectedRate | null;
  answers: QuestionnaireAnswers;
  clearance: ClearanceKind | null;
  modules: Modules;
  bookingNumber: string | null;
  generatedPackingCode: string | null;
  pendingStart: PendingStart | null;

  startOrder: (ctx: OrderContext, rate?: SelectedRate | null) => void;
  setAnswers: (patch: Partial<QuestionnaireAnswers>) => void;
  setClearance: (c: ClearanceKind) => void;
  saveModule: (id: ModuleId, data: Record<string, unknown>) => void;
  /** Persist half-typed values as an in-progress draft (no validation). */
  saveModuleDraft: (id: ModuleId, data: Record<string, unknown>) => void;
  /** Seed CI (in-progress: owner still missing) + Items (complete) from a standalone packing list; never overwrites started modules. */
  prefillFromPackingList: (data: { customerInfo: Record<string, unknown>; items: Record<string, unknown> }) => void;
  /** create a booking number once, on entering the order form */
  ensureBookingNumber: () => void;
  /** generate a packing code once CI+Items are done and none was supplied */
  ensurePackingCode: () => void;
  /** final agree → the order leaves the draft and enters Review (tracking issued) */
  submitOrder: () => void;
  /** customer (hub): attach a campaign code to the active draft; returns the
   *  validation error or null. The slot is only taken at submit. */
  applyVoucher: (raw: string) => VoucherError | null;
  /** customer: drop the code again (before pickup) */
  removeVoucher: () => void;
  /** detach from the active draft; orders themselves persist */
  reset: () => void;
  /** make an existing draft the active one again (resume it in the /pesan flow) */
  resumeOrder: (id: string) => void;
  setPendingStart: (intent: PendingStart | null) => void;
  /** ops control plane: set a submitted order's phase (drafts are read-only) */
  setOrderStatus: (id: string, status: OrderStatus) => void;
  /** ops control plane: advance the clearance spine (pre → barpin → submit → bc) */
  setClearanceStep: (id: string, step: ClearanceStep) => void;
  /** ops control plane: flag Pre-Clearance as "belum bisa" (goods partial/delayed) */
  setClearanceBlocked: (id: string, blocked: boolean) => void;
  /** customer: confirm the Barpin data → submission proceeds */
  confirmBarpin: (id: string) => void;
  /** customer: ask ops to revise the Barpin data before confirming */
  requestBarpinRevision: (id: string) => void;
  /** ops control plane: Bea Cukai raises an NPD (document request), up to 3 rounds */
  raiseNpd: (id: string) => void;
  /** ops control plane: resubmit documents after an NPD → back to BC review */
  resubmitClearance: (id: string) => void;
  /** ops control plane: final BC result — sppb/sppbl/sptnp (released) or reject (restart) */
  resolveClearance: (
    id: string,
    result: "sppb" | "sppbl" | "sptnp" | "reject",
  ) => void;
  /** customer: pay the SPTNP tax so the goods can be released */
  payClearanceTax: (id: string) => void;
  /** ops control plane: set/clear an order's attention overlay (i18n key) */
  setOrderAttention: (id: string, attention: string | null) => void;
  /** ops control plane: issue the official quotation (builds from order data) */
  issueQuotation: (id: string) => void;
  /** customer: approve the quotation → order moves to pickup scheduling */
  approveQuotation: (id: string) => void;
  /** ops control plane: confirm the pickup booking after the customer approves */
  bookPickup: (id: string) => void;
  /** ops control plane: record a failed pickup attempt (customer/carrier fault) */
  recordPickupFail: (id: string, cause: PickupFailCause) => void;
  /** customer: after a failed pickup, reschedule it for a new date + window.
   *  The new slot overwrites the pickup module's schedule so the order record
   *  and the live panel never disagree about when the courier is coming. */
  reschedulePickup: (id: string, next: PickupSchedule) => void;
  /** customer: after a failed pickup, choose a drop-off at a FedEx location */
  chooseDropOff: (id: string) => void;
  /** ops control plane: simulate the 2-day drop-off deadline passing → AWB change */
  expireDropOff: (id: string) => void;
  /** ops control plane: fulfil the customer's new-AWB request */
  issueNewAwb: (id: string) => void;
  /** ops control plane: confirm the customer's drop-off → shipment goes in transit */
  confirmDroppedOff: (id: string) => void;
  /** customer: request a new AWB after repeated customer-fault pickup failures,
   *  choosing the service (pickup/drop-off) + a new date → triggers a re-quote */
  requestNewAwb: (id: string, req: AwbRequest) => void;
  /** customer: confirm the package was dropped off at the FedEx location */
  confirmDropOff: (id: string) => void;
  /** customer: flag a module for a fix; order returns to Review until resubmitted */
  requestRevision: (
    id: string,
    moduleId: ModuleId,
    note?: string | null,
  ) => void;
}

/** The subset of an Order that is mirrored as flat top-level store fields. */
const FLAT_KEYS: (keyof Order)[] = [
  "context",
  "selectedRate",
  "answers",
  "clearance",
  "modules",
  "bookingNumber",
  "generatedPackingCode",
];

/** Copy the draft fields of an order into the flat state shape. */
function syncFlatFrom(order: Order): Partial<OrderStoreState> {
  const flat: Partial<OrderStoreState> = {};
  for (const key of FLAT_KEYS) {
    (flat as Record<string, unknown>)[key] = order[key];
  }
  return flat;
}

/** Mutate the active draft (the `orders` entry or the pre-hub `draftOrder`,
 *  plus the flat mirrors). */
function updateDraft(
  set: (fn: (s: OrderStoreState) => Partial<OrderStoreState>) => void,
  updater: (order: Order) => Partial<Order> | null,
): void {
  set((s) => {
    const inOrders = s.orders.find((o) => o.id === s.activeDraftId);
    const order =
      inOrders ??
      (s.draftOrder?.id === s.activeDraftId ? s.draftOrder : undefined);
    if (!order) return {};
    const patch = updater(order);
    if (!patch) return {};
    const next: Order = { ...order, ...patch, updatedAt: Date.now() };
    return {
      ...(inOrders
        ? { orders: s.orders.map((o) => (o.id === next.id ? next : o)) }
        : { draftOrder: next }),
      ...syncFlatFrom(next),
    };
  });
}

export const useOrderStore = create<OrderStoreState>()(
  persist(
    (set, get) => ({
      orders: [],
      draftOrder: null,
      activeDraftId: null,
      context: null,
      selectedRate: null,
      answers: {},
      clearance: null,
      modules: emptyModules,
      bookingNumber: null,
      generatedPackingCode: null,
      pendingStart: null,

      startOrder: (ctx, rate = null) =>
        set((s) => {
          const email = useAuthStore.getState().currentEmail;
          // Reuse the standing pre-hub draft (a questionnaire abandoned before
          // the hub) so repeat price-card clicks don't pile up orphan drafts.
          // Keep its id/createdAt; reset everything else. This is NOT an order
          // yet: it enters `orders` only when the hub issues a booking number.
          const existing =
            s.draftOrder && s.draftOrder.ownerEmail === email
              ? s.draftOrder
              : null;
          const id = existing?.id ?? makeOrderId();
          const order: Order = {
            id,
            ownerEmail: email,
            status: "draft",
            createdAt: existing?.createdAt ?? Date.now(),
            updatedAt: Date.now(),
            attention: null,
            timeline: [makeEvent("created", "order.evCreated")],
            quotation: null,
            revisionModule: null,
            revisionNote: null,
            opsNotice: null,
            awb: null,
            pickupFails: [],
            pickupChoicePending: false,
            dropOff: null,
            awbRequest: null,
            clearanceStep: null,
            clearanceBlocked: false,
            npdRound: 0,
            barpinConfirmedAt: null,
            taxPaidAt: null,
            voucher: null,
            context: ctx,
            selectedRate: rate,
            answers: {},
            clearance: null,
            modules: emptyModules,
            bookingNumber: null,
            generatedPackingCode: null,
          };
          return {
            draftOrder: order,
            activeDraftId: id,
            ...syncFlatFrom(order),
            pendingStart: null,
          };
        }),
      setAnswers: (patch) =>
        updateDraft(set, (o) => ({ answers: { ...o.answers, ...patch } })),
      setClearance: (c) => updateDraft(set, () => ({ clearance: c })),
      saveModule: (id, data) =>
        updateDraft(set, (o) => ({
          modules: { ...o.modules, [id]: { status: "complete", data } },
        })),
      saveModuleDraft: (id, data) =>
        updateDraft(set, (o) => ({
          modules: { ...o.modules, [id]: { status: "in-progress", data } },
        })),
      prefillFromPackingList: (data) =>
        updateDraft(set, (o) => {
          const modules = { ...o.modules };
          let changed = false;
          if (o.modules.customerInfo.status === "not-started") {
            modules.customerInfo = { status: "in-progress", data: data.customerInfo };
            changed = true;
          }
          if (o.modules.items.status === "not-started") {
            modules.items = { status: "complete", data: data.items };
            changed = true;
          }
          return changed ? { modules } : null;
        }),
      ensureBookingNumber: () =>
        set((s) => {
          // Hub entry is the moment the order comes into existence. A pre-hub
          // draft is promoted into `orders` here, stamped as created now —
          // the questionnaire stage never was an order.
          if (s.draftOrder && s.draftOrder.id === s.activeDraftId) {
            const now = Date.now();
            const order: Order = {
              ...s.draftOrder,
              bookingNumber: s.draftOrder.bookingNumber ?? makeBookingNumber(),
              createdAt: now,
              updatedAt: now,
              timeline: [makeEvent("created", "order.evCreated", now)],
            };
            return {
              orders: [...s.orders, order],
              draftOrder: null,
              ...syncFlatFrom(order),
            };
          }
          const order = s.orders.find((o) => o.id === s.activeDraftId);
          if (!order || order.bookingNumber) return {};
          const next: Order = {
            ...order,
            bookingNumber: makeBookingNumber(),
            updatedAt: Date.now(),
          };
          return {
            orders: s.orders.map((o) => (o.id === next.id ? next : o)),
            ...syncFlatFrom(next),
          };
        }),
      ensurePackingCode: () =>
        updateDraft(set, (o) => {
          // a code supplied in the questionnaire always wins; nothing to generate
          if (o.answers.packingCode?.trim() || o.generatedPackingCode) return null;
          if (!isPackingListReady(o.modules)) return null;
          return { generatedPackingCode: makePackingCode() };
        }),
      submitOrder: () =>
        updateDraft(set, (o) => {
          // first submit: draft → review. Revision re-submit: review → quotation
          // (the quotation doc still exists) or review.
          if (o.status !== "draft" && o.status !== "review") return null;
          const isResubmit = o.status === "review";
          const nextStatus: OrderStatus = o.quotation ? "quotation" : "review";
          const now = nextEventAt(o);
          // first submit takes the voucher slot: re-validate, since capacity
          // and eligibility may have moved since the code was typed
          const voucherEvents: TimelineEvent[] = [];
          let voucher = isResubmit ? effectiveVoucher(o, Date.now()) : o.voucher;
          if (!isResubmit && voucher?.state === "pending") {
            const res = validateCode({
              raw: voucher.code,
              campaigns: useVoucherStore.getState().campaigns,
              orders: get().orders,
              email: o.ownerEmail,
              order: o,
              now: Date.now(),
            });
            voucher = res.ok
              ? { ...voucher, state: "reserved", at: now }
              : { ...voucher, state: "released", releaseReason: "capacity", at: now };
            voucherEvents.push(
              makeEvent(
                "voucher",
                res.ok ? "order.evVoucherReserved" : "order.evVoucherReleased",
                now + 1,
              ),
            );
          }
          return {
            status: nextStatus,
            voucher,
            // the hub already issued a booking number; guarantee one as the
            // single lifecycle identifier just in case.
            bookingNumber: o.bookingNumber ?? makeBookingNumber(),
            revisionModule: null,
            revisionNote: null,
            // returning to a pending quotation re-arms the approval banner
            attention:
              nextStatus === "quotation"
                ? "order.attQuotationReady"
                : o.attention,
            timeline: [
              ...o.timeline,
              makeEvent(
                isResubmit ? "resubmitted" : "submitted",
                isResubmit ? "order.evResubmitted" : "order.evSubmitted",
                now,
              ),
              ...voucherEvents,
            ],
          };
        }),
      applyVoucher: (raw) => {
        const s = get();
        const o = s.orders.find((x) => x.id === s.activeDraftId);
        if (!o || o.status !== "draft") return "not-found";
        const res = validateCode({
          raw,
          campaigns: useVoucherStore.getState().campaigns,
          orders: s.orders,
          email: o.ownerEmail,
          order: o,
          now: Date.now(),
        });
        if (!res.ok) return res.error;
        updateDraft(set, () => ({
          voucher: {
            code: res.code,
            campaignId: res.campaign.id,
            state: "pending",
            discount: null,
            at: Date.now(),
          },
        }));
        return null;
      },
      removeVoucher: () =>
        updateDraft(set, (o) => {
          const v = o.voucher;
          if (!v || (v.state !== "pending" && v.state !== "reserved")) return null;
          if (!["draft", "review", "quotation"].includes(o.status)) return null;
          if (v.state === "pending") return { voucher: null };
          const now = nextEventAt(o);
          return {
            voucher: { ...v, state: "released", releaseReason: "removed", discount: null, at: now },
            // the quotation loses its discount but keeps its validity
            quotation: o.quotation
              ? {
                  ...o.quotation,
                  discount: 0,
                  voucherCode: null,
                  total: o.quotation.baseRate + o.quotation.surchargeTotal,
                }
              : null,
            timeline: [
              ...o.timeline,
              makeEvent("voucher", "order.evVoucherReleased", now),
            ],
          };
        }),
      reset: () =>
        set({
          draftOrder: null,
          activeDraftId: null,
          context: null,
          selectedRate: null,
          answers: {},
          clearance: null,
          modules: emptyModules,
          bookingNumber: null,
          generatedPackingCode: null,
        }),
      resumeOrder: (id) =>
        set((s) => {
          const order =
            s.orders.find((o) => o.id === id) ??
            (s.draftOrder?.id === id ? s.draftOrder : undefined);
          if (!order) return {};
          return { activeDraftId: id, ...syncFlatFrom(order), pendingStart: null };
        }),
      setPendingStart: (intent) => set({ pendingStart: intent }),
      setOrderStatus: (id, status) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          // drafts are managed by the customer flow, not the ops plane
          if (!order || order.status === "draft" || order.status === status) {
            return {};
          }
          const eventKey = PHASE_EVENT_KEY[status];
          const at = nextEventAt(order);
          const voucher = transitionVoucher(
            effectiveVoucher(order, Date.now()),
            status,
            at,
          );
          const voucherKey =
            voucher && voucher.state !== order.voucher?.state
              ? VOUCHER_EVENT_KEY[voucher.state]
              : undefined;
          const next: Order = {
            ...order,
            status,
            voucher,
            // entering clearance starts the sub-state machine; leaving clears it
            clearanceStep:
              status === "clearance"
                ? order.clearanceStep ?? "pre-clearance"
                : order.status === "clearance"
                  ? null
                  : order.clearanceStep,
            // the clearance banner is resolved once the phase moves on
            attention:
              order.status === "clearance" && status !== "clearance"
                ? null
                : order.attention,
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              ...(eventKey
                ? [makeEvent(status as TimelineEventType, eventKey, at)]
                : []),
              ...(voucherKey ? [makeEvent("voucher", voucherKey, at + 1)] : []),
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
      setClearanceStep: (id, step) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "clearance" ||
            order.clearanceStep === step
          ) {
            return {};
          }
          const next: Order = {
            ...order,
            clearanceStep: step,
            attention: CLEARANCE_STEP_ATTENTION[step] ?? null,
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent(
                "clearance",
                CLEARANCE_STEP_EVENT[step],
                nextEventAt(order),
              ),
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
      setClearanceBlocked: (id, blocked) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "clearance" ||
            order.clearanceStep !== "pre-clearance" ||
            order.clearanceBlocked === blocked
          ) {
            return {};
          }
          const next: Order = {
            ...order,
            clearanceBlocked: blocked,
            attention: blocked ? "order.attClearanceBlocked" : null,
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent(
                "clearance",
                blocked ? "order.evClBlocked" : "order.evClUnblocked",
                nextEventAt(order),
              ),
            ],
          };
          return { orders: s.orders.map((o) => (o.id === id ? next : o)) };
        }),
      confirmBarpin: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "clearance" ||
            order.clearanceStep !== "barpin-confirm"
          ) {
            return {};
          }
          const next: Order = {
            ...order,
            clearanceStep: "submitted",
            barpinConfirmedAt: Date.now(),
            attention: null,
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent(
                "clearance",
                "order.evClBarpinConfirmed",
                nextEventAt(order),
              ),
            ],
          };
          return { orders: s.orders.map((o) => (o.id === id ? next : o)) };
        }),
      requestBarpinRevision: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "clearance" ||
            order.clearanceStep !== "barpin-confirm"
          ) {
            return {};
          }
          const next: Order = {
            ...order,
            attention: "order.attClearanceBarpinRevision",
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent(
                "clearance",
                "order.evClBarpinRevision",
                nextEventAt(order),
              ),
            ],
          };
          return { orders: s.orders.map((o) => (o.id === id ? next : o)) };
        }),
      raiseNpd: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "clearance" ||
            !["bc-review", "npd"].includes(order.clearanceStep ?? "") ||
            order.npdRound >= MAX_NPD_ROUNDS
          ) {
            return {};
          }
          const next: Order = {
            ...order,
            clearanceStep: "npd",
            npdRound: order.npdRound + 1,
            attention: "order.attNpd",
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent("clearance", "order.evClNpd", nextEventAt(order)),
            ],
          };
          return { orders: s.orders.map((o) => (o.id === id ? next : o)) };
        }),
      resubmitClearance: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "clearance" ||
            order.clearanceStep !== "npd"
          ) {
            return {};
          }
          const next: Order = {
            ...order,
            clearanceStep: "bc-review",
            attention: null,
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent("clearance", "order.evClResubmit", nextEventAt(order)),
            ],
          };
          return { orders: s.orders.map((o) => (o.id === id ? next : o)) };
        }),
      resolveClearance: (id, result) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "clearance" ||
            !["bc-review", "npd"].includes(order.clearanceStep ?? "")
          ) {
            return {};
          }
          // Reject → restart clearance from Pre-Clearance (warehouse cost runs on).
          if (result === "reject") {
            const next: Order = {
              ...order,
              clearanceStep: "pre-clearance",
              clearanceBlocked: false,
              npdRound: 0,
              barpinConfirmedAt: null,
              attention: "order.attClearanceReject",
              updatedAt: Date.now(),
              timeline: [
                ...order.timeline,
                makeEvent("clearance", "order.evClReject", nextEventAt(order)),
              ],
            };
            return { orders: s.orders.map((o) => (o.id === id ? next : o)) };
          }
          const next: Order = {
            ...order,
            clearanceStep: result,
            attention: CLEARANCE_STEP_ATTENTION[result] ?? null,
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent(
                "clearance",
                CLEARANCE_STEP_EVENT[result],
                nextEventAt(order),
              ),
            ],
          };
          return { orders: s.orders.map((o) => (o.id === id ? next : o)) };
        }),
      payClearanceTax: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "clearance" ||
            order.clearanceStep !== "sptnp" ||
            order.taxPaidAt
          ) {
            return {};
          }
          const next: Order = {
            ...order,
            taxPaidAt: Date.now(),
            attention: "order.attClearanceReleased",
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent("clearance", "order.evClTaxPaid", nextEventAt(order)),
            ],
          };
          return { orders: s.orders.map((o) => (o.id === id ? next : o)) };
        }),
      setOrderAttention: (id, attention) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status === "draft" ||
            order.attention === attention
          ) {
            return {};
          }
          const next: Order = {
            ...order,
            attention,
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              attention
                ? makeEvent("attention", attention, nextEventAt(order))
                : makeEvent(
                    "attention-cleared",
                    "order.evAttentionCleared",
                    nextEventAt(order),
                  ),
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
      issueQuotation: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (!order || order.status === "draft") return {};
          const at = nextEventAt(order);
          const q = quoteWithVoucher(order, at);
          const next: Order = {
            ...order,
            quotation: q.quotation,
            voucher: q.voucher,
            status: "quotation",
            attention: "order.attQuotationReady",
            opsNotice: null,
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent("quotation", "order.evQuotation", at),
              ...q.events,
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
      approveQuotation: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status === "draft" ||
            !order.quotation ||
            order.status !== "quotation" ||
            // a stale tab must not approve a total whose reservation lapsed
            order.quotation.validUntil < Date.now()
          ) {
            return {};
          }
          const next: Order = {
            ...order,
            status: "pickup",
            attention: null,
            opsNotice: {
              messageKey: "order.opsQuoteApproved",
              action: "book-pickup",
            },
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent(
                "pickup",
                "order.evQuotationApproved",
                nextEventAt(order),
              ),
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
      bookPickup: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "pickup" ||
            order.opsNotice?.action !== "book-pickup"
          ) {
            return {};
          }
          const next: Order = {
            ...order,
            opsNotice: null,
            attention: "order.attPickupScheduled",
            awb: order.awb ?? makeAwb(),
            awbRequest: null,
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent("pickup", "order.evPickup", nextEventAt(order)),
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
      recordPickupFail: (id, cause) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          // pickup attempts pause while a drop-off instruction is pending
          const dropOffPending =
            order?.dropOff &&
            !order.dropOff.expired &&
            !order.dropOff.fulfilledAt;
          if (
            !order ||
            order.status !== "pickup" ||
            dropOffPending
          ) {
            return {};
          }
          const pickupFails: PickupFail[] = [
            ...order.pickupFails,
            { at: Date.now(), cause },
          ];
          const customerFails = pickupFails.filter(
            (f) => f.cause === "customer",
          ).length;
          // 3 customer-fault fails → the customer must request a new AWB;
          // otherwise they choose re-pickup or drop-off.
          const reachedLimit = customerFails >= MAX_CUSTOMER_PICKUP_FAILS;
          const next: Order = {
            ...order,
            pickupFails,
            pickupChoicePending: !reachedLimit,
            attention: reachedLimit
              ? "order.attNeedsNewAwb"
              : cause === "customer"
                ? "order.attPickupFailCustomer"
                : "order.attPickupFailFedEx",
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent(
                "attention",
                cause === "customer"
                  ? "order.evPickupFailCustomer"
                  : "order.evPickupFailFedEx",
                nextEventAt(order),
              ),
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
      reschedulePickup: (id, slot) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "pickup" ||
            !order.pickupChoicePending ||
            !slot.date ||
            !slot.time
          ) {
            return {};
          }
          const pickup = order.modules.pickup;
          const next: Order = {
            ...order,
            modules: {
              ...order.modules,
              pickup: {
                ...pickup,
                data: { ...pickup.data, date: slot.date, time: slot.time },
              },
            },
            pickupChoicePending: false,
            attention: "order.attPickupRescheduled",
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent(
                "pickup",
                "order.evPickupRescheduled",
                nextEventAt(order),
              ),
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
      chooseDropOff: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "pickup" ||
            !order.pickupChoicePending ||
            order.dropOff
          ) {
            return {};
          }
          const now = Date.now();
          const next: Order = {
            ...order,
            pickupChoicePending: false,
            dropOff: {
              requestedAt: now,
              deadline: now + DROP_OFF_DEADLINE_DAYS * 24 * 60 * 60 * 1000,
              fulfilledAt: null,
              expired: false,
            },
            attention: "order.attDropOffRequested",
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent("pickup", "order.evDropOffRequested", nextEventAt(order)),
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
      expireDropOff: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "pickup" ||
            !order.dropOff ||
            order.dropOff.fulfilledAt ||
            order.dropOff.expired
          ) {
            return {};
          }
          const next: Order = {
            ...order,
            dropOff: { ...order.dropOff, expired: true },
            awb: makeAwb(),
            pickupFails: [],
            pickupChoicePending: false,
            attention: "order.attAwbChanged",
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent("awb", "order.evAwbChanged", nextEventAt(order)),
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
      requestNewAwb: (id, req) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          const customerFails = order?.pickupFails.filter(
            (f) => f.cause === "customer",
          ).length;
          const dropOffPending =
            order?.dropOff &&
            !order.dropOff.expired &&
            !order.dropOff.fulfilledAt;
          if (
            !order ||
            order.status !== "pickup" ||
            !customerFails ||
            customerFails < MAX_CUSTOMER_PICKUP_FAILS ||
            dropOffPending
          ) {
            return {};
          }
          const next: Order = {
            ...order,
            awbRequest: req,
            attention: null,
            opsNotice: {
              messageKey: "order.opsAwbRequested",
              action: "issue-awb",
            },
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent("awb", "order.evAwbRequested", nextEventAt(order)),
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
      // Fulfil the new-AWB request: issue a fresh 3PL AWB, reset the attempt
      // history + drop-off, and re-issue a quotation the customer must re-approve.
      // The stable Rimkirim tracking number is unchanged. After approval the
      // order returns to the pickup phase (via approveQuotation → bookPickup).
      issueNewAwb: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "pickup" ||
            order.opsNotice?.action !== "issue-awb"
          ) {
            return {};
          }
          const rebased: Order = {
            ...order,
            opsNotice: null,
            awb: makeAwb(),
            pickupFails: [],
            pickupChoicePending: false,
            dropOff: null,
          };
          const at = nextEventAt(rebased);
          // the reservation survives the re-quote; the discount is recomputed
          const q = quoteWithVoucher(rebased, at + 2);
          const next: Order = {
            ...rebased,
            status: "quotation",
            quotation: q.quotation,
            voucher: q.voucher,
            attention: "order.attQuotationReady",
            updatedAt: Date.now(),
            timeline: [
              ...rebased.timeline,
              makeEvent("awb", "order.evAwbIssued", at),
              makeEvent("quotation", "order.evQuotation", at + 1),
              ...q.events,
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
      confirmDropOff: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "pickup" ||
            !order.dropOff ||
            order.dropOff.fulfilledAt ||
            order.dropOff.expired
          ) {
            return {};
          }
          const next: Order = {
            ...order,
            dropOff: { ...order.dropOff, fulfilledAt: Date.now() },
            attention: null,
            opsNotice: {
              messageKey: "order.opsDroppedOff",
              action: "confirm-drop-off",
            },
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent("pickup", "order.evDropOffConfirmed", nextEventAt(order)),
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
      confirmDroppedOff: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "pickup" ||
            order.opsNotice?.action !== "confirm-drop-off"
          ) {
            return {};
          }
          const at = nextEventAt(order);
          const voucher = transitionVoucher(order.voucher, "in-transit", at);
          const next: Order = {
            ...order,
            status: "in-transit",
            voucher,
            opsNotice: null,
            attention: null,
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent("in-transit", "order.evDroppedOff", at),
              ...(voucher?.state === "redeemed" && order.voucher?.state !== "redeemed"
                ? [makeEvent("voucher", "order.evVoucherRedeemed", at + 1)]
                : []),
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
      requestRevision: (id, moduleId, note = null) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status === "draft" ||
            !["review", "quotation"].includes(order.status)
          ) {
            return {};
          }
          const next: Order = {
            ...order,
            revisionModule: moduleId,
            revisionNote: note?.trim() ? note.trim() : null,
            status: "review",
            attention: "order.attRevision",
            opsNotice: null,
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent("attention", "order.evRevision", nextEventAt(order)),
            ],
          };
          return {
            orders: s.orders.map((o) => (o.id === id ? next : o)),
          };
        }),
    }),
    {
      name: "rimkirim:order",
      partialize: (s) => ({
        orders: s.orders,
        draftOrder: s.draftOrder,
        activeDraftId: s.activeDraftId,
        context: s.context,
        selectedRate: s.selectedRate,
        answers: s.answers,
        clearance: s.clearance,
        modules: s.modules,
        bookingNumber: s.bookingNumber,
        generatedPackingCode: s.generatedPackingCode,
        pendingStart: s.pendingStart,
      }),
      // Migrate the pre-multi-order single-draft shape into a draft order so
      // existing dev state isn't dropped (no `orders` array in the old shape).
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<OrderStoreState>;
        if (Array.isArray(p.orders)) {
          // Backfill fields added after an order was persisted (attention,
          // timeline) so stale localStorage never crashes consumers.
          const orders = (p.orders as Order[]).map((o) => ({
            ...o,
            attention: o.attention ?? null,
            timeline: o.timeline ?? [],
            // pre-breakdown quotations lack the surcharge/tax/warehouse fields;
            // re-derive from the order so the enriched card never reads undefined.
            quotation:
              o.quotation && (o.quotation as Partial<Quotation>).baseRate === undefined
                ? buildQuotation(o)
                : o.quotation
                  ? {
                      ...o.quotation,
                      discount: o.quotation.discount ?? 0,
                      voucherCode: o.quotation.voucherCode ?? null,
                    }
                  : null,
            revisionModule: o.revisionModule ?? null,
            revisionNote: o.revisionNote ?? null,
            opsNotice: o.opsNotice ?? null,
            awb: o.awb ?? null,
            pickupFails: o.pickupFails ?? [],
            pickupChoicePending: o.pickupChoicePending ?? false,
            dropOff: o.dropOff ?? null,
            awbRequest: o.awbRequest ?? null,
            // drop clearance steps from the pre-Round-13 enum (documents/…);
            // an order still in clearance falls back to "pre-clearance".
            clearanceStep:
              o.clearanceStep && CLEARANCE_STEP_EVENT[o.clearanceStep]
                ? o.clearanceStep
                : null,
            clearanceBlocked: o.clearanceBlocked ?? false,
            npdRound: o.npdRound ?? 0,
            barpinConfirmedAt: o.barpinConfirmedAt ?? null,
            taxPaidAt: o.taxPaidAt ?? null,
            voucher: o.voucher ?? null,
          }));
          // Pre-draftOrder shape kept un-booked questionnaire drafts inside
          // `orders`. Those are not orders any more: the active one migrates
          // into `draftOrder`, the rest (orphans) are dropped.
          const isPreHub = (o: Order) =>
            o.status === "draft" && o.bookingNumber === null;
          const migrated =
            (p.draftOrder as Order | undefined) ??
            orders.find((o) => isPreHub(o) && o.id === p.activeDraftId) ??
            null;
          return {
            ...current,
            ...p,
            orders: orders.filter((o) => !isPreHub(o)),
            draftOrder: migrated,
          };
        }
        if (p.context) {
          const id = makeOrderId();
          const order: Order = {
            id,
            ownerEmail: useAuthStore.getState().currentEmail,
            status: "draft",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            attention: null,
            timeline: [makeEvent("created", "order.evCreated")],
            quotation: null,
            revisionModule: null,
            revisionNote: null,
            opsNotice: null,
            awb: null,
            pickupFails: [],
            pickupChoicePending: false,
            dropOff: null,
            awbRequest: null,
            clearanceStep: null,
            clearanceBlocked: false,
            npdRound: 0,
            barpinConfirmedAt: null,
            taxPaidAt: null,
            voucher: null,
            context: p.context,
            selectedRate: p.selectedRate ?? null,
            answers: p.answers ?? {},
            clearance: p.clearance ?? null,
            modules: p.modules ?? emptyModules,
            bookingNumber: p.bookingNumber ?? null,
            generatedPackingCode: p.generatedPackingCode ?? null,
          };
          // A booked single-draft was a real order; an un-booked one becomes
          // the pre-hub draftOrder (see draftOrder on the state interface).
          const booked = order.bookingNumber !== null;
          return {
            ...current,
            ...p,
            orders: booked ? [order] : [],
            draftOrder: booked ? null : order,
            activeDraftId: id,
            pendingStart: null,
          };
        }
        return { ...current };
      },
    },
  ),
);

// ---- Derived selectors (pure helpers) -----------------------------------

/**
 * Which clearance options the user may pick, from the questionnaire answers.
 * Passenger Goods is always available; Personal Belongings requires the user to
 * have lived abroad long enough AND be able to apply for SKP (c=Yes AND d=Yes).
 */
export function allowedClearance(a: QuestionnaireAnswers): {
  personal: boolean;
  passenger: boolean;
} {
  return {
    personal: a.livedLongEnough === true && a.canApplySKP === true,
    passenger: true,
  };
}

/** Order of the four modules in the hub. */
export const MODULE_ORDER: ModuleId[] = [
  "customerInfo",
  "items",
  "compliance",
  "pickup",
];

/** Pickup unlocks only once the other three modules are complete. */
export function isPickupUnlocked(modules: Modules): boolean {
  return (["customerInfo", "items", "compliance"] as ModuleId[]).every(
    (id) => modules[id].status === "complete",
  );
}

/** The packing list can be generated once Customer Info + Items are complete. */
export function isPackingListReady(modules: Modules): boolean {
  return (
    modules.customerInfo.status === "complete" &&
    modules.items.status === "complete"
  );
}

/** All four modules complete → order request can be submitted. */
export function allModulesComplete(modules: Modules): boolean {
  return MODULE_ORDER.every((id) => modules[id].status === "complete");
}

/**
 * The packing list code to display: the one supplied in the questionnaire wins,
 * else the system-generated one (present only once CI+Items are complete),
 * else null (nothing to show yet).
 */
export function effectivePackingCode(s: {
  answers: QuestionnaireAnswers;
  generatedPackingCode: string | null;
}): string | null {
  return s.answers.packingCode?.trim() || s.generatedPackingCode || null;
}

/**
 * The current user's orders, urgency first: orders where the ball is in the
 * customer's court outrank the quiet ones, newest first within each group —
 * the list is an inbox before it is an archive. (Every entry in `orders` has
 * a booking number now — a questionnaire-stage draft is not an order; the
 * legacy filter stays as a guard against stale persisted state.)
 */
export function useMyOrders(email: string | null): Order[] {
  return useOrderStore(
    useShallow((s) => {
      if (!email) return [];
      const needsAction = (o: Order) =>
        o.attention !== null && ACTION_ATTENTION.has(o.attention) ? 1 : 0;
      return s.orders
        .filter(
          (o) =>
            o.ownerEmail === email &&
            (o.status !== "draft" || o.bookingNumber !== null),
        )
        .sort(
          (a, b) => needsAction(b) - needsAction(a) || b.createdAt - a.createdAt,
        );
    }),
  );
}

/** Every order the user owns, the pre-hub draft included (for linkage checks,
 *  not lists). */
export function useAllMyOrders(email: string | null): Order[] {
  return useOrderStore(
    useShallow((s) => {
      if (!email) return [];
      const owned = s.orders.filter((o) => o.ownerEmail === email);
      return s.draftOrder?.ownerEmail === email
        ? [...owned, s.draftOrder]
        : owned;
    }),
  );
}

/**
 * Client hydration flag (mirrors useCalculatorStore's pattern) so guards don't
 * redirect before the persisted order state has loaded.
 */
export function useOrderHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    const p = useOrderStore.persist;
    if (!p) {
      setHydrated(true);
      return;
    }
    const unsub = p.onFinishHydration(() => setHydrated(true));
    if (p.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}
