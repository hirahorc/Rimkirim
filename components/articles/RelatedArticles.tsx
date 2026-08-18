"use client";

import type { ArticleMeta } from "@/lib/articles/shared";
import { ArticleCard } from "./ArticleCard";
import { useT } from "@/lib/i18n/LanguageProvider";

export function RelatedArticles({ items }: { items: ArticleMeta[] }) {
  const t = useT();
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <h2 className="font-display text-2xl font-bold tracking-tight">{t("article.related")}</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
}
