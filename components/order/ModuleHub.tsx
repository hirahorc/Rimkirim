"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, Check, ChevronRight, FileText, Sparkles, PartyPopper } from "lucide-react";
import {
  useOrderStore,
  isPickupUnlocked,
  isPackingListReady,
  allModulesComplete,
  type ModuleId,
  type ModuleStatus,
} from "@/lib/store/useOrderStore";
import { MODULE_META } from "./module-meta";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

function StatusBadge({ status, locked }: { status: ModuleStatus; locked?: boolean }) {
  const t = useT();
  if (locked)
    return (
      <Badge variant="neutral">
        <Lock className="size-3" /> {t("order.statusLocked")}
      </Badge>
    );
  if (status === "complete")
    return (
      <Badge variant="success">
        <Check className="size-3" /> {t("order.statusComplete")}
      </Badge>
    );
  if (status === "in-progress")
    return <Badge variant="warning">{t("order.statusInProgress")}</Badge>;
  return <Badge variant="neutral">{t("order.statusNotStarted")}</Badge>;
}

export function ModuleHub() {
  const t = useT();
  const modules = useOrderStore((s) => s.modules);
  const reset = useOrderStore((s) => s.reset);
  const [submitted, setSubmitted] = React.useState(false);

  const pickupUnlocked = isPickupUnlocked(modules);
  const packingReady = isPackingListReady(modules);
  const canSubmit = allModulesComplete(modules);

  if (submitted) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-brand/15 text-brand">
          <PartyPopper className="size-8" />
        </div>
        <h1 className="mt-5 font-display text-xl font-bold tracking-tight">
          {t("order.confirmTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("order.confirmBody")}</p>
        <Button asChild className="mt-6 w-full" onClick={() => reset()}>
          <Link href="/">{t("order.backHome")}</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("order.hubTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{t("order.hubSubtitle")}</p>
      </header>

      <div className="space-y-3">
        {MODULE_META.map((m) => {
          const locked = m.locksUntilOthers && !pickupUnlocked;
          const status = modules[m.id as ModuleId].status;
          const Inner = (
            <Card
              className={cn(
                "flex items-center gap-4 p-4 transition-colors",
                locked ? "opacity-60" : "hover:border-border-strong",
              )}
            >
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-lg",
                  status === "complete"
                    ? "bg-brand/15 text-brand"
                    : "bg-surface-3 text-muted",
                )}
              >
                <m.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{t(m.titleKey)}</p>
                <p className="truncate text-sm text-muted">{t(m.descKey)}</p>
              </div>
              <StatusBadge status={status} locked={locked} />
              {!locked && <ChevronRight className="size-4 shrink-0 text-muted-2" />}
            </Card>
          );
          return locked ? (
            <div key={m.id}>{Inner}</div>
          ) : (
            <Link key={m.id} href={`/pesan/modul/${m.id}`} className="block">
              {Inner}
            </Link>
          );
        })}
      </div>

      {/* pickup locked note */}
      {!pickupUnlocked && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-2">
          <Lock className="size-3.5" /> {t("order.pickupLockedNote")}
        </p>
      )}

      {/* packing list indicator */}
      <Card className="mt-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-lg",
              packingReady ? "bg-brand/15 text-brand" : "bg-surface-3 text-muted-2",
            )}
          >
            <FileText className="size-5" />
          </span>
          <div>
            <p className="flex items-center gap-1.5 font-medium">
              {t("order.packingListTitle")}
              {packingReady && (
                <Badge variant="brand">
                  <Sparkles className="size-3" /> {t("order.packingListReady")}
                </Badge>
              )}
            </p>
            {!packingReady && (
              <p className="text-sm text-muted">{t("order.packingListPending")}</p>
            )}
          </div>
        </div>
        <Button variant="secondary" size="sm" disabled className="shrink-0">
          {t("order.generatePdf")} ({t("order.comingSoon")})
        </Button>
      </Card>

      {/* final CTA */}
      <div className="mt-6">
        <Button
          size="lg"
          className="w-full"
          disabled={!canSubmit}
          onClick={() => setSubmitted(true)}
        >
          {t("order.finalCta")}
        </Button>
        {!canSubmit && (
          <p className="mt-2 text-center text-xs text-muted-2">
            {t("order.finalDisabledNote")}
          </p>
        )}
      </div>
    </div>
  );
}
