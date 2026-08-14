import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { ShipmentCalculator } from "@/components/landing/ShipmentCalculator";
import { ServiceSection, WhySection } from "@/components/landing/InfoSections";
import { TestimonialSection } from "@/components/landing/TestimonialSection";
import { CarrierSection } from "@/components/landing/CarrierSection";
import { FaqTeaser } from "@/components/landing/FaqTeaser";
import { CookieConsent } from "@/components/landing/CookieConsent";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
      {/* calc-rise is scroll-driven, reveal-pop is the load-in — they both
          animate transform, so they get an element each */}
      <section className="calc-rise relative mx-auto -mt-2 max-w-2xl px-4 pb-8 pt-10 sm:px-6">
        <div className="reveal-pop" style={{ animationDelay: "0.5s" }}>
          <ShipmentCalculator />
        </div>
      </section>
      <ServiceSection />
      <WhySection />
      <TestimonialSection />
      <CarrierSection />
      <FaqTeaser />
      <CookieConsent />
    </>
  );
}
