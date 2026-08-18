"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ArticleMeta } from "@/lib/articles/shared";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_KEY } from "./ArticleCard";
import { useT } from "@/lib/i18n/LanguageProvider";

/** Client shell for the localised chrome around a server-rendered article. */
export function ArticleHeader({ article }: { article: ArticleMeta }) {
  const t = useT();
  const date = new Intl.DateTimeFormat(article.lang === "en" ? "en-GB" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(article.date));
  return (
    <header>
      <Link
        href="/articles"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("article.back")}
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{t(CATEGORY_KEY[article.category])}</Badge>
        <span className="text-xs text-muted-2">
          {date} · {t("article.readTime").replace("{n}", String(article.readingMinutes))}
        </span>
      </div>
      <h1 className="mt-4 max-w-[24ch] font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        {article.title}
      </h1>
      <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted sm:text-lg">
        {article.description}
      </p>
    </header>
  );
}

export function ArticleSectionLabel({ k }: { k: string }) {
  const t = useT();
  return <>{t(k)}</>;
}
