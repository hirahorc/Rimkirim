"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import {
  makeBookingNumber,
  makeOrderId,
  makePackingCode,
  makeTrackingNumber,
} from "@/lib/utils/order-ids";
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
          if (o.status !== "draft") return null;
          return {
            status: "review",
            trackingNumber: o.trackingNumber ?? makeTrackingNumber(),
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
          return { ...current, ...p };
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
