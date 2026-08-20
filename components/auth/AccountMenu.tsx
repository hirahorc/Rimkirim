"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Package, Wrench, ClipboardList } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { IconPillButton } from "@/components/ui/icon-pill-button";
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
        <IconPillButton aria-label={t("auth.account")}>
          <User className="size-4" />
        </IconPillButton>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 p-2">
        <div className="border-b border-border px-2 pb-2 pt-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
        <Link
          href="/pesanan"
          onClick={() => setOpen(false)}
          className="mt-1 flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-surface-2"
        >
          <Package className="size-4 text-muted" /> {t("auth.myOrders")}
        </Link>
        <Link
          href="/packing-list"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-surface-2"
        >
          <ClipboardList className="size-4 text-muted" /> {t("auth.myPackingLists")}
        </Link>
        <Link
          href="/simulator"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-surface-2"
        >
          <Wrench className="size-4 text-muted" /> {t("ops.menu")}
        </Link>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            logOut();
            toast.success(t("auth.loggedOut"));
            router.push("/");
          }}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-surface-2"
        >
          <LogOut className="size-4 text-muted" /> {t("auth.logout")}
        </button>
      </PopoverContent>
    </Popover>
  );
}
