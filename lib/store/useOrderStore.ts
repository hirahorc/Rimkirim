"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Citizenship = "indonesian" | "foreigner";
export type ClearanceKind = "personal" | "passenger";
export type ModuleId = "customerInfo" | "items" | "compliance" | "pickup";
export type ModuleStatus = "not-started" | "in-progress" | "complete";

/** Corridor context carried in from the rate flow (Back For Good only for now). */
export interface OrderContext {
  service: "bfg";
  originCountry: string; // ISO code (the foreign side)
  destCountry: string; // "ID"
}

export interface QuestionnaireAnswers {
  shippingPersonal?: boolean; // (a)
  citizenship?: Citizenship; // (b)
  livedLongEnough?: boolean; // (c)
  canApplySKP?: boolean; // (d)
  hasPackingCode?: boolean; // (e)
  packingCode?: string;
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

interface OrderState {
  context: OrderContext | null;
  answers: QuestionnaireAnswers;
  clearance: ClearanceKind | null;
  modules: Modules;

  startOrder: (ctx: OrderContext) => void;
  setAnswers: (patch: Partial<QuestionnaireAnswers>) => void;
  setClearance: (c: ClearanceKind) => void;
  saveModule: (id: ModuleId, data: Record<string, unknown>) => void;
  reset: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      context: null,
      answers: {},
      clearance: null,
      modules: emptyModules,

      startOrder: (ctx) =>
        set({
          context: ctx,
          // starting a fresh order clears any prior questionnaire/clearance/modules
          answers: {},
          clearance: null,
          modules: emptyModules,
        }),
      setAnswers: (patch) =>
        set((s) => ({ answers: { ...s.answers, ...patch } })),
      setClearance: (c) => set({ clearance: c }),
      saveModule: (id, data) =>
        set((s) => ({
          modules: { ...s.modules, [id]: { status: "complete", data } },
        })),
      reset: () =>
        set({ context: null, answers: {}, clearance: null, modules: emptyModules }),
    }),
    {
      name: "rimkirim:order",
      partialize: (s) => ({
        context: s.context,
        answers: s.answers,
        clearance: s.clearance,
        modules: s.modules,
      }),
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
