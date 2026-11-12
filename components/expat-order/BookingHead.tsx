"use client";

import { Check } from "lucide-react";
import { CopyButton } from "@/components/order/CopyButton";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { TYPE } from "./kit";

/**
 * The top of the Booking Summary: that it's received, with the done mark
 * (Ink, a paper check, as a finished part of the plan wears), who the
 * summary went to, and the booking number as the one figure to keep, on its
 * own wash strip with the copy button. The landing's
 * closing ticket shows this very head in its last picture, `compact` and
 * without the copy button. `fresh` is the moment the application was
 * confirmed, said in three beats, that once: the success mark arrives, its
 * check draws itself, then the booking number's strip pops. The rest of the
 * summary is there to be read, and stands.
 */
export function BookingHead({
  number,
  email,
  compact = false,
  fresh = false,
  headingId,
}: {
  number: string;
  email: string;
  compact?: boolean;
  fresh?: boolean;
  /** set on the page, where "Booking received" names it */
  headingId?: string;
}) {
  const t = useT();
  const bk = (k: string) => t(`expatOrder.booking.${k}`);
  return (
    <>
      <div className="flex gap-3">
        {/* as tall as the title's line, so the two sit level */}
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-full bg-foreground text-background",
            compact ? "size-6" : "size-8",
            fresh && "booked-in",
          )}
        >
          {fresh ? (
            // the check as a stroke that can be drawn
            <svg
              viewBox="0 0 24 24"
              className={compact ? "size-3.5" : "size-4"}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path className="check-draw" pathLength={24} d="M4 12.5l5 5L20 6.5" />
            </svg>
          ) : (
            <Check aria-hidden className={compact ? "size-3.5" : "size-4"} strokeWidth={3} />
          )}
        </span>
        <div className="min-w-0">
          <h1 id={headingId} className={compact ? TYPE.subhead : TYPE.title}>
            {bk("received")}
          </h1>
          <p className={cn("mt-1 text-pretty text-muted", compact ? "text-xs" : "text-sm")}>
            {bk("sent").replace("{email}", email)}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-md bg-surface-2",
          compact ? "mt-3 px-3 py-2" : "mt-6 px-4 py-3",
          fresh && "unlock-pop",
        )}
        // the third beat: after the check has started to draw
        style={fresh ? { animationDelay: "450ms" } : undefined}
      >
        <div className="min-w-0">
          <p className="text-xs text-muted">{bk("number")}</p>
          <p className={compact ? "font-mono text-base font-semibold tabular-nums" : TYPE.figure}>{number}</p>
        </div>
        {!compact && <CopyButton value={number} />}
      </div>
    </>
  );
}
