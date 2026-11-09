"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Info, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Field } from "@/components/shared/forms/Field";
import { DialCodeSelect } from "@/components/order/DialCodeSelect";
import { getCountry } from "@/lib/data/countries";
import { placeLine, type Place } from "@/lib/data/expat-places";
import {
  emailValid,
  firstPickupIso,
  phoneValid,
  pickupDayAllowed,
  type CheckRateInput,
  type DetailsInput,
  type Pin,
} from "@/lib/order/expat-order";
import type { AddressChange } from "@/lib/store/useExpatOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { MapPinDialog } from "./MapPinDialog";

/** where the move runs from or to, as Check Rate set it, with the way back */
function ReadOnlyRoute({ label, country, place }: { label: string; country: string; place: Place | null }) {
  const t = useT();
  return (
    <div className="rounded-md bg-surface-2 px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium text-muted">{label}</p>
        <Link href="/expat-relocation/rates" className="link-mark tap-row relative text-xs">
          {t("expatOrder.details.change")}
        </Link>
      </div>
      <p className="mt-1 text-sm font-medium">{getCountry(country)?.name}</p>
      {place && <p className="text-sm text-muted">{placeLine(place)}</p>}
    </div>
  );
}

/** one side's Detail Address: the words, then the pin, both required */
function DetailAddress({
  label,
  place,
  detail,
  pin,
  changed,
  changedNote,
  onDetail,
  onPin,
}: {
  label: string;
  place: Place;
  detail: string;
  pin?: Pin;
  changed: boolean;
  changedNote: string;
  onDetail: (v: string) => void;
  onPin: (p: Pin) => void;
}) {
  const t = useT();
  const d = (k: string) => t(`expatOrder.details.${k}`);
  const [open, setOpen] = React.useState(false);
  return (
    <div className="space-y-3">
      {changed && (
        <p role="status" className="flex gap-2 rounded-md bg-info/10 px-3 py-2.5 text-sm">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-info" />
          {changedNote}
        </p>
      )}
      <Field label={label}>
        <Input value={detail} onChange={(e) => onDetail(e.target.value)} placeholder={d("detailPh")} maxLength={200} />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        {pin ? (
          <>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
              <Check aria-hidden className="size-4 text-success" strokeWidth={3} /> {d("pinned")}
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
              {d("editPin")}
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
              <MapPin /> {d("pin")}
            </Button>
            <span className="text-xs text-muted">{d("pinMissing")}</span>
          </>
        )}
      </div>
      <MapPinDialog open={open} onOpenChange={setOpen} title={label} place={place} value={pin} onConfirm={onPin} />
    </div>
  );
}

/**
 * Personal Information, the epic's fields: where from and where to as Check
 * Rate set them (read only, with the way back), both Detail Addresses with
 * their pins, then name, email, phone and the Pickup Date. Every field is
 * required; an error shows once a field is left, not on every keystroke.
 */
export function DetailsStep({
  check,
  value,
  changed,
  onChange,
}: {
  check: CheckRateInput;
  value: DetailsInput;
  changed: AddressChange;
  onChange: (patch: Partial<DetailsInput>) => void;
}) {
  const t = useT();
  const d = (k: string) => t(`expatOrder.details.${k}`);
  const [left, setLeft] = React.useState<Record<string, boolean>>({});
  const leave = (k: string) => () => setLeft((s) => ({ ...s, [k]: true }));

  const nameErr = left.name && !value.fullName.trim() ? d("required") : undefined;
  const emailErr = left.email && !emailValid(value.email) ? (value.email.trim() ? d("emailErr") : d("required")) : undefined;
  const phoneErr = left.phone && !phoneValid(value.phone) ? (value.phone.trim() ? d("phoneErr") : d("required")) : undefined;

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2">
        <ReadOnlyRoute label={d("from")} country={check.originCountry} place={check.origin} />
        <ReadOnlyRoute label={d("to")} country="ID" place={check.destination} />
      </div>

      <div className="grid gap-6 border-t border-border pt-6">
        {check.origin && (
          <DetailAddress
            label={d("originDetail")}
            place={check.origin}
            detail={value.originDetail}
            pin={value.originPin}
            changed={changed.origin}
            changedNote={d("originChanged")}
            onDetail={(originDetail) => onChange({ originDetail })}
            onPin={(originPin) => onChange({ originPin })}
          />
        )}
        {check.destination && (
          <DetailAddress
            label={d("destinationDetail")}
            place={check.destination}
            detail={value.destinationDetail}
            pin={value.destinationPin}
            changed={changed.destination}
            changedNote={d("destinationChanged")}
            onDetail={(destinationDetail) => onChange({ destinationDetail })}
            onPin={(destinationPin) => onChange({ destinationPin })}
          />
        )}
      </div>

      <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label={d("fullName")} error={nameErr}>
            <Input
              value={value.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              onBlur={leave("name")}
              placeholder={d("fullNamePh")}
              autoComplete="name"
              maxLength={120}
            />
          </Field>
        </div>
        <Field label={d("email")} error={emailErr}>
          <Input
            type="email"
            value={value.email}
            onChange={(e) => onChange({ email: e.target.value })}
            onBlur={leave("email")}
            placeholder={d("emailPh")}
            autoComplete="email"
            inputMode="email"
          />
        </Field>
        <Field label={d("phone")} error={phoneErr}>
          <PhoneField
            dialIso={value.dialIso}
            phone={value.phone}
            placeholder={d("phonePh")}
            onDial={(dialIso) => onChange({ dialIso, dialTouched: true })}
            onPhone={(phone) => onChange({ phone: phone.replace(/[^0-9 ]/g, "") })}
            onBlur={leave("phone")}
          />
        </Field>
        <div className="sm:col-span-2 sm:max-w-sm">
          <Field label={d("pickup")} hint={d("pickupHint")}>
            <PickupPicker
              value={value.pickupDate}
              onChange={(pickupDate) => onChange({ pickupDate })}
              placeholder={d("pickupPh")}
              ariaLabel={d("pickup")}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

/** the dial code glued to the number; Field's wiring lands on the number */
function PhoneField({
  dialIso,
  phone,
  placeholder,
  onDial,
  onPhone,
  onBlur,
  ...wiring
}: {
  dialIso: string;
  phone: string;
  placeholder: string;
  onDial: (iso: string) => void;
  onPhone: (v: string) => void;
  onBlur: () => void;
} & Pick<React.InputHTMLAttributes<HTMLInputElement>, "id" | "aria-invalid" | "aria-describedby">) {
  return (
    <div className="flex gap-2">
      <div className="w-28 shrink-0">
        <DialCodeSelect value={dialIso} onChange={onDial} />
      </div>
      <Input
        {...wiring}
        className="flex-1 tabular-nums"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={phone}
        onChange={(e) => onPhone(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
      />
    </div>
  );
}

/** the Pickup Date: weekdays only, from three days out (epic, section 7) */
function PickupPicker({
  value,
  onChange,
  placeholder,
  ariaLabel,
  id,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
  id?: string;
}) {
  return (
    <DatePicker
      id={id}
      value={value}
      onChange={onChange}
      min={firstPickupIso()}
      isDateDisabled={(iso) => !pickupDayAllowed(iso)}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
    />
  );
}
