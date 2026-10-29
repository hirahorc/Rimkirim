"use client";

import { Disclosure } from "@/components/ui/disclosure";
import { REVIEW_NOTES, expatFaq } from "@/lib/data/expat";
import { WA_URL } from "@/lib/contact";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";

/**
 * Brief 08. The questions that come up before someone asks for a quote or
 * agrees to pay: what fits, documents, how the price works, large items,
 * duty, timing, delivery. Text only, as the brief says; the answers come from
 * what the site already states and still need Rimkirim's sign-off.
 */
export function ExpatFaq() {
  const { t, locale } = useLanguage();
  return (
    <section id="faq" aria-labelledby="faq-heading" data-tone="magenta" className="band scroll-mt-24">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.faq} className="mb-8" />
        <SectionHead id="faq-heading" eyebrow={t("expat.faq.eyebrow")} title={t("expat.faq.heading")} />
        <div className="mt-10 border-t border-border">
          {expatFaq(locale).map((f) => (
            <Disclosure key={f.q} question={f.q}>
              {f.a}
            </Disclosure>
          ))}
        </div>
        <p className="mt-8">
          <a href={WA_URL} target="_blank" rel="noreferrer" className="link-mark text-sm">
            {t("expat.faq.wa")}
          </a>
        </p>
      </div>
    </section>
  );
}
