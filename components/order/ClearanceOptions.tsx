"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Gift, ClipboardCheck, Lock, ArrowRight, Info, Check } from "lucide-react";
import {
  useOrderStore,
  allowedClearance,
  type ClearanceKind,
} from "@/lib/store/useOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface OptionSpec {
  kind: ClearanceKind;
  titleKey: string;
  subtitleKey: string;
  descKey: string;
  benefitKeys: string[];
  requirementKeys: string[];
}

const OPTIONS: OptionSpec[] = [
  {
    kind: "personal",
    titleKey: "order.clPersonalTitle",
    subtitleKey: "order.clPersonalSubtitle",
    descKey: "order.clPersonalDesc",
    benefitKeys: ["order.clPersonalBenefit1"],
    requirementKeys: [
      "order.clPersonalReq1",
      "order.clPersonalReq2",
      "order.clPersonalReq3",
    ],
  },
  {
    kind: "passenger",
    titleKey: "order.clPassengerTitle",
    subtitleKey: "order.clPassengerSubtitle",
    descKey: "order.clPassengerDesc",
    benefitKeys: ["order.clPassengerBenefit1", "order.clPassengerBenefit2"],
    requirementKeys: ["order.clPassengerReq1"],
  },
];

export function ClearanceOptions() {
  const t = useT();
  const router = useRouter();
  const context = useOrderStore((s) => s.context);
  const answers = useOrderStore((s) => s.answers);
  const setClearance = useOrderStore((s) => s.setClearance);
  const allowed = allowedClearance(answers);

  // Moving Abroad has no clearance step — skip straight to the module hub.
  React.useEffect(() => {
    if (context?.service === "moving-abroad") router.replace("/pesan/modul");
  }, [context, router]);

  // pre-select the sole available option; otherwise start with none
  const soleAvailable: ClearanceKind | null =
    allowed.personal && allowed.passenger
      ? null
      : allowed.personal
        ? "personal"
        : "passenger";
  const [selected, setSelected] = React.useState<ClearanceKind | null>(soleAvailable);

  const onContinue = () => {
    if (!selected) return;
    setClearance(selected);
    router.push("/pesan/modul");
  };

  return (
    <div>
      <header className="mb-6 text-center">
        {/* the questionnaire's positive outcome, said out loud — the negative
            outcomes get a full card, so passing deserves at least a sentence */}
        <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-success">
          <Check className="size-4" strokeWidth={3} />
          {t("order.clEligibleNote")}
        </p>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-2">
          {t("order.clEyebrow")}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("order.clTitle")}
        </h1>
      </header>

      <div className="grid gap-4 md:grid-cols-2" role="radiogroup">
        {OPTIONS.map((o) => {
          const enabled = allowed[o.kind];
          const isSelected = enabled && selected === o.kind;
          return (
            <Card
              key={o.kind}
              role="radio"
              aria-checked={isSelected}
              aria-disabled={!enabled}
              tabIndex={enabled ? 0 : -1}
              onClick={() => enabled && setSelected(o.kind)}
              onKeyDown={(ev) => {
                if (enabled && (ev.key === "Enter" || ev.key === " ")) {
                  ev.preventDefault();
                  setSelected(o.kind);
                }
              }}
              className={cn(
                "relative flex flex-col p-6 outline-none transition-colors",
                !enabled && "opacity-60",
                enabled && "cursor-pointer",
                enabled && !isSelected && "hover:border-border-strong",
                isSelected && "border-foreground ring-2 ring-foreground/15",
              )}
            >
              {isSelected && (
                <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-brand text-brand-ink">
                  <Check className="size-4" strokeWidth={3} />
                </span>
              )}
              <div className="flex items-start justify-between gap-2 pr-8">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {t(o.titleKey)}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted">{t(o.subtitleKey)}</p>
                </div>
                {!enabled && (
                  <Badge variant="neutral">
                    <Lock className="size-3" /> {t("order.statusLocked")}
                  </Badge>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted">
                {t(o.descKey)}
              </p>

              <div className="mt-5 space-y-4">
                <Section
                  icon={<Gift className="size-4 text-foreground" />}
                  label={t("order.clBenefits")}
                  items={o.benefitKeys.map((k) => t(k))}
                />
                <Section
                  icon={<ClipboardCheck className="size-4 text-foreground" />}
                  label={t("order.clRequirements")}
                  items={o.requirementKeys.map((k) => t(k))}
                />
              </div>

              {!enabled && (
                <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-2">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  {t("order.clDisabledReason")}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-6">
        <Button size="lg" className="w-full" disabled={!selected} onClick={onContinue}>
          {t("order.continue")} <ArrowRight className="size-4" />
        </Button>
      </div>

      <p className="mx-auto mt-4 max-w-xl text-center text-xs text-muted-2">
        {t("order.clFooter")}
      </p>
    </div>
  );
}

function Section({
  icon,
  label,
  items,
}: {
  icon: React.ReactNode;
  label: string;
  items: string[];
}) {
  return (
    <div className="rounded-sm border border-border bg-surface-2/50 p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {label}
      </p>
      <ul className="mt-2 space-y-1.5 text-sm text-muted">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-2" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
