"use client";

import * as React from "react";
import { ShieldCheck, Check } from "lucide-react";
import {
  CLEARANCE_STEPS,
  type ClearanceStep,
  type Order,
} from "@/lib/store/useOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

const STEP_TITLE_KEY: Record<ClearanceStep, string> = {
  documents: "order.clDocuments",
  inspection: "order.clInspection",
  duties: "order.clDuties",
  released: "order.clReleased",
};

/**
 * Live clearance sub-state, shown while the order is in the clearance phase.
 * Mirrors StatusStepper's look for the smaller documents → released chain.
 */
export function ClearancePanel({ order }: { order: Order }) {
  const t = useT();
  if (order.status !== "clearance") return null;

  const current = order.clearanceStep ?? "documents";
  const currentIdx = CLEARANCE_STEPS.indexOf(current);

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-base font-semibold tracking-tight">
        <span className="grid size-6 place-items-center rounded-md bg-brand/10 text-brand">
          <ShieldCheck className="size-3.5" />
        </span>
        {t("order.stepClearance")}
      </h2>

      <div className="mt-4 flex items-start">
        {CLEARANCE_STEPS.map((step, i) => {
          const done = i < currentIdx;
          const currentStep = i === currentIdx;
          return (
            <div
              key={step}
              className={cn(
                "flex flex-1 flex-col items-center",
                i === 0 && "items-start",
                i === CLEARANCE_STEPS.length - 1 && "items-end",
              )}
            >
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    i === 0 && "bg-transparent",
                    i > 0 && (done || currentStep ? "bg-brand" : "bg-border"),
                  )}
                />
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border-2",
                    done && "border-brand bg-brand text-white",
                    currentStep && "border-brand bg-brand/10 text-brand",
                    !done && !currentStep && "border-border bg-surface-2 text-muted-2",
                  )}
                >
                  {done ? (
                    <Check className="size-3" strokeWidth={3} />
                  ) : currentStep ? (
                    <span className="size-1.5 rounded-full bg-brand" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    i === CLEARANCE_STEPS.length - 1 && "bg-transparent",
                    i < CLEARANCE_STEPS.length - 1 &&
                      (done || currentStep ? "bg-brand" : "bg-border"),
                  )}
                />
              </div>
              <p
                className={cn(
                  "mt-1.5 px-0.5 text-center text-[10px] leading-tight sm:text-[11px]",
                  currentStep && "font-semibold text-foreground",
                  done && "font-medium text-brand",
                  !done && !currentStep && "text-muted-2",
                )}
              >
                {t(STEP_TITLE_KEY[step])}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-4 rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted">
        {t(`order.clDesc${capitalize(current)}`)}
      </p>
    </Card>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
