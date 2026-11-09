"use client";

import * as React from "react";
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
 *
 * A question with a slug can be linked to: arriving on, or following, its
 * #slug opens it and brings it into view, as the /faq page does.
 */
export function ExpatFaq() {
  const { t, locale } = useLanguage();

  React.useEffect(() => {
    const adoptHash = () => openFaqItem(decodeURIComponent(window.location.hash.slice(1)));
    adoptHash();
    window.addEventListener("hashchange", adoptHash);
    return () => window.removeEventListener("hashchange", adoptHash);
  }, []);

  return (
    // on the desk, after the customs band: the questions read as a page of
    // their own, not one more sheet
    <section id="faq" aria-labelledby="faq-heading" data-tone="magenta" className="scroll-mt-24">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.faq} className="mb-8" />
        <SectionHead id="faq-heading" eyebrow={t("expat.faq.eyebrow")} title={t("expat.faq.heading")} />
        <div className="mt-10 border-t border-border">
          {expatFaq(locale).map((f) => (
            <Disclosure key={f.q} id={f.slug} question={f.q}>
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

/**
 * Open one question and bring it into view (its details carries the scroll
 * margin that clears the header). A link to a question calls this on click
 * as well, so a second click opens it again after the reader closed it,
 * which the hash alone, unchanged, would not. False if there is no such
 * question.
 */
export function openFaqItem(slug: string) {
  const el = slug ? document.getElementById(slug) : null;
  if (!(el instanceof HTMLDetailsElement)) return false;
  el.open = true;
  el.scrollIntoView({ block: "start" });
  return true;
}
