"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X, LogOut, Package } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuthStore, useCurrentUser } from "@/lib/store/useAuthStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/articles", key: "nav.article" },
  { href: "/about", key: "nav.about" },
  { href: "/expat-relocation", key: "nav.expat" },
  { href: "/faq", key: "nav.faq" },
] as const;

/** Mobile-only hamburger that opens a right slide-over sheet with the nav. */
export function MobileNav() {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();
  const logOut = useAuthStore((s) => s.logOut);
  const [open, setOpen] = React.useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={t("nav.menu")}
          className="tap-target relative grid size-9 place-items-center rounded-md border border-border bg-surface-2 text-muted transition-colors hover:text-foreground md:hidden"
        >
          <Menu className="size-4" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-[min(86vw,340px)] flex-col border-l border-border-strong bg-surface shadow-2xl shadow-black/60 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right-[340px] data-[state=closed]:slide-out-to-right-[340px] data-[state=open]:duration-300 data-[state=closed]:duration-200">
          <Dialog.Title className="sr-only">{t("nav.menu")}</Dialog.Title>
          <div className="flex items-center justify-between border-b border-border p-4">
            <Logo height={28} />
            <Dialog.Close className="tap-target relative grid size-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground">
              <X className="size-5" />
              <span className="sr-only">{t("nav.closeMenu")}</span>
            </Dialog.Close>
          </div>

          <nav className="flex-1 overflow-y-auto p-2">
            {NAV_LINKS.map((n) => {
              const active =
                pathname === n.href || pathname.startsWith(`${n.href}/`);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={close}
                  className={cn(
                    "flex min-h-[48px] items-center rounded-lg px-3 text-base transition-colors",
                    active
                      ? "bg-surface-2 font-medium text-brand"
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
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/pesanan" onClick={close}>
                    <Package className="size-4" /> {t("auth.myOrders")}
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
                  className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  <LogOut className="size-4" /> {t("auth.logout")}
                </button>
              </>
            ) : (
              <Button asChild variant="secondary" className="w-full">
                <Link href="/masuk" onClick={close}>
                  {t("nav.masuk")}
                </Link>
              </Button>
            )}
            <Button asChild className="w-full">
              <Link href="/#kalkulator" onClick={close}>
                {t("nav.cekTarif")}
              </Link>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
