"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { faqTabs, faqSlug } from "@/lib/data/faq";
import { WA_URL } from "@/lib/contact";

/**
 * The objections a cold visitor raises before they'll start an order, picked
 * from the /faq source by their (stable, Indonesian-derived) slug so the
 * answers live in one place.
 */
const PICKS = [
  "Bagaimana cara booking pengiriman?",
  "Berapa lama waktu pengirimannya?",
  "Apakah barang saya akan dikenakan pajak?",
  "Apakah pajak sudah termasuk tarif?",
  "Barang apa yang dilarang dikirim?",
].map(faqSlug);

/** Landing FAQ: the top questions answered inline, the rest one link away. */
export function FaqTeaser() {
  const { t, locale } = useLanguage();
  const all = faqTabs(locale).flatMap((tab) => tab.categories.flatMap((c) => c.faqs));
  const items = PICKS.flatMap((slug) => all.find((f) => f.slug === slug) ?? []);
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
        {t("landingFaq.heading")}
      </h2>
      <div className="mt-10 border-t border-border">
        {items.map((f) => (
          <Disclosure key={f.slug} question={f.q}>
            {f.a}
          </Disclosure>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Button asChild variant="secondary">
          <Link href="/faq">
            {t("landingFaq.more")} <ArrowRight className="size-4" />
          </Link>
        </Button>
        <a
          href={WA_URL}
          target="_blank"
          rel="noreferrer"
          className="link-mark text-sm"
        >
          {t("landingFaq.wa")}
        </a>
      </div>
    </section>
  );
}
