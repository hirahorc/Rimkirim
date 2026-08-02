"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/store/useAuthStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { isBareRoute } from "@/lib/utils/routes";

export function AppHeader() {
  const t = useT();
  const pathname = usePathname();
  const user = useCurrentUser();
  // standalone pages (legal docs) render without the app chrome
  if (isBareRoute(pathname)) return null;
  return (
    <header className="reveal-down sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm text-muted md:flex">
          <Link
            href="/#kalkulator"
            className="rounded-md px-3 py-2 transition-colors hover:text-foreground"
          >
            {t("nav.hitungTarif")}
          </Link>
          <Link
            href="/#layanan"
            className="rounded-md px-3 py-2 transition-colors hover:text-foreground"
          >
            {t("nav.layanan")}
          </Link>
          <Link
            href="/#kenapa"
            className="rounded-md px-3 py-2 transition-colors hover:text-foreground"
          >
            {t("nav.kenapa")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/pesanan">{t("auth.myOrders")}</Link>
              </Button>
              <AccountMenu />
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/masuk">{t("nav.masuk")}</Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link href="/#kalkulator">{t("nav.cekTarif")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
