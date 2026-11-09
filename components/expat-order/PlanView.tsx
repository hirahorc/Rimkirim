"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReviewNote } from "@/components/expat/ReviewNote";
import { ORDER_REVIEW_NOTES } from "@/lib/data/expat-order-notes";
import { detailsProgress, eligibilityProgress } from "@/lib/order/expat-order";
import { useExpatOrderHydrated, useExpatOrderStore } from "@/lib/store/useExpatOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { CustomsPaths } from "./CustomsPaths";
import { DetailsStep } from "./DetailsStep";
import { EligibilityStep } from "./EligibilityStep";
import { FlowLoading } from "./FlowLoading";
import { FlowStepper } from "./FlowStepper";
import { SelectedService } from "./SelectedService";

/**
 * The plan: the Eligibility Check, then Personal Information, on one route
 * (the app's field, a white card per column) with the step in the URL, so the browser's Back moves
 * between them instead of leaving. The Selected Service stays beside both.
 * Arriving without a rate goes back to Check Rate; arriving at the details
 * with questions unanswered goes back to them. Confirm registers the ticket
 * and opens its Booking Summary.
 */
export function PlanView() {
  const t = useT();
  const p = (k: string) => t(`expatOrder.plan.${k}`);
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useExpatOrderHydrated();
  const { check, rate, eligibility, details, addressChanged, setEligibility, setDetails, submit } =
    useExpatOrderStore();
  const [sending, setSending] = React.useState(false);

  const eligible = eligibilityProgress(eligibility).done;
  const step = params.get("step") === "details" && eligible ? "details" : "eligibility";

  React.useEffect(() => {
    if (!hydrated || sending) return;
    if (!rate) router.replace("/expat-relocation/rates");
    else if (params.get("step") === "details" && !eligible) router.replace("/expat-relocation/plan");
  }, [hydrated, rate, eligible, params, router, sending]);

  // each step starts at the top of the page
  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  if (!hydrated || !rate) return <FlowLoading />;

  const ready = detailsProgress(details).done;

  return (
    // the app's field, as the rates step sits: white cards on Panel 2
    <div data-field className="pb-20">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 sm:pt-10">
        <ReviewNote note={step === "eligibility" ? ORDER_REVIEW_NOTES.eligibility : ORDER_REVIEW_NOTES.details} className="mb-6" />
        <FlowStepper current={step} />
        <h1 className="mt-8 text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">{p("title")}</h1>
        <p className="mt-3 max-w-xl text-pretty text-muted">{p("subtitle")}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-12">
          {/* on a phone the service comes first, as a strip over the form */}
          <div className="lg:sticky lg:top-24 lg:order-2">
            <SelectedService check={check} rate={rate} />
          </div>

          <Card className="min-w-0 px-5 py-6 sm:px-8 sm:py-8 lg:order-1">
            {step === "eligibility" ? (
              <section aria-labelledby="step-heading">
                <h2 id="step-heading" className="font-display text-2xl font-semibold tracking-tight">
                  {t("expatOrder.eligibility.title")}
                </h2>
                <p className="mt-2 text-sm text-muted">{t("expatOrder.eligibility.lead")}</p>
                <div className="mt-8">
                  <EligibilityStep value={eligibility} onChange={setEligibility} />
                </div>
                <div className="mt-10">
                  <CustomsPaths id="customs-paths" title={t("expatOrder.customs.title")} />
                </div>
                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button asChild variant="ghost">
                    <Link href="/expat-relocation/rates">
                      <ArrowLeft /> {p("back")}
                    </Link>
                  </Button>
                  <div className="flex flex-col items-stretch gap-2 sm:items-end">
                    <Button
                      type="button"
                      size="lg"
                      disabled={!eligible}
                      aria-describedby={eligible ? undefined : "eligibility-hint"}
                      onClick={() => router.push("/expat-relocation/plan?step=details")}
                    >
                      {p("continue")} <ArrowRight />
                    </Button>
                    {!eligible && (
                      <p id="eligibility-hint" className="text-xs text-muted">
                        {p("incomplete")}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            ) : (
              <section aria-labelledby="step-heading">
                <h2 id="step-heading" className="font-display text-2xl font-semibold tracking-tight">
                  {t("expatOrder.details.title")}
                </h2>
                <p className="mt-2 text-sm text-muted">{t("expatOrder.details.lead")}</p>
                <div className="mt-8">
                  <DetailsStep check={check} value={details} changed={addressChanged} onChange={setDetails} />
                </div>
                <div className="mt-10 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Button asChild variant="ghost">
                    <Link href="/expat-relocation/plan">
                      <ArrowLeft /> {p("back")}
                    </Link>
                  </Button>
                  <div className="flex flex-col items-stretch gap-2 sm:items-end">
                    <Button
                      type="button"
                      size="lg"
                      disabled={!ready}
                      loading={sending}
                      aria-describedby={ready ? undefined : "details-hint"}
                      onClick={() => {
                        setSending(true);
                        const booking = submit();
                        if (booking) router.push(`/expat-relocation/booking/${booking.number}`);
                        else setSending(false);
                      }}
                    >
                      {p("confirm")}
                    </Button>
                    {!ready && (
                      <p id="details-hint" className="text-xs text-muted">
                        {p("detailsIncomplete")}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
