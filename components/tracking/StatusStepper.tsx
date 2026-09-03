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

export type RailStep = { key: string; label: string };

type StepRailProps = {
  steps: RailStep[];
  /** index of the live step; -1 when nothing is live (cancelled) */
  currentIdx: number;
  /** every node dimmed with a terminal marker: the journey stopped */
  cancelled?: boolean;
  /** the last node filled and its check drawn once: the journey finished */
  arrived?: boolean;
  /** `sm` for a rail living inside a card (the clearance spine) */
  size?: "md" | "sm";
};

/**
 * The one rail: completed nodes check-marked, the live one framed in ink with
 * a lime core, upcoming ones muted. StatusStepper feeds it the order phases;
 * ClearancePanel feeds it the customs spine, so both keep the same a11y
 * contract (aria-current, sr-only "step n of m", labels that hide below sm).
 */
export function StepRail({
  steps,
  currentIdx,
  cancelled = false,
  arrived = false,
  size = "md",
}: StepRailProps) {
  const t = useT();
  const sm = size === "sm";
  const last = steps.length - 1;
  return (
    <div className="flex items-start">
      {steps.map((step, i) => {
        const done = !cancelled && currentIdx > -1 && i < currentIdx;
        const current = i === currentIdx;
        const finished = arrived && i === last;
        return (
          <div
            key={step.key}
            aria-current={current ? "step" : undefined}
            className="flex flex-1 flex-col items-center"
          >
            <div className="flex w-full items-center">
              {/* colour transitions on rail + node so a live advance (approving
                  the quotation flips the store on this very page) reads as the
                  rail lighting up, not a repaint — colour channel only, inert
                  on plain page loads */}
              <span
                className={cn(
                  "h-0.5 flex-1 transition-colors duration-300",
                  i === 0 && "bg-transparent",
                  i > 0 && (done || current ? "bg-brand" : "bg-border"),
                )}
              />
              <span
                className={cn(
                  "grid shrink-0 place-items-center rounded-full border-2 transition-colors duration-300",
                  sm ? "size-5" : "size-6",
                  (done || finished) && "border-brand bg-brand text-brand-ink",
                  // on daylight a lime hairline reads ~1.5:1, so the live step
                  // is framed in ink and marked with a lime core instead
                  current && !finished && "border-foreground bg-background text-brand-ink",
                  !done && !current && "border-border bg-surface-2 text-muted-2",
                  cancelled && "border-border bg-surface-2 text-muted-2",
                )}
              >
                {finished ? (
                  <svg
                    viewBox="0 0 24 24"
                    className={sm ? "size-3" : "size-3.5"}
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
                  <Check className={sm ? "size-3" : "size-3.5"} strokeWidth={3} />
                ) : cancelled ? (
                  <X className={sm ? "size-3" : "size-3.5"} />
                ) : current ? (
                  <span className={cn("rounded-full bg-brand", sm ? "size-1.5" : "size-2")} />
                ) : null}
              </span>
              <span
                className={cn(
                  "h-0.5 flex-1 transition-colors duration-300",
                  i === last && "bg-transparent",
                  i < last && (done || current ? "bg-brand" : "bg-border"),
                )}
              />
            </div>
            <p
              className={cn(
                // text-xs, not Micro: these are functional state labels, and
                // 12px is the smallest on-ramp step that clears the 11px
                // legibility floor (DESIGN.md removed 11px as drift)
                "mt-1.5 px-0.5 text-center font-display text-xs leading-tight",
                // below sm the labels have no room to breathe: only the live
                // step names itself; the rest stay for screen readers and
                // return visually from sm up
                !current && "max-sm:sr-only",
                current && "font-semibold text-foreground",
                done && "font-medium text-foreground",
                !done && !current && "text-muted-2",
                cancelled && "text-muted-2",
              )}
            >
              {step.label}
              {/* no visible counter: the rail already shows the position; the
                  place in the journey is still announced to screen readers */}
              {current && (
                <span className="sr-only">
                  {", "}
                  {t("order.stepOf")
                    .replace("{n}", String(i + 1))
                    .replace("{total}", String(steps.length))}
                </span>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Linear status stepper: completed steps check-marked, the current phase
 * highlighted, upcoming ones muted. `cancelled` renders every step dimmed with
 * a terminal marker — the order is no longer moving forward.
 */
export function StatusStepper({ status }: { status: OrderPhase }) {
  const t = useT();
  const cancelled = status === "cancelled";
  return (
    <StepRail
      steps={PHASE_STEPS.map((phase) => ({ key: phase, label: t(STEP_LABEL_KEYS[phase]) }))}
      currentIdx={cancelled ? -1 : PHASE_STEPS.indexOf(status)}
      cancelled={cancelled}
      // the journey's last node fills like the done ones and draws its check
      // once — the rail visibly finishes instead of idling
      arrived={status === "delivered"}
    />
  );
}
