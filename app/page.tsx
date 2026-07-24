import { Hero } from "@/components/landing/Hero";
import { ShipmentCalculator } from "@/components/landing/ShipmentCalculator";
import { ServiceSection, WhySection } from "@/components/landing/InfoSections";

export default function Home() {
  return (
    <>
      <Hero />
      <section
        className="reveal-pop relative mx-auto -mt-2 max-w-2xl px-4 pb-8 pt-10 sm:px-6"
        style={{ animationDelay: "0.5s" }}
      >
        <ShipmentCalculator />
      </section>
      <ServiceSection />
      <WhySection />
    </>
  );
}
