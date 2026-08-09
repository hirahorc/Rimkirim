"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { MobileNav } from "./MobileNav";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/store/useAuthStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { isBareRoute } from "@/lib/utils/routes";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/articles", key: "nav.article" },
  { href: "/about", key: "nav.about" },
  { href: "/expat-relocation", key: "nav.expat" },
  { href: "/faq", key: "nav.faq" },
] as const;

export function AppHeader() {
  const t = useT();
  const pathname = usePathname();
  const user = useCurrentUser();
  // standalone pages (legal docs) render without the app chrome
  if (isBareRoute(pathname)) return null;
  return (
    <header className="reveal-down sticky top-0 z-40 px-3 pb-1 pt-3 sm:px-6">
      {/* a capsule that floats clear of the page edge; the page scrolls behind
          it and blurs underneath, so the chrome never sits on a hard bar */}
      {/* /85 rather than the reference's /55: display type scrolling underneath
          stays legible through a thinner veil and fights the nav links */}
      <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between gap-3 rounded-full border border-border bg-background/85 pl-5 pr-2 shadow-float backdrop-blur-xl">
        <Logo />
        <nav className="hidden items-center gap-0.5 text-sm lg:flex">
          {NAV_LINKS.map((n) => {
            const active =
              pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-[18px] py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
                  active
                    ? "bg-surface-2 text-foreground"
                    : "text-muted hover:bg-surface-2/70 hover:text-foreground",
                )}
              >
                {t(n.key)}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {user ? (
            <>
              <NotificationBell />
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden lg:inline-flex"
              >
                <Link href="/pesanan">{t("auth.myOrders")}</Link>
              </Button>
              <AccountMenu />
            </>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden lg:inline-flex"
            >
              <Link href="/masuk">{t("nav.masuk")}</Link>
            </Button>
          )}
          <Button asChild size="sm" className="hidden lg:inline-flex">
            <Link href="/#kalkulator">{t("nav.cekTarif")}</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
