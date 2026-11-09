"use client";

import { CircleCheck } from "lucide-react";
import { CopyButton } from "@/components/order/CopyButton";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/**
 * The top of the Booking Summary ticket, above its tear line: "Booking
 * received" in lime, the booking number as the one big figure, and who the
 * summary went to. The landing's closing ticket shows this very head in its
 * last picture, `compact` and without the copy button.
 */
export function BookingTicketHead({
  number,
  email,
  compact = false,
  headingId,
}: {
  number: string;
  email: string;
  compact?: boolean;
  /** set on the page, where the number names the ticket */
  headingId?: string;
}) {
  const t = useT();
  const bk = (k: string) => t(`expatOrder.booking.${k}`);
  return (
    <>
      <p className="inline-flex items-center gap-2 font-display text-sm font-semibold text-brand">
        <CircleCheck aria-hidden className={compact ? "size-4" : "size-5"} /> {bk("received")}
      </p>
      <h1
        id={headingId}
        className={cn(
          "font-display text-xs font-medium uppercase tracking-[0.04em] text-dusk-soft",
          compact ? "mt-3" : "mt-5",
        )}
      >
        {bk("number")}
      </h1>
      <p className="mt-1 flex items-center gap-2">
        <span
          className={cn(
            "font-display font-bold tracking-tight tabular-nums",
            compact ? "text-2xl" : "text-4xl sm:text-5xl",
          )}
        >
          {number}
        </span>
        {!compact && (
          <CopyButton value={number} className="text-dusk-soft hover:bg-background/10 hover:text-background" />
        )}
      </p>
      <p className={cn("max-w-xl text-pretty text-dusk-soft", compact ? "mt-2 text-xs" : "mt-4")}>
        {bk("sent").replace("{email}", email)}
      </p>
    </>
  );
}
