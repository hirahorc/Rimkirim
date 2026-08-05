"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Check, ChevronRight, FileText, Hash, Sparkles, PartyPopper } from "lucide-react";
import {
  useOrderStore,
  isPickupUnlocked,
  allModulesComplete,
  effectivePackingCode,
  type ModuleId,
  type ModuleStatus,
} from "@/lib/store/useOrderStore";
import { MODULE_META } from "./module-meta";
import { CopyButton } from "./CopyButton";
import { BookingAgreementDialog } from "./BookingAgreementDialog";
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
  const router = useRouter();
  const modules = useOrderStore((s) => s.modules);
  const answers = useOrderStore((s) => s.answers);
  const bookingNumber = useOrderStore((s) => s.bookingNumber);
  const generatedPackingCode = useOrderStore((s) => s.generatedPackingCode);
  const trackingNumber = useOrderStore((s) => s.trackingNumber);
  const orderId = useOrderStore((s) => s.activeDraftId);
  const ensureBookingNumber = useOrderStore((s) => s.ensureBookingNumber);
  const ensurePackingCode = useOrderStore((s) => s.ensurePackingCode);
  const submitOrder = useOrderStore((s) => s.submitOrder);
  const reset = useOrderStore((s) => s.reset);
  const [submitted, setSubmitted] = React.useState(false);
  const [agreeOpen, setAgreeOpen] = React.useState(false);

  // reaching the order form = order created → issue a booking number once
  React.useEffect(() => {
    ensureBookingNumber();
  }, [ensureBookingNumber]);
  // generate a packing code once CI + Items are complete (if none was supplied)
  React.useEffect(() => {
    ensurePackingCode();
  }, [modules, answers.packingCode, ensurePackingCode]);

  const pickupUnlocked = isPickupUnlocked(modules);
  const packingCode = effectivePackingCode({ answers, generatedPackingCode });
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
        {trackingNumber && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-sm border border-border bg-surface-2/50 p-3 text-sm">
            <span className="text-muted-2">{t("order.trackingNumberLabel")}:</span>
            <span className="font-mono font-semibold text-brand">{trackingNumber}</span>
            <CopyButton value={trackingNumber} />
          </div>
        )}
        {bookingNumber && (
          <div className="mt-2 flex items-center justify-center gap-2 rounded-sm border border-border bg-surface-2/50 p-3 text-sm">
            <span className="text-muted-2">{t("order.bookingNumberLabel")}:</span>
            <span className="font-mono font-semibold text-brand">{bookingNumber}</span>
            <CopyButton value={bookingNumber} />
          </div>
        )}
        <Button
          className="mt-6 w-full"
          onClick={() => {
            const id = orderId;
            reset();
            router.push(id ? `/pesanan/${id}` : "/");
          }}
        >
          {t("order.viewOrder")}
        </Button>
        <Button asChild variant="ghost" className="mt-2 w-full">
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

      {/* order created: booking number */}
      <Card className="mb-4 p-5">
        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-2">
          <Hash className="size-3.5" /> {t("order.bookingNumberLabel")}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-display text-lg font-bold tracking-tight text-brand">
            {bookingNumber ?? "—"}
          </span>
          {bookingNumber && <CopyButton value={bookingNumber} />}
        </div>
      </Card>

      {/* packing list: code (or pending) + download place */}
      <Card className="mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-lg",
              packingCode ? "bg-brand/15 text-brand" : "bg-surface-3 text-muted-2",
            )}
          >
            <FileText className="size-5" />
          </span>
          <div>
            <p className="flex items-center gap-1.5 font-medium">
              {t("order.packingListTitle")}
              {packingCode && (
                <Badge variant="brand">
                  <Sparkles className="size-3" /> {t("order.packingListReady")}
                </Badge>
              )}
            </p>
            {packingCode ? (
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="font-mono text-sm font-semibold">{packingCode}</span>
                <CopyButton value={packingCode} />
              </div>
            ) : (
              <p className="text-sm text-muted">{t("order.packingListPending")}</p>
            )}
          </div>
        </div>
        <Button variant="secondary" size="sm" disabled className="shrink-0">
          {t("order.generatePdf")} ({t("order.comingSoon")})
        </Button>
      </Card>

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

      {/* final CTA */}
      <div className="mt-6">
        <Button
          size="lg"
          className="w-full"
          disabled={!canSubmit}
          onClick={() => setAgreeOpen(true)}
        >
          {t("order.finalCta")}
        </Button>
        {!canSubmit && (
          <p className="mt-2 text-center text-xs text-muted-2">
            {t("order.finalDisabledNote")}
          </p>
        )}
      </div>

      <BookingAgreementDialog
        open={agreeOpen}
        onOpenChange={setAgreeOpen}
        onAgree={() => {
          setAgreeOpen(false);
          submitOrder();
          setSubmitted(true);
        }}
      />
    </div>
  );
}
