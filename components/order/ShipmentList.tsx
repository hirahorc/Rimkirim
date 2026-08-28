"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowRight,
  PackageSearch,
  PenLine,
  Plus,
  AlertTriangle,
} from "lucide-react";
import {
  useMyOrders,
  useOrderHydrated,
  useOrderStore,
  type Order,
  type OrderPhase,
} from "@/lib/store/useOrderStore";
import { ACTION_ATTENTION, DARK_ATTENTION } from "@/lib/order/attention";
import { CopyButton } from "./CopyButton";
import { PHASE_STEPS } from "@/components/tracking/StatusStepper";
import { cn } from "@/lib/utils/cn";
import { useAuthHydrated, useCurrentUser } from "@/lib/store/useAuthStore";
import { getCountry } from "@/lib/data/countries";
import { Flag } from "@/components/shared/Flag";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RouteArrow } from "@/components/ui/route-arrow";
import { OrderStatusBadge } from "./OrderStatusBadge";

/** "Kiriman Saya" — the signed-in user's shipments. */
export function ShipmentList() {
  const t = useT();
  const { locale } = useLanguage();
  const router = useRouter();
  const hydrated = useOrderHydrated();
  const authHydrated = useAuthHydrated();
  const user = useCurrentUser();
  const orders = useMyOrders(user?.email ?? null);

  React.useEffect(() => {
    if (!hydrated || !authHydrated) return;
    if (!user) router.replace("/masuk?next=/kiriman");
  }, [hydrated, authHydrated, user, router]);

  if (!hydrated || !authHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("order.ordersTitle")}
          </h1>
          <p className="mt-1.5 text-sm text-muted">{t("order.ordersSubtitle")}</p>
        </div>
        {/* the "add" affordance, so order #2 doesn't require an empty list */}
        {orders.length > 0 && (
          <Button asChild variant="dashed" size="sm" className="shrink-0">
            <Link href="/#kalkulator">
              <Plus className="size-4" /> {t("order.ordersEmptyCta")}
            </Link>
          </Button>
        )}
      </header>

      {/* keeps the document outline unbroken (h1 → footer h3 skipped an h2) */}
      <h2 className="sr-only">{t("order.ordersListHeading")}</h2>
      {orders.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-surface-2 text-muted-2">
            <PackageSearch className="size-7" />
          </div>
          <p className="mt-4 font-medium">{t("order.ordersEmpty")}</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
            {t("order.ordersEmptyBody")}
          </p>
          <Button asChild className="mt-5">
            <Link href="/#kalkulator">
              {t("order.ordersEmptyCta")} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

const WA_URL = "https://wa.me/6281234567890";

function OrderCard({ order, locale }: { order: Order; locale: "id" | "en" }) {
  const t = useT();
  const router = useRouter();
  const resumeOrder = useOrderStore((s) => s.resumeOrder);
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
  const needsAction =
    order.attention !== null && ACTION_ATTENTION.has(order.attention);
  // the hardest news carries a human, on the list too — but never doubled
  // under an action row that already says what to do
  const darkNote =
    !needsAction &&
    order.attention !== null &&
    DARK_ATTENTION.has(order.attention);
  const isCancelled = order.status === "cancelled";
  const phaseIdx = PHASE_STEPS.indexOf(order.status as OrderPhase);

  return (
    // the whole card is the tap target: a stretched overlay link owns every
    // pixel that isn't a raised control (`relative` children paint above it)
    <Card className="relative rounded-md p-4 transition-colors hover:border-border-strong">
      <Link
        href={`/kiriman/${order.id}`}
        aria-label={[identifier, origin?.name, dest?.name]
          .filter(Boolean)
          .join(" · ")}
        className="absolute inset-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
            {identifier ?? "–"}
            {identifier && (
              <CopyButton value={identifier} className="relative" />
            )}
            <OrderStatusBadge status={order.status} />
          </p>
          <p className="mt-2 flex min-w-0 items-center gap-1.5 text-sm text-muted">
            <Flag code={order.context?.originCountry} size={13} />
            <span className="min-w-0 truncate" title={origin?.name}>
              {origin?.name ?? "–"}
            </span>
            <RouteArrow />
            <Flag code={order.context?.destCountry} size={13} />
            <span className="min-w-0 truncate" title={dest?.name}>
              {dest?.name ?? "–"}
            </span>
          </p>
        </div>
        {/* one quiet meta line on phones, a right-aligned column from sm up */}
        <div className="flex items-baseline gap-2 text-left sm:block sm:shrink-0 sm:text-right">
          <p className="text-sm text-muted">{t(serviceKey)}</p>
          <p className="text-xs text-muted-2 sm:mt-1">
            {t("order.ordersCreatedAt")} {date}
          </p>
        </div>
      </div>
      {/* where the order sits in the 7 phases, at a glance. Fills follow the
          stepper signature: lime behind, ink-framed lime current (a bare lime
          or pale-grey pill is invisible on daylight), hairline-fenced ahead */}
      {phaseIdx >= 0 && (
        <div className="mt-3 flex items-center gap-1">
          {PHASE_STEPS.map((p, i) => (
            <span
              key={p}
              aria-hidden
              className={cn(
                "flex-1 rounded-full border",
                i < phaseIdx
                  ? "h-1.5 border-brand-dim bg-brand"
                  : i === phaseIdx
                    ? "h-2.5 border-foreground bg-brand"
                    : "h-1.5 border-border-strong bg-surface-2",
              )}
            />
          ))}
          <span className="sr-only">
            {t("order.stepOf")
              .replace("{n}", String(phaseIdx + 1))
              .replace("{total}", String(PHASE_STEPS.length))}
          </span>
        </div>
      )}
      {/* the ball is in the user's court — say so on the list, not only
          inside. Not a nested link: clicks fall through to the card overlay,
          so the same destination isn't a second tab stop */}
      {needsAction && (
        <div className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          <p className="min-w-0">
            <span className="font-semibold text-warning">
              {t("order.listNeedsAction")}
            </span>{" "}
            <span className="text-foreground">{t(order.attention!)}</span>
          </p>
        </div>
      )}
      {/* the worst outcomes never end at a wordless badge: one plain line and
          a human to talk to (the WhatsApp assistance that already exists) */}
      {(isCancelled || darkNote) && (
        <div className="mt-3 border-t border-border pt-3 text-sm">
          <p className="text-muted">
            {isCancelled ? t("order.listCancelledNote") : t(order.attention!)}
          </p>
          <a
            href={WA_URL}
            target="_blank"
            rel="noreferrer"
            className="link-mark tap-row relative mt-1 inline-flex items-center text-xs font-medium"
          >
            {t("order.tdWrongLink")}
          </a>
        </div>
      )}
      {isDraft && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-xs text-muted-2">{t("order.draftNote")}</p>
          <Button
            size="sm"
            variant="secondary"
            className="tap-row relative"
            onClick={() => {
              resumeOrder(order.id);
              // every listed draft reached the hub (pre-hub questionnaires
              // aren't orders yet) — resume straight into the modules
              router.push("/pesan/modul");
            }}
          >
            <PenLine className="size-3.5" /> {t("order.resumeDraft")}
          </Button>
        </div>
      )}
    </Card>
  );
}
