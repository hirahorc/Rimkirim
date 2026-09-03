"use client";

import * as React from "react";
import { Receipt } from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { useVoucherStore } from "@/lib/store/useVoucherStore";
import { estimateOrder } from "@/lib/voucher/estimate";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { EstimateBreakdown } from "./EstimateBreakdown";

/**
 * What pressing "Kirim" will cost, as far as the draft can tell. Sits right
 * above the voucher row so a code typed below changes a number the customer
 * is already looking at. Empty until the items module exists: before that
 * the only figure is the calculator's, and that belongs to Cek Tarif, not to
 * this order.
 */
export function CostEstimateCard() {
  const t = useT();
  const modules = useOrderStore((s) => s.modules);
  const selectedRate = useOrderStore((s) => s.selectedRate);
  const voucher = useOrderStore(
    (s) => s.orders.find((o) => o.id === s.activeDraftId)?.voucher ?? null,
  );
  const campaigns = useVoucherStore((s) => s.campaigns);
  const [now] = React.useState(() => Date.now());
  const estimate = React.useMemo(
    () => estimateOrder({ modules, selectedRate, voucher, campaigns, now }),
    [modules, selectedRate, voucher, campaigns, now],
  );

  return (
    <Card className="mt-6 rounded-md p-4">
      <p className="flex items-center gap-1.5 font-display text-xs font-medium uppercase tracking-wide text-muted-2">
        <Receipt className="size-3.5" /> {t("order.estTitle")}
      </p>
      {estimate ? (
        <>
          <EstimateBreakdown estimate={estimate} className="mt-3" />
          <p className="mt-3 text-xs leading-snug text-muted-2">{t("order.estNote")}</p>
        </>
      ) : (
        <p className="mt-1 text-sm text-muted">{t("order.estEmpty")}</p>
      )}
    </Card>
  );
}
