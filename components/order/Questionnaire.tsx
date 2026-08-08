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
} from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import type { Citizenship } from "@/lib/store/useOrderStore";
import { getCountry } from "@/lib/data/countries";
import { validatePackingCode } from "@/lib/data/packing-list";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const WA_URL = "https://wa.me/6281234567890";

function Choice<T extends string | boolean>({
  value,
  onChange,
  options,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md border px-4 py-2.5 text-sm font-medium transition-colors",
            value === o.value
              ? "border-brand bg-brand text-brand-ink"
              : "border-border bg-surface-2 text-muted hover:border-border-strong hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Question({
  n,
  question,
  children,
}: {
  n: number;
  question: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="animate-fade-up p-5">
      <p className="flex gap-2 font-medium">
        <span className="text-foreground">{n}.</span>
        <span>{question}</span>
      </p>
      {children}
    </Card>
  );
}

export function Questionnaire() {
  const t = useT();
  const router = useRouter();
  const context = useOrderStore((s) => s.context);
  const answers = useOrderStore((s) => s.answers);
  const setAnswers = useOrderStore((s) => s.setAnswers);

  const [outcome, setOutcome] = React.useState<null | "ineligible" | "foreigner">(
    null,
  );
  const [codeStatus, setCodeStatus] = React.useState<
    "idle" | "checking" | "found" | "not-found"
  >("idle");

  const checkCode = async () => {
    const code = (answers.packingCode ?? "").trim();
    if (!code) return;
    setCodeStatus("checking");
    const ok = await validatePackingCode(code);
    setCodeStatus(ok ? "found" : "not-found");
  };

  const isExport = context?.service === "moving-abroad";

  const a = answers.shippingPersonal;
  const b = answers.citizenship;
  const c = answers.livedLongEnough;
  const d = answers.canApplySKP;
  const e = answers.hasPackingCode;
  const arrived = answers.arrivedAtDestination;

  const originName = getCountry(context?.originCountry)?.name ?? "–";
  const destName = getCountry(context?.destCountry)?.name ?? "–";

  const packingCodeOk = e === false || codeStatus === "found";

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

  const onSubmit = () => {
    if (a === false) return setOutcome("ineligible");
    if (isExport) return router.push("/pesan/modul");
    if (b === "foreigner") return setOutcome("foreigner");
    router.push("/pesan/clearance");
  };

  const packingReveal = e === true && (
    <div className="mt-3">
      <Label>{t("order.packingCodeLabel")}</Label>
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
        <p className="mt-1.5 text-xs text-muted-2">{t("order.packingCodeHint")}</p>
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
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-danger">
          <XCircle className="size-3.5" />
          {t("order.packingCodeNotFound")}
        </p>
      )}
    </div>
  );

  if (outcome === "ineligible") {
    return (
      <OutcomeScreen
        icon={<PackageX className="size-10 text-muted-2" />}
        title={t("order.ineligibleTitle")}
        body={t("order.ineligibleBody")}
        primary={{
          label: t("order.ineligibleCta"),
          href: WA_URL,
          external: true,
          icon: <MessageCircle className="size-4" />,
        }}
        secondaryLabel={t("order.backToRates")}
        onSecondary={() => setOutcome(null)}
      />
    );
  }
  if (outcome === "foreigner") {
    return (
      <OutcomeScreen
        icon={<Globe2 className="size-10 text-foreground" />}
        title={t("order.foreignerTitle")}
        body={t("order.foreignerBody")}
        primary={{
          label: t("order.foreignerCta"),
          href: "/",
          external: false,
          icon: <ArrowRight className="size-4" />,
        }}
        secondaryLabel={t("order.backToRates")}
        onSecondary={() => setOutcome(null)}
      />
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("order.qHeading")}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{t("order.qSubheading")}</p>
      </header>

      <div className="space-y-3">
        <Question n={1} question={t("order.qA")}>
          <Choice
            value={a}
            onChange={(v) => setAnswers({ shippingPersonal: v })}
            options={[
              { value: true, label: t("order.yes") },
              { value: false, label: t("order.no") },
            ]}
          />
        </Question>

        {/* Moving Abroad (export): lean questionnaire */}
        {a === true && isExport && (
          <>
            <Question
              n={2}
              question={`${t("order.qArrivedPre")} ${destName} ${t("order.qArrivedPost")}`}
            >
              <Choice
                value={arrived}
                onChange={(v) => setAnswers({ arrivedAtDestination: v })}
                options={[
                  { value: true, label: t("order.yes") },
                  { value: false, label: t("order.no") },
                ]}
              />
            </Question>

            <Question n={3} question={t("order.qE")}>
              <Choice
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
          <Question n={2} question={t("order.qB")}>
            <Choice<Citizenship>
              value={b}
              onChange={(v) => setAnswers({ citizenship: v })}
              options={[
                { value: "indonesian", label: t("order.indonesian") },
                { value: "foreigner", label: t("order.foreigner") },
              ]}
            />
          </Question>
        )}

        {a === true && !isExport && b === "indonesian" && (
          <>
            <Question
              n={3}
              question={`${t("order.qCPre")} ${originName} ${t("order.qCPost")}`}
            >
              <Choice
                value={c}
                onChange={(v) => setAnswers({ livedLongEnough: v })}
                options={[
                  { value: true, label: t("order.yes") },
                  { value: false, label: t("order.no") },
                ]}
              />
            </Question>

            <Question n={4} question={t("order.qD")}>
              <Choice
                value={d}
                onChange={(v) => setAnswers({ canApplySKP: v })}
                options={[
                  { value: true, label: t("order.yes") },
                  { value: false, label: t("order.no") },
                ]}
              />
            </Question>

            <Question n={5} question={t("order.qE")}>
              <Choice
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
      </div>

      <div className="mt-6">
        <Button size="lg" className="w-full" disabled={!canSubmit} onClick={onSubmit}>
          {t("order.seeResult")}
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
  );
}

function OutcomeScreen({
  icon,
  title,
  body,
  primary,
  secondaryLabel,
  onSecondary,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  primary: { label: string; href: string; external: boolean; icon: React.ReactNode };
  secondaryLabel: string;
  onSecondary: () => void;
}) {
  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-surface-2">
        {icon}
      </div>
      <h1 className="mt-5 font-display text-xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted">{body}</p>
      <div className="mt-6 space-y-2">
        <Button asChild className="w-full">
          {primary.external ? (
            <a href={primary.href} target="_blank" rel="noreferrer">
              {primary.icon} {primary.label}
            </a>
          ) : (
            <a href={primary.href}>
              {primary.icon} {primary.label}
            </a>
          )}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onSecondary}>
          {secondaryLabel}
        </Button>
      </div>
    </Card>
  );
}
