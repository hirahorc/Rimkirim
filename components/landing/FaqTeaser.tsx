"use client";

import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/LanguageProvider";

/** Compact landing band that points to the full /faq page. */
export function FaqTeaser() {
  const t = useT();
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand-ink">
            <HelpCircle className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
              {t("faq.teaserTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted">{t("faq.teaserBody")}</p>
          </div>
        </div>
        <Button asChild className="w-full shrink-0 sm:w-auto">
          <Link href="/faq">
            {t("faq.teaserCta")} <ArrowRight className="size-4" />
          </Link>
        </Button>
      </Card>
    </section>
  );
}
