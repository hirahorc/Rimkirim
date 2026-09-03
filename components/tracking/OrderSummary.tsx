"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Download, Eye, FileCheck2, FileText } from "lucide-react";
import { CollapseHeight } from "@/components/ui/disclosure";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
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
import { WA_URL } from "@/lib/contact";

const dash = "–";
/** Carrier tracking deep-link for an AWB — shared by OrderDetail's status
 *  tier (the live copy) and this record's archival row. */
export function fedexTrackUrl(awb: string): string {
  return `https://www.fedex.com/fedextrack/?trknbr=${awb.replace(/\D/g, "")}`;
}

/**
 * De-boxed section: no card, no icon chip. The section title (display, dark)
 * anchors the group; the wide gap between sections vs the hairline between
 * rows carries the hierarchy — same language as the FAQ, not stacked cards.
 */
/** The one section-title style, shared so every section head reads identically. */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    // Title role (20/600, tracking-tight): a full step above the 12px eyebrows
    // and the 14px values, so the record can be skimmed section by section.
    // h3, not h2: the "Detail Pesanan" tier label above is the h2, and these
    // sections belong to it in the outline
    <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
      {children}
    </h3>
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
      {/* Readout Grey, one step darker than the Dim-Grey row labels below —
          the Label-Ramp Rule: same-colour parent and child read as one list */}
      <p className="mb-1.5 font-display text-xs font-semibold uppercase tracking-wide text-muted">
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

/** The four measurement photos, in ledger order. */
const PHOTO_ROW = [
  ["weight", "order.itPhotoWeight"],
  ["length", "order.itPhotoLength"],
  ["width", "order.itPhotoWidth"],
  ["height", "order.itPhotoHeight"],
] as const;

/**
 * The one media lightbox: a trigger (whatever `children` renders) opening the
 * image as a centred modal at every size. The description is for screen
 * readers only; the picture is the content.
 */
function ImageLightbox({
  label,
  dataUrl,
  className,
  children,
}: {
  label: string;
  dataUrl: string;
  className?: string;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <Dialog>
      <DialogTrigger aria-label={`${t("order.viewFile")}: ${label}`} className={className}>
        {children}
      </DialogTrigger>
      <DialogContent sheet={false} className="max-w-3xl p-0">
        <DialogHeader className="pb-4">
          <DialogTitle className="truncate pr-8 text-base font-medium sm:text-base">
            {label}
          </DialogTitle>
          <DialogDescription className="sr-only">{t("order.lightboxDesc")}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-auto bg-surface-2 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUrl}
            alt={label}
            decoding="async"
            className="mx-auto max-h-[72dvh] w-auto min-w-[min(16rem,100%)] rounded-sm object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** One measurement photo as a mini thumbnail opening the media lightbox. */
function PhotoThumb({ label, dataUrl }: { label: string; dataUrl: string }) {
  return (
    <ImageLightbox
      label={label}
      dataUrl={dataUrl}
      // tap-row: real height to 44px on coarse pointers — the thumbs sit
      // gap-1.5 apart, too tight for an invisible .tap-target overlay
      className="tap-row h-10 w-12 shrink-0 overflow-hidden rounded-sm border border-border transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="size-full object-cover"
      />
    </ImageLightbox>
  );
}

/** A stored "YYYY-MM-DD" as a local date, the dash when missing or malformed. */
function formatIsoDay(fmt: Intl.DateTimeFormat, iso?: string): string {
  if (!iso) return dash;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? dash : fmt.format(d);
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
            <p className="max-w-[60ch] text-xs leading-relaxed text-muted-2">
              {t("order.tdWrongPre")}{" "}
              {/* tap-row lifts the inline link to 44px on coarse pointers
                  only — the one door out of a wrong address deserves a floor */}
              <a
                href={WA_URL}
                target="_blank"
                rel="noreferrer"
                className="link-mark tap-row"
              >
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
        // stacked, like the owner block's contact lines: joined on one line
        // the pair wraps mid-phone in a three-column grid, and a dialled
        // number split across lines stops reading as one number
        <div className="space-y-0.5 pt-1">
          {party?.email && <p className="break-words text-muted">{party.email}</p>}
          {phone && <p className="tabular-nums text-muted">{phone}</p>}
        </div>
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
  // whether ANY package carries data — the totals footer gates on this
  const anyPackageData = packages.some(
    (p) =>
      Number(p?.weight) > 0 ||
      Number(p?.length) > 0 ||
      Number(p?.width) > 0 ||
      Number(p?.height) > 0 ||
      (p?.items ?? []).some((it) => (it?.name ?? "").trim()),
  );

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
      {/* the artifact of the goods leads the meta rows; the currency footnote
          sits last, right against the tables whose figures it qualifies */}
      <Row
        prose
        label={<TipLabel label={t("order.coPackingCode")} tip={t("order.tdPackingTip")} />}
      >
        {packing ? (
          // one line on sm (code · copy · the two PDF actions) — the stacked
          // desktop form left a tall row that was mostly empty left gutter
          <span className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-end">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-mono">{packing}</span>
              <CopyButton value={packing} />
            </span>
            {pdfReady && (
              <span className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="tap-row"
                  loading={previewBusy}
                  onClick={() => previewPdf(ciplInput())}
                >
                  {!previewBusy && <Eye className="size-3.5" />}
                  {t("order.previewPdf")}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="tap-row"
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
      <Row label={t("order.itCurrency")}>{currency}</Row>
      {packages.length === 0 && (
        <Row label={t("order.itPackagesHeading")}>{dash}</Row>
      )}
      {manyPackages && (
        // the packages group head, mirroring the order form's: name + count on
        // the left, the expand/collapse control anchored to the group it acts
        // on — not floating in a ledger row of its own. Generous air above,
        // snug to its rows below: the one loose interval in a tight ledger.
        <div className="flex items-center justify-between gap-2 pb-1 pt-4">
          <p className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
            {t("order.itPackagesHeading")}
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium tabular-nums text-muted">
              {packages.length}
            </span>
          </p>
          <button
            type="button"
            onClick={anyOpen ? collapseAll : expandAll}
            className="tap-row -my-2 inline-flex items-center gap-1 rounded-sm py-2 text-xs text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
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
        // one-line summary when collapsed (same shape as the order form) —
        // built as nodes, not a joined string: money is mono (Numbers-Are-
        // Mono), and the dims speak the same formatNumber + "cm" convention
        // as the expanded spec line five lines below
        const itemCount = items.filter((it) => (it?.name ?? "").trim()).length;
        const hasAny =
          dims.weight > 0 ||
          dims.length > 0 ||
          dims.width > 0 ||
          dims.height > 0 ||
          itemCount > 0;
        const summaryParts: React.ReactNode[] = [
          dims.weight > 0 && `${formatNumber(dims.weight, 1, locale)} kg`,
          (dims.length > 0 || dims.width > 0 || dims.height > 0) &&
            `${formatNumber(dims.length, 1, locale)} × ${formatNumber(dims.width, 1, locale)} × ${formatNumber(dims.height, 1, locale)} cm`,
          itemCount > 0 &&
            `${itemCount} ${t(itemCount === 1 ? "order.itItemWordOne" : "order.itItemsWord")}`,
          pkgValue > 0 && (
            <span key="value" className="font-mono">
              {formatCurrency(pkgValue, currency, locale)}
            </span>
          ),
        ].filter(Boolean);
        const eyebrow = (
          // the sub-group eyebrow tier (SENDER / RECEIVER / PAKET N): same
          // voice as the form's package heads, Readout Grey per the
          // Label-Ramp so it parents the Dim-Grey row labels below
          <span className="shrink-0 font-display text-xs font-semibold uppercase tracking-wider text-muted">
            {t("order.itPackageN")} {i + 1}
          </span>
        );
        // an all-empty package has nothing to disclose: one quiet line, no
        // chevron promising more, no duplicated "Belum diisi" in a body
        if (!hasAny)
          return (
            <div key={i} className="flex items-center gap-2 py-2.5">
              <span className="size-4 shrink-0" aria-hidden />
              {eyebrow}
              <span className="truncate text-xs text-muted">
                {t("order.itPackageEmpty")}
              </span>
            </div>
          );
        return (
          <div key={i} className="py-2.5">
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={open}
              aria-controls={`pkg-body-${i}`}
              aria-label={`${t("order.itPackageN")} ${i + 1}`}
              aria-describedby={`pkg-summary-${i}`}
              className="tap-row -my-1 flex w-full items-center gap-2 rounded-sm py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
            >
              {/* swap, never rotate — the shared disclosure idiom */}
              {open ? (
                <ChevronUp className="size-4 shrink-0 text-muted" />
              ) : (
                <ChevronDown className="size-4 shrink-0 text-muted" />
              )}
              {eyebrow}
              {/* the one-line summary stays put when open, so the line you
                  scanned is the line you expanded; a step darker than its
                  eyebrow — it is data, the eyebrow is the label */}
              <span id={`pkg-summary-${i}`} className="truncate text-xs text-muted">
                {summaryParts.map((p, j) => (
                  <React.Fragment key={j}>
                    {j > 0 && " · "}
                    {p}
                  </React.Fragment>
                ))}
              </span>
            </button>
            {/* body stays mounted and collapses with the shared disclosure
                motion (DESIGN.md, "The disclosure open") */}
            <CollapseHeight open={open} id={`pkg-body-${i}`}>
              <div className="mt-1">
                <>
                {/* the package's physique reads itself — a packaging name, an
                    L×W×H in cm, a kg figure — so it goes label-less in one spec
                    line (the same move as Customer Info). What stays in the
                    ledger genuinely needs its label: a second kg figure is
                    mute without "chargeable", and a photo status without its
                    subject. Boolean(), not a bare && chain: a chain of falsy
                    numbers resolves to 0 and React renders the character */}
                {Boolean(
                  p?.packaging ||
                    dims.length ||
                    dims.width ||
                    dims.height ||
                    dims.weight,
                ) && (
                  <p className="py-2 text-sm text-muted">
                    {[
                      p?.packaging && pkgTypeLabel(t, p.packaging),
                      // same formatter as the collapsed summary line: one
                      // decimal convention for the same figure, five lines apart
                      (dims.length > 0 || dims.width > 0 || dims.height > 0) &&
                        `${formatNumber(dims.length, 1, locale)} × ${formatNumber(dims.width, 1, locale)} × ${formatNumber(dims.height, 1, locale)} cm`,
                      dims.weight > 0 &&
                        `${formatNumber(dims.weight, 1, locale)} kg`,
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
                  {/* the photos ARE the evidence this record exists to hold:
                      show them, don't assert them */}
                  {p?.photos && Object.keys(p.photos).length > 0 ? (
                    <span className="flex flex-wrap justify-end gap-1.5">
                      {PHOTO_ROW.map(([key, labelKey]) =>
                        typeof p.photos?.[key] === "string" &&
                        (p.photos[key] as string).startsWith("data:image/") ? (
                          <PhotoThumb
                            key={key}
                            label={t(labelKey)}
                            dataUrl={p.photos[key] as string}
                          />
                        ) : null,
                      )}
                    </span>
                  ) : (
                    t("order.tdMissingOptional")
                  )}
                </Row>
                {items.length > 0 && (
                  // a real table: columns align natively across header/body/
                  // footer (the old per-row grids sized independently and drift
                  // as soon as a number gets wider); numeric cells never wrap.
                  // same ledger language as the rows above: hairlines, no box.
                  // overflow-x-auto is the fence: three nowrap mono columns
                  // with big IDR values must scroll here, never the page
                  <div className="mt-1.5 overflow-x-auto border-t border-border pt-1">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="text-xs text-muted-2">
                          {/* the description column soaks up all slack, so the
                              three numeric columns cluster at the right edge
                              instead of drifting across the full measure */}
                          <th scope="col" className="w-full py-1.5 pr-3 text-left font-medium">
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
                              {formatCurrency(Number(it?.value) || 0, currency, locale)}
                            </td>
                            <td className="whitespace-nowrap py-1.5 pl-3 text-right font-mono font-medium tabular-nums">
                              {formatCurrency(
                                (Number(it?.value) || 0) * (Number(it?.quantity) || 0),
                                currency,
                                locale,
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
                            {formatCurrency(pkgValue, currency, locale)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
                </>
              </div>
            </CollapseHeight>
          </div>
        );
      })}
      {packages.length > 0 && anyPackageData && (
        // totals footer: darker labels + heavier values so the shipment summary
        // reads as the closing line of the ledger, not one more package row —
        // and only when there is anything to sum: "0 kg / US$0,00" under the
        // closing rule would assert figures for nothing
        <div className="divide-y divide-border border-t-2 border-t-foreground/80 pt-1">
          <Row label={<span className="text-muted">{t("order.itTotalCw")}</span>}>
            <span className="text-base font-medium">
              {formatNumber(totalCw, 1, locale)} kg
            </span>
          </Row>
          <Row label={<span className="text-muted">{t("order.itTotalValue")}</span>}>
            <span className="font-mono text-base font-medium">
              {formatCurrency(totalValue, currency, locale)}
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
                <p className="mt-1 max-w-[60ch] text-xs leading-relaxed text-muted-2 sm:ml-auto sm:text-right">
                  {t("order.tdEstimateSuperseded")}
                </p>
              </div>
            ) : (
              <div className="py-2">
                <div className="flex items-start justify-between gap-4">
                  <span className="shrink-0 text-xs font-medium text-foreground">
                    {t("order.itTotalPrice")}
                  </span>
                  {/* the one lime mark in the record (Marker Rule: fill behind
                      ink) — the figure a customer comes back to check. card-mark,
                      not hero-mark: the hero's budget stays the hero's */}
                  <span className="card-mark font-mono text-lg font-semibold tabular-nums">
                    {formatIDR(totalPrice)}
                  </span>
                </div>
                {/* capped measure: at full width this caveat ran ~120ch */}
                <p className="mt-1 max-w-[60ch] text-xs leading-relaxed text-muted-2 sm:ml-auto sm:text-right">
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
  emptyTone = "action",
}: {
  label: string;
  fileName?: string | null;
  dataUrl?: string | null;
  /** the empty state, always "not uploaded" in some form */
  emptyWord?: string;
  /** optional second line: when the missing doc is actually due */
  dueWord?: string;
  /** "your move" purple while the missing doc is a live to-do; neutral once
      it's moot (draft, the phase it served has passed, or the order ended) */
  emptyTone?: "action" | "neutral";
}) {
  const t = useT();
  const isImage = !!dataUrl && dataUrl.startsWith("data:image/");
  const frame =
    "grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-md border";
  const interactive =
    "border-border bg-surface-2 transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50";
  const warn = emptyTone === "action";

  const caption = (
    <span className="mt-1.5 block">
      <span className="block text-xs font-medium text-foreground">{label}</span>
      {fileName ? (
        <span className="block truncate font-mono text-xs text-muted-2">{fileName}</span>
      ) : (
        <>
          {/* one state, one colour at a time — and the words wear the status
              INK (Tint-15: the ink clears 4.5:1 where the raw hue doesn't);
              the icon and the dashed "add" border keep the raw hue */}
          <span
            className={cn("block text-xs", warn ? "text-accent-ink" : "text-muted-2")}
          >
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
              ? "border-accent/50 bg-accent/5 text-accent"
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
        <ImageLightbox label={fileName} dataUrl={dataUrl!} className={cn(frame, interactive)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUrl!}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        </ImageLightbox>
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
            <DialogDescription className="text-sm text-muted">
              {t("order.previewUnavailable")}
            </DialogDescription>
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

/** The phase index each doc must exist by: pickup docs by pickup (2),
 *  everything else by clearance (4). */
const docDeadlineIdx = (noteKey: string | undefined) =>
  noteKey === "order.coBeforePickup" ? 2 : 4;

function docStillDue(noteKey: string | undefined, status: Order["status"]): boolean {
  const idx = (ACTIVE_PHASES as readonly string[]).indexOf(status);
  if (idx === -1) return false; // draft / delivered / cancelled
  return idx <= docDeadlineIdx(noteKey);
}

/** Urgency follows proximity, not mere relevance: a missing doc speaks
 *  "your move" purple only when its deadline phase is current or next. Before that the
 *  words already say "menyusul" — amber four phases early made the colour
 *  contradict them, and lit six alarms on day one. */
function docUrgent(noteKey: string | undefined, status: Order["status"]): boolean {
  const idx = (ACTIVE_PHASES as readonly string[]).indexOf(status);
  if (idx === -1) return false;
  const deadline = docDeadlineIdx(noteKey);
  return idx >= deadline - 1 && idx <= deadline;
}

/** How many compliance docs are an URGENT to-do (missing, deadline current or
 *  next) — the number OrderDetail surfaces in the status tier as a link down
 *  here. Follows docUrgent, so the banner never reports six standing to-dos
 *  on day one. */
export function dueComplianceDocsCount(order: Order): number {
  const data = order.modules.compliance.data as
    | { docs?: Record<string, string> }
    | undefined;
  const docs = data?.docs ?? {};
  const isMa = order.context?.service === "moving-abroad";
  const specs = (isMa ? EXPORT_DOCS : BFG_DOCS).filter(
    (d) => !d.personalOnly || order.clearance === "personal",
  );
  return specs.filter((d) => !docs[d.key] && docUrgent(d.noteKey, order.status))
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
      className="target-flash -m-2 scroll-mt-24 rounded-xs p-2 outline-none"
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
              // amber by proximity, not relevance: a doc due at clearance
              // stays neutral (with its "menyusul" line) until the shipment
              // is actually approaching clearance
              emptyTone={docUrgent(spec.noteKey, order.status) ? "action" : "neutral"}
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
              // the words say "optional", so the frame must not shout
              emptyTone="neutral"
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
  const dateFmt = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }),
    [locale],
  );
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
  const date = formatIsoDay(dateFmt, data?.date);
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
              href={fedexTrackUrl(order.awb!)}
              target="_blank"
              rel="noreferrer"
              className="link-mark tap-row text-xs font-medium"
            >
              {t("order.tdAwbTrack")}
            </a>
          </span>
        </Row>
      )}
    </Section>
  );
}
