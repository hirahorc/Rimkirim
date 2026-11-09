"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CollapseHeight } from "@/components/ui/disclosure";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { Field } from "@/components/shared/forms/Field";
import { SurchargeInfoDialog } from "@/components/rates/SurchargeInfoDialog";
import { ReviewNote } from "@/components/expat/ReviewNote";
import { ORDER_REVIEW_NOTES } from "@/lib/data/expat-order-notes";
import { INDONESIA } from "@/lib/data/countries";
import { expatRates } from "@/lib/pricing/expat-rates";
import { checkComplete, type CheckRateInput } from "@/lib/order/expat-order";
import { useExpatOrderHydrated, useExpatOrderStore } from "@/lib/store/useExpatOrderStore";
import type { Place } from "@/lib/data/expat-places";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { AddressField } from "./AddressField";
import { FlowStepper } from "./FlowStepper";
import { FlowLoading } from "./FlowLoading";
import { RateCard } from "./RateCard";

/** a picked Address's error, once the customer has tried to check */
function addressError(p: Place | null, t: (k: string) => string): string | undefined {
  if (!p) return t("expatOrder.rates.addressPick");
  if (!p.postalCode) return t("expatOrder.rates.addressNoPostal");
  return undefined;
}

/**
 * Check Rate and Select Rate on one page, on the app's field (a white card
 * on Panel 2, as every order screen sits): the form, and once checked the
 * one rate the epic asks for under it, the rest behind "See more rates". The form writes straight
 * into the draft, so a changed input reprices at once and a reload keeps it.
 */
export function RatesView() {
  const hydrated = useExpatOrderHydrated();
  // the form mounts on the loaded draft, so its first state is the draft's
  if (!hydrated) return <FlowLoading />;
  return <RatesForm />;
}

function RatesForm() {
  const t = useT();
  const r = (k: string) => t(`expatOrder.rates.${k}`);
  const router = useRouter();
  const check = useExpatOrderStore((s) => s.check);
  const setCheck = useExpatOrderStore((s) => s.setCheck);
  const selectRate = useExpatOrderStore((s) => s.selectRate);

  // shown once checked, or straight away for a draft that was already complete
  const [tried, setTried] = React.useState(false);
  const [shown, setShown] = React.useState(() => checkComplete(check));
  const [more, setMore] = React.useState(false);
  const [weightText, setWeightText] = React.useState(() => (check.weightKg ? String(check.weightKg) : ""));

  const update = (patch: Partial<CheckRateInput>) => setCheck({ ...check, ...patch });
  const complete = checkComplete(check);
  const result = React.useMemo(
    () => (complete && check.weightKg ? expatRates(check.originCountry, check.weightKg) : null),
    [complete, check.originCountry, check.weightKg],
  );

  const errs = tried
    ? {
        originCountry: check.originCountry ? undefined : r("required"),
        origin: check.originCountry ? addressError(check.origin, t) : undefined,
        destination: addressError(check.destination, t),
        weight: check.weightKg && check.weightKg > 0 ? undefined : r("weightErr"),
      }
    : {};
  // a place without a postal code is refused at once, not only on submit
  const originErr = errs.origin ?? (check.origin && !check.origin.postalCode ? r("addressNoPostal") : undefined);
  const destErr = errs.destination ?? (check.destination && !check.destination.postalCode ? r("addressNoPostal") : undefined);

  const lead = result?.rates[0];
  const rest = result?.rates.slice(1) ?? [];
  const rounded = !!check.weightKg && result && result.chargedKg !== check.weightKg;

  return (
    // the app's field: Panel 2 under white cards, the way every order screen
    // reads; the landing's chapter colours stay on the landing
    <div data-field className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
      <ReviewNote note={ORDER_REVIEW_NOTES.rates} className="mb-6" />
      <FlowStepper current="rate" />
      <h1 className="mt-8 text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">{r("title")}</h1>
      <p className="mt-3 max-w-xl text-pretty text-muted">{r("subtitle")}</p>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTried(true);
          if (complete) setShown(true);
        }}
        className="mt-8"
      >
        <Card className="p-5 sm:p-6">
          <div className="grid gap-8 md:grid-cols-2 md:gap-6">
            <fieldset className="min-w-0">
              <legend className="mb-4 font-display text-base font-semibold tracking-tight">{r("from")}</legend>
              <div className="space-y-4">
                <Field label={r("country")} error={errs.originCountry}>
                  <CountrySelectField
                    value={check.originCountry}
                    onChange={(code) => update({ originCountry: code, origin: null })}
                    placeholder={r("countryPh")}
                    ariaLabel={`${r("from")}: ${r("country")}`}
                  />
                </Field>
                <Field label={r("address")} hint={originErr ? undefined : r("addressHint")} error={originErr}>
                  <AddressField
                    country={check.originCountry}
                    value={check.origin}
                    onChange={(p) => update({ origin: p })}
                    invalid={!!originErr}
                  />
                </Field>
              </div>
            </fieldset>

            <fieldset className="min-w-0">
              <legend className="mb-4 font-display text-base font-semibold tracking-tight">{r("to")}</legend>
              <div className="space-y-4">
                <Field label={r("country")}>
                  <CountrySelectField
                    value={INDONESIA.code}
                    onChange={() => {}}
                    locked
                    ariaLabel={`${r("to")}: ${r("country")}`}
                  />
                </Field>
                <Field label={r("address")} hint={destErr ? undefined : r("addressHint")} error={destErr}>
                  <AddressField
                    country="ID"
                    value={check.destination}
                    onChange={(p) => update({ destination: p })}
                    invalid={!!destErr}
                  />
                </Field>
              </div>
            </fieldset>
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="sm:w-64">
              <Field label={r("weight")} hint={errs.weight ? undefined : r("weightHint")} error={errs.weight}>
                <WeightInput
                  value={weightText}
                  onChange={(text) => {
                    setWeightText(text);
                    const n = Number(text.replace(",", "."));
                    update({ weightKg: text.trim() && Number.isFinite(n) && n > 0 ? n : null });
                  }}
                  placeholder={r("weightPh")}
                  invalid={!!errs.weight}
                />
              </Field>
            </div>
            <Button type="submit" size="lg" variant={shown ? "secondary" : "brand"} className="sm:mt-6">
              {r("submit")}
            </Button>
          </div>
        </Card>
      </form>

      {shown && result && lead && (
        <section aria-labelledby="estimate-heading" className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 id="estimate-heading" className="font-display text-2xl font-semibold tracking-tight">
              {r("resultsTitle")}
            </h2>
            {rounded && (
              <p className="text-sm text-muted">{r("pricedAt").replace("{kg}", String(result.chargedKg))}</p>
            )}
          </div>

          <div className="mt-5">
            <RateCard
              rate={lead}
              origin={check.originCountry}
              lead
              onSelect={() => {
                selectRate(lead);
                router.push("/expat-relocation/plan");
              }}
            />
          </div>
          {result.specialFromKg && (
            <p className="mt-3 text-sm text-muted">
              {r("specialFrom").replace("{kg}", String(result.specialFromKg))}
            </p>
          )}

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            {r("disclaimer")}{" "}
            <SurchargeInfoDialog>
              <button type="button" className="link-mark tap-row relative">
                {r("surcharges")}
              </button>
            </SurchargeInfoDialog>
          </p>

          {rest.length > 0 && (
            <div className="mt-8 border-t border-border pt-6">
              <button
                type="button"
                aria-expanded={more}
                aria-controls="more-rates"
                onClick={() => setMore((m) => !m)}
                className="tap-row relative inline-flex items-center gap-2 font-display text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
              >
                {more ? r("seeLess") : r("seeMore").replace("{n}", String(rest.length))}
                <ChevronDown aria-hidden className={cn("size-4 transition-transform", more && "rotate-180")} />
              </button>
              <CollapseHeight open={more} id="more-rates">
                <ul className="grid gap-3 pt-5">
                  {rest.map((rate) => (
                    <li key={rate.id}>
                      <RateCard
                        rate={rate}
                        origin={check.originCountry}
                        onSelect={() => {
                          selectRate(rate);
                          router.push("/expat-relocation/plan");
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </CollapseHeight>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/** CountrySelect is named by `ariaLabel`, not by an id, so Field's wiring
 *  lands on a wrapper and the rest is dropped */
function CountrySelectField({
  id,
  value,
  onChange,
  locked,
  placeholder,
  ariaLabel,
}: React.ComponentProps<typeof CountrySelect> & { id?: string }) {
  return (
    <div id={id}>
      <CountrySelect value={value} onChange={onChange} locked={locked} placeholder={placeholder} ariaLabel={ariaLabel} />
    </div>
  );
}

/** the weight in kg, decimals allowed, with its unit inside the field */
function WeightInput({
  value,
  onChange,
  placeholder,
  invalid,
  ...wiring
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  invalid?: boolean;
} & Pick<React.InputHTMLAttributes<HTMLInputElement>, "id" | "aria-describedby" | "aria-invalid">) {
  return (
    <div className="relative">
      <Input
        {...wiring}
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ""))}
        className={cn("pr-10 tabular-nums", invalid && "border-danger")}
      />
      <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
        kg
      </span>
    </div>
  );
}
