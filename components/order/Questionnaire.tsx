"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  MessageCircle,
  PackageX,
  Globe2,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Check as CheckIcon,
} from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import type { Citizenship } from "@/lib/store/useOrderStore";
import { getCountry } from "@/lib/data/countries";
import { validatePackingCode } from "@/lib/data/packing-list";
import { findOwnedByCode } from "@/lib/store/usePackingListStore";
import { mapPackingToModules } from "@/lib/order/packing-prefill";
import { useCurrentUser } from "@/lib/store/useAuthStore";
import { toast } from "sonner";
import { useT, useLanguage } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InfoTip, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { formatIDR } from "@/lib/utils/currency";
import { RouteArrow } from "@/components/ui/route-arrow";

const WA_URL = "https://wa.me/6281234567890";

/**
 * A yes/no (or A/B) answer as the system's segmented control: the chosen
 * segment lifts off the track in white + ink instead of filling with lime, so
 * five answered questions never out-shout the one lime "Lanjut". Real radio
 * semantics: the group is labelled by its question, arrows move the choice.
 */
function Choice<T extends string | boolean>({
  value,
  onChange,
  options,
  labelledBy,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  /** id of the question text that names this group */
  labelledBy: string;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIdx = options.findIndex((o) => o.value === value);
  const move = (from: number, dir: 1 | -1) => {
    const next = (from + dir + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="mt-3 inline-flex w-full items-stretch gap-1 rounded-full border border-border bg-surface-2 p-1"
    >
      {options.map((o, i) => {
        const checked = value === o.value;
        // roving tabindex: the checked item (or the first, before any answer) is the tab stop
        const tabStop = selectedIdx === -1 ? i === 0 : checked;
        return (
          <button
            key={String(o.value)}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={tabStop ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(ev) => {
              if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
                ev.preventDefault();
                move(i, 1);
              } else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
                ev.preventDefault();
                move(i, -1);
              } else if (ev.key === " " || ev.key === "Enter") {
                ev.preventDefault();
                onChange(o.value);
              }
            }}
            className={cn(
              "tap-row flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
              checked
                ? "bg-background font-semibold text-foreground shadow-float"
                : "text-muted hover:text-foreground",
            )}
          >
            {/* the lift + weight already say "chosen"; the check is a bonus that
                only fits once the pill has room */}
            {checked && (
              <CheckIcon
                className="hidden size-3.5 sm:block"
                strokeWidth={3}
                aria-hidden
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Question({
  n,
  question,
  note,
  children,
}: {
  n: number;
  question: string;
  /** small eyebrow naming what the answer does (e.g. "decides the clearance route") */
  note?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  // a question that appears below the fold on a phone announces itself by
  // sliding into view; mount-only, and skipped when motion is reduced
  React.useEffect(() => {
    if (n === 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom > window.innerHeight)
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [n]);
  return (
    // id lets the clearance step deep-link back to the exact question
    <Card ref={ref} id={`q${n}`} className="scroll-mt-28 animate-fade-up p-5">
      {note && (
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.04em] text-muted-2">
          {note}
        </p>
      )}
      <p id={`q${n}-label`} className="flex gap-2 font-medium">
        <span className="tabular-nums text-foreground">{n}.</span>
        <span>{question}</span>
      </p>
      {children}
    </Card>
  );
}

export function Questionnaire() {
  const t = useT();
  const { locale } = useLanguage();
  const router = useRouter();
  const context = useOrderStore((s) => s.context);
  const selectedRate = useOrderStore((s) => s.selectedRate);
  const answers = useOrderStore((s) => s.answers);
  const setAnswers = useOrderStore((s) => s.setAnswers);
  const prefillFromPackingList = useOrderStore((s) => s.prefillFromPackingList);
  const user = useCurrentUser();

  const [outcome, setOutcome] = React.useState<
    null | "ineligible" | "foreigner"
  >(null);
  const [codeStatus, setCodeStatus] = React.useState<
    "idle" | "checking" | "found" | "not-found"
  >(() =>
    answers.packingCode?.trim() &&
    answers.packingCodeVerified === answers.packingCode.trim()
      ? "found"
      : "idle",
  );

  const checkCode = async () => {
    const code = (answers.packingCode ?? "").trim();
    if (!code) return;
    setCodeStatus("checking");
    const ok = await validatePackingCode(code, user?.email);
    setCodeStatus(ok ? "found" : "not-found");
    // remember the verified code so a reload doesn't ask to search again
    setAnswers({ packingCodeVerified: ok ? code : undefined });
  };

  const isExport = context?.service === "moving-abroad";

  const a = answers.shippingPersonal;
  const b = answers.citizenship;
  const c = answers.livedLongEnough;
  const d = answers.canApplySKP;
  const e = answers.hasPackingCode;
  const arrived = answers.arrivedAtDestination;

  // country names in the reader's language ("Belanda", not "Netherlands" inside ID copy)
  const countryName = (code: string | undefined | null) => {
    if (!code) return "–";
    try {
      return (
        new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code
      );
    } catch {
      return getCountry(code)?.name ?? code;
    }
  };
  const originName = countryName(context?.originCountry);
  const destName = countryName(context?.destCountry);

  const packingCodeOk = e === false || codeStatus === "found";

  // how far along, out of the longest path this service can take: the count
  // shrinks the moment a branch closes, so the horizon is always honest
  const maxQuestions = isExport
    ? 3
    : a === false
      ? 1
      : b === "foreigner"
        ? 2
        : 5;
  const answeredCount = [a, isExport ? arrived : b, c, d, e].filter(
    (v) => v !== undefined,
  ).length;
  const answeredShown = Math.min(answeredCount, maxQuestions);
  // the lime door only leads forward; a branch that ends in a hand-off gets a
  // quieter, honest button (and says so under the answer that caused it)
  // the lane the routing answers are forming, said out loud under Q3/Q4 so a
  // "Tidak" is never a mystery: it's a different lane, not a rejection
  const laneText =
    c === false || d === false
      ? t("order.qLanePassenger")
      : c === true && d === true
        ? t("order.qLanePersonal")
        : t("order.qLaneOpen");
  const laneReadout = (
    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-2">
      <ArrowRight className="size-3.5 shrink-0" aria-hidden /> {laneText}
    </p>
  );
  const offRamp: "ineligible" | "foreigner" | null =
    a === false
      ? "ineligible"
      : !isExport && b === "foreigner"
        ? "foreigner"
        : null;

  const canSubmit = isExport
    ? a === false ||
      (a === true && arrived !== undefined && e !== undefined && packingCodeOk)
    : a === false ||
      (a === true && b === "foreigner") ||
      (a === true &&
        b === "indonesian" &&
        c !== undefined &&
        d !== undefined &&
        e !== undefined &&
        packingCodeOk);

  // a code from one of the user's own packing lists carries its data along:
  // CI + Items land in the form pre-filled instead of being typed twice
  const applyOwnPackingList = () => {
    if (e !== true || codeStatus !== "found") return;
    const own = findOwnedByCode(user?.email, answers.packingCode ?? "");
    if (!own) return;
    prefillFromPackingList(mapPackingToModules(own.data, context));
    toast.success(t("pl.prefilledToast"), {
      description: t("pl.prefilledToastBody").replace("{code}", own.code),
    });
  };

  const onSubmit = () => {
    if (a === false) return setOutcome("ineligible");
    if (!isExport && b === "foreigner") return setOutcome("foreigner");
    applyOwnPackingList();
    if (isExport) return router.push("/pesan/modul");
    router.push("/pesan/clearance");
  };

  const packingReveal = e === true && (
    <div className="mt-3">
      <Label className="inline-flex items-center gap-1.5">
        {t("order.packingCodeLabel")}
        <InfoTip
          content={t("order.qPackingTip")}
          label={t("order.packingCodeLabel")}
        />
      </Label>
      <div className="flex gap-2">
        <Input
          value={answers.packingCode ?? ""}
          onChange={(ev) => {
            setAnswers({ packingCode: ev.target.value });
            setCodeStatus("idle");
          }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              ev.preventDefault();
              checkCode();
            }
          }}
          placeholder={t("order.packingCodePlaceholder")}
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={checkCode}
          disabled={codeStatus === "checking" || !answers.packingCode?.trim()}
          className="h-11 shrink-0"
        >
          {codeStatus === "checking" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          {t("order.packingCodeSearch")}
        </Button>
      </div>
      {codeStatus === "idle" && (
        <p className="mt-1.5 text-xs text-muted-2">
          {t("order.packingCodeHint")}{" "}
          <Link href="/packing-list" className="link-mark">
            {t("order.packingCodeIdleMake")}
          </Link>
        </p>
      )}
      {codeStatus === "checking" && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
          <Loader2 className="size-3.5 animate-spin" />
          {t("order.packingCodeChecking")}
        </p>
      )}
      {codeStatus === "found" && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-success">
          <CheckCircle2 className="size-3.5" />
          {t("order.packingCodeFound")}
        </p>
      )}
      {codeStatus === "not-found" && (
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-danger">
          <span className="inline-flex items-center gap-1.5">
            <XCircle className="size-3.5" />
            {t("order.packingCodeNotFound")}
          </span>
          <Link href="/packing-list" className="link-mark">
            {t("order.packingCodeMakeOne")}
          </Link>
        </p>
      )}
    </div>
  );

  // the hand-off card: the form stays in view (dimmed) so the answer that
  // routed them is still on screen, and the card arrives rather than replaces
  const outcomeCard =
    outcome === "ineligible" ? (
      <OutcomeScreen
        icon={<PackageX className="size-6 text-foreground" />}
        eyebrow={t("order.qOutcomeEyebrow")}
        title={t("order.ineligibleTitle")}
        body={t("order.ineligibleBody")}
        echo={`${t("order.qYourAnswer")}: ${t("order.no")} · ${t("order.qA")}`}
        primary={{
          label: t("order.ineligibleCta"),
          href: WA_URL,
          external: true,
          icon: <MessageCircle className="size-4" />,
        }}
        alt={{ label: t("order.ineligibleAlt"), href: "/cek-tarif" }}
        secondaryLabel={t("order.backToRates")}
        onSecondary={() => setOutcome(null)}
      />
    ) : outcome === "foreigner" ? (
      <OutcomeScreen
        icon={<Globe2 className="size-6 text-foreground" />}
        eyebrow={t("order.qOutcomeEyebrow")}
        title={t("order.foreignerTitle")}
        body={t("order.foreignerBody")}
        echo={`${t("order.qYourAnswer")}: ${t("order.foreigner")} · ${t("order.qB")}`}
        primary={{
          label: t("order.foreignerCta"),
          href: "/expat-relocation",
          external: false,
          icon: <ArrowRight className="size-4" />,
        }}
        alt={{ label: t("order.ineligibleAlt"), href: "/cek-tarif" }}
        secondaryLabel={t("order.backToRates")}
        onSecondary={() => setOutcome(null)}
      />
    ) : null;

  return (
    <TooltipProvider delayDuration={150}>
      <div>
        <div
          className={cn(
            "transition-opacity",
            outcome && "pointer-events-none opacity-40",
          )}
          // inert: removes the dimmed form from tab order AND the a11y tree
          inert={!!outcome}
        >
          <header className="mb-6">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("order.qHeading")}
            </h1>
            <p className="mt-1.5 max-w-prose text-sm text-muted">
              {t("order.qSubheading")}
            </p>
            {/* the shipment this check is about: the Open Desk readout the page
                was missing (route · service · quoted rate) */}
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground">
              <span className="inline-flex items-center gap-1.5">
                {originName}
                <RouteArrow className="text-muted-2" />
                {destName}
              </span>
              <span className="text-muted-2">·</span>
              <span>
                {isExport ? t("order.serviceMa") : t("order.serviceBfg")}
              </span>
              {selectedRate && (
                <>
                  <span className="text-muted-2">·</span>
                  <span className="font-mono tabular-nums">
                    {formatIDR(selectedRate.perKg)}
                    <span className="ml-1 text-xs text-muted-2">
                      {t("order.qPerKg")}
                    </span>
                  </span>
                </>
              )}
            </p>
            {maxQuestions > 1 && (
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.04em] text-muted-2">
                {t("order.qProgress")
                  .replace("{n}", String(answeredShown))
                  .replace("{max}", String(maxQuestions))}
              </p>
            )}
          </header>

          <div className="space-y-3">
            <Question
              n={1}
              note={t("order.qGateNote")}
              question={t("order.qA")}
            >
              {/* the gate term, defined where it's asked (same treatment as SKP) */}
              <p className="mt-1.5 text-xs text-muted-2">
                {t("order.qAGloss")}
              </p>
              <Choice
                labelledBy={`q1-label`}
                value={a}
                onChange={(v) => setAnswers({ shippingPersonal: v })}
                options={[
                  { value: true, label: t("order.yes") },
                  { value: false, label: t("order.no") },
                ]}
              />
              {offRamp === "ineligible" && (
                <p className="mt-3 text-xs leading-relaxed text-muted">
                  {t("order.qIneligibleInline")}
                </p>
              )}
            </Question>

            {/* Moving Abroad (export): lean questionnaire */}
            {a === true && isExport && (
              <>
                <Question
                  n={2}
                  question={`${t("order.qArrivedPre")} ${destName} ${t("order.qArrivedPost")}`}
                >
                  <Choice
                    labelledBy={`q2-label`}
                    value={arrived}
                    onChange={(v) => setAnswers({ arrivedAtDestination: v })}
                    options={[
                      { value: true, label: t("order.yes") },
                      { value: false, label: t("order.no") },
                    ]}
                  />
                </Question>

                <Question
                  n={3}
                  note={t("order.qOptionalNote")}
                  question={t("order.qE")}
                >
                  <Choice
                    labelledBy={`q3-label`}
                    value={e}
                    onChange={(v) => setAnswers({ hasPackingCode: v })}
                    options={[
                      { value: true, label: t("order.yes") },
                      { value: false, label: t("order.no") },
                    ]}
                  />
                  {packingReveal}
                </Question>
              </>
            )}

            {/* Back For Good (import): full eligibility questionnaire */}
            {a === true && !isExport && (
              <Question
                n={2}
                note={t("order.qGateNote")}
                question={t("order.qB")}
              >
                <Choice<Citizenship>
                  labelledBy={`q2-label`}
                  value={b}
                  onChange={(v) => setAnswers({ citizenship: v })}
                  options={[
                    { value: "indonesian", label: t("order.indonesian") },
                    { value: "foreigner", label: t("order.foreigner") },
                  ]}
                />
                {offRamp === "foreigner" && (
                  <p className="mt-3 text-xs leading-relaxed text-muted">
                    {t("order.qForeignerInline")}
                  </p>
                )}
              </Question>
            )}

            {a === true && !isExport && b === "indonesian" && (
              <>
                <Question
                  n={3}
                  note={t("order.qRoutingNote")}
                  question={`${t("order.qCPre")} ${originName} ${t("order.qCPost")}`}
                >
                  <Choice
                    labelledBy={`q3-label`}
                    value={c}
                    onChange={(v) => setAnswers({ livedLongEnough: v })}
                    options={[
                      { value: true, label: t("order.yes") },
                      { value: false, label: t("order.no") },
                    ]}
                  />
                  {c !== undefined && laneReadout}
                </Question>

                {/* one question at a time: the next card appears once this one is answered */}
                {c !== undefined && (
                  <Question
                    n={4}
                    note={t("order.qRoutingNote")}
                    question={t("order.qD")}
                  >
                    {/* SKP is the one term here a first-timer won't know — explain
                  it right where it's asked, not behind a tap */}
                    <p className="mt-1.5 text-xs text-muted-2">
                      {t("order.jargSkp")}
                    </p>
                    <Choice
                      labelledBy={`q4-label`}
                      value={d}
                      onChange={(v) => setAnswers({ canApplySKP: v })}
                      options={[
                        { value: true, label: t("order.yes") },
                        { value: false, label: t("order.no") },
                      ]}
                    />
                    {d !== undefined && laneReadout}
                  </Question>
                )}

                {c !== undefined && d !== undefined && (
                  <Question
                    n={5}
                    note={t("order.qOptionalNote")}
                    question={t("order.qE")}
                  >
                    <Choice
                      labelledBy={`q5-label`}
                      value={e}
                      onChange={(v) => setAnswers({ hasPackingCode: v })}
                      options={[
                        { value: true, label: t("order.yes") },
                        { value: false, label: t("order.no") },
                      ]}
                    />
                    {packingReveal}
                  </Question>
                )}
              </>
            )}
          </div>

          {/* the action block steps aside when the outcome card has taken over */}
          <div className={cn("mt-6", outcome && "hidden")}>
            {canSubmit && !offRamp && (
              <p className="mb-2 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-foreground">
                <CheckCircle2 className="size-3.5 text-success" />{" "}
                {t("order.qEligibleReadout")}
              </p>
            )}
            {!canSubmit && (
              <p
                id="q-submit-hint"
                role="status"
                className="mb-2 text-center text-xs text-muted-2"
              >
                {e === true && codeStatus === "not-found"
                  ? t("order.qBadCodeHint")
                  : e === true &&
                      !!answers.packingCode?.trim() &&
                      codeStatus !== "found"
                    ? t("order.qCheckCodeHint")
                    : t("order.qAnswerAllHint")}
              </p>
            )}
            <Button
              size="lg"
              // lime means "forward"; an off-ramp and a not-yet both wear the secondary coat
              variant={canSubmit && !offRamp ? "brand" : "secondary"}
              className="w-full"
              disabled={!canSubmit}
              aria-describedby={canSubmit ? undefined : "q-submit-hint"}
              onClick={onSubmit}
            >
              {offRamp === "ineligible"
                ? t("order.qSeeOptions")
                : offRamp === "foreigner"
                  ? t("order.qToExpat")
                  : t("order.seeResult")}
              <ArrowRight className="size-4" />
            </Button>
            <p className="mt-3 text-center text-xs leading-relaxed text-muted-2">
              {t("order.qAgreePre")}{" "}
              <Link href="/terms" className="link-mark">
                {t("footer.legalTerms")}
              </Link>{" "}
              {t("order.qAgreeMid")}{" "}
              <Link href="/privacy" className="link-mark">
                {t("footer.legalPrivacy")}
              </Link>
              {t("order.qAgreePost")}
            </p>
          </div>
        </div>
        {outcomeCard}
      </div>
    </TooltipProvider>
  );
}

function OutcomeScreen({
  icon,
  eyebrow,
  title,
  body,
  echo,
  primary,
  alt,
  secondaryLabel,
  onSecondary,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  /** the answer that routed them here, repeated so the hand-off has a reason */
  echo: string;
  primary: {
    label: string;
    href: string;
    external: boolean;
    icon: React.ReactNode;
  };
  /** an optional second way forward (never a dead end) */
  alt?: { label: string; href: string };
  secondaryLabel: string;
  onSecondary: () => void;
}) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  // the card arrives below the dimmed form; focus lands on its title so keyboard
  // and screen-reader users are taken to the outcome, not left on the button
  React.useEffect(() => {
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);
  return (
    <Card
      className="reveal-pop mt-3 p-6 sm:p-8"
      role="region"
      aria-live="polite"
    >
      <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted-2">
        {eyebrow}
      </p>
      <div className="mt-3 flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-2">
          {icon}
        </div>
        <div className="min-w-0">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-xl font-semibold tracking-tight outline-none"
          >
            {title}
          </h2>
          <p className="mt-1.5 text-sm text-muted">{body}</p>
          <p className="mt-2 text-xs text-muted-2">{echo}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button asChild className="w-full sm:w-auto">
          {primary.external ? (
            <a href={primary.href} target="_blank" rel="noreferrer">
              {primary.icon} {primary.label}
            </a>
          ) : (
            <Link href={primary.href}>
              {primary.icon} {primary.label}
            </Link>
          )}
        </Button>
        {alt && (
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href={alt.href}>{alt.label}</Link>
          </Button>
        )}
        <Button
          variant="ghost"
          className="w-full sm:ml-auto sm:w-auto"
          onClick={onSecondary}
        >
          {secondaryLabel}
        </Button>
      </div>
    </Card>
  );
}
