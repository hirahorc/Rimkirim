"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PenLine } from "lucide-react";
import { useOrderStore, type ModuleId } from "@/lib/store/useOrderStore";
import { getModuleMeta } from "@/components/order/module-meta";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AttentionStrip } from "@/components/tracking/AttentionStrip";

/**
 * Shown while an order is waiting on a customer fix: points at the flagged
 * module and reopens it so the customer can correct the data and resubmit.
 */
export function RevisionCard({
  orderId,
  moduleId,
  note,
  attention = null,
}: {
  orderId: string;
  moduleId: ModuleId;
  note?: string | null;
  /** the order's attention state, worn as this card's head */
  attention?: string | null;
}) {
  const t = useT();
  const router = useRouter();
  const resumeOrder = useOrderStore((s) => s.resumeOrder);
  const meta = getModuleMeta(moduleId);

  return (
    // the "your move" purple rides as the head strip (The Attached-Strip
    // Rule); the body stays a white plane like every other live panel, so
    // the page never stacks two purple boxes for one state
    <Card className="rounded-md p-5 sm:p-6">
      <AttentionStrip attention={attention} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-base font-semibold tracking-tight">
            <PenLine className="size-4 text-foreground" />
            {t("order.revTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted">
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
      </div>
    </Card>
  );
}
