"use client";

import * as React from "react";
import { Loader2, Wrench } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useOrderStore, useOrderHydrated } from "@/lib/store/useOrderStore";
import { useVoucherHydrated } from "@/lib/store/useVoucherStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OpsSimulator } from "./OpsSimulator";
import { VoucherOpsTab } from "./VoucherOpsTab";

/** Ops control-plane page: one simulator card per submitted order, plus the voucher back-office. */
export function OpsPanel() {
  const t = useT();
  // both stores gate the page: the voucher tab reads campaigns and orders
  const ordersHydrated = useOrderHydrated();
  const vouchersHydrated = useVoucherHydrated();
  const hydrated = ordersHydrated && vouchersHydrated;
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
    // 5xl for the voucher tables; the order cards keep their 3xl reading width
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          <Wrench className="size-6 text-info" /> {t("ops.title")}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{t("ops.subtitle")}</p>
      </header>

      <Tabs defaultValue="orders">
        <TabsList className="mb-5">
          <TabsTrigger value="orders">{t("ops.ordersTab")}</TabsTrigger>
          <TabsTrigger value="vouchers">{t("ops.vcTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="max-w-3xl">
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
        </TabsContent>
        <TabsContent value="vouchers">
          <VoucherOpsTab />
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-xs text-muted-2">{t("ops.hint")}</p>
    </div>
  );
}
