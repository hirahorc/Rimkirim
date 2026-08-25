"use client";

import {
  Home,
  Plane,
  ShieldCheck,
  Headset,
  FileCheck2,
  Package,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { RouteArrow } from "@/components/ui/route-arrow";
import {
  StackingCards,
  STACK_SKINS,
  STACK_MARK_INDEX,
} from "@/components/landing/StackingCards";
import { useT } from "@/lib/i18n/LanguageProvider";

export function ServiceSection() {
  const t = useT();
  return (
    <section id="layanan" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t("service.heading")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">{t("service.subtitle")}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {/* marketing cards keep the generous lg corner (Card default is md) */}
        <Card className="relative overflow-hidden rounded-lg p-6">
          <div className="relative">
            <span className="grid size-11 place-items-center rounded-md bg-surface-3 text-foreground">
              <Home className="size-5" />
            </span>
            <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
              {t("service.bfgTitle")}
            </h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
              {t("service.bfgFrom")}
              <RouteArrow />
              {t("service.bfgTo")}
            </p>
            <p className="mt-3 text-sm text-muted">{t("service.bfgBody")}</p>
          </div>
        </Card>
        <Card className="rounded-lg p-6">
          <span className="grid size-11 place-items-center rounded-md bg-surface-3 text-foreground">
            <Plane className="size-5" />
          </span>
          <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
            {t("service.maTitle")}
          </h3>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
            {t("service.maFrom")}
            <RouteArrow />
            {t("service.maTo")}
          </p>
          <p className="mt-3 text-sm text-muted">{t("service.maBody")}</p>
        </Card>
      </div>
    </section>
  );
}

export function WhySection() {
  const t = useT();
  const reasons = [
    { icon: ShieldCheck, title: t("why.r1Title"), body: t("why.r1Body") },
    { icon: FileCheck2, title: t("why.r2Title"), body: t("why.r2Body") },
    { icon: Headset, title: t("why.r3Title"), body: t("why.r3Body") },
    { icon: Package, title: t("why.r4Title"), body: t("why.r4Body") },
  ];
  return (
    <section id="kenapa" className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t("why.heading")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">{t("why.subtitle")}</p>
        </div>
        {/* mobile: pure-CSS sticky "stacking cards on scroll" (full-bleed).
            sm and up: the restrained multi-column grid takes over */}
        <StackingCards items={reasons} />
        <div
          className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4"
          role="group"
          aria-label={t("why.heading")}
        >
          {reasons.map(({ title, body }, i) => (
            // same opaque skins + ghost index as the mobile stack, in the grid
            <article
              key={title}
              className={`relative flex min-h-[17rem] flex-col overflow-hidden rounded-[6px] p-6 pb-14 ${
                STACK_SKINS[i % STACK_SKINS.length]
              }`}
            >
              <h3 className="font-display text-xl font-semibold leading-tight tracking-tight">
                <span className={i === STACK_MARK_INDEX ? "card-mark" : undefined}>
                  {title}
                </span>
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed opacity-80">{body}</p>
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-6 -right-2 font-display text-[7rem] font-bold leading-none opacity-[0.07]"
              >
                {i + 1}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
