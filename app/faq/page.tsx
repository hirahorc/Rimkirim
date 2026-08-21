import type { Metadata } from "next";
import { Faq } from "@/components/faq/Faq";
import { FAQ_TABS, type FaqItem } from "@/lib/data/faq";

// FAQPage structured data, generated from the same source as the page so it
// can never drift. The two service tabs share most questions; dedupe by
// question text so Google sees each once.
function faqJsonLd() {
  const seen = new Set<string>();
  const items: FaqItem[] = [];
  for (const tab of FAQ_TABS)
    for (const cat of tab.categories)
      for (const f of cat.faqs)
        if (!seen.has(f.q)) {
          seen.add(f.q);
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
