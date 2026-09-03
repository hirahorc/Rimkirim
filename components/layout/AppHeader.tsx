"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { MobileNav } from "./MobileNav";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LiveOrderToasts } from "@/components/notifications/LiveOrderToasts";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/store/useAuthStore";
import { useLoginModal } from "@/lib/store/useLoginModal";
import { useT } from "@/lib/i18n/LanguageProvider";
import { isBareRoute } from "@/lib/utils/routes";
import { NAV_LINKS } from "@/lib/nav-links";
import { cn } from "@/lib/utils/cn";

export function AppHeader() {
  const t = useT();
  const pathname = usePathname();
  const user = useCurrentUser();
  const openLogin = useLoginModal((s) => s.openModal);
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
            const accent = "accent" in n && n.accent;
            return (
              <Link
                key={n.href}
                href={n.href}
                data-label={accent ? t(n.key) : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-[18px] py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
                  accent
                    ? "nav-expat"
                    : active
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
              {/* Signed in, the sales CTA steps aside and nothing takes its
                  place: the bell is the door to the customer's shipments, so
                  a second "My Shipments" pill beside it would be one door
                  drawn twice. */}
              <NotificationBell />
              <LiveOrderToasts />
              <AccountMenu />
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hidden lg:inline-flex"
                onClick={() => openLogin()}
              >
                {t("nav.masuk")}
              </Button>
              {/* visible at every width: on phones the capsule is the only
                  place a first-time visitor can reach the calculator without
                  opening the sheet first */}
              <Button asChild size="sm">
                <Link href="/#kalkulator">{t("nav.cekTarif")}</Link>
              </Button>
            </>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
