"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import type { ZodError } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, Textarea, Label, FieldError } from "@/components/ui/input";
import { SegmentedRoot, SegmentedItem } from "@/components/ui/toggle-group";
import { CardStrip, stripInk } from "@/components/ui/card-strip";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { DialCodeSelect } from "@/components/order/DialCodeSelect";
import { INDONESIA } from "@/lib/data/countries";
import { isUnservicedCity } from "@/lib/data/domestic-coverage";
import { waLink } from "@/lib/contact";
import {
  EXPAT_ITEMS,
  EXPAT_QUANTITIES,
  expatContactSchema,
  expatShipmentSchema,
  type ExpatItem,
} from "@/lib/schemas/expat-quote";
import {
  useExpatQuoteHydration,
  useExpatQuoteStore,
  type ExpatQuoteDraft,
} from "@/lib/store/useExpatQuoteStore";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

type Errors = Partial<Record<keyof ExpatQuoteDraft, string>>;

/** first message per field, keyed by the field name */
function toErrors(error: ZodError): Errors {
  const out: Errors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof ExpatQuoteDraft;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** "4-6" → "4–6": the data keeps plain hyphens, the page sets en-dashes */
const rangeLabel = (q: string) => q.replace("-", "–");

const countryName = (code: string, locale: string) =>
  code ? (new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code) : "";

/**
 * The expat quote request, in the order the brief asks for: what and where
 * first, contact details only once the visitor has seen that the service
 * fits (step 2 opens on that verdict). Rendered twice on the page, in the
 * hero and in the closing section; both read one store, so the visitor is
 * never asked the same thing twice.
 */
export function QuoteForm({ id, className }: { id?: string; className?: string }) {
  useExpatQuoteHydration();
  const { t, locale } = useLanguage();
  const draft = useExpatQuoteStore((s) => s.draft);
  const step = useExpatQuoteStore((s) => s.step);
  const sent = useExpatQuoteStore((s) => s.sent);
  const update = useExpatQuoteStore((s) => s.update);
  const toggleItem = useExpatQuoteStore((s) => s.toggleItem);
  const setStep = useExpatQuoteStore((s) => s.setStep);
  const send = useExpatQuoteStore((s) => s.send);
  const startOver = useExpatQuoteStore((s) => s.startOver);

  const uid = React.useId();
  const [errors, setErrors] = React.useState<Errors>({});
  const nameRef = React.useRef<HTMLInputElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  // a field the visitor touches stops shouting
  const change = (patch: Partial<ExpatQuoteDraft>) => {
    update(patch);
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(patch)) delete next[k as keyof ExpatQuoteDraft];
      return next;
    });
  };
  const toggle = (item: ExpatItem) => {
    toggleItem(item);
    setErrors((e) => {
      const next = { ...e };
      delete next.items;
      return next;
    });
  };

  const onContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const r = expatShipmentSchema.safeParse(draft);
    if (!r.success) return setErrors(toErrors(r.error));
    setErrors({});
    setStep(2);
    // only the instance the visitor used moves focus, never its twin
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    const r = expatContactSchema.safeParse(draft);
    if (!r.success) return setErrors(toErrors(r.error));
    setErrors({});
    send();
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const onEdit = () => {
    setErrors({});
    setStep(1);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const err = (k: keyof ExpatQuoteDraft) => (errors[k] ? t(errors[k]) : undefined);
  const itemList = (items: ExpatItem[]) => items.map((i) => t(`expat.items.${i}`)).join(", ");

  if (sent) {
    const firstName = sent.name.trim().split(/\s+/)[0];
    // the enquiry in the visitor's own words, so whoever picks up the chat
    // starts where the form left off
    const summary = [
      `${t("expat.form.waFrom")}: ${countryName(sent.origin, locale)}`,
      `${t("expat.form.waTo")}: ${sent.city.trim()}`,
      `${t("expat.form.waItems")}: ${itemList(sent.items)}`,
      `${t("expat.form.waQuantity")}: ${t("expat.form.pieces").replace("{n}", rangeLabel(sent.quantity))}`,
      `${t("expat.form.waName")}: ${sent.name.trim()}`,
    ];
    if (sent.notes.trim()) summary.push(`${t("expat.form.waNotes")}: ${sent.notes.trim()}`);
    const waText = `${t("expat.form.waIntro")}\n\n${summary.join("\n")}`;
    return (
      <Card id={id} className={cn("scroll-mt-28 rounded-lg border-border-strong p-5 shadow-overlay sm:p-6", className)}>
        <div className="banner-enter" aria-live="polite">
          {/* earned motion: the check draws once, for the moment the
              enquiry lands (DESIGN.md, Motion) */}
          <span className="grid size-12 place-items-center rounded-full bg-success/15 text-success">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path className="check-draw" d="M4 12.5l5 5L20 6.5" />
            </svg>
          </span>
          <h3
            ref={headingRef}
            tabIndex={-1}
            className="mt-4 font-display text-xl font-semibold tracking-tight outline-none"
          >
            {t("expat.form.successTitle").replace("{name}", firstName)}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {t("expat.form.successBody").replace("{email}", sent.email)}
          </p>
          {/* stacked at every width: side by side, two labels this long
              outgrow a 26rem card */}
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild variant="secondary" className="w-full">
              <a href={waLink(waText)} target="_blank" rel="noreferrer">
                <MessageCircle /> {t("expat.form.successWa")}
              </a>
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={startOver}>
              {t("expat.form.successAgain")}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (step === 2) {
    const large = draft.items.includes("large");
    const cityByHand = isUnservicedCity(draft.city);
    const tone = large || cityByHand ? "hold" : "positive";
    return (
      <Card id={id} className={cn("scroll-mt-28 rounded-lg border-border-strong p-5 shadow-overlay sm:p-6", className)}>
        <form noValidate onSubmit={onSend}>
          {/* the verdict first: the visitor learns the service fits before
              we ask who they are (brief, 01 Hero) */}
          <CardStrip
            edge="top"
            tone={tone}
            icon={tone === "hold" ? ExclamationTriangleIcon : CheckCircleIcon}
            className="banner-enter"
          >
            <p className={cn("font-medium", stripInk(tone))}>
              {large ? t("expat.form.fitLarge") : t("expat.form.fitGood")}
            </p>
            <p className="mt-1 text-xs text-muted">
              {t("expat.form.fitSummary")
                .replace("{items}", itemList(draft.items))
                .replace("{pieces}", t("expat.form.pieces").replace("{n}", rangeLabel(draft.quantity)))
                .replace("{from}", countryName(draft.origin, locale))
                .replace("{to}", draft.city.trim())}
            </p>
            {cityByHand && (
              <p className="mt-1 text-xs text-muted">
                {t("expat.form.fitCity").replace("{city}", draft.city.trim())}
              </p>
            )}
          </CardStrip>

          <h3
            ref={headingRef}
            tabIndex={-1}
            className="mt-5 font-display text-xl font-semibold tracking-tight outline-none"
          >
            {t("expat.form.title")}
          </h3>
          <p className="mt-1 text-xs text-muted-2">{t("expat.form.step2Meta")}</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor={`${uid}-name`}>{t("expat.form.name")}</Label>
              <Input
                ref={nameRef}
                id={`${uid}-name`}
                autoComplete="name"
                placeholder={t("expat.form.namePh")}
                value={draft.name}
                onChange={(e) => change({ name: e.target.value })}
                aria-invalid={!!errors.name || undefined}
                aria-describedby={errors.name ? `${uid}-name-err` : undefined}
              />
              <FieldError id={`${uid}-name-err`}>{err("name")}</FieldError>
            </div>
            <div>
              <Label htmlFor={`${uid}-email`}>{t("expat.form.email")}</Label>
              <Input
                id={`${uid}-email`}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t("expat.form.emailPh")}
                value={draft.email}
                onChange={(e) => change({ email: e.target.value })}
                aria-invalid={!!errors.email || undefined}
                aria-describedby={errors.email ? `${uid}-email-err` : undefined}
              />
              <FieldError id={`${uid}-email-err`}>{err("email")}</FieldError>
            </div>
            <div>
              <Label htmlFor={`${uid}-phone`}>
                {t("expat.form.phone")} <span className="font-normal text-muted-2">{t("expat.form.optional")}</span>
              </Label>
              <div className="flex gap-2">
                {/* the number most likely to answer is the one from the
                    country they're leaving, so the dial code starts there */}
                <div className="w-28 shrink-0">
                  <DialCodeSelect
                    value={draft.dial || draft.origin || INDONESIA.code}
                    onChange={(iso) => change({ dial: iso })}
                  />
                </div>
                <Input
                  id={`${uid}-phone`}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder={t("expat.form.phonePh")}
                  value={draft.phone}
                  onChange={(e) => change({ phone: e.target.value.replace(/[^\d]/g, "") })}
                  aria-invalid={!!errors.phone || undefined}
                  aria-describedby={`${uid}-phone-hint${errors.phone ? ` ${uid}-phone-err` : ""}`}
                  className="min-w-0 flex-1"
                />
              </div>
              <p id={`${uid}-phone-hint`} className="mt-1 text-xs text-muted-2">
                {t("expat.form.phoneHint")}
              </p>
              <FieldError id={`${uid}-phone-err`}>{err("phone")}</FieldError>
            </div>
            <div>
              <Label htmlFor={`${uid}-notes`}>
                {t("expat.form.notes")} <span className="font-normal text-muted-2">{t("expat.form.optional")}</span>
              </Label>
              <Textarea
                id={`${uid}-notes`}
                rows={3}
                maxLength={500}
                placeholder={t("expat.form.notesPh")}
                value={draft.notes}
                onChange={(e) => change({ notes: e.target.value })}
              />
            </div>
          </div>

          <p className="mt-5 text-xs text-muted-2">{t("expat.form.privacy")}</p>
          <Button type="submit" size="lg" className="mt-3 w-full">
            {t("expat.form.submit")} <ArrowRight />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="mt-2 w-full" onClick={onEdit}>
            <ArrowLeft /> {t("expat.form.edit")}
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card
      id={id}
      className={cn("scroll-mt-28 rounded-lg border-border-strong px-5 pb-5 pt-7 shadow-overlay sm:px-6 sm:pb-6", className)}
    >
      <form noValidate onSubmit={onContinue}>
        <h3 ref={headingRef} tabIndex={-1} className="font-display text-xl font-semibold tracking-tight outline-none">
          {t("expat.form.title")}
        </h3>
        <p className="mt-1 text-xs text-muted-2">{t("expat.form.step1Meta")}</p>

        <div className="mt-5 space-y-4">
          <div>
            <Label>{t("expat.form.from")}</Label>
            <CountrySelect
              value={draft.origin}
              onChange={(code) => change({ origin: code })}
              exclude={INDONESIA.code}
              ariaLabel={t("expat.form.from")}
              placeholder={t("expat.form.fromPh")}
            />
            <FieldError>{err("origin")}</FieldError>
          </div>

          <div>
            <Label htmlFor={`${uid}-city`}>{t("expat.form.to")}</Label>
            <Input
              id={`${uid}-city`}
              autoComplete="address-level2"
              placeholder={t("expat.form.toPh")}
              value={draft.city}
              onChange={(e) => change({ city: e.target.value })}
              aria-invalid={!!errors.city || undefined}
              aria-describedby={errors.city ? `${uid}-city-err` : undefined}
            />
            <FieldError id={`${uid}-city-err`}>{err("city")}</FieldError>
          </div>

          <fieldset aria-describedby={`${uid}-items-hint`}>
            <legend className="mb-1.5 block text-xs font-medium text-muted">{t("expat.form.items")}</legend>
            <div className="flex flex-wrap gap-2">
              {EXPAT_ITEMS.map((item) => {
                const checked = draft.items.includes(item);
                const cid = `${uid}-item-${item}`;
                return (
                  <label
                    key={item}
                    htmlFor={cid}
                    className={cn(
                      "inline-flex cursor-pointer select-none items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                      checked
                        ? "border-foreground bg-surface text-foreground"
                        : "border-border-strong bg-surface-2 text-foreground hover:border-foreground/40",
                    )}
                  >
                    <Checkbox id={cid} checked={checked} onCheckedChange={() => toggle(item)} />
                    {t(`expat.items.${item}`)}
                  </label>
                );
              })}
            </div>
            <p id={`${uid}-items-hint`} className="mt-1 text-xs text-muted-2">
              {t("expat.form.itemsHint")}
            </p>
            <FieldError>{err("items")}</FieldError>
          </fieldset>

          <div>
            <Label>{t("expat.form.quantity")}</Label>
            <SegmentedRoot
              type="single"
              value={draft.quantity}
              onValueChange={(v) => v && change({ quantity: v as ExpatQuoteDraft["quantity"] })}
              aria-label={t("expat.form.quantity")}
            >
              {EXPAT_QUANTITIES.map((q) => (
                <SegmentedItem key={q} value={q} className="tabular-nums">
                  {rangeLabel(q)}
                </SegmentedItem>
              ))}
            </SegmentedRoot>
            <FieldError>{err("quantity")}</FieldError>
          </div>
        </div>

        <Button type="submit" size="lg" className="mt-6 w-full">
          {t("expat.form.continue")} <ArrowRight />
        </Button>
      </form>
    </Card>
  );
}
