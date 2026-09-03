"use client";

import * as React from "react";
import { toast } from "sonner";
import { Ticket, BarChart3, Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { useVoucherStore, makeCampaignId } from "@/lib/store/useVoucherStore";
import {
  campaignStats,
  normalizeCode,
  type ApprovalTier,
  type Campaign,
  type CampaignKind,
} from "@/lib/voucher/engine";
import { useT, useLanguage } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/shared/forms/Field";
import { formatIDR } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

const KIND_KEY: Record<CampaignKind, string> = {
  kol: "ops.vcKindKol",
  community: "ops.vcKindCommunity",
  seasonal: "ops.vcKindSeasonal",
};
const TIER_KEY: Record<ApprovalTier, string> = {
  "marketing-lead": "ops.vcTierMarketingLead",
  "head-of-marketing": "ops.vcTierHeadOfMarketing",
  "finance-director": "ops.vcTierFinanceDirector",
};

/**
 * Campaign back-office: the codes ops hands out, and — the point of the whole
 * scheme — what each one actually brought in. Counts are read straight off
 * the orders, so the table is the shipments, not a tally that could drift.
 */
export function VoucherOpsTab() {
  const t = useT();
  const { locale } = useLanguage();
  const campaigns = useVoucherStore((s) => s.campaigns);
  const setCampaignActive = useVoucherStore((s) => s.setCampaignActive);
  const removeCampaign = useVoucherStore((s) => s.removeCampaign);
  const resetToSeed = useVoucherStore((s) => s.resetToSeed);
  const orders = useOrderStore(
    useShallow((s) => s.orders.filter((o) => o.voucher !== null)),
  );
  const [editing, setEditing] = React.useState<Campaign | "new" | null>(null);
  const [now] = React.useState(() => Date.now());
  const dateFmt = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }),
    [locale],
  );

  const sectionHead = "flex items-center gap-1.5 font-display text-xs font-medium uppercase tracking-wide text-muted-2";
  const th = "px-3 py-2 text-left text-xs font-medium text-muted-2 whitespace-nowrap";
  const td = "px-3 py-2.5 align-top text-sm whitespace-nowrap";
  const num = "font-mono tabular-nums";

  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={sectionHead}>
              <Ticket className="size-3.5" /> {t("ops.vcCampaigns")}
            </p>
            <p className="mt-1 max-w-prose text-xs text-muted">{t("ops.vcCampaignsDesc")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { resetToSeed(); toast.success(t("ops.vcSavedToast")); }}>
              <RotateCcw /> {t("ops.vcResetSeed")}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setEditing("new")}>
              <Plus /> {t("ops.vcNew")}
            </Button>
          </div>
        </div>

        {editing && (
          <CampaignForm
            key={editing === "new" ? "new" : editing.id}
            initial={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
          />
        )}

        {campaigns.length === 0 ? (
          <Card className="mt-3 p-8 text-center text-sm text-muted">{t("ops.vcNoCampaigns")}</Card>
        ) : (
          <Card className="mt-3 overflow-x-auto p-0">
            <table className="w-full min-w-[52rem] border-collapse">
              <thead className="border-b border-border">
                <tr>
                  <th className={th}>{t("ops.vcCode")}</th>
                  <th className={th}>{t("ops.vcName")}</th>
                  <th className={th}>{t("ops.vcKind")}</th>
                  <th className={cn(th, "text-right")}>{t("ops.vcDiscount")}</th>
                  <th className={cn(th, "text-right")}>{t("ops.vcUsageLimit")}</th>
                  <th className={th}>{t("ops.vcValidUntil")}</th>
                  <th className={th}>{t("ops.vcActive")}</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaigns.map((c) => {
                  const lapsed = now > c.validUntil;
                  return (
                    <tr key={c.id} className={cn(!c.active && "text-muted-2")}>
                      <td className={cn(td, "font-mono font-medium", c.active && "text-foreground")}>{c.code}</td>
                      {/* the one column allowed to wrap: names are the widest cell and carry no number */}
                      <td className={cn(td, "whitespace-normal")}>
                        {c.name}
                        {c.minWeightKg ? (
                          <span className="ml-1 whitespace-nowrap text-xs text-muted-2">≥ {c.minWeightKg} kg</span>
                        ) : null}
                      </td>
                      <td className={td}>{t(KIND_KEY[c.kind])}</td>
                      <td className={cn(td, num, "text-right")}>
                        {c.percent}% <span className="text-muted-2">· ≤ {formatIDR(c.maxDiscount)}</span>
                      </td>
                      <td className={cn(td, num, "text-right")}>{c.usageLimit}</td>
                      <td className={cn(td, num, lapsed && "text-warning-ink")}>{dateFmt.format(c.validUntil)}</td>
                      <td className={td}>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={c.active}
                          onClick={() => setCampaignActive(c.id, !c.active)}
                          className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/60"
                        >
                          <Badge variant={c.active ? "success" : "neutral"}>
                            {t(c.active ? "ops.vcActive" : "ops.vcInactive")}
                          </Badge>
                        </button>
                      </td>
                      <td className={cn(td, "text-right")}>
                        <span className="inline-flex gap-1">
                          <Button variant="ghost" size="sm" aria-label={t("ops.vcEdit")} onClick={() => setEditing(c)}>
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={t("ops.vcDelete")}
                            onClick={() => { removeCampaign(c.id); toast.success(t("ops.vcDeletedToast")); }}
                          >
                            <Trash2 />
                          </Button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </section>

      <section>
        <p className={sectionHead}>
          <BarChart3 className="size-3.5" /> {t("ops.vcAttribution")}
        </p>
        <p className="mt-1 max-w-prose text-xs text-muted">{t("ops.vcAttributionDesc")}</p>
        {campaigns.length > 0 && (
          <Card className="mt-3 overflow-x-auto p-0">
            <table className="w-full min-w-[56rem] border-collapse">
              <thead className="border-b border-border">
                <tr>
                  <th className={th}>{t("ops.vcCode")}</th>
                  <th className={cn(th, "text-right")}>{t("ops.vcReserved")}</th>
                  <th className={cn(th, "text-right")}>{t("ops.vcRedeemed")}</th>
                  <th className={cn(th, "text-right")}>{t("ops.vcFinalized")}</th>
                  <th className={cn(th, "text-right")}>{t("ops.vcReversed")}</th>
                  <th className={cn(th, "text-right")}>{t("ops.vcRemaining")}</th>
                  <th className={cn(th, "text-right")}>
                    {t("ops.vcCac")}{" "}
                    <span className="font-normal normal-case">({t("ops.vcCacHint")})</span>
                  </th>
                  <th className={cn(th, "text-right")}>{t("ops.vcExposure")}</th>
                  <th className={th}>{t("ops.vcTier")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaigns.map((c) => {
                  const s = campaignStats(c, orders, now);
                  return (
                    <tr key={c.id}>
                      <td className={cn(td, "font-mono font-medium text-foreground")}>{c.code}</td>
                      <td className={cn(td, num, "text-right")}>{s.reserved}</td>
                      <td className={cn(td, num, "text-right font-medium", s.redeemed > 0 && "text-success-ink")}>{s.redeemed}</td>
                      <td className={cn(td, num, "text-right")}>{s.finalized}</td>
                      <td className={cn(td, num, "text-right", s.reversed > 0 && "text-danger-ink")}>{s.reversed}</td>
                      <td className={cn(td, num, "text-right", s.remaining === 0 && "text-warning-ink")}>
                        {s.remaining} / {c.usageLimit}
                      </td>
                      <td className={cn(td, num, "text-right")}>
                        {s.cac === null ? <span className="text-muted-2">–</span> : formatIDR(s.cac)}
                      </td>
                      <td className={cn(td, num, "text-right")}>{formatIDR(s.exposure)}</td>
                      <td className={td}>
                        <Badge variant="neutral">{t(TIER_KEY[s.tier])}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </div>
  );
}

const toDateInput = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const fromDateInput = (s: string, endOfDay: boolean) => {
  const [y, m, d] = s.split("-").map(Number);
  return endOfDay ? Date.UTC(y, m - 1, d, 23, 59, 59) : Date.UTC(y, m - 1, d);
};

function CampaignForm({
  initial,
  onClose,
}: {
  initial: Campaign | null;
  onClose: () => void;
}) {
  const t = useT();
  const campaigns = useVoucherStore((s) => s.campaigns);
  const upsertCampaign = useVoucherStore((s) => s.upsertCampaign);
  const [form, setForm] = React.useState(() => ({
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    kind: initial?.kind ?? ("kol" as CampaignKind),
    percent: String(initial?.percent ?? 5),
    maxDiscount: String(initial?.maxDiscount ?? 900_000),
    minWeightKg: initial?.minWeightKg ? String(initial.minWeightKg) : "",
    usageLimit: String(initial?.usageLimit ?? 25),
    validFrom: toDateInput(initial?.validFrom ?? Date.now()),
    validUntil: toDateInput(initial?.validUntil ?? Date.UTC(2026, 11, 31)),
    feeIdr: String(initial?.feeIdr ?? 0),
  }));
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const code = normalizeCode(form.code);
  const codeTaken = campaigns.some((c) => c.code === code && c.id !== initial?.id);
  const valid = code.length >= 3 && !codeTaken && form.name.trim().length > 0;

  const save = () => {
    if (!valid) return;
    const minWeight = Number(form.minWeightKg);
    upsertCampaign({
      id: initial?.id ?? makeCampaignId(),
      code,
      name: form.name.trim(),
      kind: form.kind,
      segment: "bfg",
      percent: Math.min(100, Math.max(0, Number(form.percent) || 0)),
      maxDiscount: Math.max(0, Number(form.maxDiscount) || 0),
      minWeightKg: minWeight > 0 ? minWeight : undefined,
      usageLimit: Math.max(0, Math.floor(Number(form.usageLimit) || 0)),
      validFrom: fromDateInput(form.validFrom, false),
      validUntil: fromDateInput(form.validUntil, true),
      feeIdr: Math.max(0, Number(form.feeIdr) || 0),
      active: initial?.active ?? true,
    });
    toast.success(t("ops.vcSavedToast"));
    onClose();
  };

  return (
    <Card className="mt-3 border-info/40 bg-info/5 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("ops.vcCode")} error={codeTaken ? t("ops.vcCodeTaken") : undefined}>
          <Input className="font-mono uppercase" value={form.code} onChange={set("code")} autoCapitalize="characters" />
        </Field>
        <Field label={t("ops.vcName")}>
          <Input value={form.name} onChange={set("name")} />
        </Field>
        <Field label={t("ops.vcKind")}>
          <Select value={form.kind} onChange={set("kind")}>
            <option value="kol">{t("ops.vcKindKol")}</option>
            <option value="community">{t("ops.vcKindCommunity")}</option>
            <option value="seasonal">{t("ops.vcKindSeasonal")}</option>
          </Select>
        </Field>
        <Field label={t("ops.vcUsageLimit")}>
          <Input type="number" inputMode="numeric" min={0} value={form.usageLimit} onChange={set("usageLimit")} />
        </Field>
        <Field label={t("ops.vcPercent")}>
          <Input type="number" inputMode="numeric" min={0} max={100} value={form.percent} onChange={set("percent")} />
        </Field>
        <Field label={t("ops.vcMaxDiscount")}>
          <Input type="number" inputMode="numeric" min={0} step={50000} value={form.maxDiscount} onChange={set("maxDiscount")} />
        </Field>
        <Field label={t("ops.vcMinWeight")}>
          <Input type="number" inputMode="numeric" min={0} value={form.minWeightKg} onChange={set("minWeightKg")} placeholder="–" />
        </Field>
        <Field label={t("ops.vcFee")}>
          <Input type="number" inputMode="numeric" min={0} step={500000} value={form.feeIdr} onChange={set("feeIdr")} />
        </Field>
        <Field label={t("ops.vcValidFrom")}>
          <Input type="date" value={form.validFrom} onChange={set("validFrom")} />
        </Field>
        <Field label={t("ops.vcValidUntil")}>
          <Input type="date" value={form.validUntil} min={form.validFrom} onChange={set("validUntil")} />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>{t("ops.vcCancel")}</Button>
        <Button variant="secondary" size="sm" disabled={!valid} onClick={save}>{t("ops.vcSave")}</Button>
      </div>
    </Card>
  );
}
