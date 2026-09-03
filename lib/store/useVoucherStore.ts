"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Campaign } from "@/lib/voucher/engine";
import { SEED_CAMPAIGNS } from "@/lib/voucher/seed";

/**
 * Campaign definitions (mock back-office). Redemption state lives on each
 * Order (`order.voucher`) so every lifecycle step stays atomic with the
 * order transition that causes it; counts are derived, never stored here.
 */
interface VoucherStoreState {
  campaigns: Campaign[];
  upsertCampaign: (c: Campaign) => void;
  removeCampaign: (id: string) => void;
  setCampaignActive: (id: string, active: boolean) => void;
  resetToSeed: () => void;
}

export const useVoucherStore = create<VoucherStoreState>()(
  persist(
    (set) => ({
      campaigns: SEED_CAMPAIGNS,
      upsertCampaign: (c) =>
        set((s) => ({
          campaigns: s.campaigns.some((k) => k.id === c.id)
            ? s.campaigns.map((k) => (k.id === c.id ? c : k))
            : [...s.campaigns, c],
        })),
      removeCampaign: (id) =>
        set((s) => ({ campaigns: s.campaigns.filter((k) => k.id !== id) })),
      setCampaignActive: (id, active) =>
        set((s) => ({
          campaigns: s.campaigns.map((k) => (k.id === id ? { ...k, active } : k)),
        })),
      resetToSeed: () => set({ campaigns: SEED_CAMPAIGNS }),
    }),
    {
      name: "rimkirim:voucher",
      version: 1,
      partialize: (s) => ({ campaigns: s.campaigns }),
    },
  ),
);

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function makeCampaignId(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `cmp-${s}`;
}

/** Hydration flag so the ops tab doesn't flash the seed before edits load. */
export function useVoucherHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    const p = useVoucherStore.persist;
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
