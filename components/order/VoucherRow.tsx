"use client";

import * as React from "react";
import { toast } from "sonner";
import { Ticket, X } from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { useVoucherStore } from "@/lib/store/useVoucherStore";
import type { VoucherError } from "@/lib/voucher/engine";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils/currency";

const ERROR_KEY: Record<VoucherError, string> = {
  "not-found": "order.vcErrNotFound",
  inactive: "order.vcErrInactive",
  "not-started": "order.vcErrNotStarted",
  expired: "order.vcErrExpired",
  "sold-out": "order.vcErrSoldOut",
  "not-first-shipment": "order.vcErrNotFirstShipment",
  "already-used": "order.vcErrAlreadyUsed",
  "wrong-segment": "order.vcErrWrongSegment",
};

/**
 * The one place a customer types a campaign code: on the draft, right before
 * the booking is sent. Collapsed to a single line until asked for — most
 * people have no code, and the hub's job is the four modules above it. No
 * amount is promised here: the discount is computed off the chargeable
 * weight ops verifies, so the row only names the terms.
 */
export function VoucherRow() {
  const t = useT();
  const voucher = useOrderStore(
    (s) => s.orders.find((o) => o.id === s.activeDraftId)?.voucher ?? null,
  );
  const applyVoucher = useOrderStore((s) => s.applyVoucher);
  const removeVoucher = useOrderStore((s) => s.removeVoucher);
  const campaigns = useVoucherStore((s) => s.campaigns);
  const [open, setOpen] = React.useState(false);
  const [raw, setRaw] = React.useState("");
  const [error, setError] = React.useState<VoucherError | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const id = React.useId();

  const submit = () => {
    if (!raw.trim()) {
      inputRef.current?.focus();
      return;
    }
    const err = applyVoucher(raw);
    setError(err);
    if (!err) {
      setRaw("");
      setOpen(false);
      toast.success(t("order.vcAppliedToast"));
    }
  };

  if (voucher) {
    const campaign = campaigns.find((c) => c.id === voucher.campaignId);
    return (
      // a card, like the modules above: the canvas is already the Panel grey
      <Card className="mt-4 flex items-start gap-3 rounded-md p-4">
        <Ticket className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="font-mono font-medium text-foreground">{voucher.code}</span>
            {campaign && (
              <span className="text-muted"> · {campaign.name}</span>
            )}
          </p>
          {campaign && (
            <p className="mt-0.5 text-xs text-muted-2">
              {t("order.vcAppliedHint")
                .replace("{pct}", String(campaign.percent))
                .replace("{max}", formatIDR(campaign.maxDiscount))}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="-mr-2 -mt-1 shrink-0"
          onClick={() => {
            removeVoucher();
            toast.success(t("order.vcRemovedToast"));
          }}
        >
          <X className="size-3.5" aria-hidden />
          {t("order.vcRemove")}
        </Button>
      </Card>
    );
  }

  if (!open) {
    return (
      <p className="mt-4 flex items-center gap-1.5 text-sm">
        <Ticket className="size-4 shrink-0 text-muted-2" aria-hidden />
        <button
          type="button"
          className="link-mark tap-row text-left"
          onClick={() => setOpen(true)}
        >
          {t("order.vcPrompt")}
        </button>
        <span className="text-xs text-muted-2">{t("order.vcOptional")}</span>
      </p>
    );
  }

  return (
    // Field wires its ids onto a single child; with the Apply button beside
    // the input the wiring is done by hand so the label still lands on the box
    <Card className="mt-4 rounded-md p-4">
      <Label htmlFor={id}>{t("order.vcLabel")}</Label>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          id={id}
          autoFocus
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder={t("order.vcPlaceholder")}
          className="font-mono uppercase"
          value={raw}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          onChange={(e) => {
            setRaw(e.target.value.toUpperCase());
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button variant="secondary" className="shrink-0" onClick={submit}>
          {t("order.vcApply")}
        </Button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-danger">
          {t(ERROR_KEY[error])}
        </p>
      ) : (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted-2">
          {t("order.vcHint")}
        </p>
      )}
    </Card>
  );
}
