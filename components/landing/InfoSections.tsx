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
        <Card className="relative overflow-hidden p-6">
          <div className="relative">
            <span className="grid size-11 place-items-center rounded-md bg-brand/15 text-brand-ink">
              <Home className="size-5" />
            </span>
            <h3 className="mt-4 font-display text-xl font-semibold">
              {t("service.bfgTitle")}
            </h3>
            <p className="mt-1 text-sm text-foreground">{t("service.bfgDir")}</p>
            <p className="mt-3 text-sm text-muted">{t("service.bfgBody")}</p>
          </div>
        </Card>
        <Card className="p-6">
          <span className="grid size-11 place-items-center rounded-md bg-surface-3 text-foreground">
            <Plane className="size-5" />
          </span>
          <h3 className="mt-4 font-display text-xl font-semibold">
            {t("service.maTitle")}
          </h3>
          <p className="mt-1 text-sm text-muted">{t("service.maDir")}</p>
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
        {/* below sm these become a snapping strip that bleeds to the viewport
            edge, with the next card peeking so the swipe is discoverable;
            tabIndex keeps the overflow reachable without a pointer */}
        <div
          className="scroll-strip -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
          tabIndex={0}
          role="group"
          aria-label={t("why.heading")}
        >
          {reasons.map(({ icon: Icon, title, body }) => (
            <Card
              key={title}
              className="w-[78%] shrink-0 snap-start p-5 sm:w-auto sm:shrink"
            >
              <span className="grid size-10 place-items-center rounded-md bg-brand/15 text-brand-ink">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-medium">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
