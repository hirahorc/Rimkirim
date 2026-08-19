"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { useT, useLanguage } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
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
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
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

/** A group/section with nothing filled in yet: one muted line, not a stack of dashes. */
function EmptyLine() {
  const t = useT();
  return <p className="py-2 text-sm text-muted-2">{t("order.tdNotFilled")}</p>;
}

/** Empty-string/null/undefined → em-dash, otherwise the string form. */
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

  return (
    // lead with the substance a customer actually verifies (who/where → what →
    // when → docs); the eligibility questionnaire replay is demoted near the
    // end. wide gap between de-boxed sections carries the grouping.
    <TooltipProvider delayDuration={150}>
      <div className="space-y-10">
        <CustomerCard order={order} />
        <ItemsCard order={order} />
        <PickupCard order={order} locale={locale} />
        <ComplianceCard order={order} />
        <EligibilityCard order={order} />
        {order.status !== "draft" && <PendingCards order={order} />}
        {order.status === "cancelled" && (
          <Card className="border-danger/40 bg-danger/10 p-4 text-sm text-danger">
            {t("order.tdCancelledNotice")}
          </Card>
        )}
        {isMa && (
          <p className="text-xs text-muted-2">{t("order.tdMaNote")}</p>
        )}
        {/* the record is read-only, but a customer who spots a wrong address
            needs a door: the assistant, not a dead end */}
        {order.status !== "cancelled" && order.status !== "delivered" && (
          <p className="text-xs leading-relaxed text-muted-2">
            {t("order.tdWrongPre")}{" "}
            <a href={WA_URL} target="_blank" rel="noreferrer" className="link-mark">
              {t("order.tdWrongLink")}
            </a>{" "}
            {t("order.tdWrongPost")}
          </p>
        )}
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

function EligibilityCard({ order }: { order: Order }) {
  const t = useT();
  const a = order.answers;
  const isMa = order.context?.service === "moving-abroad";
  const packing = effectivePackingCode({
    answers: a,
    generatedPackingCode: order.generatedPackingCode,
  });

  // Condensed to the outcomes that matter as a record — the clearance path and the
  // packing code. The gating yes/no answers (personal goods, lived-long, SKP,
  // arrived) are resolved the moment the order has a path, so they'd only be noise.
  const citizenship =
    a.citizenship === "indonesian"
      ? t("order.indonesian")
      : a.citizenship === "foreigner"
        ? t("order.foreigner")
        : null;
  const clearancePath =
    order.clearance === "personal"
      ? t("order.clPersonalTitle")
      : order.clearance === "passenger"
        ? t("order.clPassengerTitle")
        : null;

  return (
    <Section title={t("order.tdEligibility")}>
      {!isMa && citizenship && (
        <Row label={t("order.tdCitizenship")}>{citizenship}</Row>
      )}
      {!isMa && clearancePath && (
        <Row label={t("order.stepClearance")}>{clearancePath}</Row>
      )}
      <Row
        label={
          <TipLabel label={t("order.coPackingCode")} tip={t("order.tdPackingTip")} />
        }
      >
        {packing ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="font-mono">{packing}</span>
            <CopyButton value={packing} />
          </span>
        ) : (
          dash
        )}
      </Row>
    </Section>
  );
}

function PartyRows({ party }: { party: Party | undefined }) {
  const t = useT();
  const phone =
    party?.phoneCountry && party?.phone
      ? `${dialCodeFor(party.phoneCountry)} ${party.phone}`
      : null;
  const country = party?.country
    ? (getCountry(party.country)?.name ?? party.country)
    : null;
  // only rows with a real value — a half-empty party shouldn't stack dashes
  const rows: [string, React.ReactNode, boolean?][] = [];
  if (party?.fullName) rows.push([t("order.ciFullName"), party.fullName]);
  if (country) rows.push([t("order.ciCountry"), country]);
  if (party?.address) rows.push([t("order.ciFullAddress"), party.address, true]);
  if (party?.email) rows.push([t("order.ciEmail"), party.email]);
  if (phone) rows.push([t("order.ciPhone"), phone]);

  if (rows.length === 0) return <EmptyLine />;
  return (
    <>
      {rows.map(([label, value, prose]) => (
        <Row key={label} label={label} prose={prose}>
          {value}
        </Row>
      ))}
    </>
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

  // Three peer parties, each a real sub-group: eyebrow + a hairline row list,
  // separated by space rather than a single divider, so the groups stay distinct
  // while every row keeps the same ledger rhythm as the rest of the record.
  return (
    <section>
      <SectionTitle>{t("order.modCustomer")}</SectionTitle>
      <div className="mt-3 space-y-6">
        <SubGroup label={t("order.ciSectionSender")}>
          <PartyRows party={data?.sender} />
        </SubGroup>
        <SubGroup label={t("order.ciSectionReceiver")}>
          <PartyRows party={data?.receiver} />
        </SubGroup>
        <SubGroup label={t("order.ciSectionOwner")}>
          {/* every owner field is optional — show only what's filled, and a single
              muted line when the whole group is empty, never a stack of dashes */}
          {!owner?.fullName && !ownerPhoneOrigin && !ownerPhoneDest && !owner?.email ? (
            <EmptyLine />
          ) : (
            <>
              {owner?.fullName && (
                <Row label={t("order.ciFullName")}>{owner.fullName}</Row>
              )}
              {ownerPhoneOrigin && (
                <Row label={t("order.ciPhoneOrigin")}>{ownerPhoneOrigin}</Row>
              )}
              {ownerPhoneDest && (
                <Row label={t("order.ciPhoneDestination")}>{ownerPhoneDest}</Row>
              )}
              {owner?.email && <Row label={t("order.ciEmail")}>{owner.email}</Row>}
            </>
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
  // Auto default: ≤3 open, >3 collapsed to summaries (the totals below never
  // collapse — they are what the collapsing is for). Read-only, so no
  // validation/error-expand concern the order form has to handle.
  const manyPackages = packages.length > 3;
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

  return (
    <Section title={t("order.modItems")}>
      <Row label={t("order.itCurrency")}>{currency}</Row>
      {packages.length === 0 && (
        <Row label={t("order.itPackagesHeading")}>{dash}</Row>
      )}
      {manyPackages && (
        <div className="flex justify-end py-2">
          <button
            type="button"
            onClick={anyOpen ? collapseAll : expandAll}
            className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
          >
            <ChevronDown
              className={cn("size-3.5 transition-transform", !anyOpen && "-rotate-90")}
            />
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
              dims.weight > 0 && `${formatNumber(dims.weight)}kg`,
              (dims.length > 0 || dims.width > 0 || dims.height > 0) &&
                `${dims.length}×${dims.width}×${dims.height}`,
              itemCount > 0 && `${itemCount} ${t("order.itItemsWord")}`,
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
              className="flex w-full items-center gap-2 text-left"
            >
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted transition-transform",
                  !open && "-rotate-90",
                )}
              />
              <span className="shrink-0 text-sm font-medium text-foreground">
                {t("order.itPackageN")} {i + 1}
              </span>
              {!open && (
                <span className="truncate text-xs text-muted-2">{summary}</span>
              )}
            </button>
            {open && (
              <div className="mt-1">
                <Row label={t("order.itPackaging")}>{pkgTypeLabel(t, p?.packaging)}</Row>
                <Row label={t("order.tdDimensions")}>
                  {val(p?.length)} × {val(p?.width)} × {val(p?.height)} cm
                </Row>
                <Row label={t("order.tdWeight")}>{val(p?.weight)} kg</Row>
                <Row
                  label={
                    <TipLabel label={t("order.tdChargeable")} tip={t("pkg.chgTooltip")} />
                  }
                >
                  {formatNumber(cw, 1)} kg
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
                            {t("order.itColTotal")}
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
            )}
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
            <span className="text-base font-medium">{formatNumber(totalCw, 1)} kg</span>
          </Row>
          <Row label={<span className="text-muted">{t("order.itTotalValue")}</span>}>
            <span className="font-mono text-base font-medium">
              {formatCurrency(totalValue, currency)}
            </span>
          </Row>
          {totalPrice > 0 && (
            <div className="py-2">
              <div className="flex items-start justify-between gap-4">
                <span className="shrink-0 text-xs font-medium text-foreground">
                  {t("order.itTotalPrice")}
                </span>
                <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                  {formatIDR(totalPrice)}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-2 sm:text-right">
                {t("order.itEstimateNote")}
              </p>
            </div>
          )}
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

function ComplianceCard({ order }: { order: Order }) {
  const t = useT();
  const data = order.modules.compliance.data as
    | { docs?: Record<string, string>; otherDocs?: { name?: string; file?: string }[] }
    | undefined;
  const docs = data?.docs ?? {};
  const isMa = order.context?.service === "moving-abroad";
  // the same spec the form uses, so the record shows exactly the docs this
  // route asks for (Passenger Goods never sees SKP / Proof of Stay)
  const specs = (isMa ? EXPORT_DOCS : BFG_DOCS).filter(
    (d) => !d.personalOnly || order.clearance === "personal",
  );
  const entries = specs
    .map((d) => ({ key: d.key, label: docLabelKey(d.key), spec: d }))
    .filter((e) => e.label);
  // what an empty slot means, in words: required now, due later, or optional
  const emptyWord = (spec: (typeof specs)[number]) =>
    spec.required
      ? t("order.tdMissing")
      : spec.noteKey === "order.coBeforePickup"
        ? t("order.tdLaterPickup")
        : spec.noteKey === "order.coBeforeClearance"
          ? t("order.tdLaterClearance")
          : t("order.tdMissingOptional");

  // The fixed doc checklist is the section's primary hairline row list; the
  // free-form "other docs" is a real sub-group beneath it — same eyebrow + spaced
  // treatment as Customer Info, so no section mixes two grouping models.
  return (
    <section>
      <SectionTitle>{t("order.modCompliance")}</SectionTitle>
      <div className="mt-3">
        <div className="divide-y divide-border">
          {entries.map(({ key, label, spec }) => (
            <Row key={key} label={t(label!)}>
              {docs[key] ? (
                <span className="font-mono text-xs text-muted">{docs[key]}</span>
              ) : (
                <span className={cn(spec.required ? "text-warning" : "text-muted-2")}>
                  {emptyWord(spec)}
                </span>
              )}
            </Row>
          ))}
        </div>
        {(data?.otherDocs ?? []).length > 0 && (
          <div className="mt-6">
            <SubGroup label={t("order.coOtherDocs")}>
              {(data?.otherDocs ?? []).map((d, i) => (
                <Row key={i} label={val(d?.name)}>
                  <span className="font-mono text-xs text-muted">{val(d?.file)}</span>
                </Row>
              ))}
            </SubGroup>
          </div>
        )}
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
      : dash;
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

  return (
    <Section title={t("order.modPickup")}>
      {!hasAny ? (
        <EmptyLine />
      ) : (
        <>
          {data?.picName && <Row label={t("order.puPicName")}>{data.picName}</Row>}
          {phone !== dash && <Row label={t("order.puPicPhone")}>{phone}</Row>}
          {data?.buildingType && (
            <Row label={t("order.puBuildingType")}>
              {buildingLabel(t, data.buildingType)}
            </Row>
          )}
          {showAccessQs && data?.freightElevator != null && (
            <Row label={t("order.puFreightElevator")}>{yesNo(data.freightElevator)}</Row>
          )}
          {showAccessQs && data?.receptionist != null && (
            <Row label={t("order.puReceptionist")}>{yesNo(data.receptionist)}</Row>
          )}
          {data?.address && (
            <Row prose label={t("order.puAddress")}>
              {data.address}
            </Row>
          )}
          {data?.date && <Row label={t("order.puDate")}>{date}</Row>}
          {data?.time && <Row label={t("order.puTime")}>{data.time}</Row>}
          {data?.standbyDuration != null && data.standbyDuration !== "" && (
            <Row label={t("order.puStandbyLabel")}>{standby}</Row>
          )}
          {data?.notesCourier && (
            <Row prose label={t("order.puNotesCourier")}>
              {data.notesCourier}
            </Row>
          )}
        </>
      )}
    </Section>
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
  const showRate = !order.quotation && !!rate;
  const showAwb = !!order.awb;
  if (!showRate && !showAwb) return null;

  return (
    <Section title={t("order.tdNextSection")}>
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
          label={<TipLabel label={t("order.tdAwbSection")} tip={t("order.tdAwbTip")} />}
        >
          <span className="font-mono font-medium text-foreground">{order.awb}</span>
        </Row>
      )}
    </Section>
  );
}
