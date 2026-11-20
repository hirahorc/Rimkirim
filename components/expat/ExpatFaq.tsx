"use client";

import * as React from "react";
import { Disclosure } from "@/components/ui/disclosure";
import { AnswerExtras } from "@/components/faq/AnswerExtras";
import { REVIEW_NOTES, expatFaq } from "@/lib/data/expat";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AskLine } from "./AskLine";
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

  // the way to ask: under the heading from lg (24, a group's step), the
  // questions' foot on a phone (16 under their last rule), where "still
  // have a question?" before the first one read backwards
  const question = t("expat.faq.ask");

  return (
    // on the desk, as every section is: the questions read as a page of
    // their own, not one more sheet. Outside the chapters, on the daylight
    // neutrals, so the questions read as plain reference, not one more stop
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-24">
      {/* on the page's content edge like every other section, the heading
          and the way to ask in a column of their own from lg, the questions
          beside them, ruled one from the next */}
      <div className="section-shell mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div>
          <ReviewNote note={REVIEW_NOTES.faq} className="mb-8" />
          <div className="lg:sticky lg:top-28">
            <SectionHead id="faq-heading" eyebrow={t("expat.faq.eyebrow")} title={t("expat.faq.heading")} compact />
            <AskLine question={question} className="mt-6 hidden lg:block" />
          </div>
        </div>
        <div>
          <div className="divide-y divide-border border-y border-border">
            {expatFaq(locale).map((f) => (
              <Disclosure key={f.q} id={f.slug} question={f.q} strong>
                <p>{f.a}</p>
                {/* a few points the paragraph leads into, plain bullets in
                    the answer's ink (not /faq's ticks: these aren't a checklist) */}
                {f.list && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-muted">
                    {f.list.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                )}
                <AnswerExtras rows={f.rows} after={f.after} cta={f.cta} />
              </Disclosure>
            ))}
          </div>
          <AskLine question={question} className="mt-4 lg:hidden" />
        </div>
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
