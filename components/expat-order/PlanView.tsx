"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReviewNote } from "@/components/expat/ReviewNote";
import { ORDER_REVIEW_NOTES } from "@/lib/data/expat-order-notes";
import {
  detailsProgress,
  eligibilityProgress,
  packedPricing,
  packingProgress,
  photosMissing,
} from "@/lib/order/expat-order";
import { useExpatOrderHydrated, useExpatOrderStore } from "@/lib/store/useExpatOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { CustomsPaths } from "./CustomsPaths";
import { DetailsStep } from "./DetailsStep";
import { EligibilityStep } from "./EligibilityStep";
import { FlowLoading } from "./FlowLoading";
import { FlowStepper } from "./FlowStepper";
import { MissingPhotosDialog, PackingStep, type PackingStepHandle } from "./PackingStep";
import { SelectedService } from "./SelectedService";

/**
 * The plan: the Eligibility Check, the Packing List, then Personal
 * Information, on one route (the app's field, a white card per column) with
 * the step in the URL, so the browser's Back moves between them instead of
 * leaving. The Selected Service stays beside all three, priced on the
 * packages once they're measured. Arriving without a rate goes back to Check
 * Rate; arriving at a step whose steps before it aren't done goes back to
 * the first one that isn't. Confirm registers the ticket and opens its
 * Booking Summary.
 */
export function PlanView() {
  const t = useT();
  const p = (k: string) => t(`expatOrder.plan.${k}`);
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useExpatOrderHydrated();
  const { check, rate, eligibility, packing, details, addressChanged, setEligibility, setPacking, setDetails, submit } =
    useExpatOrderStore();
  const [sending, setSending] = React.useState(false);
  const [photoCheck, setPhotoCheck] = React.useState(false);
  const packingRef = React.useRef<PackingStepHandle>(null);

  const eligible = eligibilityProgress(eligibility).done;
  const packed = packingProgress(packing).done;
  const asked = params.get("step");
  const step = !eligible
    ? "eligibility"
    : asked === "details" && packed
      ? "details"
      : asked === "packing" || asked === "details"
        ? "packing"
        : "eligibility";

  React.useEffect(() => {
    if (!hydrated || sending) return;
    if (!rate) router.replace("/expat-relocation/rates");
    else if (asked && asked !== step) {
      router.replace(step === "eligibility" ? "/expat-relocation/plan" : `/expat-relocation/plan?step=${step}`);
    }
  }, [hydrated, rate, asked, step, router, sending]);

  // each step starts at the top of the page
  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  if (!hydrated || !rate) return <FlowLoading />;

  const ready = detailsProgress(details).done;
  const pricing = packedPricing(check.originCountry, rate, packing);
  const toDetails = () => router.push("/expat-relocation/plan?step=details");

  return (
    // the app's field, as the rates step sits: white cards on Panel 2
    <div data-field className="pb-20">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 sm:pt-10">
        <ReviewNote note={ORDER_REVIEW_NOTES[step]} className="mb-6" />
        <FlowStepper current={step} />
        <h1 className="mt-8 text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">{p("title")}</h1>
        <p className="mt-3 max-w-xl text-pretty text-muted">{p("subtitle")}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-12">
          {/* on a phone the service comes first, as a strip over the form */}
          <div className="lg:sticky lg:top-24 lg:order-2">
            <SelectedService check={check} rate={pricing.rate} packed={pricing.packed} />
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
                      onClick={() => router.push("/expat-relocation/plan?step=packing")}
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
            ) : step === "packing" ? (
              <section aria-labelledby="step-heading">
                <h2 id="step-heading" className="font-display text-2xl font-semibold tracking-tight">
                  {t("expatOrder.packing.title")}
                </h2>
                <p className="mt-2 text-sm text-muted">{t("expatOrder.packing.lead")}</p>
                <div className="mt-8">
                  <PackingStep
                    value={packing}
                    onChange={setPacking}
                    originCountry={check.originCountry}
                    checkedKg={rate.chargedKg}
                    pricing={pricing}
                    handleRef={packingRef}
                  />
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
                      disabled={!packed}
                      aria-describedby={packed ? undefined : "packing-hint"}
                      // photos never block; going on without them is asked once
                      onClick={() => (packing.packages.some(photosMissing) ? setPhotoCheck(true) : toDetails())}
                    >
                      {p("continue")} <ArrowRight />
                    </Button>
                    {!packed && (
                      <p id="packing-hint" className="text-xs text-muted">
                        {p("packingIncomplete")}
                      </p>
                    )}
                  </div>
                </div>
                <MissingPhotosDialog
                  open={photoCheck}
                  onOpenChange={setPhotoCheck}
                  onAdd={() => {
                    setPhotoCheck(false);
                    const first = packing.packages.find(photosMissing);
                    if (first) packingRef.current?.reveal(first.id);
                  }}
                  onContinue={() => {
                    setPhotoCheck(false);
                    toDetails();
                  }}
                />
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
                    <Link href="/expat-relocation/plan?step=packing">
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
