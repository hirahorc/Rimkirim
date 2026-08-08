"use client";

import * as React from "react";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SegmentedRoot, SegmentedItem } from "@/components/ui/toggle-group";
import { CarrierDot } from "./CarrierMark";
import { useT } from "@/lib/i18n/LanguageProvider";

/** A cost row defined by i18n keys; `cost` is a literal (amount) or a key. */
interface CostRow {
  typeKey: string;
  descKey: string;
  bulletKeys?: string[];
  afterKey?: string;
  /** literal amount (e.g. "IDR 495.000") or an i18n key for a text cost */
  cost: string;
  costNoteKey?: string;
}

interface SurchargeGroup {
  labelKey: string;
  qualifyKeys: string[];
  rows: CostRow[];
}

const PER_PKG = "surcharge.perPackage";

const HANDLING_GROUPS: SurchargeGroup[] = [
  {
    labelKey: "surcharge.groupParcel",
    qualifyKeys: ["surcharge.parcelQ1", "surcharge.parcelQ2", "surcharge.parcelQ3"],
    rows: [
      { typeKey: "surcharge.packagingType", descKey: "surcharge.packagingDesc", cost: "IDR 495.000", costNoteKey: PER_PKG },
      { typeKey: "surcharge.overweightType", descKey: "surcharge.overweightDesc", cost: "IDR 495.000", costNoteKey: PER_PKG },
      {
        typeKey: "surcharge.overdimType",
        descKey: "surcharge.overdimDesc",
        bulletKeys: ["surcharge.overdimB1", "surcharge.overdimB2", "surcharge.overdimB3", "surcharge.overdimB4"],
        cost: "IDR 495.000",
        costNoteKey: PER_PKG,
      },
      {
        typeKey: "surcharge.oversizeType",
        descKey: "surcharge.oversizeDesc",
        bulletKeys: ["surcharge.oversizeB1", "surcharge.oversizeB2", "surcharge.oversizeB3"],
        cost: "IDR 1.072.000",
        costNoteKey: PER_PKG,
      },
    ],
  },
  {
    labelKey: "surcharge.groupLarge",
    qualifyKeys: ["surcharge.largeQ1", "surcharge.largeQ2", "surcharge.largeQ3"],
    rows: [
      {
        typeKey: "surcharge.freightType",
        descKey: "surcharge.freightDesc",
        bulletKeys: ["surcharge.freightB1"],
        cost: "IDR 2.944.000",
        costNoteKey: PER_PKG,
      },
      { typeKey: "surcharge.nonStackType", descKey: "surcharge.nonStackDesc", cost: "IDR 3.700.000", costNoteKey: PER_PKG },
      {
        typeKey: "surcharge.unauthType",
        descKey: "surcharge.unauthDesc",
        bulletKeys: ["surcharge.unauthB1", "surcharge.unauthB2", "surcharge.unauthB3"],
        cost: "IDR 7.306.000",
        costNoteKey: PER_PKG,
      },
    ],
  },
];

// DHL / UPS handling surcharges (flat lists; cost = Charge by Rimkirim).
const DHL_ROWS: CostRow[] = [
  { typeKey: "surcharge.dhlOverweightType", descKey: "surcharge.dhlOverweightDesc", cost: "IDR 1.750.000", costNoteKey: PER_PKG },
  {
    typeKey: "surcharge.dhlOversizeType",
    descKey: "surcharge.dhlOversizeDesc",
    bulletKeys: ["surcharge.dhlOversizeB1", "surcharge.dhlOversizeB2"],
    cost: "IDR 495.000",
    costNoteKey: PER_PKG,
  },
  { typeKey: "surcharge.dhlNonConvType", descKey: "surcharge.dhlNonConvDesc", cost: "IDR 495.000", costNoteKey: PER_PKG },
  { typeKey: "surcharge.dhlNonStackType", descKey: "surcharge.dhlNonStackDesc", cost: "IDR 5.150.000", costNoteKey: PER_PKG },
];

const UPS_ROWS: CostRow[] = [
  { typeKey: "surcharge.upsOverweightType", descKey: "surcharge.upsOverweightDesc", cost: "IDR 495.000", costNoteKey: PER_PKG },
  {
    typeKey: "surcharge.upsOverdimType",
    descKey: "surcharge.upsOverdimDesc",
    bulletKeys: ["surcharge.upsOverdimB1", "surcharge.upsOverdimB2"],
    cost: "IDR 495.000",
    costNoteKey: PER_PKG,
  },
  { typeKey: "surcharge.upsPackagingType", descKey: "surcharge.upsPackagingDesc", cost: "IDR 495.000", costNoteKey: PER_PKG },
  {
    typeKey: "surcharge.upsLargeType",
    descKey: "surcharge.upsLargeDesc",
    bulletKeys: ["surcharge.upsLargeB1", "surcharge.upsLargeB2"],
    cost: "IDR 1.058.200",
    costNoteKey: PER_PKG,
  },
];

const CARRIERS = [
  { id: "fedex", label: "FedEx" },
  { id: "dhl", label: "DHL" },
  { id: "ups", label: "UPS" },
] as const;

const LOGISTIC_ROWS: CostRow[] = [
  { typeKey: "surcharge.warehouseType", descKey: "surcharge.warehouseDesc", cost: "surcharge.warehouseCost", costNoteKey: "surcharge.warehouseNote" },
  {
    typeKey: "surcharge.outPickupType",
    descKey: "surcharge.outPickupDesc",
    cost: "surcharge.outPickupCost",
    costNoteKey: "surcharge.outPickupNote",
  },
  {
    typeKey: "surcharge.extDeliveryType",
    descKey: "surcharge.extDeliveryDesc",
    cost: "surcharge.extDeliveryCost",
    costNoteKey: "surcharge.extDeliveryNote",
  },
  {
    typeKey: "surcharge.mrnType",
    descKey: "surcharge.mrnDesc",
    bulletKeys: ["surcharge.mrnB1", "surcharge.mrnB2"],
    afterKey: "surcharge.mrnAfter",
    cost: "surcharge.mrnCost",
    costNoteKey: "surcharge.mrnNote",
  },
];

/** Resolve a cost that may be a literal amount or an i18n key. */
function resolveCost(t: (k: string) => string, cost: string): string {
  return cost.startsWith("surcharge.") ? t(cost) : cost;
}

/** A small count badge shown next to a group/section heading. */
function CountPill({ n }: { n: number }) {
  return (
    <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-2">
      {n}
    </span>
  );
}

function CostRowItem({ row, index }: { row: CostRow; index: number }) {
  const t = useT();
  return (
    <div className="flex gap-3 px-4 py-4 sm:px-5">
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand/15 text-xs font-semibold tabular-nums text-foreground">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{t(row.typeKey)}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(row.descKey)}</p>

        {row.bulletKeys && (
          <ul className="mt-2 space-y-1 rounded-sm bg-surface-2/60 px-3 py-2.5 text-sm text-muted">
            {row.bulletKeys.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-muted-2">•</span>
                <span>{t(b)}</span>
              </li>
            ))}
          </ul>
        )}
        {row.afterKey && (
          <p className="mt-2 text-sm leading-relaxed text-muted">{t(row.afterKey)}</p>
        )}

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-t border-border/60 pt-2.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-2">
            {t("surcharge.biaya")}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {resolveCost(t, row.cost)}
          </span>
          {row.costNoteKey && (
            <span className="w-full text-xs text-muted-2 sm:w-auto">
              {t(row.costNoteKey)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SurchargeGroupBlock({
  label,
  qualifyKeys,
  rows,
}: {
  /** already-resolved label (FedEx group name or a carrier name) */
  label: string;
  qualifyKeys?: string[];
  rows: CostRow[];
}) {
  const t = useT();
  return (
    <div>
      <div className="flex items-center gap-2">
        <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
          {label}
        </h4>
        <CountPill n={rows.length} />
      </div>
      {qualifyKeys && qualifyKeys.length > 0 && (
        <div className="mt-2 rounded-lg border border-border bg-surface-2/40 px-4 py-3 text-xs text-muted sm:px-5">
          <p className="font-medium text-muted-2">{t("surcharge.appliesAny")}</p>
          <ul className="mt-1 space-y-0.5">
            {qualifyKeys.map((c) => (
              <li key={c} className="flex gap-2">
                <span className="text-muted-2">•</span>
                <span>{t(c)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
        {rows.map((r, i) => (
          <CostRowItem key={r.typeKey} row={r} index={i + 1} />
        ))}
      </div>
    </div>
  );
}

function CostSection({
  heading,
  intro,
  rows,
}: {
  heading: string;
  intro: React.ReactNode;
  rows: CostRow[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <h3 className="font-display text-base font-semibold sm:text-lg">{heading}</h3>
        <CountPill n={rows.length} />
      </div>
      <p className="mt-1 text-sm leading-relaxed text-muted">{intro}</p>
      <div className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border">
        {rows.map((r, i) => (
          <CostRowItem key={r.typeKey} row={r} index={i + 1} />
        ))}
      </div>
    </div>
  );
}

function FooterNote() {
  const t = useT();
  return (
    <div className="mt-4 flex items-start gap-2.5 rounded-md border border-border bg-surface-2/60 p-3 text-xs leading-relaxed text-muted">
      <Info className="mt-0.5 size-4 shrink-0 text-muted-2" />
      <p>{t("surcharge.footerNote")}</p>
    </div>
  );
}

export function SurchargeInfoDialog({ children }: { children: React.ReactNode }) {
  const t = useT();
  const [carrier, setCarrier] = React.useState<string>("fedex");
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="p-5 pb-4 sm:p-6 sm:pb-4">
          <DialogTitle>{t("surcharge.title")}</DialogTitle>
          <DialogDescription>{t("surcharge.desc")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="handling" className="flex min-h-0 flex-1 flex-col">
          <div className="px-5 sm:px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="handling"
                className="h-auto whitespace-normal px-2 py-2 text-center text-xs leading-tight sm:text-sm"
              >
                {t("surcharge.tabHandling")}
              </TabsTrigger>
              <TabsTrigger
                value="logistic"
                className="h-auto whitespace-normal px-2 py-2 text-center text-xs leading-tight sm:text-sm"
              >
                {t("surcharge.tabLogistic")}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
            <div className="pl-5 pr-[14px] pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
            <TabsContent value="handling">
              <h3 className="font-display text-base font-semibold sm:text-lg">
                {t("surcharge.handlingHeading")}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {t("surcharge.handlingIntroPre")}{" "}
                <span className="text-foreground">
                  {t("surcharge.handlingIntroHighlight")}
                </span>
              </p>

              {/* carrier switcher */}
              <SegmentedRoot
                type="single"
                value={carrier}
                onValueChange={(v) => v && setCarrier(v)}
                className="mt-4"
              >
                {CARRIERS.map((c) => (
                  <SegmentedItem key={c.id} value={c.id}>
                    <CarrierDot carrier={c.label} /> {c.label}
                  </SegmentedItem>
                ))}
              </SegmentedRoot>

              {carrier === "fedex" && (
                <div className="mt-4 space-y-6">
                  {HANDLING_GROUPS.map((g) => (
                    <SurchargeGroupBlock
                      key={g.labelKey}
                      label={t(g.labelKey)}
                      qualifyKeys={g.qualifyKeys}
                      rows={g.rows}
                    />
                  ))}
                </div>
              )}
              {carrier === "dhl" && (
                <div className="mt-4">
                  <SurchargeGroupBlock label="DHL" rows={DHL_ROWS} />
                </div>
              )}
              {carrier === "ups" && (
                <div className="mt-4">
                  <SurchargeGroupBlock label="UPS" rows={UPS_ROWS} />
                </div>
              )}

              <FooterNote />
            </TabsContent>

            <TabsContent value="logistic">
              <CostSection
                heading={t("surcharge.logisticHeading")}
                intro={t("surcharge.logisticIntro")}
                rows={LOGISTIC_ROWS}
              />
              <FooterNote />
            </TabsContent>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
