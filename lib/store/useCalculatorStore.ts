"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CalculatorValues } from "@/lib/schemas/calculator";

interface CalculatorState {
  /** the last submitted calculator input; null until first submit */
  submitted: CalculatorValues | null;
  /** true once the persisted store has rehydrated on the client */
  hydrated: boolean;
  setSubmitted: (values: CalculatorValues) => void;
  clear: () => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      submitted: null,
      hydrated: false,
      setSubmitted: (values) => set({ submitted: values }),
      clear: () => set({ submitted: null }),
    }),
    {
      name: "rimkirim:calc",
      onRehydrateStorage: () => () => {
        // mark hydration complete to avoid SSR/client mismatch flashes
        useCalculatorStore.setState({ hydrated: true });
      },
    },
  ),
);
