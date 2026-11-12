"use client";

import { CircleCheck } from "lucide-react";
import { CopyButton } from "@/components/order/CopyButton";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/**
 * The top of the Booking Summary: that it's received, with the success
 * check, who the summary went to, and the booking number as the one figure
 * to keep, on its own Panel 2 strip with the copy button. The landing's
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
      <div className={cn("flex items-start", compact ? "gap-3" : "gap-4")}>
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-full bg-success/15 text-success",
            compact ? "size-9" : "size-11",
            fresh && "booked-in",
          )}
        >
          {fresh ? (
            // CircleCheck's own drawing, its tick as a stroke that can be drawn
            <svg
              viewBox="0 0 24 24"
              className={compact ? "size-5" : "size-6"}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <path className="check-draw" pathLength={24} d="m9 12 2 2 4-4" />
            </svg>
          ) : (
            <CircleCheck aria-hidden className={compact ? "size-5" : "size-6"} />
          )}
        </span>
        <div className="min-w-0">
          <h1
            id={headingId}
            className={cn("font-display font-bold tracking-tight", compact ? "text-lg" : "text-2xl sm:text-3xl")}
          >
            {bk("received")}
          </h1>
          <p className={cn("text-pretty text-muted", compact ? "mt-0.5 text-xs" : "mt-1 text-sm")}>
            {bk("sent").replace("{email}", email)}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-md bg-surface-2",
          compact ? "mt-4 px-3 py-2.5" : "mt-6 px-4 py-3",
          fresh && "unlock-pop",
        )}
        // the third beat: after the check has started to draw
        style={fresh ? { animationDelay: "450ms" } : undefined}
      >
        <div className="min-w-0">
          <p className="text-xs text-muted">{bk("number")}</p>
          <p className={cn("font-display font-semibold tracking-tight tabular-nums", compact ? "text-lg" : "text-2xl")}>
            {number}
          </p>
        </div>
        {!compact && <CopyButton value={number} />}
      </div>
    </>
  );
}
