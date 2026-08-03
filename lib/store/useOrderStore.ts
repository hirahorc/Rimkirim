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
  makeTrackingNumber,
} from "@/lib/utils/order-ids";
import { totalChargeableWeight } from "@/lib/utils/chargeable-weight";
import { useAuthStore } from "./useAuthStore";

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
}

/** One line of the itemized quotation breakdown (label is an i18n key). */
export interface QuotationItem {
  labelKey: string;
  amount: number;
}

/** The official quotation issued by ops (mock — numbers are demo-only). */
export interface Quotation {
  total: number; // IDR
  perKg: number; // IDR charged per chargeable kg
  chargeableKg: number;
  items: QuotationItem[];
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

/** Loose package shape as saved by the Items module (for weight math). */
interface Pkg {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  quantity?: number;
}

/** Build a demo quotation from the order's selected rate + item dimensions. */
export function buildQuotation(
  order: Pick<Order, "modules" | "selectedRate">,
): Quotation {
  const packages = (order.modules.items.data as { packages?: Pkg[] } | undefined)
    ?.packages ?? [];
  const chargeableKg = totalChargeableWeight(
    packages.map((p) => ({
      weight: Number(p?.weight) || 0,
      length: Number(p?.length) || 0,
      width: Number(p?.width) || 0,
      height: Number(p?.height) || 0,
      quantity: 1,
    })),
  );
  const perKg = order.selectedRate?.perKg ?? 135000;
  const freight = Math.round(perKg * chargeableKg);
  const items: QuotationItem[] = [
    { labelKey: "order.quFeeFreight", amount: freight },
    { labelKey: "order.quFeeInsurance", amount: Math.round(freight * 0.015) },
    { labelKey: "order.quFeeClearance", amount: 750000 },
    { labelKey: "order.quFeePickup", amount: 150000 },
  ];
  const total = items.reduce((sum, i) => sum + i.amount, 0);
  const now = Date.now();
  return {
    total,
    perKg,
    chargeableKg,
    items,
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
  | "awb";

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

export interface Order {
  id: string;
  ownerEmail: string | null;
  status: OrderStatus;
  /** Stable Rimkirim tracking number, issued once the order is submitted. */
  trackingNumber: string | null;
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
  /** The FedEx airway bill. Unlike the stable trackingNumber, this can be
   *  re-issued when pickups keep failing or a drop-off deadline is missed. */
  awb: string | null;
  /** Failed pickup attempts, oldest first, with fault attribution. */
  pickupFails: PickupFail[];
  /** True while the customer must choose re-pickup or drop-off after a failure. */
  pickupChoicePending: boolean;
  /** Active drop-off instruction (null = normal pickup flow). */
  dropOff: DropOffInstruction | null;
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
  trackingNumber: string | null;
  pendingStart: PendingStart | null;

  startOrder: (ctx: OrderContext, rate?: SelectedRate | null) => void;
  setAnswers: (patch: Partial<QuestionnaireAnswers>) => void;
  setClearance: (c: ClearanceKind) => void;
  saveModule: (id: ModuleId, data: Record<string, unknown>) => void;
  /** create a booking number once, on entering the order form */
  ensureBookingNumber: () => void;
  /** generate a packing code once CI+Items are done and none was supplied */
  ensurePackingCode: () => void;
  /** final agree → the order leaves the draft and enters Review (tracking issued) */
  submitOrder: () => void;
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
  /** customer: after a failed pickup, choose to reschedule the pickup */
  reschedulePickup: (id: string) => void;
  /** customer: after a failed pickup, choose a drop-off at a FedEx location */
  chooseDropOff: (id: string) => void;
  /** ops control plane: simulate the 2-day drop-off deadline passing → AWB change */
  expireDropOff: (id: string) => void;
  /** ops control plane: fulfil the customer's new-AWB request */
  issueNewAwb: (id: string) => void;
  /** ops control plane: confirm the customer's drop-off → shipment goes in transit */
  confirmDroppedOff: (id: string) => void;
  /** customer: request a new AWB after repeated customer-fault pickup failures */
  requestNewAwb: (id: string) => void;
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
  "trackingNumber",
];

/** Copy the draft fields of an order into the flat state shape. */
function syncFlatFrom(order: Order): Partial<OrderStoreState> {
  const flat: Partial<OrderStoreState> = {};
  for (const key of FLAT_KEYS) {
    (flat as Record<string, unknown>)[key] = order[key];
  }
  return flat;
}

/** Mutate the active draft (both the `orders` entry and the flat mirrors). */
function updateDraft(
  set: (fn: (s: OrderStoreState) => Partial<OrderStoreState>) => void,
  updater: (order: Order) => Partial<Order> | null,
): void {
  set((s) => {
    const order = s.orders.find((o) => o.id === s.activeDraftId);
    if (!order) return {};
    const patch = updater(order);
    if (!patch) return {};
    const next: Order = { ...order, ...patch, updatedAt: Date.now() };
    return {
      orders: s.orders.map((o) => (o.id === next.id ? next : o)),
      ...syncFlatFrom(next),
    };
  });
}

export const useOrderStore = create<OrderStoreState>()(
  persist(
    (set) => ({
      orders: [],
      activeDraftId: null,
      context: null,
      selectedRate: null,
      answers: {},
      clearance: null,
      modules: emptyModules,
      bookingNumber: null,
      generatedPackingCode: null,
      trackingNumber: null,
      pendingStart: null,

      startOrder: (ctx, rate = null) =>
        set((s) => {
          const id = makeOrderId();
          const order: Order = {
            id,
            ownerEmail: useAuthStore.getState().currentEmail,
            status: "draft",
            trackingNumber: null,
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
            clearanceStep: null,
            clearanceBlocked: false,
            npdRound: 0,
            barpinConfirmedAt: null,
            taxPaidAt: null,
            context: ctx,
            selectedRate: rate,
            answers: {},
            clearance: null,
            modules: emptyModules,
            bookingNumber: null,
            generatedPackingCode: null,
          };
          return {
            orders: [...s.orders, order],
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
      ensureBookingNumber: () =>
        updateDraft(set, (o) =>
          o.bookingNumber ? null : { bookingNumber: makeBookingNumber() },
        ),
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
          return {
            status: nextStatus,
            trackingNumber: o.trackingNumber ?? makeTrackingNumber(),
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
                nextEventAt(o),
              ),
            ],
          };
        }),
      reset: () =>
        set({
          activeDraftId: null,
          context: null,
          selectedRate: null,
          answers: {},
          clearance: null,
          modules: emptyModules,
          bookingNumber: null,
          generatedPackingCode: null,
          trackingNumber: null,
        }),
      resumeOrder: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
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
          const next: Order = {
            ...order,
            status,
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
            timeline: eventKey
              ? [
                  ...order.timeline,
                  makeEvent(
                    status as TimelineEventType,
                    eventKey,
                    nextEventAt(order),
                  ),
                ]
              : order.timeline,
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
          const next: Order = {
            ...order,
            quotation: buildQuotation(order),
            status: "quotation",
            attention: "order.attQuotationReady",
            opsNotice: null,
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent("quotation", "order.evQuotation", nextEventAt(order)),
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
            order.status !== "quotation"
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
      reschedulePickup: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          if (
            !order ||
            order.status !== "pickup" ||
            !order.pickupChoicePending
          ) {
            return {};
          }
          const next: Order = {
            ...order,
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
      requestNewAwb: (id) =>
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
          const next: Order = {
            ...order,
            opsNotice: null,
            awb: makeAwb(),
            pickupFails: [],
            pickupChoicePending: false,
            attention: "order.attAwbIssued",
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent("awb", "order.evAwbIssued", nextEventAt(order)),
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
          const next: Order = {
            ...order,
            status: "in-transit",
            opsNotice: null,
            attention: null,
            updatedAt: Date.now(),
            timeline: [
              ...order.timeline,
              makeEvent("in-transit", "order.evDroppedOff", nextEventAt(order)),
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
        activeDraftId: s.activeDraftId,
        context: s.context,
        selectedRate: s.selectedRate,
        answers: s.answers,
        clearance: s.clearance,
        modules: s.modules,
        bookingNumber: s.bookingNumber,
        generatedPackingCode: s.generatedPackingCode,
        trackingNumber: s.trackingNumber,
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
            quotation: o.quotation ?? null,
            revisionModule: o.revisionModule ?? null,
            revisionNote: o.revisionNote ?? null,
            opsNotice: o.opsNotice ?? null,
            awb: o.awb ?? null,
            pickupFails: o.pickupFails ?? [],
            pickupChoicePending: o.pickupChoicePending ?? false,
            dropOff: o.dropOff ?? null,
            clearanceStep: o.clearanceStep ?? null,
            clearanceBlocked: o.clearanceBlocked ?? false,
            npdRound: o.npdRound ?? 0,
            barpinConfirmedAt: o.barpinConfirmedAt ?? null,
            taxPaidAt: o.taxPaidAt ?? null,
          }));
          return { ...current, ...p, orders };
        }
        if (p.context) {
          const id = makeOrderId();
          const order: Order = {
            id,
            ownerEmail: useAuthStore.getState().currentEmail,
            status: "draft",
            trackingNumber: null,
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
            clearanceStep: null,
            clearanceBlocked: false,
            npdRound: 0,
            barpinConfirmedAt: null,
            taxPaidAt: null,
            context: p.context,
            selectedRate: p.selectedRate ?? null,
            answers: p.answers ?? {},
            clearance: p.clearance ?? null,
            modules: p.modules ?? emptyModules,
            bookingNumber: p.bookingNumber ?? null,
            generatedPackingCode: p.generatedPackingCode ?? null,
          };
          return {
            ...current,
            ...p,
            orders: [order],
            activeDraftId: id,
            trackingNumber: null,
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

/** The current user's orders — in-progress drafts included (a draft is an order). */
export function useMyOrders(email: string | null): Order[] {
  return useOrderStore(
    useShallow((s) => {
      if (!email) return [];
      return s.orders
        .filter((o) => o.ownerEmail === email)
        .sort((a, b) => b.createdAt - a.createdAt);
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
