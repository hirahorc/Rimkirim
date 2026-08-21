import type { Metadata } from "next";
import { Faq } from "@/components/faq/Faq";
import { faqTabs, type FaqItem } from "@/lib/data/faq";

// FAQPage structured data, generated from the same source as the page so it
// can never drift. Emitted in Indonesian (the page's default render); the
// two service tabs share most questions, so dedupe by slug.
function faqJsonLd() {
  const seen = new Set<string>();
  const items: FaqItem[] = [];
  for (const tab of faqTabs("id"))
    for (const cat of tab.categories)
      for (const f of cat.faqs)
        if (!seen.has(f.slug)) {
          seen.add(f.slug);
          items.push(f);
        }
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "id",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.list ? `${f.a} ${f.list.join(", ")}.` : f.a,
      },
    })),
  };
}

export const metadata: Metadata = {
  title: "FAQ · Rimkirim",
  description:
    "Pertanyaan yang sering ditanya soal Back For Good & Moving Abroad · packing, bea cukai, biaya, tracking, dan klaim.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      <Faq />
    </>
  );
}
