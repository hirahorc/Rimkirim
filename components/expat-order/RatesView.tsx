"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CollapseHeight } from "@/components/ui/disclosure";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { Field } from "@/components/shared/forms/Field";
import { ReviewNote } from "@/components/expat/ReviewNote";
import { ORDER_REVIEW_NOTES } from "@/lib/data/expat-order-notes";
import { INDONESIA } from "@/lib/data/countries";
import { expatRates, type ExpatRate, type ExpatRates } from "@/lib/pricing/expat-rates";
import { checkComplete, type CheckRateInput } from "@/lib/order/expat-order";
import { useExpatOrderHydrated, useExpatOrderStore } from "@/lib/store/useExpatOrderStore";
import type { Place } from "@/lib/data/expat-places";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { AddressField } from "./AddressField";
import { FlowLoading } from "./FlowLoading";
import { PACE, paced } from "./pace";
import { RateCard } from "./RateCard";
import { useDraftWelcome } from "./visit";

/** a picked Address's error, once the customer has tried to check */
function addressError(p: Place | null, t: (k: string) => string): string | undefined {
  if (!p) return t("expatOrder.rates.addressPick");
  if (!p.postalCode) return t("expatOrder.rates.addressNoPostal");
  return undefined;
}

/** what an estimate was priced on: any change to it makes the one on the page stale */
const checkKey = (c: CheckRateInput) => [c.originCountry, c.origin?.id, c.destination?.id, c.weightKg].join("|");

/**
 * Check Rate and Select Rate on one page, on the app's field (a white card
 * on Panel 2, as every order screen sits): the form, and once checked the
 * one rate the epic asks for under it, the rest behind "See more rates". The form writes straight
 * into the draft, so a reload keeps it. An estimate is the answer to a check:
 * Check rate takes its moment (pace.ts), then the estimate comes up; once an
 * input changes, the estimate on the page is stale (dimmed, not selectable)
 * until it's checked again. It comes before the plan, which starts once a
 * rate is picked. Checking answers where the eye should go next: to the
 * first field that's wrong, or to the estimate.
 */
export function RatesView() {
  const t = useT();
  const hydrated = useExpatOrderHydrated();
  const check = useExpatOrderStore((s) => s.check);
  useDraftWelcome(
    hydrated,
    !!(check.originCountry || check.origin || check.destination || check.weightKg),
    t("expatOrder.plan.restored"),
  );
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

  const [tried, setTried] = React.useState(false);
  // The estimate on the page, and what it was priced on. A draft that was
  // already complete opens with its estimate, as it was left; otherwise
  // there's none until Check rate is pressed
  const [estimate, setEstimate] = React.useState<{ key: string; origin: string; kg: number; result: ExpatRates } | null>(() =>
    checkComplete(check) && check.weightKg
      ? { key: checkKey(check), origin: check.originCountry, kg: check.weightKg, result: expatRates(check.originCountry, check.weightKg) }
      : null,
  );
  const [checking, setChecking] = React.useState(false);
  // how often Check rate brought an estimate up: one eases in for that, never for a load
  const [checks, setChecks] = React.useState(0);
  const [more, setMore] = React.useState(false);
  // the rate that was picked, while the plan is on its way
  const [going, startGoing] = React.useTransition();
  const [picked, setPicked] = React.useState<string | null>(null);
  const form = React.useRef<HTMLFormElement>(null);
  const results = React.useRef<HTMLElement>(null);
  const resultsHead = React.useRef<HTMLHeadingElement>(null);
  const [weightText, setWeightText] = React.useState(() => (check.weightKg ? String(check.weightKg) : ""));

  const update = (patch: Partial<CheckRateInput>) => setCheck({ ...check, ...patch });
  const select = (rate: ExpatRate) => {
    setPicked(rate.id);
    selectRate(rate);
    startGoing(() => router.push("/expat-relocation/plan"));
  };
  // Check rate, answered where the eye should go next (once its render has
  // landed): the first field that's wrong, or the estimate, which on a phone
  // comes up below what's on the screen
  const settle = (ok: boolean) =>
    window.requestAnimationFrame(() => {
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (ok) {
        results.current?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
        resultsHead.current?.focus({ preventScroll: true });
        return;
      }
      const wrong = form.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid]');
      wrong?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
      (wrong?.matches("input, button") ? wrong : wrong?.querySelector<HTMLElement>("input, button"))?.focus({ preventScroll: true });
    });
  const complete = checkComplete(check);
  // priced on what the form holds now, or on what it held before a change
  const fresh = !!estimate && estimate.key === checkKey(check);
  const stale = !!estimate && !fresh;
  const result = estimate?.result ?? null;
  const submit = async () => {
    setTried(true);
    if (!complete || !check.weightKg) return settle(false);
    // nothing changed since it was priced: the estimate on the page is the answer
    if (fresh) return settle(true);
    setChecking(true);
    const priced = { key: checkKey(check), origin: check.originCountry, kg: check.weightKg };
    // the request and its floor, together; the rates are local in the prototype
    const priceList = await paced(expatRates(priced.origin, priced.kg), PACE.check);
    setEstimate({ ...priced, result: priceList });
    setChecks((n) => n + 1);
    setChecking(false);
    settle(true);
  };

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
  const rounded = !!estimate && estimate.result.chargedKg !== estimate.kg;

  return (
    // the app's field: Panel 2 under white cards, the way every order screen
    // reads; the landing's chapter colours stay on the landing
    <div data-field className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
      <ReviewNote note={ORDER_REVIEW_NOTES.rates} className="mb-6" />
      <h1 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">{r("title")}</h1>
      <p className="mt-3 max-w-xl text-pretty text-muted">{r("subtitle")}</p>

      <form
        ref={form}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
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
                    exclude="ID"
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
                <Field label={r("address")} hint={destErr ? undefined : r("addressHintTo")} error={destErr}>
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
            {/* lime while there's something to check: no estimate yet, or one that's stale */}
            <Button type="submit" size="lg" variant={fresh ? "secondary" : "brand"} loading={checking} className="sm:mt-6">
              {checking ? r("checking") : r("submit")}
            </Button>
          </div>
        </Card>
      </form>

      {estimate && result && lead && (
        // a new estimate eases in (a key per check, so each one does); the
        // one a draft opened with stands
        <section
          key={checks}
          ref={results}
          aria-labelledby="estimate-heading"
          className={cn("mt-10 scroll-mt-24", checks > 0 && "reveal")}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2
              ref={resultsHead}
              id="estimate-heading"
              // takes focus when Check rate brings the estimate up (settle)
              tabIndex={-1}
              className="font-display text-2xl font-semibold tracking-tight outline-none"
            >
              {r("resultsTitle")}
            </h2>
            {rounded && (
              <p className="text-sm text-muted">{r("pricedAt").replace("{kg}", String(result.chargedKg))}</p>
            )}
          </div>
          {stale && (
            <p role="status" className="mt-2 text-sm text-muted">
              {r("stale")}
            </p>
          )}

          {/* priced on what the form held before: still readable, no longer selectable */}
          <div inert={stale} className={cn("transition-opacity duration-150", stale && "opacity-50")}>
            <div className="mt-5">
              <RateCard
                rate={lead}
                origin={estimate.origin}
                lead
                loading={going && picked === lead.id}
                onSelect={() => select(lead)}
              />
            </div>
            {result.specialFromKg && (
              <p className="mt-3 text-sm text-muted">
                {r("specialFrom").replace("{kg}", String(result.specialFromKg))}
              </p>
            )}

            {/* the card says what it excludes; the page adds what it leads to */}
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{t("expatOrder.service.note")}</p>

            {rest.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <button
                  type="button"
                  aria-expanded={more}
                  aria-controls="more-rates"
                  onClick={() => setMore((m) => !m)}
                  // the press is answered at once, in colour (and let go of over 150ms)
                className="tap-row relative inline-flex items-center gap-2 rounded-sm font-display text-sm font-semibold after:-inset-x-2 after:inset-y-0 after:absolute after:rounded-sm after:transition-colors active:after:bg-foreground/[0.04] active:after:duration-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
                >
                  {more ? r("seeLess") : r("seeMore").replace("{n}", String(rest.length))}
                  {/* swap, never rotate: the shared disclosure idiom */}
                  {more ? <ChevronUp aria-hidden className="size-4" /> : <ChevronDown aria-hidden className="size-4" />}
                </button>
                <CollapseHeight open={more} id="more-rates">
                  <ul className="grid gap-3 pt-5">
                    {rest.map((rate) => (
                      <li key={rate.id}>
                        <RateCard
                          rate={rate}
                          origin={estimate.origin}
                          loading={going && picked === rate.id}
                          onSelect={() => select(rate)}
                        />
                      </li>
                    ))}
                  </ul>
                </CollapseHeight>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/** CountrySelect is named by `ariaLabel`, not by an id, so Field's wiring
 *  lands on a wrapper and the rest is dropped. Check Rate's list is plain:
 *  every country A to Z, no region beside each and no "Popular" group, and
 *  never Indonesia as the origin (the service imports to it). Its error is
 *  marked on the wrapper (`data-invalid`), where Check rate looks for the
 *  first thing wrong */
function CountrySelectField({
  id,
  value,
  onChange,
  locked,
  placeholder,
  ariaLabel,
  exclude,
  "aria-invalid": invalid,
}: React.ComponentProps<typeof CountrySelect> & { id?: string; "aria-invalid"?: React.AriaAttributes["aria-invalid"] }) {
  return (
    <div id={id} data-invalid={invalid ? true : undefined}>
      <CountrySelect
        value={value}
        onChange={onChange}
        locked={locked}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        exclude={exclude}
        showZone={false}
        showPopular={false}
      />
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
        // a bound on what's typed, not a rule: the most a shipment may weigh is ops' to set
        maxLength={7}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ""))}
        className={cn("pr-10 tabular-nums", invalid && "border-danger")}
      />
      <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
        kg
      </span>
    </div>
  );
}
