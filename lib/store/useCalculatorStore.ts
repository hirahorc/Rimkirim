"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CalculatorValues } from "@/lib/schemas/calculator";

interface CalculatorState {
  /** the last submitted calculator input; null until first submit */
  submitted: CalculatorValues | null;
  setSubmitted: (values: CalculatorValues) => void;
  clear: () => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      submitted: null,
      setSubmitted: (values) => set({ submitted: values }),
      clear: () => set({ submitted: null }),
    }),
    {
      name: "rimkirim:calc",
      partialize: (s) => ({ submitted: s.submitted }),
    },
  ),
);

/**
 * True once the persisted store has finished rehydrating on the client.
 * Uses zustand's official persist hydration API to avoid SSR/client mismatch
 * and the timing pitfalls of onRehydrateStorage.
 */
export function useStoreHydrated(): boolean {
  // Always start false so server and first client render match (no SSR mismatch).
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const p = useCalculatorStore.persist;
    if (!p) {
      setHydrated(true);
      return;
    }
    const unsubFinish = p.onFinishHydration(() => setHydrated(true));
    if (p.hasHydrated()) setHydrated(true);
    return unsubFinish;
  }, []);

  return hydrated;
}
