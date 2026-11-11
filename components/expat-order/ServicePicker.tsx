"use client";

import * as React from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReviewNote } from "@/components/expat/ReviewNote";
import { ORDER_REVIEW_NOTES } from "@/lib/data/expat-order-notes";
import type { ExpatRate } from "@/lib/pricing/expat-rates";
import { serviceOptions, type CheckRateInput, type PackedPricing } from "@/lib/order/expat-order";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { RateCard } from "./RateCard";

/**
 * The service changed without leaving the plan: "Change" on the Selected
 * Service opens Check Rate's own list (every carrier and service for the
 * route, the Special Rate first, then cheapest first) in Check Rate's own
 * card, priced at the weight the estimate follows. The rate in hand is
 * framed in Ink and marked, the way a chosen answer is; picking another
 * closes the list and the Selected Service follows. A sheet on a phone, a
 * modal from sm (Dialog). The plan's answers stay as they are.
 */
export function ServicePicker({
  check,
  pricing,
  onSelect,
}: {
  check: CheckRateInput;
  pricing: PackedPricing;
  onSelect: (rate: ExpatRate) => void;
}) {
  const t = useT();
  const s = (k: string) => t(`expatOrder.service.${k}`);
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" aria-label={s("changeTitle")} className="link-mark tap-target relative text-sm">
          {s("change")}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <Options
          check={check}
          pricing={pricing}
          onSelect={(rate) => {
            onSelect(rate);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

/** priced only while the list is open */
function Options({
  check,
  pricing,
  onSelect,
}: {
  check: CheckRateInput;
  pricing: PackedPricing;
  onSelect: (rate: ExpatRate) => void;
}) {
  const t = useT();
  const s = (k: string) => t(`expatOrder.service.${k}`);
  const options = serviceOptions(check, pricing);
  return (
    <>
      <DialogHeader>
        <DialogTitle>{s("changeTitle")}</DialogTitle>
        <DialogDescription>
          {s(pricing.kg ? "changeLeadPacked" : "changeLead").replace("{kg}", String(options.chargedKg))}
          {options.specialFromKg && (
            <> {t("expatOrder.rates.specialFrom").replace("{kg}", String(options.specialFromKg))}</>
          )}
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="pb-dialog-safe sm:pb-6">
        <ReviewNote note={ORDER_REVIEW_NOTES.service} />
        {/* the page's field makes a card a white plane with no outline; on
            the dialog's own surface it wears its hairline again. The room on
            top is the Special Rate's tab, which rides its card's edge */}
        <ul className="grid gap-3 pt-4 [--card-border:var(--border)]">
          {options.rates.map((rate) => {
            const selected = rate.id === pricing.rate.id;
            return (
              <li
                key={rate.id}
                aria-current={selected || undefined}
                className={cn("rounded-lg", selected && "ring-2 ring-foreground")}
              >
                <RateCard
                  rate={rate}
                  origin={check.originCountry}
                  selected={selected}
                  onSelect={() => onSelect(rate)}
                />
              </li>
            );
          })}
        </ul>
      </DialogBody>
    </>
  );
}
