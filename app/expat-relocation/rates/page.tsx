import type { Metadata } from "next";
import { RatesView } from "@/components/expat-order/RatesView";

export const metadata: Metadata = {
  title: "Check your rate · Expat Relocation · Rimkirim",
  description: "See an estimate for shipping your belongings to Indonesia: where from, where to and roughly what it weighs.",
  alternates: { canonical: "/expat-relocation/rates" },
};

/** Check Rate and Select Rate, the first step of the expat order flow */
export default function ExpatRatesPage() {
  return <RatesView />;
}
