"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/LanguageProvider";
import { WA_URL } from "@/lib/contact";

export function ArticleCta() {
  const t = useT();
  return (
    <aside className="mt-12 rounded-lg bg-foreground p-6 text-background sm:p-8">
      <h2 className="font-display text-xl font-semibold tracking-tight">{t("article.ctaTitle")}</h2>
      <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-background/70">{t("article.ctaBody")}</p>
      <Button asChild className="mt-5">
        <a href={WA_URL} target="_blank" rel="noopener noreferrer">
          <MessageCircle />
          {t("article.ctaButton")}
        </a>
      </Button>
    </aside>
  );
}
