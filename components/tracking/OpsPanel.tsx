"use client";

import * as React from "react";
import { Loader2, Wrench } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useOrderStore, useOrderHydrated } from "@/lib/store/useOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { OpsSimulator } from "./OpsSimulator";

/** Ops control-plane page: one simulator card per submitted order. */
export function OpsPanel() {
  const t = useT();
  const hydrated = useOrderHydrated();
  const orders = useOrderStore(
    useShallow((s) => s.orders.filter((o) => o.status !== "draft")),
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          <Wrench className="size-6 text-info" /> {t("ops.title")}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{t("ops.subtitle")}</p>
      </header>

      {orders.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">
          {t("ops.noOrders")}
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <OpsSimulator key={o.id} order={o} />
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-muted-2">{t("ops.hint")}</p>
    </div>
  );
}
