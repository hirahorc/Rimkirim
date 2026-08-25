"use client";

import * as React from "react";
import type { ArticleMeta, ArticleCategory } from "@/lib/articles/shared";
import { ARTICLE_CATEGORIES } from "@/lib/articles/shared";
import { ArticleCard, CATEGORY_KEY } from "./ArticleCard";
import { SegmentedRoot, SegmentedItem } from "@/components/ui/toggle-group";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";

type Filter = "all" | ArticleCategory;

/** Index: newest article of the active locale featured on top, the rest in a grid. */
export function ArticlesIndex({ articles }: { articles: ArticleMeta[] }) {
  const t = useT();
  const { locale } = useLanguage();
  const [filter, setFilter] = React.useState<Filter>("all");

  const inLocale = articles.filter((a) => a.lang === locale);
  const list = filter === "all" ? inLocale : inLocale.filter((a) => a.category === filter);
  const [featured, ...rest] = list;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="max-w-2xl">
        <p className="font-display text-xs font-medium uppercase tracking-[0.14em] text-muted">
          {t("article.eyebrow")}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t("article.title")}
        </h1>
        <p className="mt-3 text-muted">{t("article.subtitle")}</p>
      </header>

      <div className="mt-8 overflow-x-auto pb-1">
        <SegmentedRoot
          type="single"
          className="w-auto"
          value={filter}
          onValueChange={(v) => v && setFilter(v as Filter)}
          aria-label={t("article.eyebrow")}
        >
          <SegmentedItem value="all" className="whitespace-nowrap px-4">{t("article.filterAll")}</SegmentedItem>
          {ARTICLE_CATEGORIES.map((c) => (
            <SegmentedItem key={c} value={c} className="whitespace-nowrap px-4">
              {t(CATEGORY_KEY[c])}
            </SegmentedItem>
          ))}
        </SegmentedRoot>
      </div>

      {featured ? (
        <>
          <ArticleCard article={featured} featured className="mt-8" />
          {rest.length > 0 && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="mt-10 text-sm text-muted">{t("article.empty")}</p>
      )}
    </section>
  );
}
