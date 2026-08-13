"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, PackageSearch, PenLine } from "lucide-react";
import {
  useMyOrders,
  useOrderHydrated,
  useOrderStore,
  type Order,
} from "@/lib/store/useOrderStore";
import { useAuthHydrated, useCurrentUser } from "@/lib/store/useAuthStore";
import { getCountry } from "@/lib/data/countries";
import { Flag } from "@/components/shared/Flag";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RouteArrow } from "@/components/ui/route-arrow";
import { OrderStatusBadge } from "./OrderStatusBadge";

/** "Pesanan Saya" — the signed-in user's submitted orders. */
export function OrderList() {
  const t = useT();
  const { locale } = useLanguage();
  const router = useRouter();
  const hydrated = useOrderHydrated();
  const authHydrated = useAuthHydrated();
  const user = useCurrentUser();
  const orders = useMyOrders(user?.email ?? null);

  React.useEffect(() => {
    if (!hydrated || !authHydrated) return;
    if (!user) router.replace("/masuk?next=/pesanan");
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
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("order.ordersTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{t("order.ordersSubtitle")}</p>
      </header>

      {orders.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-surface-2 text-muted-2">
            <PackageSearch className="size-7" />
          </div>
          <p className="mt-4 font-medium">{t("order.ordersEmpty")}</p>
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

  return (
    <Card className="p-4 transition-colors hover:border-border-strong">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/pesanan/${order.id}`} className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
            {identifier ?? "–"}
            <OrderStatusBadge status={order.status} />
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <Flag code={order.context?.originCountry} size={13} />
            <span>{origin?.name ?? "–"}</span>
            <RouteArrow />
            <Flag code={order.context?.destCountry} size={13} />
            <span>{dest?.name ?? "–"}</span>
          </p>
        </Link>
        <div className="shrink-0 text-right">
          <p className="text-sm text-muted">{t(serviceKey)}</p>
          <p className="mt-1 text-xs text-muted-2">
            {t("order.ordersCreatedAt")} {date}
          </p>
        </div>
      </div>
      {isDraft && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-xs text-muted-2">{t("order.draftNote")}</p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              resumeOrder(order.id);
              // a booking number means the hub was reached — resume there
              router.push(order.bookingNumber ? "/pesan/modul" : "/pesan");
            }}
          >
            <PenLine className="size-3.5" /> {t("order.resumeDraft")}
          </Button>
        </div>
      )}
    </Card>
  );
}
