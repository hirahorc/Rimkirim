"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ArticleMeta } from "@/lib/articles/shared";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

/**
 * Landing band for the two flagship guides (the customs guide and the
 * quotation explainer). The server page passes both language pairs; the
 * band shows the pair matching the visitor's language, in the order given
 * (customs first, pricing second).
 */
export function GuideSpotlight({ articles }: { articles: ArticleMeta[] }) {
  const { locale, t } = useLanguage();
  const picks = articles.filter((a) => a.lang === locale);
  if (picks.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t("guides.heading")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">{t("guides.subtitle")}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {picks.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button asChild variant="secondary">
          <Link href="/articles">
            {t("guides.cta")} <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
