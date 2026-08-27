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
  PartyPopper,
  Download,
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
  const clearance = useOrderStore((s) => s.clearance);
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
  // the save that crossed the line: three chores done, pickup just came alive.
  // One earned animation, once, plus a spoken announcement for SR users.
  const justUnlocked =
    justDone !== null &&
    justDone !== "pickup" &&
    isPickupUnlocked(modules) &&
    modules.pickup.status !== "complete" &&
    MODULE_META.filter((m) => modules[m.id as ModuleId].status === "complete")
      .length === 3;
  const completeCount = MODULE_META.filter(
    (m) => modules[m.id as ModuleId].status === "complete",
  ).length;

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
      {/* left on phones, centred from sm up — the flow's shared header
          alignment (same on /pesan and /pesan/clearance) */}
      <header className="mb-6 sm:text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("order.hubTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{t("order.hubSubtitle")}</p>
        {/* the customs route chosen one step ago, kept in view; it is one-way,
            so it is stated, not offered for editing */}
        {clearance && context?.service !== "moving-abroad" && (
          <p className="mt-3 text-sm">
            <span className="font-display text-xs font-medium uppercase tracking-[0.04em] text-muted-2">
              {t("order.hubRouteLabel")}
            </span>{" "}
            <span className="font-medium text-foreground">
              {t(clearance === "personal" ? "order.clPersonalTitle" : "order.clPassengerTitle")}
            </span>{" "}
            <span className="text-muted-2">({t("order.hubRouteFixed")})</span>
          </p>
        )}
        {/* progress in numbers only — the per-card badges already show it per
            section, so a filling bar would say the same thing a third time */}
        <div className="mt-4">
          <p className="text-sm font-medium text-foreground">
            {t("order.hubProgress")
              .replace("{n}", String(completeCount))
              .replace("{total}", String(MODULE_META.length))}
          </p>
          {lastSavedAt && completeCount > 0 && (
            <p className="mt-1 text-xs text-muted-2">
              {t("order.hubLastSaved").replace("{when}", formatRelative(lastSavedAt, locale))}
            </p>
          )}
        </div>
      </header>

      {/* the receipt: what the order already HAS (booking number, packing list,
          document) in one quiet strip, so the body below is only the work */}
      <Card className="mb-6 grid rounded-md divide-y divide-border overflow-hidden p-0 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3 sm:px-5">
          <p className="font-display text-xs font-medium uppercase tracking-wide text-muted-2">
            {t("order.bookingNumberLabel")}
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
          <p className="flex items-center gap-1.5 font-display text-xs font-medium uppercase tracking-wide text-muted-2">
            <FileText className="size-3.5" /> {t("order.packingListTitle")}
            {/* "created" only when we made it; a code the user typed is just their code */}
            {packingCode && !answers.packingCode?.trim() && (
              <Badge variant="brand">{t("order.packingListReady")}</Badge>
            )}
          </p>
          {packingCode ? (
            <>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-base font-semibold tabular-nums">
                  {packingCode}
                </span>
                <CopyButton value={packingCode} />
              </div>
              {/* the PDF is the packing list's document, so its action lives in
                  this cell — it appears together with the code it downloads */}
              <Button
                variant="secondary"
                size="sm"
                className="mt-2 w-full sm:w-auto"
                loading={pdfBusy}
                disabled={!pdfReady}
                aria-describedby={pdfReady ? undefined : "hub-pdf-note"}
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
                {!pdfBusy && <Download className="size-3.5" />}
                {pdfBusy ? t("pl.downloading") : t("order.generatePdf")}
              </Button>
              {/* a user-supplied code can exist before the sections do */}
              {!pdfReady && (
                <p id="hub-pdf-note" className="mt-1 text-xs leading-snug text-muted-2">
                  {t("order.generatePdfNote")}
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">{t("order.packingListPending")}</p>
          )}
        </div>
      </Card>

      <div className="space-y-3">
        {MODULE_META.map((m) => {
          const locked = m.locksUntilOthers && !pickupUnlocked;
          const status = modules[m.id as ModuleId].status;
          const Inner = (
            <Card
              className={cn(
                "rounded-md flex items-center gap-4 p-4 transition-colors",
                // muted via tokens, not opacity: the badge and note must stay AA
                locked && "border-border/70 bg-surface-2/60 text-muted",
                // no "next" highlight: the four sections are deliberately
                // order-free, so no card is nominated over the others
                !locked && "hover:border-border-strong",
                m.id === "pickup" && justUnlocked && "unlock-pop",
              )}
            >
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-md transition-colors",
                  // "done" is a status, so it speaks in the status hue (same as the
                  // badge beside it); lime stays with the bar and the CTA
                  status === "complete"
                    ? "bg-success/15 text-success"
                    : "bg-surface-3 text-muted",
                )}
              >
                <m.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("font-medium", locked && "text-muted")}>{t(m.titleKey)}</p>
                {/* the description is the only explanation of the module: let it
                    wrap (2 lines) instead of truncating on the primary device —
                    but always reserve both lines, so the four cards stay one
                    height regardless of how far each description wraps */}
                <p className="line-clamp-2 min-h-[2lh] text-sm leading-snug text-muted sm:min-h-0 sm:truncate">
                  {t(m.descKey)}
                </p>
                {/* phone: status sits under the text so the title keeps its width */}
                <span className="mt-1.5 inline-flex sm:hidden">
                  <StatusBadge status={status} locked={locked} justDone={m.id === justDone} />
                </span>
              </div>
              <span className="hidden sm:contents">
                <StatusBadge status={status} locked={locked} justDone={m.id === justDone} />
              </span>
              {!locked && <ChevronRight className="size-4 shrink-0 text-muted-2" />}
            </Card>
          );
          return locked ? (
            // focusable so keyboard/SR users land on it and hear WHY it's locked
            <div
              key={m.id}
              tabIndex={0}
              role="link"
              aria-disabled="true"
              aria-describedby="hub-pickup-locked"
              className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/60"
            >
              {Inner}
            </div>
          ) : (
            <Link key={m.id} href={`/pesan/modul/${m.id}`} className="block">
              {Inner}
            </Link>
          );
        })}
      </div>

      {justUnlocked && (
        <p role="status" className="sr-only">
          {t("order.hubPickupUnlocked")}
        </p>
      )}

      {/* pickup locked note */}
      {!pickupUnlocked && (
        <p id="hub-pickup-locked" className="mt-2 flex items-center gap-1.5 text-xs text-muted-2">
          <Lock className="size-3.5" /> {t("order.pickupLockedNote")}
        </p>
      )}

      {/* all four complete: name the moment before asking for the booking */}
      {canSubmit && (
        <p className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-foreground">
          {/* success lives in the icon, per the Tint-15/25 rule: body text stays ink */}
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
