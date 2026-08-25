"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Download, Eye, FileCheck2, FileText } from "lucide-react";
import { CollapseHeight } from "@/components/ui/disclosure";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDownloadCipl, usePreviewCipl } from "@/components/packing/useDownloadCipl";
import { orderModulesToCipl } from "@/lib/pdf/cipl";
import { useT, useLanguage } from "@/lib/i18n/LanguageProvider";
import { TooltipProvider, InfoTip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { CopyButton } from "@/components/order/CopyButton";
import { getCountry } from "@/lib/data/countries";
import { dialCodeFor } from "@/lib/data/dial-codes";
import { formatCurrency } from "@/lib/data/currencies";
import { formatIDR, formatNumber } from "@/lib/utils/currency";
import {
  chargeableWeight,
  chargedBasis,
  totalChargeableWeight,
} from "@/lib/utils/chargeable-weight";
import { PACKAGING_TYPES, BUILDING_TYPES } from "@/components/order/module-options";
import { BFG_DOCS, EXPORT_DOCS } from "@/components/order/modules/ComplianceForm";
import {
  effectivePackingCode,
  type Order,
} from "@/lib/store/useOrderStore";

const dash = "–";
const WA_URL = "https://wa.me/6281234567890";

/**
 * De-boxed section: no card, no icon chip. The section title (display, dark)
 * anchors the group; the wide gap between sections vs the hairline between
 * rows carries the hierarchy — same language as the FAQ, not stacked cards.
 */
/** The one section-title style, shared so every section head reads identically. */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    // Title role (20/600, tracking-tight): a full step above the 12px eyebrows
    // and the 14px values, so the record can be skimmed section by section
    <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className="mt-3 divide-y divide-border">{children}</div>
    </section>
  );
}

/**
 * A named group *within* a section (Sender / Receiver / Owner). The grouping is
 * carried by the eyebrow plus the space above it — the rows inside keep the exact
 * same hairline rhythm as every flat section, so the whole record reads as one
 * consistent ledger instead of Customer Info collapsing into denser blocks.
 */
function SubGroup({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 font-display text-xs font-semibold uppercase tracking-wide text-muted-2">
        {label}
      </p>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
  prose = false,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  /** addresses, notes: sentences read left-aligned under their label on phones,
      instead of ragged right-aligned fragments beside it */
  prose?: boolean;
}) {
  return (
    <div
      className={cn(
        "py-2",
        prose
          ? "flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
          : "flex items-start justify-between gap-4",
      )}
    >
      <span className="shrink-0 text-xs text-muted-2">{label}</span>
      {/* tabular-nums here aligns every numeric value down the right column —
          dims, weights, dates, phone digits — and is inert on prose values. */}
      <span className={cn("text-sm tabular-nums", prose ? "sm:text-right" : "text-right")}>
        {children}
      </span>
    </div>
  );
}

/**
 * The mobile grouped-list break (iOS-settings style): a soft band running
 * edge to edge (the page container is px-4 below sm) between the record's
 * sections, so a long one-column read stays scannable. From sm up the band
 * disappears and the de-boxed whitespace rhythm carries the grouping again.
 */
export function SectionBand() {
  return <div aria-hidden className="-mx-4 my-7 h-2 bg-surface-2 sm:mx-0 sm:my-5 sm:h-0" />;
}

/** A group/section with nothing filled in yet: one muted line, not a stack of dashes. */
function EmptyLine() {
  const t = useT();
  return <p className="py-2 text-sm text-muted-2">{t("order.tdNotFilled")}</p>;
}

/** Empty-string/null/undefined → en dash, otherwise the string form. */
function val(x: unknown): string {
  return x === undefined || x === null || x === "" ? dash : String(x);
}

interface Party {
  fullName?: string;
  country?: string;
  address?: string;
  email?: string;
  phoneCountry?: string;
  phone?: string;
}
interface Owner {
  fullName?: string;
  phoneOriginCountry?: string;
  phoneOrigin?: string;
  phoneDestinationCountry?: string;
  phoneDestination?: string;
  email?: string;
}
interface PkgItem {
  name?: string;
  value?: number;
  quantity?: number;
}
interface Pkg {
  packaging?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  items?: PkgItem[];
  photos?: Record<string, unknown>;
}

/**
 * Replays the questionnaire + all four module forms the customer filled in,
 * plus placeholder slots for the data the ops side produces later (quotation,
 * AWB, clearance). Read-only — nothing here edits the order.
 */
export function OrderSummary({ order }: { order: Order }) {
  const t = useT();
  const { locale } = useLanguage();
  const isMa = order.context?.service === "moving-abroad";

  // PendingCards decides its own visibility; mirror it here so a band is
  // never drawn above a section that then renders nothing
  const showPending =
    (order.status === "review" && !order.quotation && !!order.selectedRate) ||
    !!order.awb;
  const sections: React.ReactNode[] = [
    <CustomerCard key="customer" order={order} />,
    <ItemsCard key="items" order={order} />,
    <PickupCard key="pickup" order={order} locale={locale} />,
    <ComplianceCard key="compliance" order={order} />,
  ];
  if (showPending) sections.push(<PendingCards key="pending" order={order} />);

  return (
    // lead with the substance a customer actually verifies (who/where → what →
    // when → docs). Between sections: whitespace from sm up, a full-bleed band
    // (SectionBand) on phones, where whitespace alone stops reading as a break.
    <TooltipProvider delayDuration={150}>
      <div>
        {sections.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <SectionBand />}
            {s}
          </React.Fragment>
        ))}
        <div className="mt-8 space-y-4 sm:mt-10">
          {/* the cancelled notice lives in OrderDetail's live tier now — a
              terminal status is news, not archive material for the record's foot */}
          {isMa && (
            <p className="text-xs text-muted-2">{t("order.tdMaNote")}</p>
          )}
          {/* the record is read-only, but a customer who spots a wrong address
              needs a door: the assistant, not a dead end */}
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <p className="max-w-prose text-xs leading-relaxed text-muted-2">
              {t("order.tdWrongPre")}{" "}
              <a href={WA_URL} target="_blank" rel="noreferrer" className="link-mark">
                {t("order.tdWrongLink")}
              </a>{" "}
              {t("order.tdWrongPost")}
            </p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

/** A row label with an inline info tooltip, for terms a first-timer won't know. */
function TipLabel({ label, tip }: { label: string; tip: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <InfoTip content={tip} label={label} />
    </span>
  );
}

/* A party reads as an address block, not a ledger: the shapes of a name, an
   address, an email and a dialled number identify themselves, so labels would
   only repeat what the eye already knows. Only filled lines render. */
function PartyBlock({ party }: { party: Party | undefined }) {
  const phone =
    party?.phoneCountry && party?.phone
      ? `${dialCodeFor(party.phoneCountry)} ${party.phone}`
      : null;
  const country = party?.country
    ? (getCountry(party.country)?.name ?? party.country)
    : null;

  if (!party?.fullName && !country && !party?.address && !party?.email && !phone)
    return <EmptyLine />;
  return (
    <div className="space-y-0.5 py-1 text-sm">
      {party?.fullName && <p className="font-medium text-foreground">{party.fullName}</p>}
      {party?.address && <p className="text-muted">{party.address}</p>}
      {country && <p className="text-muted">{country}</p>}
      {(party?.email || phone) && (
        <p className="break-words pt-1 text-muted">
          {party?.email}
          {party?.email && phone && " · "}
          {phone && <span className="tabular-nums">{phone}</span>}
        </p>
      )}
    </div>
  );
}

function CustomerCard({ order }: { order: Order }) {
  const t = useT();
  const data = order.modules.customerInfo.data as
    | { sender?: Party; receiver?: Party; owner?: Owner }
    | undefined;
  const owner = data?.owner;
  const ownerPhoneOrigin =
    owner?.phoneOriginCountry && owner?.phoneOrigin
      ? `${dialCodeFor(owner.phoneOriginCountry)} ${owner.phoneOrigin}`
      : null;
  const ownerPhoneDest =
    owner?.phoneDestinationCountry && owner?.phoneDestination
      ? `${dialCodeFor(owner.phoneDestinationCountry)} ${owner.phoneDestination}`
      : null;

  // Three peer parties reading as a waybill: sender → receiver → owner, side
  // by side from sm up, each an unlabelled address block under its eyebrow —
  // identity blocks against the labelled ledger the rest of the record keeps.
  return (
    <section>
      <SectionTitle>{t("order.modCustomer")}</SectionTitle>
      <div className="mt-3 grid gap-x-8 gap-y-6 sm:grid-cols-3">
        <SubGroup label={t("order.ciSectionSender")}>
          <PartyBlock party={data?.sender} />
        </SubGroup>
        <SubGroup label={t("order.ciSectionReceiver")}>
          <PartyBlock party={data?.receiver} />
        </SubGroup>
        <SubGroup label={t("order.ciSectionOwner")}>
          {/* every owner field is optional — show only what's filled, and a single
              muted line when the whole group is empty, never a stack of dashes.
              The two phones need no labels either: +60 / +62 says which is which */}
          {!owner?.fullName && !ownerPhoneOrigin && !ownerPhoneDest && !owner?.email ? (
            <EmptyLine />
          ) : (
            <div className="space-y-0.5 py-1 text-sm">
              {owner?.fullName && (
                <p className="font-medium text-foreground">{owner.fullName}</p>
              )}
              {ownerPhoneOrigin && (
                <p className="tabular-nums text-muted">{ownerPhoneOrigin}</p>
              )}
              {ownerPhoneDest && (
                <p className="tabular-nums text-muted">{ownerPhoneDest}</p>
              )}
              {owner?.email && <p className="break-words pt-1 text-muted">{owner.email}</p>}
            </div>
          )}
        </SubGroup>
      </div>
    </section>
  );
}

const pkgTypeLabel = (t: (k: string) => string, value: string | undefined) =>
  PACKAGING_TYPES.find((p) => p.value === value)?.labelKey
    ? t(PACKAGING_TYPES.find((p) => p.value === value)!.labelKey)
    : val(value);

function ItemsCard({ order }: { order: Order }) {
  const t = useT();
  const { locale } = useLanguage();
  const data = order.modules.items.data as
    | { currency?: string; packages?: Pkg[] }
    | undefined;
  const packages = data?.packages ?? [];
  const currency = data?.currency ?? "USD";

  const dims = packages.map((p) => ({
    weight: Number(p?.weight) || 0,
    length: Number(p?.length) || 0,
    width: Number(p?.width) || 0,
    height: Number(p?.height) || 0,
    quantity: 1,
  }));
  const totalCw = totalChargeableWeight(dims);
  const totalValue = packages.reduce(
    (sum, p) =>
      sum +
      (p?.items ?? []).reduce(
        (s, it) => s + (Number(it?.value) || 0) * (Number(it?.quantity) || 0),
        0,
      ),
    0,
  );
  const totalPrice = (order.selectedRate?.perKg ?? 0) * totalCw;

  // Collapse packages so a many-package shipment isn't a long read-only wall.
  // Auto default: one package opens, two or more collapse to their one-line
  // summaries (the totals below never collapse — they are what the collapsing
  // is for). Read-only, so no validation/error-expand concern here.
  const manyPackages = packages.length > 1;
  const [openIdx, setOpenIdx] = React.useState<Set<number>>(() =>
    manyPackages ? new Set() : new Set(packages.map((_, i) => i)),
  );
  const isOpen = (i: number) => openIdx.has(i);
  const toggle = (i: number) =>
    setOpenIdx((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  const anyOpen = packages.some((_, i) => openIdx.has(i));
  const expandAll = () => setOpenIdx(new Set(packages.map((_, i) => i)));
  const collapseAll = () => setOpenIdx(new Set());

  // the packing list is an artifact OF the goods, so its code and its PDF
  // live here (the old Eligibility section is gone)
  const packing = effectivePackingCode({
    answers: order.answers,
    generatedPackingCode: order.generatedPackingCode,
  });
  const pdfReady =
    order.modules.items.status === "complete" &&
    Boolean((order.modules.customerInfo.data as { sender?: unknown } | undefined)?.sender);
  const { busy: pdfBusy, download: downloadPdf } = useDownloadCipl();
  const { busy: previewBusy, preview: previewPdf } = usePreviewCipl();
  const ciplInput = () =>
    orderModulesToCipl({
      code: packing,
      customerInfo: order.modules.customerInfo.data,
      items: order.modules.items.data,
      pickup: order.modules.pickup.data,
      context: order.context,
    });

  return (
    <Section title={t("order.modItems")}>
      <Row label={t("order.itCurrency")}>{currency}</Row>
      <Row
        prose
        label={<TipLabel label={t("order.coPackingCode")} tip={t("order.tdPackingTip")} />}
      >
        {packing ? (
          <span className="flex flex-col items-start gap-2 sm:items-end">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-mono">{packing}</span>
              <CopyButton value={packing} />
            </span>
            {pdfReady && (
              <span className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  loading={previewBusy}
                  onClick={() => previewPdf(ciplInput())}
                >
                  {!previewBusy && <Eye className="size-3.5" />}
                  {t("order.previewPdf")}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={pdfBusy}
                  onClick={() => downloadPdf(ciplInput())}
                >
                  {!pdfBusy && <Download className="size-3.5" />}
                  {pdfBusy ? t("pl.downloading") : t("order.generatePdf")}
                </Button>
              </span>
            )}
          </span>
        ) : (
          dash
        )}
      </Row>
      {packages.length === 0 && (
        <Row label={t("order.itPackagesHeading")}>{dash}</Row>
      )}
      {manyPackages && (
        <div className="flex justify-end py-2">
          <button
            type="button"
            onClick={anyOpen ? collapseAll : expandAll}
            className="inline-flex items-center gap-1 rounded-sm text-xs text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
          >
            {/* swap, never rotate — the shared disclosure idiom */}
            {anyOpen ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
            {anyOpen ? t("order.itCollapseAll") : t("order.itExpandAll")}
          </button>
        </div>
      )}
      {packages.map((p, i) => {
        const dims = {
          weight: Number(p?.weight) || 0,
          length: Number(p?.length) || 0,
          width: Number(p?.width) || 0,
          height: Number(p?.height) || 0,
        };
        const cw = chargeableWeight({ ...dims, quantity: 1 });
        const basis = chargedBasis({ ...dims, quantity: 1 });
        const items = p?.items ?? [];
        const pkgValue = items.reduce(
          (s, it) => s + (Number(it?.value) || 0) * (Number(it?.quantity) || 0),
          0,
        );
        const open = isOpen(i);
        // one-line summary when collapsed (same shape as the order form)
        const itemCount = items.filter((it) => (it?.name ?? "").trim()).length;
        const hasAny =
          dims.weight > 0 ||
          dims.length > 0 ||
          dims.width > 0 ||
          dims.height > 0 ||
          itemCount > 0;
        const summary = hasAny
          ? [
              dims.weight > 0 && `${formatNumber(dims.weight, 1, locale)}kg`,
              (dims.length > 0 || dims.width > 0 || dims.height > 0) &&
                `${dims.length} × ${dims.width} × ${dims.height}`,
              itemCount > 0 &&
                `${itemCount} ${t(itemCount === 1 ? "order.itItemWordOne" : "order.itItemsWord")}`,
              pkgValue > 0 && formatCurrency(pkgValue, currency),
            ]
              .filter(Boolean)
              .join(" · ")
          : t("order.itPackageEmpty");
        return (
          <div key={i} className="py-2">
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={open}
              className="flex w-full items-center gap-2 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
            >
              {/* swap, never rotate — the shared disclosure idiom */}
              {open ? (
                <ChevronUp className="size-4 shrink-0 text-muted" />
              ) : (
                <ChevronDown className="size-4 shrink-0 text-muted" />
              )}
              <span className="shrink-0 text-sm font-medium text-foreground">
                {t("order.itPackageN")} {i + 1}
              </span>
              {/* the one-line summary stays put when open, so the line you
                  scanned is the line you expanded */}
              <span className="truncate text-xs text-muted-2">{summary}</span>
            </button>
            {/* body stays mounted and collapses with the shared disclosure
                motion (DESIGN.md, "The disclosure open") */}
            <CollapseHeight open={open}>
              <div className="mt-1">
                {/* the package's physique reads itself — a packaging name, an
                    L×W×H in cm, a kg figure — so it goes label-less in one spec
                    line (the same move as Customer Info). What stays in the
                    ledger genuinely needs its label: a second kg figure is
                    mute without "chargeable", and a photo status without its
                    subject */}
                {(p?.packaging ||
                  p?.length ||
                  p?.width ||
                  p?.height ||
                  p?.weight) && (
                  <p className="py-2 text-sm text-muted">
                    {[
                      p?.packaging && pkgTypeLabel(t, p.packaging),
                      (p?.length || p?.width || p?.height) &&
                        `${val(p?.length)} × ${val(p?.width)} × ${val(p?.height)} cm`,
                      p?.weight && `${val(p.weight)} kg`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                <Row
                  label={
                    <TipLabel label={t("order.tdChargeable")} tip={t("pkg.chgTooltip")} />
                  }
                >
                  {formatNumber(cw, 1, locale)} kg
                  {basis === "volumetric" && (
                    <span className="ml-1 text-xs text-muted-2">
                      ({t("order.tdVolumetric")})
                    </span>
                  )}
                </Row>
                <Row label={t("order.tdPhotos")}>
                  {p?.photos && Object.keys(p.photos).length > 0
                    ? t("order.tdUploaded")
                    : t("order.tdMissingOptional")}
                </Row>
                {items.length > 0 && (
                  // a real table: columns align natively across header/body/
                  // footer (the old per-row grids sized independently and drift
                  // as soon as a number gets wider); numeric cells never wrap.
                  // same ledger language as the rows above: hairlines, no box
                  <div className="mt-1 border-t border-border">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="text-xs text-muted-2">
                          <th scope="col" className="py-1.5 pr-3 text-left font-medium">
                            {t("order.itColDescription")}
                          </th>
                          <th scope="col" className="px-3 py-1.5 text-right font-medium last:pr-0">
                            {t("order.itColQty")}
                          </th>
                          <th scope="col" className="whitespace-nowrap px-3 py-1.5 text-right font-medium last:pr-0">
                            {t("order.itColValue")}
                          </th>
                          <th scope="col" className="px-3 py-1.5 text-right font-medium last:pr-0">
                            {t("order.itColTotal")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it, j) => (
                          <tr key={j} className="border-t border-border align-top">
                            <td className="py-1.5 pr-3">{val(it?.name)}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums text-muted">
                              {val(it?.quantity)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-1.5 text-right font-mono tabular-nums text-muted">
                              {formatCurrency(Number(it?.value) || 0, currency)}
                            </td>
                            <td className="whitespace-nowrap py-1.5 pl-3 text-right font-mono font-medium tabular-nums">
                              {formatCurrency(
                                (Number(it?.value) || 0) * (Number(it?.quantity) || 0),
                                currency,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border">
                          <td colSpan={3} className="px-3 py-1.5 text-right text-xs text-muted-2">
                            {t("order.itSubtotalPkg")}
                          </td>
                          <td className="whitespace-nowrap py-1.5 pl-3 text-right font-mono text-sm font-medium tabular-nums">
                            {formatCurrency(pkgValue, currency)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </CollapseHeight>
          </div>
        );
      })}
      {packages.length > 0 && (
        // totals footer: darker labels + heavier values so the shipment summary
        // reads as the closing line of the ledger, not one more package row
        // the closing line of the ledger: the figures a customer actually checks
        // step up a size, and the estimate carries its own caveat right under it
        <div className="!border-t-2 !border-t-foreground/80 divide-y divide-border pt-1">
          <Row label={<span className="text-muted">{t("order.itTotalCw")}</span>}>
            <span className="text-base font-medium">
              {formatNumber(totalCw, 1, locale)} kg
            </span>
          </Row>
          <Row label={<span className="text-muted">{t("order.itTotalValue")}</span>}>
            <span className="font-mono text-base font-medium">
              {formatCurrency(totalValue, currency)}
            </span>
          </Row>
          {totalPrice > 0 &&
            (order.quotation ? (
              // the official quotation owns the answer now (and the mark, up in
              // its own card) — the estimate stays only as paper trail, demoted
              // to the ledger's quiet voice so two totals never compete
              <div className="py-2">
                <div className="flex items-start justify-between gap-4">
                  <span className="shrink-0 text-xs text-muted-2">
                    {t("order.itTotalPrice")}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-muted-2">
                    {formatIDR(totalPrice)}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-2 sm:text-right">
                  {t("order.tdEstimateSuperseded")}
                </p>
              </div>
            ) : (
              <div className="py-2">
                <div className="flex items-start justify-between gap-4">
                  <span className="shrink-0 text-xs font-medium text-foreground">
                    {t("order.itTotalPrice")}
                  </span>
                  {/* the one lime mark in the record (Marker Rule: fill behind ink) —
                      the figure a customer comes back to check */}
                  <span className="hero-mark font-mono text-lg font-semibold tabular-nums">
                    {formatIDR(totalPrice)}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-2 sm:text-right">
                  {t("order.itEstimateNote")}
                </p>
              </div>
            ))}
        </div>
      )}
    </Section>
  );
}

const docLabelKey = (key: string) =>
  ({
    ktp: "order.coKtp",
    passport: "order.coPassport",
    flightTicket: "order.coFlightTicket",
    enpwp: "order.coEnpwp",
    skp: "order.coSKP",
    proofOfStay: "order.coProofOfStay",
    visa: "order.coVisa",
  })[key] ?? null;

/* Opens a stored data URL in a new tab. `data:` is blocked as a top-level
   navigation, so the bytes are re-wrapped in a blob URL; the tab itself is
   opened synchronously inside the click so popup blockers stay quiet. */
async function openDataUrlInTab(dataUrl: string) {
  const tab = window.open("", "_blank");
  try {
    const blob = await (await fetch(dataUrl)).blob();
    if (tab) tab.location.href = URL.createObjectURL(blob);
  } catch {
    tab?.close();
  }
}

/* One document as a tile: thumbnail (or icon) above the doc's name and its
   filename/state. Interactions by what the record holds — a stored image opens
   the big preview dialog, a stored PDF opens in a new tab, an upload from
   before previews existed explains itself, an empty slot is inert. */
function DocTile({
  label,
  fileName,
  dataUrl,
  emptyWord,
  dueWord,
  emptyTone = "warning",
}: {
  label: string;
  fileName?: string | null;
  dataUrl?: string | null;
  /** the empty state, always "not uploaded" in some form */
  emptyWord?: string;
  /** optional second line: when the missing doc is actually due */
  dueWord?: string;
  /** warning while the missing doc is a live to-do; neutral once it's moot
      (draft, the phase it served has passed, or the order ended) */
  emptyTone?: "warning" | "neutral";
}) {
  const t = useT();
  const isImage = !!dataUrl && dataUrl.startsWith("data:image/");
  const frame =
    "grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-md border";
  const interactive =
    "border-border bg-surface-2 transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50";
  const warn = emptyTone === "warning";

  const caption = (
    <span className="mt-1.5 block">
      <span className="block text-xs font-medium text-foreground">{label}</span>
      {fileName ? (
        <span className="block truncate font-mono text-xs text-muted-2">{fileName}</span>
      ) : (
        <>
          {/* one state, one colour at a time: while a doc is due, every empty
              slot speaks warning; once it's moot they all quiet down together */}
          <span className={cn("block text-xs", warn ? "text-warning" : "text-muted-2")}>
            {emptyWord}
          </span>
          {dueWord && <span className="block text-xs text-muted-2">{dueWord}</span>}
        </>
      )}
    </span>
  );

  if (!fileName)
    return (
      <div>
        <span
          className={cn(
            frame,
            "border-dashed",
            warn
              ? "border-warning/50 bg-warning/5 text-warning"
              : "border-border bg-surface-2 text-muted-2",
          )}
        >
          <FileText className="size-6" aria-hidden />
        </span>
        {caption}
      </div>
    );

  if (isImage)
    return (
      <div className="min-w-0">
        <Dialog>
          <DialogTrigger
            aria-label={`${t("order.viewFile")}: ${label}`}
            className={cn(frame, interactive)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl!} alt="" aria-hidden className="size-full object-cover" />
          </DialogTrigger>
          <DialogContent className="max-w-3xl p-0">
            <DialogHeader className="pb-4">
              <DialogTitle className="truncate pr-8 text-base font-medium sm:text-base">
                {fileName}
              </DialogTitle>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-auto bg-surface-2 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUrl!}
                alt={fileName}
                className="mx-auto max-h-[72dvh] w-auto rounded-sm object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
        {caption}
      </div>
    );

  if (dataUrl)
    return (
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => void openDataUrlInTab(dataUrl)}
          aria-label={`${t("order.viewFile")}: ${label}`}
          className={cn(frame, interactive, "text-muted")}
        >
          <FileText className="size-6" aria-hidden />
        </button>
        {caption}
      </div>
    );

  // uploaded before stored previews existed: the filename is all the record has
  return (
    <div className="min-w-0">
      <Dialog>
        <DialogTrigger
          aria-label={`${t("order.viewFile")}: ${label}`}
          className={cn(frame, interactive, "text-muted")}
        >
          <FileCheck2 className="size-6" aria-hidden />
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="truncate pr-8 text-base font-medium sm:text-base">
              {fileName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <FileText className="size-8 text-muted-2" aria-hidden />
            <p className="text-sm text-muted">{t("order.previewUnavailable")}</p>
          </div>
        </DialogContent>
      </Dialog>
      {caption}
    </div>
  );
}

/* A missing doc is a live to-do only while its moment is still ahead: pickup
   docs until the pickup phase passes, everything else until clearance is done.
   Draft (nothing expected yet), passed phases, and terminal states read
   neutral — a delivered shipment has no business shouting about paperwork. */
const ACTIVE_PHASES = [
  "review",
  "quotation",
  "pickup",
  "in-transit",
  "clearance",
  "delivery",
] as const;

function docStillDue(noteKey: string | undefined, status: Order["status"]): boolean {
  const idx = (ACTIVE_PHASES as readonly string[]).indexOf(status);
  if (idx === -1) return false; // draft / delivered / cancelled
  if (noteKey === "order.coBeforePickup") return idx <= 2; // …through pickup
  return idx <= 4; // base + before-clearance docs matter through clearance
}

/** How many compliance docs are still a live to-do (missing and due now) —
 *  the number OrderDetail surfaces in the status tier as a link down here. */
export function dueComplianceDocsCount(order: Order): number {
  const data = order.modules.compliance.data as
    | { docs?: Record<string, string> }
    | undefined;
  const docs = data?.docs ?? {};
  const isMa = order.context?.service === "moving-abroad";
  const specs = (isMa ? EXPORT_DOCS : BFG_DOCS).filter(
    (d) => !d.personalOnly || order.clearance === "personal",
  );
  return specs.filter((d) => !docs[d.key] && docStillDue(d.noteKey, order.status))
    .length;
}

function ComplianceCard({ order }: { order: Order }) {
  const t = useT();
  const data = order.modules.compliance.data as
    | {
        docs?: Record<string, string>;
        docFiles?: Record<string, string>;
        otherDocs?: { name?: string; file?: string; fileData?: string }[];
      }
    | undefined;
  const docs = data?.docs ?? {};
  const docFiles = data?.docFiles ?? {};
  const isMa = order.context?.service === "moving-abroad";
  const isDraft = order.status === "draft";
  // the same spec the form uses, so the record shows exactly the docs this
  // route asks for (Passenger Goods never sees SKP / Proof of Stay)
  const specs = (isMa ? EXPORT_DOCS : BFG_DOCS).filter(
    (d) => !d.personalOnly || order.clearance === "personal",
  );
  const entries = specs
    .map((d) => ({ key: d.key, label: docLabelKey(d.key), spec: d }))
    .filter((e) => e.label);
  // every empty slot states "not uploaded"; the due timing (before pickup /
  // before clearance) is a supplementary second line, never the state itself
  const emptyWord = (spec: (typeof specs)[number]) =>
    spec.required || spec.noteKey ? t("order.tdMissing") : t("order.tdMissingOptional");
  const dueWord = (spec: (typeof specs)[number]) =>
    spec.noteKey === "order.coBeforePickup"
      ? t("order.tdLaterPickup")
      : spec.noteKey === "order.coBeforeClearance"
        ? t("order.tdLaterClearance")
        : undefined;

  return (
    // anchor target for the status-tier "documents still to upload" link:
    // the landing answers with the system's arrival flash (:target, colour
    // channel only), and tabIndex lets focus land here for keyboard/SR users
    <section
      id="compliance-docs"
      tabIndex={-1}
      className="target-flash -m-2 scroll-mt-24 rounded-md p-2 outline-none"
    >
      <SectionTitle>{t("order.modCompliance")}</SectionTitle>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
        {entries.map(({ key, label, spec }) => {
          const due = docStillDue(spec.noteKey, order.status);
          return (
            <DocTile
              key={key}
              label={t(label!)}
              fileName={docs[key] || null}
              dataUrl={docFiles[key] || null}
              emptyWord={emptyWord(spec)}
              // the timing hint helps while it's still ahead (draft included);
              // once the phase has passed it would just contradict the record
              dueWord={due || isDraft ? dueWord(spec) : undefined}
              emptyTone={due ? "warning" : "neutral"}
            />
          );
        })}
        {(data?.otherDocs ?? [])
          .filter((d) => d?.name || d?.file)
          .map((d, i) => (
            <DocTile
              key={`other-${i}`}
              label={d?.name || t("order.coOtherDocs")}
              fileName={d?.file || null}
              dataUrl={d?.fileData || null}
              emptyWord={t("order.tdMissingOptional")}
              emptyTone={docStillDue(undefined, order.status) ? "warning" : "neutral"}
            />
          ))}
      </div>
    </section>
  );
}

const buildingLabel = (t: (k: string) => string, value: string | undefined) =>
  BUILDING_TYPES.find((b) => b.value === value)?.labelKey
    ? t(BUILDING_TYPES.find((b) => b.value === value)!.labelKey)
    : val(value);

function PickupCard({
  order,
  locale,
}: {
  order: Order;
  locale: "id" | "en";
}) {
  const t = useT();
  const data = order.modules.pickup.data as
    | {
        picName?: string;
        buildingType?: string;
        freightElevator?: string;
        receptionist?: string;
        address?: string;
        notesCourier?: string;
        picPhoneCountry?: string;
        picPhone?: string;
        date?: string;
        time?: string;
        standbyDuration?: string;
      }
    | undefined;
  const showAccessQs = !!data?.buildingType && data.buildingType !== "house";
  const yesNo = (v?: string) =>
    v === "yes" ? t("order.yes") : v === "no" ? t("order.no") : dash;
  const date = data?.date
    ? new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(`${data.date}T00:00:00`))
    : dash;
  const phone =
    data?.picPhoneCountry && data?.picPhone
      ? `${dialCodeFor(data.picPhoneCountry)} ${data.picPhone}`
      : null;
  const standby =
    data?.standbyDuration === "0"
      ? t("order.puStandbyNone")
      : data?.standbyDuration
        ? `${data.standbyDuration} ${t("order.puStandbyUnit")}`
        : dash;

  // nothing filled yet (a draft that hasn't reached pickup) → one muted line
  const hasAny = !!(
    data?.picName ||
    (data?.picPhoneCountry && data?.picPhone) ||
    data?.buildingType ||
    data?.address ||
    data?.date ||
    data?.time ||
    (data?.standbyDuration && data.standbyDuration !== "") ||
    data?.notesCourier
  );

  // what identifies itself goes label-less (a contact card, an address, a
  // dated time window); what would be mute without its question keeps the
  // labelled ledger row (yes/no access answers, standby days, courier notes)
  const hasContact = !!(data?.picName || phone || data?.buildingType || data?.address);
  const hasSchedule = !!(data?.date || data?.time);
  const hasStandby = data?.standbyDuration != null && data.standbyDuration !== "";
  const hasLedger =
    (showAccessQs && (data?.freightElevator != null || data?.receptionist != null)) ||
    hasStandby ||
    !!data?.notesCourier;

  return (
    <section>
      <SectionTitle>{t("order.modPickup")}</SectionTitle>
      {!hasAny ? (
        <div className="mt-3">
          <EmptyLine />
        </div>
      ) : (
        <>
          {(hasContact || hasSchedule) && (
            <div className="mt-3 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {hasContact && (
                <SubGroup label={t("order.puGroupContact")}>
                  <div className="space-y-0.5 py-1 text-sm">
                    {data?.picName && (
                      <p className="font-medium text-foreground">{data.picName}</p>
                    )}
                    {phone && <p className="tabular-nums text-muted">{phone}</p>}
                    {data?.buildingType && (
                      <p className="text-muted">{buildingLabel(t, data.buildingType)}</p>
                    )}
                    {data?.address && <p className="text-muted">{data.address}</p>}
                  </div>
                </SubGroup>
              )}
              {hasSchedule && (
                <SubGroup label={t("order.puGroupSchedule")}>
                  <p className="py-1 text-sm font-medium tabular-nums text-foreground">
                    {data?.date && date}
                    {data?.date && data?.time && " · "}
                    {data?.time}
                  </p>
                </SubGroup>
              )}
            </div>
          )}
          {hasLedger && (
            <div className="mt-6 divide-y divide-border">
              {showAccessQs && data?.freightElevator != null && (
                <Row label={t("order.puFreightElevator")}>{yesNo(data.freightElevator)}</Row>
              )}
              {showAccessQs && data?.receptionist != null && (
                <Row label={t("order.puReceptionist")}>{yesNo(data.receptionist)}</Row>
              )}
              {hasStandby && <Row label={t("order.puStandbyLabel")}>{standby}</Row>}
              {data?.notesCourier && (
                <Row prose label={t("order.puNotesCourier")}>
                  {data.notesCourier}
                </Row>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

/**
 * Ops-produced values that aren't already surfaced elsewhere. Phase progress
 * lives in the status stepper and the timeline, so the old "pending" placeholder
 * rows (AWB pending / clearance pending) were pure duplication and are gone. This
 * shows only concrete artifacts: the picked rate while a formal quotation is still
 * pending, and the AWB once issued. The whole section hides when there's neither.
 */
function PendingCards({ order }: { order: Order }) {
  const t = useT();
  const rate = order.selectedRate;
  // "waiting for the quotation" is a promise about the future — it may only
  // be made while the order is actually there (review); once the phase moves
  // on (or the order ends) the line would contradict every other status signal
  const showRate = order.status === "review" && !order.quotation && !!rate;
  const showAwb = !!order.awb;
  if (!showRate && !showAwb) return null;

  return (
    // "what's next" only fits a promise; once the AWB exists the section is
    // simply the shipment's artifact and says so
    <Section title={t(showRate ? "order.tdNextSection" : "order.tdAwbSection")}>
      {showRate && (
        // the figure on its own line, the status sentence as prose under it —
        // a paragraph never belongs in a value cell
        <Row prose label={t("order.tdQuotationSection")}>
          <span className="block">
            <span className="font-mono font-medium tabular-nums">{formatIDR(rate!.perKg)}</span>{" "}
            <span className="text-xs text-muted-2">/ {t("order.tdPerKg")}</span>
          </span>
          <span className="mt-1 block max-w-prose text-xs leading-relaxed text-muted-2 sm:ml-auto">
            {t("order.tdQuotationPending")}
          </span>
        </Row>
      )}
      {showAwb && (
        <Row
          label={<TipLabel label={t("order.tdAwbNumber")} tip={t("order.tdAwbTip")} />}
        >
          <span className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-mono font-medium text-foreground">{order.awb}</span>
              <CopyButton value={order.awb!} />
            </span>
            {/* the AWB's whole job is being pasted into the carrier's tracker —
                hand over the link instead of making Alex build it */}
            <a
              href={`https://www.fedex.com/fedextrack/?trknbr=${order.awb!.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="link-mark text-xs font-medium"
            >
              {t("order.tdAwbTrack")}
            </a>
          </span>
        </Row>
      )}
    </Section>
  );
}
