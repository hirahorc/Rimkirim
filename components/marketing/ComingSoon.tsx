"use client";

import Link from "next/link";
import { ArrowLeft, Newspaper, Building2, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/LanguageProvider";

/** Icon set by name so a Server Component page can pick one without passing a function. */
const ICONS = { article: Newspaper, about: Building2, expat: Plane } as const;

/**
 * On-brand placeholder hero for pages whose real content is still being built
 * (Article, About Us, Expat Relocation). Slick copy + a route back home.
 */
export function ComingSoon({
  icon,
  eyebrowKey,
  titleKey,
  bodyKey,
}: {
  icon: keyof typeof ICONS;
  eyebrowKey: string;
  titleKey: string;
  bodyKey: string;
}) {
  const t = useT();
  const Icon = ICONS[icon];
  return (
    <section className="mx-auto flex min-h-[72vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <span className="grid size-14 place-items-center rounded-md bg-brand/15 text-brand-ink">
        <Icon className="size-7" />
      </span>
      <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/15 px-3 py-1 font-display text-xs font-medium text-foreground">
        <span className="size-1.5 rounded-full bg-brand" />
        {t("comingSoon.tag")}
      </span>
      <p className="mt-6 font-display text-xs font-medium uppercase tracking-wider text-muted-2">
        {t(eyebrowKey)}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        {t(titleKey)}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
        {t(bodyKey)}
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/">
          <ArrowLeft className="size-4" /> {t("comingSoon.backHome")}
        </Link>
      </Button>
    </section>
  );
}
