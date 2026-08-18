"use client";

import Link from "next/link";
import type { ArticleMeta } from "@/lib/articles/shared";
import { ArticleCover } from "./ArticleCover";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

export const CATEGORY_KEY = {
  guides: "article.catGuides",
  fees: "article.catFees",
  country: "article.catCountry",
} as const;

export function ArticleCard({
  article,
  featured = false,
  className,
}: {
  article: ArticleMeta;
  featured?: boolean;
  className?: string;
}) {
  const t = useT();
  const readTime = t("article.readTime").replace("{n}", String(article.readingMinutes));
  return (
    <Link
      href={`/articles/${article.slug}`}
      className={cn(
        "group flex overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40",
        featured ? "flex-col md:grid md:grid-cols-[minmax(0,58%)_1fr]" : "flex-col",
        className,
      )}
    >
      <ArticleCover
        article={article}
        sizes={featured ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
        priority={featured}
        missingLabel={t("article.coverMissing")}
        className={cn(featured && "md:aspect-auto md:min-h-[20rem]")}
      />
      <div className={cn("flex flex-1 flex-col p-5", featured && "md:p-8")}>
        <div className="flex items-center gap-2">
          <Badge variant="neutral">{t(CATEGORY_KEY[article.category])}</Badge>
          {featured && <Badge variant="brand">{t("article.featured")}</Badge>}
        </div>
        <h3
          className={cn(
            "mt-3 font-display font-semibold leading-snug tracking-tight text-foreground",
            featured ? "text-2xl sm:text-3xl" : "text-lg",
          )}
        >
          {article.title}
        </h3>
        <p
          className={cn(
            "mt-2 text-sm leading-relaxed text-muted",
            featured ? "line-clamp-3 sm:text-base" : "line-clamp-2",
          )}
        >
          {article.description}
        </p>
        <p className="mt-auto pt-5 text-xs text-muted-2">{readTime}</p>
      </div>
    </Link>
  );
}
