import type { Metadata } from "next";
import { RatesView } from "@/components/expat-order/RatesView";

export const metadata: Metadata = {
  title: "Check your rate · Expat Relocation · Rimkirim",
  description: "See an estimate for shipping your belongings to Indonesia: where from, where to and roughly what it weighs.",
  alternates: { canonical: "/expat-relocation/rates" },
};

/** Check Rate and Select Rate, where the expat order flow starts, ahead of the plan */
export default function ExpatRatesPage() {
  return <RatesView />;
}
