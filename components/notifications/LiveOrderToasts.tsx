"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import {
  useOrderStore,
  useOrderHydrated,
  type TimelineEventType,
} from "@/lib/store/useOrderStore";
import { useAuthHydrated, useCurrentUser } from "@/lib/store/useAuthStore";
import { useT } from "@/lib/i18n/LanguageProvider";

interface FlatEvent {
  key: string;
  kind: TimelineEventType;
  messageKey: string;
  orderId: string;
  identifier: string | null;
}

/**
 * Announces ops-driven order changes while the app is open: any timeline
 * event that appears after mount fires one clickable toast. The bell stays
 * the history; this is the "something just happened" signal the bell badge
 * alone couldn't give.
 */
export function LiveOrderToasts() {
  const t = useT();
  const router = useRouter();
  const hydrated = useOrderHydrated();
  const authHydrated = useAuthHydrated();
  const email = useCurrentUser()?.email ?? null;
  const orders = useOrderStore(
    useShallow((s) =>
      email ? s.orders.filter((o) => o.ownerEmail === email) : [],
    ),
  );
  const seen = React.useRef<Set<string> | null>(null);

  // a different signed-in user starts from a fresh baseline (declared before
  // the announcer so it runs first on the same commit)
  React.useEffect(() => {
    seen.current = null;
  }, [email]);

  React.useEffect(() => {
    if (!hydrated || !authHydrated || !email) return;
    const events: FlatEvent[] = [];
    for (const o of orders)
      for (const e of o.timeline ?? [])
        events.push({
          key: `${o.id}:${e.id}`,
          kind: e.type,
          messageKey: e.messageKey,
          orderId: o.id,
          identifier: o.bookingNumber,
        });
    // first pass after hydration is the baseline — history isn't news
    if (!seen.current) {
      seen.current = new Set(events.map((e) => e.key));
      return;
    }
    const fresh = events.filter((e) => !seen.current!.has(e.key));
    for (const e of fresh) seen.current.add(e.key);
    // if a burst lands at once, announce only the latest few
    for (const e of fresh.slice(-3)) {
      const fire =
        e.kind === "delivered"
          ? toast.success
          : e.kind === "attention"
            ? toast.warning
            : e.kind === "cancelled"
              ? toast.error
              : toast.info;
      fire(t(e.messageKey), {
        description: e.identifier ?? undefined,
        action: {
          label: t("notif.view"),
          onClick: () => router.push(`/pesanan/${e.orderId}`),
        },
      });
    }
  }, [orders, hydrated, authHydrated, email, router, t]);

  return null;
}
