"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { useOrderStore, useOrderHydrated } from "@/lib/store/useOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/** Which stepper step the current path maps to (1-indexed). */
function stepFromPath(pathname: string, isExport: boolean): number {
  // Moving Abroad has no clearance step: Questionnaire → Order Form.
  if (isExport) return pathname.startsWith("/pesan/modul") ? 2 : 1;
  if (pathname.startsWith("/pesan/modul")) return 3;
  if (pathname.startsWith("/pesan/clearance")) return 2;
  return 1;
}

export function OrderShell({ children }: { children: React.ReactNode }) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useOrderHydrated();
  const context = useOrderStore((s) => s.context);

  React.useEffect(() => {
    if (hydrated && !context) router.replace("/cek-tarif");
  }, [hydrated, context, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }
  if (!context) return null;

  const isExport = context.service === "moving-abroad";
  const active = stepFromPath(pathname, isExport);
  const steps = isExport
    ? [t("order.stepQuestionnaire"), t("order.stepForm")]
    : [t("order.stepQuestionnaire"), t("order.stepClearance"), t("order.stepForm")];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      {/* stepper */}
      <ol className="mb-8 flex items-center gap-2 sm:gap-3">
        {steps.map((label, i) => {
          const n = i + 1;
          const done = n < active;
          const current = n === active;
          return (
            <React.Fragment key={label}>
              <li className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                    done && "border-brand bg-brand text-brand-ink",
                    current && "border-brand text-brand",
                    !done && !current && "border-border text-muted-2",
                  )}
                >
                  {done ? <Check className="size-3.5" strokeWidth={3} /> : n}
                </span>
                <span
                  className={cn(
                    "hidden text-sm sm:inline",
                    current ? "font-medium text-foreground" : "text-muted",
                  )}
                >
                  {label}
                </span>
              </li>
              {n < steps.length && (
                <li
                  aria-hidden
                  className={cn(
                    "h-px flex-1",
                    n < active ? "bg-brand/50" : "bg-border",
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>

      {children}
    </div>
  );
}
