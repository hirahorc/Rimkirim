"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils/cn";

const OPTIONS: Locale[] = ["id", "en"];

export function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage();
  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className="inline-flex items-center rounded-full border border-border bg-surface-2 p-0.5"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => setLocale(opt)}
          aria-pressed={locale === opt}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            locale === opt
              ? "bg-brand text-brand-ink"
              : "text-muted hover:text-foreground",
          )}
        >
          {t(`lang.${opt}`)}
        </button>
      ))}
    </div>
  );
}
