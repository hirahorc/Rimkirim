"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  ArrowRight,
  ClipboardList,
  Plus,
  Download,
  PenLine,
  Trash2,
  Package,
  ArrowUpRight,
} from "lucide-react";
import { useAllMyOrders, useOrderHydrated } from "@/lib/store/useOrderStore";
import { packingListFromOrder, orderUsingCode } from "@/lib/order/order-packing";
import {
  useMyPackingLists,
  usePackingHydrated,
  usePackingListStore,
} from "@/lib/store/usePackingListStore";
import { useAuthHydrated, useCurrentUser } from "@/lib/store/useAuthStore";
import { summarizeItems, type PackingList } from "@/lib/types/packing";
import { packingListToCipl } from "@/lib/pdf/cipl";
import { getCountry } from "@/lib/data/countries";
import { formatNumber } from "@/lib/utils/currency";
import { Flag } from "@/components/shared/Flag";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RouteArrow } from "@/components/ui/route-arrow";
import { CopyButton } from "@/components/order/CopyButton";
import { DeletePackingListDialog } from "./DeletePackingListDialog";
import { useDownloadCipl } from "./useDownloadCipl";
import { useOpenOrder } from "./useOpenOrder";

/** "Packing List Saya" — the signed-in user's standalone packing lists. */
export function PackingLists() {
  const t = useT();
  const { locale } = useLanguage();
  const router = useRouter();
  const hydrated = usePackingHydrated();
  const authHydrated = useAuthHydrated();
  const user = useCurrentUser();
  const ownLists = useMyPackingLists(user?.email ?? null);
  const orderHydrated = useOrderHydrated();
  const orders = useAllMyOrders(user?.email ?? null);
  // one rule: a packing list linked to an order is owned by that order — its
  // data comes from the order's modules and it's edited there. Standalone
  // lists whose code an order picked up therefore show as the order's version.
  const lists = React.useMemo(() => {
    const fromOrders = new Map(
      orders
        .map(packingListFromOrder)
        .filter((l): l is PackingList => l !== null)
        .map((l) => [l.code, l] as const),
    );
    const merged: PackingList[] = ownLists.map((l) => {
      const viaOrder = fromOrders.get(l.code);
      if (viaOrder) {
        fromOrders.delete(l.code);
        return viaOrder;
      }
      const linked = orderUsingCode(orders, l.code);
      // linked but the order hasn't filled its modules yet: still read-only
      return linked
        ? {
            ...l,
            source: {
              orderId: linked.id,
              bookingNumber: linked.bookingNumber,
              draft: linked.status === "draft",
            },
          }
        : l;
    });
    return [...merged, ...fromOrders.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [ownLists, orders]);
  const remove = usePackingListStore((s) => s.remove);
  const [pendingDelete, setPendingDelete] = React.useState<PackingList | null>(null);

  React.useEffect(() => {
    if (!hydrated || !authHydrated) return;
    if (!user) router.replace("/masuk?next=/packing-list");
  }, [hydrated, authHydrated, user, router]);

  if (!hydrated || !authHydrated || !orderHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("pl.listTitle")}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted">{t("pl.listSubtitle")}</p>
        </div>
        {lists.length > 0 && (
          <Button asChild>
            <Link href="/packing-list/buat">
              <Plus className="size-4" /> {t("pl.newCta")}
            </Link>
          </Button>
        )}
      </header>

      {lists.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-surface-2 text-muted-2">
            <ClipboardList className="size-7" />
          </div>
          <p className="mt-4 font-medium">{t("pl.empty")}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{t("pl.emptyBody")}</p>
          <Button asChild className="mt-5">
            <Link href="/packing-list/buat">
              {t("pl.emptyCta")} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {lists.map((pl) => (
            <PackingListCard
              key={pl.id}
              pl={pl}
              locale={locale}
              onDelete={() => setPendingDelete(pl)}
            />
          ))}
        </div>
      )}

      <DeletePackingListDialog
        code={pendingDelete?.code ?? null}
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            remove(pendingDelete.id);
            toast.success(t("pl.deletedToast"));
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function PackingListCard({
  pl,
  locale,
  onDelete,
}: {
  pl: PackingList;
  locale: "id" | "en";
  onDelete: () => void;
}) {
  const t = useT();
  const { busy, download } = useDownloadCipl();
  const openOrder = useOpenOrder();
  const origin = getCountry(pl.data.sender.country);
  const dest = getCountry(pl.data.receiver.country);
  const sum = summarizeItems(pl.data.items);
  const date = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(pl.updatedAt));

  return (
    <Card className="p-4 transition-colors hover:border-border-strong">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 font-mono text-sm font-semibold text-foreground">
            {pl.code}
            <CopyButton value={pl.code} />
            {pl.source && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 font-sans text-xs font-medium text-muted">
                <Package className="size-3" /> {t("pl.fromOrder")}
                {pl.source.bookingNumber && (
                  <span className="font-mono">{pl.source.bookingNumber}</span>
                )}
              </span>
            )}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <Flag code={pl.data.sender.country} size={13} />
            <span className="truncate">{origin?.name ?? (pl.data.sender.country || "–")}</span>
            <RouteArrow />
            <Flag code={pl.data.receiver.country} size={13} />
            <span className="truncate">{dest?.name ?? (pl.data.receiver.country || "–")}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-baseline gap-2 sm:block sm:text-right">
          <p className="text-sm text-muted tabular-nums">
            {sum.packageCount} {t("pl.packagesShort")} · {formatNumber(sum.totalWeight)} kg
          </p>
          <p className="text-xs text-muted-2 sm:mt-1">
            {t("pl.updatedAt")} {date}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-border pt-3">
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() => download(packingListToCipl(pl))}
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          {busy ? t("pl.downloading") : t("pl.download")}
        </Button>
        {pl.source ? (
          <>
            <Button size="sm" variant="ghost" onClick={() => openOrder(pl.source!)}>
              <ArrowUpRight className="size-3.5" /> {t("pl.viewOrder")}
            </Button>
            <span className="ml-auto text-xs text-muted-2">{t("pl.fromOrderNote")}</span>
          </>
        ) : (
          <>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/packing-list/${pl.id}`}>
                <PenLine className="size-3.5" /> {t("pl.edit")}
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto hover:text-danger"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5" /> {t("pl.delete")}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
