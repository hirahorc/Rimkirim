import type { Metadata } from "next";
import { PlanView } from "@/components/expat-order/PlanView";

export const metadata: Metadata = {
  title: "Plan your relocation · Expat Relocation · Rimkirim",
  robots: { index: false },
};

/** the plan: the Eligibility Check, Personal Information and the Packages,
 *  three parts on one page */
export default function ExpatPlanPage() {
  return <PlanView />;
}
