"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { EXPAT_QUOTE_URL } from "@/lib/data/expat";
import { waLink } from "@/lib/contact";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/**
 * The expat landing's own bar, after the live rimkirim.com/relocation page:
 * the wordmark, the service name in the expat gradient, one way forward
 * ("Check your rate", into the order flow). No site menu, no sign-in
 * (expat orders run in their own flow, not the account system), and the logo
 * stays on this page; the way back to the main site is the footer's service
 * links. A plain sticky bar rather than the site's
 * floating capsule, so the page reads as its own service at a glance; the
 * translucency is the same functional one as the capsule's (DESIGN.md, The
 * No-Gradient Rule). Inside the order flow (rates, plan, booking) the
 * visitor is already through the door, so the lime button gives way to a
 * quiet "Need help?" on WhatsApp: each step's own button is its one lime.
 */
export function ExpatHeader() {
  const t = useT();
  const inFlow = usePathname() !== "/expat-relocation";
  // on the landing the bar's button waits while the hero's own pair is in
  // view, then arrives (a fade and a 4px rise, 200ms ease-out): two limes
  // saying the same thing at once split the voice
  const [heroDoor, setHeroDoor] = React.useState(true);
  React.useEffect(() => {
    if (inFlow) return;
    const door = document.querySelector("[data-hero-door]");
    if (!door) return;
    // the latest entry wins: a fast scroll can deliver several at once
    const io = new IntersectionObserver((entries) => setHeroDoor(entries[entries.length - 1].isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
    });
    io.observe(door);
    return () => io.disconnect();
  }, [inFlow]);
  return (
    // /95, as on the live page: a full-width bar shows whatever scrolls under
    // it, and at the capsule's /85 the content ghosted through as blotches
    <header className="reveal-down sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <Logo href="/expat-relocation" ariaLabel={t("expat.headerHome")} height={26} />
          {/* the service's name in its own voice: the gradient is the one
              the nav link wears everywhere else (.nav-expat). Under 350px it
              cannot sit beside the logo and the button without clipping, so
              the smallest phones keep logo and button only; the hero's
              eyebrow names the service right below. The wrapper owns the
              visibility because .nav-expat sets its own display. */}
          <span className="hidden items-center gap-2.5 min-[350px]:flex sm:gap-3">
            <span aria-hidden className="h-5 w-px shrink-0 bg-border-strong" />
            <span
              className="nav-expat whitespace-nowrap font-display text-xs font-semibold uppercase tracking-[0.04em] sm:text-sm"
              data-label={t("nav.expat")}
            >
              {t("nav.expat")}
            </span>
          </span>
        </div>
        {/* no language switch: the page is English only (LanguageProvider) */}
        {inFlow ? (
          <a
            href={waLink(t("expatOrder.helpWa"))}
            target="_blank"
            rel="noreferrer"
            className="link-mark tap-row relative inline-flex shrink-0 items-center gap-1.5 text-sm"
          >
            <MessageCircle aria-hidden className="size-4" /> {t("expatOrder.help")}
          </a>
        ) : (
          <span
            inert={heroDoor || undefined}
            aria-hidden={heroDoor || undefined}
            className={cn(
              "shrink-0 transition-[opacity,translate] duration-200 ease-(--ease-hover) motion-reduce:transition-none",
              heroDoor ? "pointer-events-none translate-y-1 opacity-0 motion-reduce:translate-y-0" : "opacity-100",
            )}
          >
            {/* the bar's height keeps it `sm`; its hit area is 44px all the same */}
            <Button asChild size="sm" className="tap-target relative">
              <a href={EXPAT_QUOTE_URL}>{t("expat.cta")}</a>
            </Button>
          </span>
        )}
      </div>
    </header>
  );
}
