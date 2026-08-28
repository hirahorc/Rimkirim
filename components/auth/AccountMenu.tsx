"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Package, Wrench, ClipboardList } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useAuthStore, useCurrentUser } from "@/lib/store/useAuthStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { toast } from "sonner";

/** Logged-in account menu in the header (profile, orders, sign out). */
export function AccountMenu() {
  const t = useT();
  const router = useRouter();
  const user = useCurrentUser();
  const logOut = useAuthStore((s) => s.logOut);
  const [open, setOpen] = React.useState(false);

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* the customer's own initial, not an anonymous silhouette — the one
            place the chrome says who is signed in. Same geometry as
            IconPillButton so the trio still reads as one family. */}
        <button
          type="button"
          aria-label={`${t("auth.account")}: ${user.name}`}
          className="tap-target relative grid size-9 place-items-center rounded-full border border-border bg-surface-2 font-display text-sm font-bold text-foreground transition motion-safe:active:scale-[0.98] hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          {user.name.trim().charAt(0).toUpperCase() || "?"}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 p-2">
        {/* the identity block is itself the door to /akun */}
        <Link
          href="/akun"
          onClick={() => setOpen(false)}
          className="block rounded-sm border-b border-border px-2 pb-2 pt-1 transition-colors hover:bg-surface-2"
        >
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </Link>
        <Link
          href="/kiriman"
          onClick={() => setOpen(false)}
          className="mt-1 flex items-center gap-2 rounded-sm px-2 py-2 text-sm transition-colors hover:bg-surface-2"
        >
          <Package className="size-4 text-muted" /> {t("auth.myOrders")}
        </Link>
        <Link
          href="/packing-list"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm transition-colors hover:bg-surface-2"
        >
          <ClipboardList className="size-4 text-muted" /> {t("auth.myPackingLists")}
        </Link>
        {/* internal demo tool, not a customer item: fenced below a hairline
            and dressed in ops Info Blue so it can't pass as product UI.
            "Pengaturan Akun" has no row of its own — the identity block
            above is the door to /akun. */}
        <div className="my-1 border-t border-border" aria-hidden />
        <Link
          href="/simulator"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm text-info-ink transition-colors hover:bg-info/10"
        >
          <Wrench className="size-4" /> {t("ops.menu")}
        </Link>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            logOut();
            toast.success(t("auth.loggedOut"));
            router.push("/");
          }}
          className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm transition-colors hover:bg-surface-2"
        >
          <LogOut className="size-4 text-muted" /> {t("auth.logout")}
        </button>
      </PopoverContent>
    </Popover>
  );
}
