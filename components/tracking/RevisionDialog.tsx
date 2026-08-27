"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { useOrderStore, type ModuleId } from "@/lib/store/useOrderStore";
import { MODULE_META } from "@/components/order/module-meta";
import { useT } from "@/lib/i18n/LanguageProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

/**
 * Module picker for the "needs revision" flow. Regressing an order to Review
 * is a point of no return, so picking a row only *selects* it — the request
 * fires from an explicit footer CTA, with an optional note so ops receives a
 * reason, not just a module name.
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
  const [selected, setSelected] = React.useState<ModuleId | null>(null);
  const [note, setNote] = React.useState("");

  // a reopened dialog starts clean: yesterday's half-picked revision is stale
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelected(null);
      setNote("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("order.revDialogTitle")}</DialogTitle>
          <DialogDescription>{t("order.revDialogHint")}</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-2">
            {MODULE_META.map((m) => {
              const active = selected === (m.id as ModuleId);
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(m.id as ModuleId)}
                  className={cn(
                    "flex h-10 w-full items-center gap-3 rounded-md border px-4 font-display text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60",
                    active
                      ? "border-foreground bg-surface-2 text-foreground"
                      : "border-border-strong bg-surface-2/60 text-muted hover:bg-surface-2 hover:text-foreground",
                  )}
                >
                  <m.icon
                    className={cn(
                      "size-4",
                      active ? "text-foreground" : "text-muted",
                    )}
                  />
                  <span className="flex-1 text-left">{t(m.titleKey)}</span>
                  {active && <Check className="size-4" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
          <div>
            <Label htmlFor="rev-note">{t("order.revNoteLabel")}</Label>
            <Textarea
              id="rev-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("order.revNotePlaceholder")}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            {t("order.baCancel")}
          </Button>
          <Button
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              requestRevision(orderId, selected, note);
              handleOpenChange(false);
              toast.info(t("order.revRequested"));
            }}
          >
            {t("order.revSubmit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
