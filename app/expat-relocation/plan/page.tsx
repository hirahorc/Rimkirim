import { Suspense } from "react";
import type { Metadata } from "next";
import { PlanView } from "@/components/expat-order/PlanView";
import { FlowLoading } from "@/components/expat-order/FlowLoading";

export const metadata: Metadata = {
  title: "Plan your relocation · Expat Relocation · Rimkirim",
  robots: { index: false },
};

/** the Eligibility Check and Personal Information; the step rides the URL
 *  (useSearchParams), so the view waits in a Suspense boundary */
export default function ExpatPlanPage() {
  return (
    <Suspense fallback={<FlowLoading />}>
      <PlanView />
    </Suspense>
  );
}
