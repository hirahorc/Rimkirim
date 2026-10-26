"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExpatItem, ExpatQuantity } from "@/lib/schemas/expat-quote";

export interface ExpatQuoteDraft {
  origin: string;
  city: string;
  items: ExpatItem[];
  quantity: ExpatQuantity | "";
  name: string;
  email: string;
  /** ISO code of the WhatsApp number's country, not "+44" */
  dial: string;
  phone: string;
  notes: string;
}

export const EMPTY_EXPAT_DRAFT: ExpatQuoteDraft = {
  origin: "",
  city: "",
  items: [],
  quantity: "",
  name: "",
  email: "",
  dial: "",
  phone: "",
  notes: "",
};

interface ExpatQuoteState {
  draft: ExpatQuoteDraft;
  step: 1 | 2;
  /** the enquiry as sent; lives for the session only, so a reload starts a
   *  fresh form instead of showing a stale confirmation */
  sent: ExpatQuoteDraft | null;
  update: (patch: Partial<ExpatQuoteDraft>) => void;
  toggleItem: (item: ExpatItem) => void;
  setStep: (step: 1 | 2) => void;
  send: () => void;
  startOver: () => void;
}

/**
 * The expat quote form's state. The landing renders the form twice (hero and
 * closing), and both instances read this one store, so whatever a visitor
 * typed up top is still there at the bottom. The draft persists (a move is
 * planned over days, and progress must never be lost); hydration is skipped
 * at creation and run after mount (`useExpatQuoteHydration`) so the server
 * render and the first client render agree.
 */
export const useExpatQuoteStore = create<ExpatQuoteState>()(
  persist(
    (set, get) => ({
      draft: EMPTY_EXPAT_DRAFT,
      step: 1,
      sent: null,
      update: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      toggleItem: (item) =>
        set((s) => {
          const has = s.draft.items.includes(item);
          const items = has ? s.draft.items.filter((i) => i !== item) : [...s.draft.items, item];
          return { draft: { ...s.draft, items } };
        }),
      setStep: (step) => set({ step }),
      // prototype: nothing leaves the browser yet (no backend); the lead is
      // only held here so the confirmation can quote it back
      send: () => set({ sent: get().draft, draft: EMPTY_EXPAT_DRAFT, step: 1 }),
      startOver: () => set({ sent: null, draft: EMPTY_EXPAT_DRAFT, step: 1 }),
    }),
    {
      name: "rimkirim:expat-quote",
      partialize: (s) => ({ draft: s.draft, step: s.step }),
      skipHydration: true,
    },
  ),
);

/** Rehydrate the persisted draft once, after mount. */
export function useExpatQuoteHydration() {
  React.useEffect(() => {
    const p = useExpatQuoteStore.persist;
    if (!p.hasHydrated()) void p.rehydrate();
  }, []);
}
