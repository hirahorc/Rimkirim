"use client";

import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * The expat landing's own bar, after the live rimkirim.com/relocation page:
 * the wordmark, the service name in the expat gradient, one way forward. No
 * site menu, no sign-in (expat orders run over WhatsApp, not the account
 * system), and the logo stays on this page; the way back to the main site
 * is the footer's service links. A plain sticky bar rather than the site's
 * floating capsule, so the page reads as its own service at a glance; the
 * translucency is the same functional one as the capsule's (DESIGN.md, The
 * No-Gradient Rule).
 */
export function ExpatHeader() {
  const t = useT();
  return (
    // /95, as on the live page: a full-width bar shows whatever scrolls under
    // it, and at the capsule's /85 the content ghosted through as blotches
    <header className="reveal-down sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <Logo href="/expat-relocation" ariaLabel={t("expat.headerHome")} height={26} />
          {/* the service's name in its own voice: the gradient is the one
              the nav link wears everywhere else (.nav-expat). Under 380px it
              cannot sit beside the logo and the Indonesian button without
              clipping, so the smallest phones keep logo and button only; the
              hero's eyebrow names the service right below. The wrapper owns
              the visibility because .nav-expat sets its own display. */}
          <span className="hidden items-center gap-2.5 min-[380px]:flex sm:gap-3">
            <span aria-hidden className="h-5 w-px shrink-0 bg-border-strong" />
            <span
              className="nav-expat whitespace-nowrap font-display text-xs font-semibold uppercase tracking-[0.04em] sm:text-sm"
              data-label={t("nav.expat")}
            >
              {t("nav.expat")}
            </span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* phones keep the bar to the brand and the button; the switch
              moves to the footer there */}
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>
          <Button asChild size="sm">
            <a href="#quote">{t("expat.headerCta")}</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
