"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  MessageCircle,
  Plane,
  Route as RouteIcon,
  PenLine,
  ShieldCheck,
} from "lucide-react";
import { DocumentArrowUpIcon, XCircleIcon } from "@heroicons/react/24/solid";
import {
  useOrderStore,
  useOrderHydrated,
  type OrderPhase,
} from "@/lib/store/useOrderStore";
import { useAuthHydrated, useCurrentUser } from "@/lib/store/useAuthStore";
import { getCountry } from "@/lib/data/countries";
import { Flag } from "@/components/shared/Flag";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RouteArrow } from "@/components/ui/route-arrow";
import { CopyButton } from "./CopyButton";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { StatusStepper } from "@/components/tracking/StatusStepper";
import { AttentionStrip } from "@/components/tracking/AttentionStrip";
import { CardStrip, stripInk } from "@/components/ui/card-strip";
import { cn } from "@/lib/utils/cn";
import {
  OrderSummary,
  SectionBand,
  dueComplianceDocsCount,
  fedexTrackUrl,
} from "@/components/tracking/OrderSummary";
import { OrderTimeline } from "@/components/tracking/OrderTimeline";
import { QuotationCard } from "@/components/tracking/QuotationCard";
import { RevisionCard } from "@/components/tracking/RevisionCard";
import { PickupPanel } from "@/components/tracking/PickupPanel";
import { ClearancePanel } from "@/components/tracking/ClearancePanel";
import { WA_URL } from "@/lib/contact";

/** Tracking detail page — owner-only. */
export function OrderDetail({ id }: { id: string }) {
  const t = useT();
  const { locale } = useLanguage();
  const router = useRouter();
  const hydrated = useOrderHydrated();
  const authHydrated = useAuthHydrated();
  const user = useCurrentUser();
  const order = useOrderStore((s) => s.orders.find((o) => o.id === id));
  const resumeOrder = useOrderStore((s) => s.resumeOrder);

  // hooks stay above the early returns
  const dateFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [locale],
  );

  React.useEffect(() => {
    if (!hydrated || !authHydrated) return;
    if (!user) {
      router.replace(`/masuk?next=${encodeURIComponent(`/kiriman/${id}`)}`);
      return;
    }
    if (!order || order.ownerEmail !== user.email) {
      router.replace("/kiriman");
    }
  }, [hydrated, authHydrated, user, order, id, router]);

  if (!hydrated || !authHydrated) {
    return (
      <div data-field className="flex min-h-[50vh] items-center justify-center text-muted">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }
  if (!user || !order || order.ownerEmail !== user.email) return null;

  const origin = getCountry(order.context?.originCountry);
  const dest = getCountry(order.context?.destCountry);
  const serviceKey =
    order.context?.service === "moving-abroad"
      ? "order.serviceMa"
      : "order.serviceBfg";
  const createdAt = new Date(order.createdAt);
  // a corrupt persisted timestamp must not throw the whole page away
  const date = Number.isNaN(createdAt.getTime()) ? null : dateFmt.format(createdAt);
  const isDraft = order.status === "draft";
  const identifier = order.bookingNumber;

  // the "needs you / in progress" tier — anything time-sensitive or live.
  // gated so the zone wrapper never renders an empty band with a top margin.
  const showRevision = !!order.revisionModule && order.status === "review";
  // the journey's end deserves at least a success banner, not a bare stepper
  const attention =
    order.attention ??
    (order.status === "delivered" ? "order.attDelivered" : null);
  // the attention rides as the head of the card it explains (The
  // Attached-Strip Rule): the live panel for that phase when there is one,
  // otherwise the status card — never a box of its own
  const attentionHost: "revision" | "quotation" | "pickup" | "clearance" | "status" =
    showRevision
      ? "revision"
      : order.status === "quotation" && order.quotation
        ? "quotation"
        : order.status === "pickup"
          ? "pickup"
          : order.status === "clearance"
            ? "clearance"
            : "status";
  const hosted = (host: typeof attentionHost) =>
    attentionHost === host ? attention : null;
  const hasLivePanels =
    showRevision ||
    !!order.quotation ||
    order.status === "pickup" ||
    order.status === "clearance";
  // docs the customer still owes for the phases ahead — surfaced up here in
  // the status tier so the page's one standing to-do isn't buried below the
  // activity log (the tiles themselves live in the Compliance section)
  const docsTodo = dueComplianceDocsCount(order);

  return (
    <div data-field className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/kiriman"
        className="tap-row mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {t("order.ordersTitle")}
      </Link>

      {/* de-boxed identity header (De-Box Rule): this is the record naming the
          page, not a liftable unit — no card frame around the headline */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-xs font-medium uppercase tracking-wide text-muted-2">
              {t("order.bookingNumberLabel")}
            </p>
            {/* the booking number names this page, so it carries the h1 —
                the copy button stays a sibling rather than sitting inside it */}
            <div className="mt-1 flex items-center gap-2">
              <h1
                className="font-mono text-xl font-bold tracking-tight text-foreground"
                aria-label={`${t("order.bookingNumberLabel")}: ${
                  identifier ?? t("order.bookingNumberPending")
                }`}
              >
                {identifier ?? "–"}
              </h1>
              {identifier && <CopyButton value={identifier} />}
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-muted-2">
              <CalendarDays className="size-4" /> {t("order.ordersCreatedAt")}
            </span>
            <span className="text-muted">{date ?? "–"}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-muted-2">
              <Plane className="size-4" /> {t("order.serviceLabel")}
            </span>
            <span className="text-muted">{t(serviceKey)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-muted-2">
              <RouteIcon className="size-4" /> {t("order.ordersRoute")}
            </span>
            <span className="flex items-center gap-1.5 text-muted">
              <Flag code={order.context?.originCountry} size={13} />
              {origin?.name ?? "–"}
              <RouteArrow />
              <Flag code={order.context?.destCountry} size={13} />
              {dest?.name ?? "–"}
            </span>
          </div>
          {/* the customs route is an identity fact of the order (chosen once,
              one-way), so it lives with created/service/route — the old
              Eligibility section this replaces sat far below the fold */}
          {order.clearance && order.context?.service !== "moving-abroad" && (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-2">
                <ShieldCheck className="size-4" /> {t("order.hubRouteLabel")}
              </span>
              <span className="text-muted">
                {t(
                  order.clearance === "personal"
                    ? "order.clPersonalTitle"
                    : "order.clPassengerTitle",
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* status tier: the first boxed unit under the de-boxed header */}
      {!isDraft && (
        <Card className="mt-6 rounded-md p-4 sm:p-5">
          {/* head: why you are here (in transit, delivered, cancelled —
              phases with no live panel to carry it). A terminal status is
              news, not archive material: cancelled leads the record here,
              with a reason-door, instead of as a red box of its own */}
          {order.status === "cancelled" ? (
            <CardStrip edge="top" tone="danger" inset="sm" icon={XCircleIcon}>
              <p className={cn("font-semibold", stripInk("danger"))}>
                {t("order.tdCancelledNotice")}
              </p>
              <p className="mt-0.5 text-muted">{t("order.tdCancelledBody")}</p>
              <a
                href={WA_URL}
                target="_blank"
                rel="noreferrer"
                className="link-mark tap-row relative mt-2 inline-flex items-center gap-1.5 text-sm font-medium"
              >
                <MessageCircle className="size-4" /> {t("order.contactWa")}
              </a>
            </CardStrip>
          ) : (
            <AttentionStrip attention={hosted("status")} inset="sm" />
          )}
          <StatusStepper status={order.status as OrderPhase} />
          {/* the tracking artifact rides with the rail it advances: once the
              AWB exists, an in-transit customer finds it beside the stepper
              instead of below the whole record (its archival row stays in
              "what's next" at the record's foot) */}
          {order.awb && (
            // the number is the headline: a small label above, the mono
            // number large beneath with its copy, and the tracking link as a
            // chip on the right. Nothing has to share a line with the label,
            // so no width turns it into a ragged second row
            <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-3.5">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-display text-xs font-medium uppercase tracking-wide text-muted-2">
                  <Plane className="size-3.5" aria-hidden /> {t("order.tdAwbNumber")}
                </p>
                <p className="mt-1 flex items-center gap-1.5">
                  <span className="truncate font-mono text-base font-medium text-foreground">
                    {order.awb}
                  </span>
                  <CopyButton value={order.awb} />
                </p>
              </div>
              <a
                href={fedexTrackUrl(order.awb)}
                target="_blank"
                rel="noreferrer"
                aria-label={t("order.tdAwbTrack")}
                className="tap-target relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 sm:px-3.5"
              >
                <span className="hidden sm:inline">{t("order.tdAwbTrack")}</span>
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </div>
          )}
          {docsTodo > 0 && (
            // the card's foot wears the ask (purple tint, no outline, ink
            // words, raw hue in the glyphs): a to-do reads as "your move"
            // from across the room, not as one grey line under the rail
            <CardStrip
              edge="bottom"
              tone="action"
              inset="sm"
              icon={DocumentArrowUpIcon}
              href="#compliance-docs"
              rowClassName="items-center"
            >
              <span className="flex items-center gap-2 font-medium text-accent">
                {(docsTodo === 1
                  ? t("order.tdDocsTodoOne")
                  : t("order.tdDocsTodoMany")
                ).replace("{n}", String(docsTodo))}
                <ChevronRight className="ml-auto size-4 shrink-0 text-accent" aria-hidden />
              </span>
            </CardStrip>
          )}
        </Card>
      )}

      {/* live tier — what needs the customer or is changing right now. one
          generous break separates it from status; the panels sit tight to
          each other so they read as a single "in progress" band */}
      {hasLivePanels && (
        <div className="mt-8 space-y-3">
          {showRevision && (
            <RevisionCard
              orderId={order.id}
              moduleId={order.revisionModule!}
              note={order.revisionNote}
              attention={hosted("revision")}
            />
          )}
          {/* the phase that needs the customer outranks the archived
              quotation: it leads only while approving it IS the live task.
              NOTE: the two mutually-exclusive QuotationCard slots also force a
              REMOUNT when the status changes — the card's breakdownOpen
              initial state relies on that. Merging the slots into one would
              silently freeze the breakdown open after approval. */}
          {order.status === "quotation" && order.quotation && (
            <QuotationCard order={order} attention={hosted("quotation")} />
          )}
          {order.status === "pickup" && (
            <PickupPanel order={order} attention={hosted("pickup")} />
          )}
          {order.status === "clearance" && (
            <ClearancePanel order={order} attention={hosted("clearance")} />
          )}
          {order.status !== "quotation" && order.quotation && (
            <QuotationCard order={order} />
          )}
        </div>
      )}

      {/* reference tier — the archival record: timeline + the full replay of
          everything the customer entered. a labeled hairline break drops it a
          clear step below the live tier so it reads as look-it-up material */}
      <div className="mt-12 flex items-center gap-3">
        <h2 className="font-display text-xs font-medium uppercase tracking-wide text-muted-2">
          {t("order.tdRecordHeading")}
        </h2>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="mt-5">
        <OrderTimeline events={order.timeline} />
        {/* same mobile band the record sections use, so the Activity ↔ record
            boundary reads like every other section break */}
        {order.timeline?.length > 0 && <SectionBand />}
        <OrderSummary order={order} />
      </div>

      {isDraft && (
        <>
          <p className="mt-8 text-center text-xs text-muted-2">
            {t("order.draftNote")}
          </p>
          <Button
            size="lg"
            className="mt-2 w-full"
            onClick={() => {
              resumeOrder(order.id);
              // a booking number means the hub was reached — resume there
              router.push(order.bookingNumber ? "/pesan/modul" : "/pesan");
            }}
          >
            <PenLine className="size-4" /> {t("order.resumeDraft")}
          </Button>
        </>
      )}
    </div>
  );
}
