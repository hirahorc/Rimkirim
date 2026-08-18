"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { ArticleLang } from "@/lib/articles/shared";

/**
 * An article URL is one language. On arrival the page's language wins (the
 * global toggle is set to match); afterwards, flipping the toggle navigates
 * to the paired slug in the other language.
 */
export function ArticleLocaleSync({ lang, pairSlug }: { lang: ArticleLang; pairSlug: string }) {
  const { locale, setLocale } = useLanguage();
  const router = useRouter();
  const armed = React.useRef(false);

  React.useEffect(() => {
    // first pass: align the toggle with the article; ignore the initial
    // "id" default that precedes the stored preference being applied
    const id = window.setTimeout(() => {
      if (locale !== lang) setLocale(lang);
      armed.current = true;
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!armed.current) return;
    if (locale !== lang && pairSlug) router.push(`/articles/${pairSlug}`);
  }, [locale, lang, pairSlug, router]);

  return null;
}
