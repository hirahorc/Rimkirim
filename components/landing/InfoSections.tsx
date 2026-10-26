"use client";

import {
  Home,
  Plane,
  ShieldCheck,
  Headset,
  FileCheck2,
  PackageCheck,
  ArrowRight,
} from "lucide-react";
import { RouteArrow } from "@/components/ui/route-arrow";
import {
  StackingCards,
  STACK_SKINS,
  STACK_MARK_INDEX,
} from "@/components/landing/StackingCards";
import { selectCalculatorService } from "@/components/landing/ShipmentCalculator";
import { useT } from "@/lib/i18n/LanguageProvider";

/** a whole service card is one button: it flips the calculator to its direction */
function ServiceCard({
  icon: Icon,
  title,
  from,
  to,
  body,
  onSelect,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  from: string;
  to: string;
  body: string;
  onSelect: () => void;
}) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex flex-col rounded-lg border border-border bg-surface px-6 py-7 text-left transition-[border-color,transform] duration-200 hover:border-border-strong motion-safe:active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
    >
      <span className="grid size-11 place-items-center rounded-md bg-surface-3 text-foreground">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
        {from}
        <RouteArrow />
        {to}
      </p>
      <p className="mt-3 text-sm text-muted">{body}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 font-display text-sm font-medium text-foreground">
        {t("service.cta")}
        <ArrowRight className="size-4" />
      </span>
    </button>
  );
}

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
        <ServiceCard
          icon={Home}
          title={t("service.bfgTitle")}
          from={t("service.bfgFrom")}
          to={t("service.bfgTo")}
          body={t("service.bfgBody")}
          onSelect={() => selectCalculatorService("bfg")}
        />
        <ServiceCard
          icon={Plane}
          title={t("service.maTitle")}
          from={t("service.maFrom")}
          to={t("service.maTo")}
          body={t("service.maBody")}
          onSelect={() => selectCalculatorService("moving-abroad")}
        />
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
    { icon: PackageCheck, title: t("why.r4Title"), body: t("why.r4Body") },
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
