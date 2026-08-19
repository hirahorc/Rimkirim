"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Hash,
  Sparkles,
  PartyPopper,
  Download,
  Loader2,
} from "lucide-react";
import {
  useOrderStore,
  isPickupUnlocked,
  allModulesComplete,
  effectivePackingCode,
  type ModuleId,
  type ModuleStatus,
} from "@/lib/store/useOrderStore";
import { MODULE_META } from "./module-meta";
import { consumeJustSaved } from "./modules/shared";
import { orderModulesToCipl } from "@/lib/pdf/cipl";
import { useDownloadCipl } from "@/components/packing/useDownloadCipl";
import { CopyButton } from "./CopyButton";
import { BookingAgreementDialog } from "./BookingAgreementDialog";
import { useT, useLanguage } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

function StatusBadge({
  status,
  locked,
  justDone,
}: {
  status: ModuleStatus;
  locked?: boolean;
  /** the module was completed on this visit — draw the check once */
  justDone?: boolean;
}) {
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
        {justDone ? (
          <svg
            viewBox="0 0 24 24"
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path className="check-draw" d="M4 12.5l5 5L20 6.5" />
          </svg>
        ) : (
          <Check className="size-3" />
        )}
        {t("order.statusComplete")}
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
  const context = useOrderStore((s) => s.context);
  const { locale } = useLanguage();
  // the draft's last write, for the returning user
  const lastSavedAt = useOrderStore(
    (s) => s.orders.find((o) => o.id === s.activeDraftId)?.updatedAt ?? null,
  );
  // the document needs sender/receiver + packages — an in-progress CI (e.g.
  // prefilled from a standalone list, owner still blank) is enough
  const pdfReady =
    modules.items.status === "complete" &&
    Boolean((modules.customerInfo.data as { sender?: unknown } | undefined)?.sender);
  const { busy: pdfBusy, download: downloadPdf } = useDownloadCipl();

  // the module completed on the way here — its check draws once, and the
  // progress bar fills from the previous count instead of rendering done
  const [justDone] = React.useState(() => consumeJustSaved());
  const completeCount = MODULE_META.filter(
    (m) => modules[m.id as ModuleId].status === "complete",
  ).length;
  const [barCount, setBarCount] = React.useState(
    justDone ? Math.max(0, completeCount - 1) : completeCount,
  );
  React.useEffect(() => {
    if (barCount === completeCount) return;
    // double rAF so the start width paints before the transition target lands
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setBarCount(completeCount)),
    );
    return () => cancelAnimationFrame(raf);
  }, [barCount, completeCount]);

  const nextUp = MODULE_META.find((m) => {
    const locked = m.locksUntilOthers && !pickupUnlocked;
    return !locked && modules[m.id as ModuleId].status !== "complete";
  })?.id;

  if (submitted) {
    return (
      <Card className="reveal-pop mx-auto max-w-md p-8 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-brand/15 text-brand-ink">
          <PartyPopper className="size-8" />
        </div>
        <h1 className="mt-5 font-display text-xl font-bold tracking-tight">
          {t("order.confirmTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("order.confirmBody")}</p>
        {bookingNumber && (
          <div className="mt-2 flex items-center justify-center gap-2 rounded-sm border border-border bg-surface-2/50 p-3 text-sm">
            <span className="text-muted-2">{t("order.bookingNumberLabel")}:</span>
            <span className="font-mono font-semibold text-foreground">{bookingNumber}</span>
            <CopyButton value={bookingNumber} />
          </div>
        )}
        <Button
          className="mt-6 w-full"
          onClick={() => {
            // detach from the draft, then land on the "Pesanan Saya" list
            reset();
            router.push("/pesanan");
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
        {/* the user's progress, said in numbers and shown as a filling bar */}
        <div className="mt-4">
          <p className="text-sm font-medium text-foreground">
            {t("order.hubProgress")
              .replace("{n}", String(completeCount))
              .replace("{total}", String(MODULE_META.length))}
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={MODULE_META.length}
            aria-valuenow={completeCount}
            aria-label={t("order.hubProgress")
              .replace("{n}", String(completeCount))
              .replace("{total}", String(MODULE_META.length))}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3"
          >
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
              style={{ width: `${(barCount / MODULE_META.length) * 100}%` }}
            />
          </div>
          {lastSavedAt && completeCount > 0 && (
            <p className="mt-2 text-xs text-muted-2">
              {t("order.hubLastSaved").replace("{when}", formatRelative(lastSavedAt, locale))}
            </p>
          )}
        </div>
      </header>

      {/* the receipt: what the order already HAS (booking number, packing list,
          document) in one quiet strip, so the body below is only the work */}
      <Card className="mb-6 grid divide-y divide-border p-0 sm:grid-cols-[1fr_1fr_auto] sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3 sm:px-5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-2">
            <Hash className="size-3.5" /> {t("order.bookingNumberLabel")}
          </p>
          <div className="mt-1 flex items-center gap-2">
            {/* an identifier the customer will read out loud: mono, tabular (Numbers-Are-Mono) */}
            {bookingNumber ? (
              <span className="font-mono text-base font-semibold tabular-nums text-foreground">
                {bookingNumber}
              </span>
            ) : (
              <span className="text-sm text-muted">{t("order.bookingNumberPending")}</span>
            )}
            {bookingNumber && <CopyButton value={bookingNumber} />}
          </div>
        </div>
        <div className="px-4 py-3 sm:px-5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-2">
            <FileText className="size-3.5" /> {t("order.packingListTitle")}
            {packingCode && (
              <Badge variant="brand">
                <Sparkles className="size-3" /> {t("order.packingListReady")}
              </Badge>
            )}
          </p>
          {packingCode ? (
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-base font-semibold tabular-nums">{packingCode}</span>
              <CopyButton value={packingCode} />
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted">{t("order.packingListPending")}</p>
          )}
        </div>
        <div className="flex items-center px-4 py-3 sm:px-5">
          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            disabled={!pdfReady || pdfBusy}
            title={pdfReady ? undefined : t("order.generatePdfNote")}
            onClick={() =>
              downloadPdf(
                orderModulesToCipl({
                  code: packingCode,
                  customerInfo: modules.customerInfo.data,
                  items: modules.items.data,
                  pickup: modules.pickup.data,
                  context,
                }),
              )
            }
          >
            {pdfBusy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            {pdfBusy ? t("pl.downloading") : t("order.generatePdf")}
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {MODULE_META.map((m) => {
          const locked = m.locksUntilOthers && !pickupUnlocked;
          const status = modules[m.id as ModuleId].status;
          const isNext = m.id === nextUp;
          const Inner = (
            <Card
              className={cn(
                "flex items-center gap-4 p-4 transition-colors",
                locked && "opacity-60",
                // the next card to fill gets the lime frame (the same "this
                // one" signal the cheapest rate card uses)
                !locked && (isNext ? "border-brand/50" : "hover:border-border-strong"),
              )}
            >
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-md transition-colors",
                  // "done" is a status, so it speaks in the status hue (same as the
                  // badge beside it); lime stays with the bar, the next pill and the CTA
                  status === "complete"
                    ? "bg-success/15 text-success"
                    : "bg-surface-3 text-muted",
                )}
              >
                <m.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{t(m.titleKey)}</p>
                {/* the description is the only explanation of the module: let it
                    wrap (2 lines) instead of truncating on the primary device */}
                <p className="line-clamp-2 text-sm leading-snug text-muted sm:truncate">
                  {t(m.descKey)}
                </p>
                {/* phone: status sits under the text so the title keeps its width;
                    the next-up card's Continue pill already says it */}
                {!isNext && (
                  <span className="mt-1.5 inline-flex sm:hidden">
                    <StatusBadge status={status} locked={locked} justDone={m.id === justDone} />
                  </span>
                )}
              </div>
              <span className={cn("hidden sm:contents")}>
                <StatusBadge status={status} locked={locked} justDone={m.id === justDone} />
              </span>
              {!locked &&
                (isNext ? (
                  <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-brand py-1 pl-2.5 pr-1.5 text-xs font-semibold text-brand-ink">
                    {t("order.hubNext")} <ChevronRight className="size-3.5" />
                  </span>
                ) : (
                  <ChevronRight className="size-4 shrink-0 text-muted-2" />
                ))}
            </Card>
          );
          return locked ? (
            <div key={m.id} aria-disabled="true" aria-describedby="hub-pickup-locked">
              {Inner}
            </div>
          ) : (
            <Link key={m.id} href={`/pesan/modul/${m.id}`} className="block">
              {Inner}
            </Link>
          );
        })}
      </div>

      {/* pickup locked note */}
      {!pickupUnlocked && (
        <p id="hub-pickup-locked" className="mt-2 flex items-center gap-1.5 text-xs text-muted-2">
          <Lock className="size-3.5" /> {t("order.pickupLockedNote")}
        </p>
      )}

      {/* all four complete: name the moment before asking for the booking */}
      {canSubmit && (
        <p className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-foreground">
          {/* success lives in the icon; #16a34a text on white is only 3.3:1 */}
          <CheckCircle2 className="size-4 text-success" /> {t("order.hubAllDone")}
        </p>
      )}

      {/* final CTA */}
      <div className={canSubmit ? "mt-3" : "mt-6"}>
        {/* lime is "the answer": until every section is done the answer is the
            next card, so the submit waits in a quiet secondary coat */}
        <Button
          size="lg"
          variant={canSubmit ? "brand" : "secondary"}
          className="w-full"
          disabled={!canSubmit}
          aria-describedby={canSubmit ? undefined : "hub-submit-note"}
          onClick={() => setAgreeOpen(true)}
        >
          {t("order.finalCta")}
        </Button>
        {!canSubmit && (
          <p id="hub-submit-note" className="mt-2 text-center text-xs text-muted-2">
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

/** "3 hari lalu" / "2 hours ago" from a timestamp, in the active locale. */
function formatRelative(ts: number, locale: string): string {
  const diff = Date.now() - ts;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const min = Math.round(diff / 60000);
  if (min < 1) return rtf.format(0, "minute");
  if (min < 60) return rtf.format(-min, "minute");
  const h = Math.round(min / 60);
  if (h < 24) return rtf.format(-h, "hour");
  return rtf.format(-Math.round(h / 24), "day");
}
