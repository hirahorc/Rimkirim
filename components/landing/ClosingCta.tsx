"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/LanguageProvider";
import { WA_URL } from "@/lib/contact";

/**
 * The last thing on the page is a way in, not a link elsewhere. The web order
 * is the door; WhatsApp stays as the quiet fallback for whoever isn't ready.
 */
export function ClosingCta() {
  const t = useT();
  return (
    <section className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t("closing.heading")}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted">{t("closing.body")}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/#kalkulator">
            {t("closing.cta")} <ArrowRight className="size-4" />
          </Link>
        </Button>
        <p className="mt-5">
          <a href={WA_URL} target="_blank" rel="noreferrer" className="link-mark text-sm">
            {t("closing.wa")}
          </a>
        </p>
      </div>
    </section>
  );
}
