"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { makePackingCode, makePackingListId } from "@/lib/utils/order-ids";
import type { PackingList, PackingListData } from "@/lib/types/packing";

interface PackingListState {
  lists: PackingList[];
  create: (ownerEmail: string, data: PackingListData) => PackingList;
  update: (id: string, data: PackingListData) => void;
  remove: (id: string) => void;
}

export const usePackingListStore = create<PackingListState>()(
  persist(
    (set) => ({
      lists: [],
      create: (ownerEmail, data) => {
        const now = Date.now();
        const list: PackingList = {
          id: makePackingListId(),
          code: makePackingCode(),
          ownerEmail,
          createdAt: now,
          updatedAt: now,
          data,
        };
        set((s) => ({ lists: [...s.lists, list] }));
        return list;
      },
      update: (id, data) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === id ? { ...l, data, updatedAt: Date.now() } : l,
          ),
        })),
      remove: (id) => set((s) => ({ lists: s.lists.filter((l) => l.id !== id) })),
    }),
    { name: "rimkirim:packing", partialize: (s) => ({ lists: s.lists }) },
  ),
);

/** The current user's packing lists, most recently touched first. */
export function useMyPackingLists(email: string | null): PackingList[] {
  return usePackingListStore(
    useShallow((s) =>
      email
        ? s.lists
            .filter((l) => l.ownerEmail === email)
            .sort((a, b) => b.updatedAt - a.updatedAt)
        : [],
    ),
  );
}

export function usePackingList(id: string | null): PackingList | undefined {
  return usePackingListStore((s) => (id ? s.lists.find((l) => l.id === id) : undefined));
}

/** Non-hook lookup: a packing list the given user owns, by its code. */
export function findOwnedByCode(
  email: string | null | undefined,
  code: string,
): PackingList | undefined {
  if (!email) return undefined;
  const n = code.trim().toUpperCase();
  return usePackingListStore
    .getState()
    .lists.find((l) => l.ownerEmail === email && l.code === n);
}

export function usePackingHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    const p = usePackingListStore.persist;
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
