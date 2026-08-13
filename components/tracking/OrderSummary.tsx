"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { useT, useLanguage } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { TooltipProvider, InfoTip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
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
import {
  effectivePackingCode,
  type Order,
} from "@/lib/store/useOrderStore";

const dash = "–";

/**
 * De-boxed section: no card, no icon chip. The section title (display, dark)
 * anchors the group; the wide gap between sections vs the hairline between
 * rows carries the hierarchy — same language as the FAQ, not stacked cards.
 */
/** The one section-title style, shared so every section head reads identically. */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
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
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="shrink-0 text-xs text-muted-2">{label}</span>
      {/* tabular-nums here aligns every numeric value down the right column —
          dims, weights, dates, phone digits — and is inert on prose values. */}
      <span className="text-right text-sm tabular-nums">{children}</span>
    </div>
  );
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
      </div>
    </TooltipProvider>
  );
}

/** A row label with an inline info tooltip, for terms a first-timer won't know. */
function TipLabel({ label, tip }: { label: string; tip: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <InfoTip content={tip} />
    </span>
  );
}

function EligibilityCard({ order }: { order: Order }) {
  const t = useT();
  const a = order.answers;
  const isMa = order.context?.service === "moving-abroad";
  const yesNo = (b?: boolean) =>
    b === true ? t("order.yes") : b === false ? t("order.no") : dash;
  const packing = effectivePackingCode({
    answers: a,
    generatedPackingCode: order.generatedPackingCode,
  });

  return (
    <Section title={t("order.tdEligibility")}>
      <Row label={t("order.tdShippingPersonal")}>{yesNo(a.shippingPersonal)}</Row>
      {isMa ? (
        <Row label={t("order.tdArrived")}>{yesNo(a.arrivedAtDestination)}</Row>
      ) : (
        <>
          <Row label={t("order.tdCitizenship")}>
            {a.citizenship === "indonesian"
              ? t("order.indonesian")
              : a.citizenship === "foreigner"
                ? t("order.foreigner")
                : dash}
          </Row>
          <Row label={t("order.tdLivedLong")}>{yesNo(a.livedLongEnough)}</Row>
          <Row label={t("order.tdCanSkp")}>{yesNo(a.canApplySKP)}</Row>
          <Row label={t("order.stepClearance")}>
            {order.clearance === "personal"
              ? t("order.clPersonalTitle")
              : order.clearance === "passenger"
                ? t("order.clPassengerTitle")
                : dash}
          </Row>
        </>
      )}
      <Row
        label={
          <TipLabel label={t("order.coPackingCode")} tip={t("order.tdPackingTip")} />
        }
      >
        {packing ? <span className="font-mono">{packing}</span> : dash}
      </Row>
    </Section>
  );
}

function PartyRows({ party }: { party: Party | undefined }) {
  const t = useT();
  const phone = party?.phoneCountry && party?.phone
    ? `${dialCodeFor(party.phoneCountry)} ${party.phone}`
    : dash;
  return (
    <>
      <Row label={t("order.ciFullName")}>{val(party?.fullName)}</Row>
      <Row label={t("order.ciCountry")}>
        {party?.country ? (getCountry(party.country)?.name ?? party.country) : dash}
      </Row>
      <Row label={t("order.ciFullAddress")}>{val(party?.address)}</Row>
      <Row label={t("order.ciEmail")}>{val(party?.email)}</Row>
      <Row label={t("order.ciPhone")}>{phone}</Row>
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
          <Row label={t("order.ciFullName")}>{val(data?.owner?.fullName)}</Row>
          {/* the owner's two phones + email are optional — hide when unfilled
              rather than stacking dashes */}
          {ownerPhoneOrigin && (
            <Row label={t("order.ciPhoneOrigin")}>{ownerPhoneOrigin}</Row>
          )}
          {ownerPhoneDest && (
            <Row label={t("order.ciPhoneDestination")}>{ownerPhoneDest}</Row>
          )}
          {data?.owner?.email && (
            <Row label={t("order.ciEmail")}>{data.owner.email}</Row>
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
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted">
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
                    : t("order.tdMissing")}
                </Row>
                {items.length > 0 && (
                  // a real table: columns align natively across header/body/
                  // footer (the old per-row grids sized independently and drift
                  // as soon as a number gets wider); numeric cells never wrap.
                  <div className="mt-1.5 overflow-hidden rounded-md border border-border">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-surface-2 text-xs uppercase tracking-wide text-muted-2">
                          <th scope="col" className="px-3 py-1.5 text-left font-medium">
                            {t("order.itColDescription")}
                          </th>
                          <th scope="col" className="px-3 py-1.5 text-right font-medium">
                            {t("order.itColQty")}
                          </th>
                          <th scope="col" className="whitespace-nowrap px-3 py-1.5 text-right font-medium">
                            {t("order.itColValue")}
                          </th>
                          <th scope="col" className="px-3 py-1.5 text-right font-medium">
                            {t("order.itColTotal")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it, j) => (
                          <tr key={j} className="border-t border-border align-top">
                            <td className="px-3 py-1.5">{val(it?.name)}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums text-muted">
                              {val(it?.quantity)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-1.5 text-right font-mono tabular-nums text-muted">
                              {formatCurrency(Number(it?.value) || 0, currency)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-1.5 text-right font-mono font-medium tabular-nums">
                              {formatCurrency(
                                (Number(it?.value) || 0) * (Number(it?.quantity) || 0),
                                currency,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border bg-surface-2">
                          <td
                            colSpan={3}
                            className="px-3 py-1.5 text-right text-xs uppercase tracking-wide text-muted-2"
                          >
                            {t("order.itColTotal")}
                          </td>
                          <td className="whitespace-nowrap px-3 py-1.5 text-right font-mono text-sm font-medium tabular-nums">
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
        <>
          <div className="py-2">
            <Row label={t("order.itTotalCw")}>
              <span className="font-medium">{formatNumber(totalCw, 1)} kg</span>
            </Row>
            <Row label={t("order.itTotalValue")}>
              <span className="font-mono font-medium tabular-nums">
                {formatCurrency(totalValue, currency)}
              </span>
            </Row>
          </div>
          {totalPrice > 0 && (
            <div className="py-2">
              <Row label={t("order.itTotalPrice")}>
                <span className="font-mono font-medium tabular-nums">
                  {formatIDR(totalPrice)}
                </span>
              </Row>
            </div>
          )}
        </>
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
  const orderKeys = isMa
    ? ["passport", "visa", "flightTicket", "ktp"]
    : ["ktp", "passport", "flightTicket", "enpwp", "skp", "proofOfStay"];
  const entries = orderKeys
    .map((key) => ({ key, label: docLabelKey(key) }))
    .filter((e) => e.label);

  // The fixed doc checklist is the section's primary hairline row list; the
  // free-form "other docs" is a real sub-group beneath it — same eyebrow + spaced
  // treatment as Customer Info, so no section mixes two grouping models.
  return (
    <section>
      <SectionTitle>{t("order.modCompliance")}</SectionTitle>
      <div className="mt-3">
        <div className="divide-y divide-border">
          {entries.map(({ key, label }) => (
            <Row key={key} label={t(label!)}>
              {docs[key] ? (
                <span className="font-mono text-xs text-muted">{docs[key]}</span>
              ) : (
                <span className="text-muted-2">{t("order.tdMissing")}</span>
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

  return (
    <Section title={t("order.modPickup")}>
      <Row label={t("order.puPicName")}>{val(data?.picName)}</Row>
      <Row label={t("order.puPicPhone")}>{phone}</Row>
      <Row label={t("order.puBuildingType")}>
        {buildingLabel(t, data?.buildingType)}
      </Row>
      {showAccessQs && (
        <>
          <Row label={t("order.puFreightElevator")}>
            {yesNo(data?.freightElevator)}
          </Row>
          <Row label={t("order.puReceptionist")}>
            {yesNo(data?.receptionist)}
          </Row>
        </>
      )}
      <Row label={t("order.puAddress")}>{val(data?.address)}</Row>
      <Row label={t("order.puDate")}>{date}</Row>
      <Row label={t("order.puTime")}>{val(data?.time)}</Row>
      <Row label={t("order.puStandbyLabel")}>{standby}</Row>
      {/* courier notes are optional — omit the row entirely when empty */}
      {data?.notesCourier && (
        <Row label={t("order.puNotesCourier")}>{data.notesCourier}</Row>
      )}
    </Section>
  );
}

/**
 * The three ops-produced slots (quotation, AWB, clearance) folded into one
 * compact section — one row each, the real value when it exists, a muted
 * "pending" line otherwise. Total chargeable weight is not repeated here
 * (Items already shows it). The live QuotationCard up top owns the full
 * quotation once it arrives, so the quotation row drops out then.
 */
function PendingCards({ order }: { order: Order }) {
  const t = useT();
  const rate = order.selectedRate;
  const clearanceDone =
    order.status === "clearance" ||
    order.status === "delivery" ||
    order.status === "delivered";

  return (
    <Section title={t("order.tdNextSection")}>
      {!order.quotation && (
        <Row label={t("order.tdQuotationSection")}>
          {rate ? (
            <>
              <span className="font-mono font-medium tabular-nums">
                {formatIDR(rate.perKg)}
              </span>{" "}
              <span className="text-xs text-muted-2">
                / {t("order.tdPerKg")} · {t("order.tdQuotationPending")}
              </span>
            </>
          ) : (
            <span className="text-muted-2">{t("order.tdQuotationPending")}</span>
          )}
        </Row>
      )}
      <Row
        label={
          <TipLabel label={t("order.tdAwbSection")} tip={t("order.tdAwbTip")} />
        }
      >
        {order.awb ? (
          <span className="font-mono font-medium text-foreground">{order.awb}</span>
        ) : (
          <span className="text-muted-2">{t("order.tdAwbPending")}</span>
        )}
      </Row>
      <Row label={t("order.stepClearance")}>
        <span className="text-muted-2">
          {clearanceDone
            ? t("order.tdClearanceDone")
            : t("order.tdClearancePending")}
        </span>
      </Row>
    </Section>
  );
}
