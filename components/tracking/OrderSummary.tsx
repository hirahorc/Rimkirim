"use client";

import * as React from "react";
import {
  ClipboardList,
  UserRound,
  Package,
  FileText,
  Truck,
  ReceiptText,
  Plane,
  ShieldCheck,
} from "lucide-react";
import { useT, useLanguage } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
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

const dash = "—";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-base font-semibold tracking-tight">
        <span className="grid size-6 place-items-center rounded-md bg-brand/10 text-brand">
          <Icon className="size-3.5" />
        </span>
        {title}
      </h2>
      <div className="mt-3 divide-y divide-border">{children}</div>
    </Card>
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
      <span className="text-right text-sm">{children}</span>
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
    <div className="space-y-4">
      <EligibilityCard order={order} />
      <CustomerCard order={order} />
      <ItemsCard order={order} />
      <ComplianceCard order={order} />
      <PickupCard order={order} locale={locale} />
      {order.status !== "draft" && <PendingCards order={order} />}
      {order.status === "cancelled" && (
        <Card className="border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {t("order.tdCancelledNotice")}
        </Card>
      )}
      {isMa && (
        <p className="px-1 text-xs text-muted-2">{t("order.tdMaNote")}</p>
      )}
    </div>
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
    <Section icon={ClipboardList} title={t("order.tdEligibility")}>
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
      <Row label={t("order.coPackingCode")}>
        {packing ?? t("order.tdNotProvided")}
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

  return (
    <Section icon={UserRound} title={t("order.modCustomer")}>
      <div className="py-2">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-2">
          {t("order.ciSectionSender")}
        </p>
        <PartyRows party={data?.sender} />
      </div>
      <div className="py-2">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-2">
          {t("order.ciSectionReceiver")}
        </p>
        <PartyRows party={data?.receiver} />
      </div>
      <div className="py-2">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-2">
          {t("order.ciSectionOwner")}
        </p>
        <Row label={t("order.ciFullName")}>{val(data?.owner?.fullName)}</Row>
        <Row label={t("order.ciPhoneOrigin")}>
          {data?.owner?.phoneOriginCountry && data?.owner?.phoneOrigin
            ? `${dialCodeFor(data.owner.phoneOriginCountry)} ${data.owner.phoneOrigin}`
            : dash}
        </Row>
        <Row label={t("order.ciPhoneDestination")}>
          {data?.owner?.phoneDestinationCountry &&
          data?.owner?.phoneDestination
            ? `${dialCodeFor(data.owner.phoneDestinationCountry)} ${data.owner.phoneDestination}`
            : dash}
        </Row>
        <Row label={t("order.ciEmail")}>{val(data?.owner?.email)}</Row>
      </div>
    </Section>
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

  return (
    <Section icon={Package} title={t("order.modItems")}>
      <Row label={t("order.itCurrency")}>{currency}</Row>
      {packages.length === 0 && (
        <Row label={t("order.itPackagesHeading")}>{t("order.tdNotProvided")}</Row>
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
        return (
          <div key={i} className="py-2">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-2">
              {t("order.itPackageN")} {i + 1}
            </p>
            <Row label={t("order.itPackaging")}>{pkgTypeLabel(t, p?.packaging)}</Row>
            <Row label={t("order.tdDimensions")}>
              {val(p?.length)} × {val(p?.width)} × {val(p?.height)} cm
            </Row>
            <Row label={t("order.tdWeight")}>{val(p?.weight)} kg</Row>
            <Row label={t("order.tdChargeable")}>
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
              <div className="mt-1.5 overflow-hidden rounded-lg border border-border">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 bg-surface-2 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-2">
                  <span>{t("order.itColDescription")}</span>
                  <span className="text-right">{t("order.itColQty")}</span>
                  <span className="text-right">{t("order.itColValue")}</span>
                  <span className="text-right">{t("order.itColTotal")}</span>
                </div>
                {items.map((it, j) => (
                  <div
                    key={j}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-t border-border px-3 py-1.5 text-sm"
                  >
                    <span className="truncate">{val(it?.name)}</span>
                    <span className="text-right tabular-nums text-muted">
                      {val(it?.quantity)}
                    </span>
                    <span className="text-right tabular-nums text-muted">
                      {formatCurrency(Number(it?.value) || 0, currency)}
                    </span>
                    <span className="text-right font-medium tabular-nums">
                      {formatCurrency(
                        (Number(it?.value) || 0) * (Number(it?.quantity) || 0),
                        currency,
                      )}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border bg-surface-2 px-3 py-1.5 text-right text-sm font-medium">
                  {formatCurrency(pkgValue, currency)}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {packages.length > 0 && (
        <>
          <div className="py-2">
            <Row label={t("order.itTotalCw")}>
              {formatNumber(totalCw, 1)} kg
            </Row>
            <Row label={t("order.itTotalValue")}>
              {formatCurrency(totalValue, currency)}
            </Row>
          </div>
          {totalPrice > 0 && (
            <div className="py-2">
              <Row label={t("order.itTotalPrice")}>{formatIDR(totalPrice)}</Row>
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

  return (
    <Section icon={FileText} title={t("order.modCompliance")}>
      {entries.map(({ key, label }) => (
        <Row key={key} label={t(label!)}>
          {docs[key] ? (
            <span className="font-mono text-xs text-muted">{docs[key]}</span>
          ) : (
            <span className="text-muted-2">{t("order.tdMissing")}</span>
          )}
        </Row>
      ))}
      {(data?.otherDocs ?? []).length > 0 && (
        <div className="py-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-2">
            {t("order.coOtherDocs")}
          </p>
          {(data?.otherDocs ?? []).map((d, i) => (
            <Row key={i} label={val(d?.name)}>
              <span className="font-mono text-xs text-muted">{val(d?.file)}</span>
            </Row>
          ))}
        </div>
      )}
    </Section>
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
        address?: string;
        notesCourier?: string;
        picPhoneCountry?: string;
        picPhone?: string;
        date?: string;
        time?: string;
        standbyDuration?: string;
      }
    | undefined;
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
    <Section icon={Truck} title={t("order.modPickup")}>
      <Row label={t("order.puPicName")}>{val(data?.picName)}</Row>
      <Row label={t("order.puPicPhone")}>{phone}</Row>
      <Row label={t("order.puBuildingType")}>
        {buildingLabel(t, data?.buildingType)}
      </Row>
      <Row label={t("order.puAddress")}>{val(data?.address)}</Row>
      <Row label={t("order.puDate")}>{date}</Row>
      <Row label={t("order.puTime")}>{val(data?.time)}</Row>
      <Row label={t("order.puStandbyLabel")}>{standby}</Row>
      <Row label={t("order.puNotesCourier")}>{val(data?.notesCourier)}</Row>
    </Section>
  );
}

function PendingCards({ order }: { order: Order }) {
  const t = useT();
  const totalCw = totalChargeableWeight(
    (order.modules.items.data as { packages?: Pkg[] } | undefined)?.packages?.map(
      (p) => ({
        weight: Number(p?.weight) || 0,
        length: Number(p?.length) || 0,
        width: Number(p?.width) || 0,
        height: Number(p?.height) || 0,
        quantity: 1,
      }),
    ) ?? [],
  );
  const rate = order.selectedRate;

  return (
    <>
      <Section icon={ReceiptText} title={t("order.tdQuotationSection")}>
        {rate && (
          <Row label={t("order.tdBaseRate")}>
            <span className="font-medium">
              {formatIDR(rate.perKg)}{" "}
              <span className="text-xs font-normal text-muted-2">
                / {t("order.tdPerKg")}
              </span>
            </span>
          </Row>
        )}
        <Row label={t("order.itTotalCw")}>{formatNumber(totalCw, 1)} kg</Row>
        <p className="py-2 text-sm text-muted-2">{t("order.tdQuotationPending")}</p>
      </Section>

      <Section icon={Plane} title={t("order.tdAwbSection")}>
        <p className="py-2 text-sm text-muted-2">{t("order.tdAwbPending")}</p>
      </Section>

      <Section icon={ShieldCheck} title={t("order.stepClearance")}>
        <p className="py-2 text-sm text-muted-2">{t("order.tdClearancePending")}</p>
      </Section>
    </>
  );
}
