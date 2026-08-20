"use client";

import * as React from "react";
import { toast } from "sonner";
import { useOrderStore, type ModuleId } from "@/lib/store/useOrderStore";
import { MODULE_META } from "@/components/order/module-meta";
import { useT } from "@/lib/i18n/LanguageProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Module picker for the "needs revision" flow. Sends the order back to Review
 * with the chosen module flagged; the customer must fix it and resubmit.
 */
export function RevisionDialog({
  orderId,
  open,
  onOpenChange,
}: {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const requestRevision = useOrderStore((s) => s.requestRevision);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("order.revDialogTitle")}</DialogTitle>
          <DialogDescription>{t("order.revDialogHint")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {MODULE_META.map((m) => (
            <Button
              key={m.id}
              variant="secondary"
              className="flex w-full items-center justify-start gap-3"
              onClick={() => {
                requestRevision(orderId, m.id as ModuleId);
                onOpenChange(false);
                toast.info(t("order.revRequested"));
              }}
            >
              <m.icon className="size-4 text-muted" />
              {t(m.titleKey)}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
