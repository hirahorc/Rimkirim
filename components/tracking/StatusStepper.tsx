"use client";

import { Check, X } from "lucide-react";
import type { OrderPhase } from "@/lib/store/useOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/** Linear phases a shipment moves through (terminal: delivered / cancelled). */
export const PHASE_STEPS: OrderPhase[] = [
  "review",
  "quotation",
  "pickup",
  "in-transit",
  "clearance",
  "delivery",
  "delivered",
];

const STEP_LABEL_KEYS: Record<OrderPhase, string> = {
  review: "order.statusReview",
  quotation: "order.statusQuotation",
  pickup: "order.statusPickup",
  "in-transit": "order.statusInTransit",
  clearance: "order.statusClearance",
  delivery: "order.statusDelivery",
  delivered: "order.statusDelivered",
  cancelled: "order.statusCancelled",
};

/**
 * Linear status stepper: completed steps check-marked, the current phase
 * highlighted, upcoming ones muted. `cancelled` renders every step dimmed with
 * a terminal marker — the order is no longer moving forward.
 */
export function StatusStepper({ status }: { status: OrderPhase }) {
  const t = useT();
  const cancelled = status === "cancelled";
  const currentIdx = cancelled ? -1 : PHASE_STEPS.indexOf(status);

  return (
    <div className="flex items-start">
      {PHASE_STEPS.map((phase, i) => {
        const done = !cancelled && currentIdx > -1 && i < currentIdx;
        const current = i === currentIdx;
        // the journey's last node fills like the done ones and draws its
        // check once — the rail visibly finishes instead of idling
        const arrived = status === "delivered" && phase === "delivered";
        return (
          <div
            key={phase}
            aria-current={current ? "step" : undefined}
            className="flex flex-1 flex-col items-center"
          >
            <div className="flex w-full items-center">
              {/* colour transitions on rail + node so a live phase advance
                  (approving the quotation flips the store on this very page)
                  reads as the rail lighting up, not a repaint — colour
                  channel only, inert on plain page loads */}
              <span
                className={cn(
                  "h-0.5 flex-1 transition-colors duration-300",
                  i === 0 && "bg-transparent",
                  i > 0 && (done || current ? "bg-brand" : "bg-border"),
                )}
              />
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300",
                  (done || arrived) && "border-brand bg-brand text-brand-ink",
                  // on daylight a lime hairline reads ~1.5:1, so the live step
                  // is framed in ink and marked with a lime core instead
                  current && !arrived && "border-foreground bg-background text-brand-ink",
                  !done && !current && "border-border bg-surface-2 text-muted-2",
                  cancelled && "border-border bg-surface-2 text-muted-2",
                )}
              >
                {arrived ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path className="check-draw" d="M4 12.5l5 5L20 6.5" />
                  </svg>
                ) : done ? (
                  <Check className="size-3.5" strokeWidth={3} />
                ) : cancelled ? (
                  <X className="size-3.5" />
                ) : current ? (
                  <span className="size-2 rounded-full bg-brand" />
                ) : null}
              </span>
              <span
                className={cn(
                  "h-0.5 flex-1 transition-colors duration-300",
                  i === PHASE_STEPS.length - 1 && "bg-transparent",
                  i < PHASE_STEPS.length - 1 &&
                    (done || current ? "bg-brand" : "bg-border"),
                )}
              />
            </div>
            <p
              className={cn(
                // text-xs, not Micro: these are functional state labels, and
                // 12px is the smallest on-ramp step that clears the 11px
                // legibility floor (DESIGN.md removed 11px as drift)
                "mt-1.5 px-0.5 text-center font-display text-xs leading-tight",
                // below sm seven labels have no room to breathe: only the live
                // step names itself (with its n/7 place); the rest stay for
                // screen readers and return visually from sm up
                !current && "max-sm:sr-only",
                current && "font-semibold text-foreground",
                done && "font-medium text-foreground",
                !done && !current && "text-muted-2",
                cancelled && "text-muted-2",
              )}
            >
              {t(STEP_LABEL_KEYS[phase])}
              {current && (
                <>
                  <span aria-hidden className="font-normal text-muted-2 sm:hidden">
                    {" "}
                    · {i + 1}/{PHASE_STEPS.length}
                  </span>
                  <span className="sr-only">
                    {" — "}
                    {t("order.stepOf")
                      .replace("{n}", String(i + 1))
                      .replace("{total}", String(PHASE_STEPS.length))}
                  </span>
                </>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}
