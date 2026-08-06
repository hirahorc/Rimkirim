"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import {
  useOrderStore,
  useOrderHydrated,
} from "@/lib/store/useOrderStore";
import {
  useNotificationsStore,
  useNotificationsHydrated,
} from "@/lib/store/useNotificationsStore";
import { useAuthHydrated, useCurrentUser } from "@/lib/store/useAuthStore";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";

interface NotificationItem {
  key: string;
  at: number;
  /** insertion sequence (higher = later) — deterministic tiebreaker for `at`. */
  seq: number;
  messageKey: string;
  orderId: string;
  identifier: string | null;
}

/** Recent events across the current user's orders, newest first. */
function useNotifications(): NotificationItem[] {
  const email = useCurrentUser()?.email ?? null;
  const orders = useOrderStore(
    useShallow((s) =>
      email
        ? s.orders.filter(
            (o) =>
              o.ownerEmail === email &&
              (o.status !== "draft" || o.bookingNumber !== null),
          )
        : [],
    ),
  );
  return React.useMemo(() => {
    const items: NotificationItem[] = [];
    for (const o of orders) {
      for (const e of o.timeline ?? []) {
        items.push({
          key: `${o.id}:${e.id}`,
          at: e.at,
          seq: items.length,
          messageKey: e.messageKey,
          orderId: o.id,
          identifier: o.bookingNumber,
        });
      }
    }
    return items.sort((a, b) => b.at - a.at || b.seq - a.seq);
  }, [orders]);
}

/** Header bell — the user's notifications, driven by each order's timeline. */
export function NotificationBell() {
  const t = useT();
  const { locale } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const hydrated = useOrderHydrated();
  const authHydrated = useAuthHydrated();
  const notifHydrated = useNotificationsHydrated();
  const user = useCurrentUser();
  const notifications = useNotifications();
  const readUpTo = useNotificationsStore((s) =>
    user ? s.readUpTo[user.email] ?? 0 : 0,
  );
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const ready = hydrated && authHydrated && notifHydrated;
  const unread = ready
    ? notifications.filter((n) => n.at > readUpTo).length
    : 0;

  const timeFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && user && notifications.length > 0) {
      markAllRead(user.email, notifications[0].at);
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("notif.title")}
          className="tap-target relative grid size-9 place-items-center rounded-md border border-border bg-surface-2 text-muted transition-colors hover:text-foreground"
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold leading-4 text-brand-ink">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-2 sm:w-96">
        <div className="flex items-center justify-between border-b border-border px-2 pb-2 pt-1">
          <p className="text-sm font-semibold">{t("notif.title")}</p>
          {unread > 0 && (
            <span className="text-xs text-muted-2">
              {unread} {t("notif.unread")}
            </span>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted">
            {t("notif.empty")}
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto scroll-thin">
            {notifications.map((n) => (
              <li key={n.key}>
                <Link
                  href={`/pesanan/${n.orderId}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex flex-col gap-0.5 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-2",
                    n.at > readUpTo && "bg-surface-2/60",
                  )}
                >
                  <span className="text-sm">{t(n.messageKey)}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-2">
                    <span className="font-mono">{n.identifier ?? "—"}</span>
                    <span>·</span>
                    <span>{timeFmt.format(n.at)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
