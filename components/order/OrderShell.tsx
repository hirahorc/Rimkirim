"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useOrderStore, useOrderHydrated } from "@/lib/store/useOrderStore";
import { useAuthHydrated, useCurrentUser } from "@/lib/store/useAuthStore";

export function OrderShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useOrderHydrated();
  const authHydrated = useAuthHydrated();
  const user = useCurrentUser();
  const context = useOrderStore((s) => s.context);
  const pendingStart = useOrderStore((s) => s.pendingStart);
  const startOrder = useOrderStore((s) => s.startOrder);
  const setPendingStart = useOrderStore((s) => s.setPendingStart);

  React.useEffect(() => {
    if (!hydrated || !authHydrated) return;
    // orders belong to a user — send logged-out visitors to sign in first
    if (!user) {
      router.replace(`/masuk?next=${encodeURIComponent(pathname)}`);
      return;
    }
    // resume an order start that was stashed before login
    if (pendingStart && !context) {
      startOrder(pendingStart.context, pendingStart.rate);
      setPendingStart(null);
      return;
    }
    if (!context) router.replace("/cek-tarif");
  }, [
    hydrated,
    authHydrated,
    user,
    context,
    pendingStart,
    startOrder,
    setPendingStart,
    router,
    pathname,
  ]);

  if (!hydrated || !authHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }
  if (!user) return null;
  if (!context) return null;

  // No stepper here on purpose: eligibility and clearance are one-way,
  // one-time gates (there is no navigating back), and the order form — the
  // page people actually return to — carries its own "N of 4 sections"
  // progress bar. Each page opens with its own heading instead.
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
  );
}
