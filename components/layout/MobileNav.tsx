"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X, LogOut, Package, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { IconPillButton } from "@/components/ui/icon-pill-button";
import { useAuthStore, useCurrentUser } from "@/lib/store/useAuthStore";
import { useLoginModal } from "@/lib/store/useLoginModal";
import { useT } from "@/lib/i18n/LanguageProvider";
import { NAV_LINKS } from "@/lib/nav-links";
import { cn } from "@/lib/utils/cn";

/** Mobile-only hamburger that opens a right slide-over sheet with the nav. */
export function MobileNav() {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();
  const logOut = useAuthStore((s) => s.logOut);
  const openLogin = useLoginModal((s) => s.openModal);
  const [open, setOpen] = React.useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <IconPillButton aria-label={t("nav.menu")} className="lg:hidden">
          <Menu className="size-4" />
        </IconPillButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dlg-overlay fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm" />
        <Dialog.Content className="nav-sheet fixed right-0 top-0 z-50 flex h-full w-[min(86vw,340px)] flex-col rounded-l-lg border-l border-border bg-background shadow-overlay outline-none">
          <Dialog.Title className="sr-only">{t("nav.menu")}</Dialog.Title>
          <div className="flex items-center justify-between border-b border-border p-4">
            <Logo height={28} />
            <Dialog.Close className="tap-target relative grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50">
              <X className="size-5" />
              <span className="sr-only">{t("nav.closeMenu")}</span>
            </Dialog.Close>
          </div>

          <nav className="flex-1 overflow-y-auto p-2">
            {NAV_LINKS.map((n) => {
              const active =
                pathname === n.href || pathname.startsWith(`${n.href}/`);
              const accent = "accent" in n && n.accent;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={close}
                  data-label={accent ? t(n.key) : undefined}
                  className={cn(
                    "flex min-h-[48px] items-center rounded-full px-4 text-base transition-colors",
                    accent
                      ? "nav-expat font-medium"
                      : active
                        ? "bg-surface-2 font-medium text-foreground"
                        : "text-muted hover:bg-surface-2 hover:text-foreground",
                  )}
                >
                  {t(n.key)}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-3 border-t border-border p-4">
            {user ? (
              <>
                {/* who is signed in, and the door to /akun — same pattern as
                    the AccountMenu identity block, so the sheet is never
                    anonymous. "Pengaturan Akun" needs no button of its own. */}
                <Link
                  href="/akun"
                  onClick={close}
                  className="flex min-h-12 items-center gap-3 rounded-sm px-2 py-1.5 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
                >
                  <span
                    aria-hidden
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-surface-2 font-display text-sm font-bold text-foreground"
                  >
                    {user.name.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {user.name}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {user.email}
                    </span>
                  </span>
                </Link>
                {/* signed in, the sheet changes register too: the customer's
                    orders take the lime and the sales CTA steps down */}
                <Button asChild className="w-full">
                  <Link href="/pesanan" onClick={close}>
                    <Package className="size-4" /> {t("auth.myOrders")}
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/packing-list" onClick={close}>
                    <ClipboardList className="size-4" /> {t("auth.myPackingLists")}
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/#kalkulator" onClick={close}>
                    {t("nav.cekTarif")}
                  </Link>
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    logOut();
                    toast.success(t("auth.loggedOut"));
                    router.push("/");
                  }}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-sm px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
                >
                  <LogOut className="size-4" /> {t("auth.logout")}
                </button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    close();
                    openLogin();
                  }}
                >
                  {t("nav.masuk")}
                </Button>
                <Button asChild className="w-full">
                  <Link href="/#kalkulator" onClick={close}>
                    {t("nav.cekTarif")}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
