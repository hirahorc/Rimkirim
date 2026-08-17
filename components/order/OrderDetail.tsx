"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  CalendarDays,
  Plane,
  Route as RouteIcon,
  PenLine,
} from "lucide-react";
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
import { AttentionBanner } from "@/components/tracking/AttentionBanner";
import { OrderSummary } from "@/components/tracking/OrderSummary";
import { OrderTimeline } from "@/components/tracking/OrderTimeline";
import { QuotationCard } from "@/components/tracking/QuotationCard";
import { RevisionCard } from "@/components/tracking/RevisionCard";
import { PickupPanel } from "@/components/tracking/PickupPanel";
import { ClearancePanel } from "@/components/tracking/ClearancePanel";

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

  React.useEffect(() => {
    if (!hydrated || !authHydrated) return;
    if (!user) {
      router.replace(`/masuk?next=${encodeURIComponent(`/pesanan/${id}`)}`);
      return;
    }
    if (!order || order.ownerEmail !== user.email) {
      router.replace("/pesanan");
    }
  }, [hydrated, authHydrated, user, order, id, router]);

  if (!hydrated || !authHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
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
  const date = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(order.createdAt));
  const isDraft = order.status === "draft";
  const identifier = order.bookingNumber;

  // the "needs you / in progress" tier — anything time-sensitive or live.
  // gated so the zone wrapper never renders an empty band with a top margin.
  const showRevision = !!order.revisionModule && order.status === "review";
  // the journey's end deserves at least a success banner, not a bare stepper
  const attention =
    order.attention ??
    (order.status === "delivered" ? "order.attDelivered" : null);
  const hasLivePanels =
    !!attention ||
    showRevision ||
    !!order.quotation ||
    order.status === "pickup" ||
    order.status === "clearance";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/pesanan"
        className="tap-row mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {t("order.ordersTitle")}
      </Link>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-2">
              {t("order.bookingNumberLabel")}
            </p>
            {/* the booking number names this page, so it carries the h1 —
                the copy button stays a sibling rather than sitting inside it */}
            <div className="mt-1 flex items-center gap-2">
              <h1
                className="font-mono text-xl font-bold tracking-tight text-foreground"
                aria-label={`${t("order.bookingNumberLabel")} ${identifier ?? ""}`}
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
            <span className="text-muted">{date}</span>
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
        </div>
      </Card>

      {/* status tier — reads as one concern with the identity card above,
          so it sits tight (mt-3) rather than at the between-tier interval */}
      {!isDraft && (
        <Card className="mt-3 p-4 sm:p-5">
          <StatusStepper status={order.status as OrderPhase} />
        </Card>
      )}

      {/* live tier — what needs the customer or is changing right now. one
          generous break separates it from status; the panels sit tight to
          each other so they read as a single "in progress" band */}
      {hasLivePanels && (
        <div className="mt-8 space-y-3">
          <AttentionBanner attention={attention} />
          {showRevision && (
            <RevisionCard
              orderId={order.id}
              moduleId={order.revisionModule!}
              note={order.revisionNote}
            />
          )}
          {order.quotation && <QuotationCard order={order} />}
          {order.status === "pickup" && <PickupPanel order={order} />}
          {order.status === "clearance" && <ClearancePanel order={order} />}
        </div>
      )}

      {/* reference tier — the archival record: timeline + the full replay of
          everything the customer entered. a labeled hairline break drops it a
          clear step below the live tier so it reads as look-it-up material */}
      <div className="mt-12 flex items-center gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-2">
          {t("order.tdRecordHeading")}
        </h2>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="mt-5 space-y-10">
        <OrderTimeline events={order.timeline} />
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
