"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PenLine } from "lucide-react";
import {
  useOrderStore,
  type ModuleId,
} from "@/lib/store/useOrderStore";
import { getModuleMeta } from "@/components/order/module-meta";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Shown while an order is waiting on a customer fix: points at the flagged
 * module and reopens it so the customer can correct the data and resubmit.
 */
export function RevisionCard({
  orderId,
  moduleId,
  note,
}: {
  orderId: string;
  moduleId: ModuleId;
  note?: string | null;
}) {
  const t = useT();
  const router = useRouter();
  const resumeOrder = useOrderStore((s) => s.resumeOrder);
  const meta = getModuleMeta(moduleId);

  return (
    <Card className="flex flex-col gap-3 border-warning/40 bg-warning/10 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-warning">{t("order.revTitle")}</p>
        <p className="mt-0.5 text-sm text-muted">
          {t("order.revBody")}{" "}
          <span className="font-medium text-foreground">
            {meta ? t(meta.titleKey) : moduleId}
          </span>
        </p>
        {note && (
          <p className="mt-2 rounded-sm bg-surface-2 px-3 py-2 text-sm text-muted">
            <span className="font-medium text-foreground">
              {t("order.revNote")}:
            </span>{" "}
            {note}
          </p>
        )}
      </div>
      <Button
        className="shrink-0"
        onClick={() => {
          resumeOrder(orderId);
          router.push(`/pesan/modul/${moduleId}`);
        }}
      >
        <PenLine /> {t("order.revCta")}
      </Button>
    </Card>
  );
}
