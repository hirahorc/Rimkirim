"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationsState {
  /** email → timestamp up to which that user has read their notifications */
  readUpTo: Record<string, number>;
  markAllRead: (email: string, upTo: number) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      readUpTo: {},
      markAllRead: (email, upTo) =>
        set((s) => ({
          readUpTo: {
            ...s.readUpTo,
            [email]: Math.max(s.readUpTo[email] ?? 0, upTo),
          },
        })),
    }),
    { name: "rimkirim:notifications" },
  ),
);

/** Hydration flag so the bell doesn't flash an unread dot before read state loads. */
export function useNotificationsHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    const p = useNotificationsStore.persist;
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
