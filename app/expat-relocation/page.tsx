import type { Metadata } from "next";
import { CarrierSection } from "@/components/landing/CarrierSection";
import { ExpatHero } from "@/components/expat/ExpatHero";
import { ExpatReviews } from "@/components/expat/ExpatReviews";
import { WhatYouCanShip } from "@/components/expat/WhatYouCanShip";
import { WhatWeCoordinate } from "@/components/expat/WhatWeCoordinate";
import { QuoteFactors } from "@/components/expat/QuoteFactors";
import { ExpatSteps } from "@/components/expat/ExpatSteps";
import { ShipmentExamples } from "@/components/expat/ShipmentExamples";
import { ExpatFaq } from "@/components/expat/ExpatFaq";
import { ExpatClosing } from "@/components/expat/ExpatClosing";
import { expatFaq } from "@/lib/data/expat";

// English first: the page opens in English for a new visitor (LanguageProvider,
// ROUTE_LOCALE), so search engines and link previews read it in English too
const TITLE = "Ship your belongings to Indonesia · Expat Relocation · Rimkirim";
const DESCRIPTION =
  "Moving to Indonesia? Ship boxes, suitcases and personal belongings by air. Rimkirim coordinates the pickup, the customs paperwork and the delivery. Get a quote.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/expat-relocation" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/expat-relocation" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

// FAQPage structured data from the same source the page renders, so the two
// can never drift
function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en",
    mainEntity: expatFaq("en").map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/**
 * Expat relocation landing, built from the agency's CRO brief (sections 01 to
 * 09, in its order): a visitor from a search should know at once that this
 * ships boxes and suitcases to Indonesia, see who vouches for it, what fits,
 * who does what, what drives the price and how it runs, and find the quote
 * form at both ends of the page.
 */
export default function ExpatRelocationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      <ExpatHero />
      <ExpatReviews />
      <WhatYouCanShip />
      <WhatWeCoordinate />
      <CarrierSection />
      <QuoteFactors />
      <ExpatSteps />
      <ShipmentExamples />
      <ExpatFaq />
      <ExpatClosing />
    </>
  );
}
