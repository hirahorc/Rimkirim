"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LegalBody } from "@/components/legal/LegalDoc";
import { termsDoc, privacyDoc } from "@/components/legal/legal-content";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/**
 * Shown before an order is created: the user must read (scroll to the bottom of)
 * the Terms of Service + Privacy Policy and tick the agreement checkbox before
 * the "Agree & Book" button is enabled. Gates both BFG and Moving Abroad.
 */
export function BookingAgreementDialog({
  open,
  onOpenChange,
  onAgree,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
}) {
  const t = useT();
  const { locale } = useLanguage();
  const loc = locale as "id" | "en";
  const [readToBottom, setReadToBottom] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);

  // reset gate each time the modal opens
  React.useEffect(() => {
    if (open) {
      setReadToBottom(false);
      setAgreed(false);
    }
  }, [open]);

  const markReadIfAtBottom = (el: HTMLDivElement | null) => {
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setReadToBottom(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-2 p-5 pb-4 sm:p-6 sm:pb-4">
          <ShieldCheck className="size-5 shrink-0 text-foreground" />
          <div>
            <DialogTitle>{t("order.baTitle")}</DialogTitle>
            <DialogDescription>{t("order.baSubtitle")}</DialogDescription>
          </div>
        </DialogHeader>

        <div
          ref={markReadIfAtBottom}
          onScroll={(e) => markReadIfAtBottom(e.currentTarget)}
          className="scroll-thin min-h-0 flex-1 overflow-y-auto border-y border-border px-5 py-5 sm:px-6"
        >
          <LegalBody doc={termsDoc} locale={loc} />
          <div className="my-10 border-t border-border" />
          <LegalBody doc={privacyDoc} locale={loc} />
        </div>

        <div className="space-y-3 p-5 sm:p-6">
          {!readToBottom && (
            <p className="text-xs text-muted-2">{t("order.baScrollHint")}</p>
          )}
          <label
            className={cn(
              "flex cursor-pointer items-start gap-2 text-sm text-muted",
              !readToBottom && "cursor-not-allowed opacity-50",
            )}
          >
            <Checkbox
              checked={agreed}
              onCheckedChange={(v) => setAgreed(Boolean(v))}
              disabled={!readToBottom}
              aria-label={t("order.baCheckbox")}
            />
            <span>{t("order.baCheckbox")}</span>
          </label>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {t("order.baCancel")}
            </Button>
            <Button className="flex-1" disabled={!agreed} onClick={onAgree}>
              {t("order.baAgree")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
