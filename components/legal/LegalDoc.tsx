"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

/** A bilingual string: { id, en }. Legal copy is authored inline (not through
 * the i18n catalog) to avoid bloating the parity-enforced message types. */
export interface L {
  id: string;
  en: string;
}

export interface LegalSection {
  heading: L;
  paragraphs: L[];
}

export interface LegalDocData {
  title: L;
  updated: L;
  intro: L;
  sections: LegalSection[];
  contact: L;
}

/**
 * Standalone legal document page (Terms / Privacy). Renders WITHOUT the app
 * header/footer (see isBareRoute) so it can drop into any Rimkirim landing
 * service. Reads the global locale and offers a small self-contained toggle
 * since there's no navbar here.
 */
type Locale = "id" | "en";

/**
 * The legal document content (title, intro, numbered sections, contact) with no
 * page chrome — reused by the standalone page and the booking agreement modal.
 */
export function LegalBody({
  doc,
  locale,
}: {
  doc: LegalDocData;
  locale: Locale;
}) {
  const tx = (l: L) => (locale === "en" ? l.en : l.id);
  return (
    <div>
      <header className="border-b border-border pb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {tx(doc.title)}
        </h1>
        <p className="mt-2 text-sm text-muted-2">{tx(doc.updated)}</p>
      </header>

      <p className="mt-6 text-sm leading-relaxed text-muted sm:text-base">
        {tx(doc.intro)}
      </p>

      <div className="mt-8 space-y-8">
        {doc.sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-lg font-semibold sm:text-xl">
              {i + 1}. {tx(s.heading)}
            </h2>
            <div className="mt-2 space-y-3">
              {s.paragraphs.map((p, j) => (
                <p
                  key={j}
                  className="text-sm leading-relaxed text-muted sm:text-base"
                >
                  {tx(p)}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 border-t border-border pt-6 text-sm leading-relaxed text-muted">
        {tx(doc.contact)}
      </p>
    </div>
  );
}

export function LegalDoc({ doc }: { doc: LegalDocData }) {
  const { locale } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex items-start justify-end">
        <LanguageToggle />
      </div>
      <LegalBody doc={doc} locale={locale as Locale} />
    </div>
  );
}
