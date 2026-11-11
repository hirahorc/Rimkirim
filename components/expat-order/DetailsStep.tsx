"use client";

import * as React from "react";
import Link from "next/link";
import { Info, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Field } from "@/components/shared/forms/Field";
import { DialCodeSelect } from "@/components/order/DialCodeSelect";
import { getCountry } from "@/lib/data/countries";
import { placeLine, type Place } from "@/lib/data/expat-places";
import {
  addressReady,
  emailValid,
  firstPickupIso,
  phoneValid,
  pickupDayAllowed,
  type CheckRateInput,
  type DetailsInput,
} from "@/lib/order/expat-order";
import type { AddressChange } from "@/lib/store/useExpatOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { AddressField } from "./AddressField";

type Side = "origin" | "destination";

/** one side's Address as it's edited: the place and its Detail Address */
interface AddressDraft {
  place: Place | null;
  detail: string;
}

/**
 * A side's Address being changed, in the card's own place: the Address
 * searched again (inside its country, which set the rate and stays) and its
 * Detail Address. Nothing is kept until Save; Cancel leaves the card as it
 * was. A white plane with a hairline, so its Panel 2 fields read (the card
 * it replaces is Panel 2 itself).
 */
function AddressEditor({
  side,
  label,
  country,
  value,
  onSave,
  onCancel,
}: {
  side: Side;
  label: string;
  country: string;
  value: AddressDraft;
  onSave: (next: AddressDraft & { place: Place }) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const d = (k: string) => t(`expatOrder.details.${k}`);
  const r = (k: string) => t(`expatOrder.rates.${k}`);
  const [draft, setDraft] = React.useState<AddressDraft>(value);
  const [tried, setTried] = React.useState(false);
  const fields = React.useRef<HTMLDivElement>(null);

  // it opens on the Address, the thing "Change" was pressed to change
  React.useEffect(() => {
    fields.current?.querySelector("input")?.focus();
  }, []);

  // a place without a postal code is refused at once, an empty field once Save is tried
  const placeErr =
    draft.place && !draft.place.postalCode ? r("addressNoPostal") : tried && !draft.place ? r("addressPick") : undefined;

  return (
    <form
      noValidate
      aria-label={label}
      className="rounded-md border border-border-strong bg-background px-4 py-4 sm:px-5"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (addressReady(draft.place)) onSave({ place: draft.place, detail: draft.detail.trim() });
      }}
    >
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium">{getCountry(country)?.name}</p>
      {/* the origin country set the rate: it changes where the rate does */}
      {side === "origin" && (
        <p className="mt-0.5 text-xs text-muted">
          {d("otherCountry")}{" "}
          <Link href="/expat-relocation/rates" className="link-mark">
            {d("checkAgain")}
          </Link>
        </p>
      )}

      <div ref={fields} className="mt-4 grid gap-4">
        <Field label={r("address")} hint={placeErr ? undefined : r("addressHint")} error={placeErr}>
          <AddressField
            country={country}
            value={draft.place}
            onChange={(place) => setDraft((s) => ({ ...s, place }))}
            invalid={!!placeErr}
          />
        </Field>
        <Field label={d(side === "origin" ? "originDetail" : "destinationDetail")}>
          <Input
            value={draft.detail}
            onChange={(e) => setDraft((s) => ({ ...s, detail: e.target.value }))}
            placeholder={d("detailPh")}
            maxLength={200}
          />
        </Field>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {d("cancel")}
        </Button>
        {/* never lime: the page's one lime is the plan's own action */}
        <Button type="submit" variant="secondary">
          {d("save")}
        </Button>
      </div>
    </form>
  );
}

/**
 * One side of the move, as a card: where from or where to as Check Rate set
 * it, with its Detail Address once it's given. "Change" turns the card into
 * its own editor, in place and across both columns (AddressEditor), so an
 * Address is changed here, not back on Check Rate. Each side's Detail
 * Address is optional and nothing else on the page asks for it, so until
 * it's in the card offers it, with what it's for.
 */
function AddressCard({
  side,
  label,
  country,
  value,
  note,
  onSave,
}: {
  side: Side;
  label: string;
  country: string;
  value: AddressDraft;
  /** said on the card when Check Rate moved its Address and cleared its detail */
  note?: string;
  onSave: (next: AddressDraft & { place: Place }) => void;
}) {
  const t = useT();
  const d = (k: string) => t(`expatOrder.details.${k}`);
  const [editing, setEditing] = React.useState(false);
  const change = React.useRef<HTMLButtonElement>(null);
  // closing the editor hands focus back to where it was opened from
  const wasEditing = React.useRef(false);
  React.useEffect(() => {
    if (wasEditing.current && !editing) change.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  const detail = value.detail.trim();

  return (
    <div className={cn("min-w-0", editing && "sm:col-span-2")}>
      {editing ? (
        <AddressEditor
          side={side}
          label={label}
          country={country}
          value={value}
          onCancel={() => setEditing(false)}
          onSave={(next) => {
            onSave(next);
            setEditing(false);
          }}
        />
      ) : (
        <div className="h-full rounded-md bg-surface-2 px-4 py-3 [overflow-wrap:anywhere]">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs font-medium text-muted">{label}</p>
            <button
              ref={change}
              type="button"
              onClick={() => setEditing(true)}
              className="link-mark tap-target relative shrink-0 text-xs"
            >
              {d("change")}
            </button>
          </div>
          <p className="mt-1 text-sm font-medium">{getCountry(country)?.name}</p>
          {value.place && <p className="text-sm text-muted">{placeLine(value.place)}</p>}
          {detail && <p className="text-sm text-muted">{detail}</p>}
          {note && (
            <p role="status" className="mt-3 flex gap-2 rounded-md bg-info/10 px-3 py-2.5 text-sm">
              <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-info" />
              {note}
            </p>
          )}
          {!detail && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              {/* white on the card's Panel 2, so it stands as the thing to press */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="tap-target relative bg-background"
                onClick={() => setEditing(true)}
              >
                <MapPin /> {d("addDetail")}
              </Button>
              <span className="text-xs text-muted">{d(side === "origin" ? "addDetailHintFrom" : "addDetailHintTo")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Personal Information: where from and where to as cards, each changed in
 * place (AddressCard: the Address and its Detail Address, optional on both
 * sides), then name, email, phone and the Pickup Date. The origin country
 * isn't changed here: it set the rate, so it changes on Check Rate. An error
 * shows once a field is left, not on every keystroke; `tried` (the plan's
 * action pressed while a field was still open) shows them all.
 */
export function DetailsStep({
  check,
  value,
  changed,
  tried = false,
  onChange,
  onAddress,
}: {
  check: CheckRateInput;
  value: DetailsInput;
  changed: AddressChange;
  tried?: boolean;
  onChange: (patch: Partial<DetailsInput>) => void;
  /** a side's Address picked again; before `onChange`, since a moved
   *  Address clears the detail it had */
  onAddress: (side: Side, place: Place) => void;
}) {
  const t = useT();
  const d = (k: string) => t(`expatOrder.details.${k}`);
  const [left, setLeft] = React.useState<Record<string, boolean>>({});
  const leave = (k: string) => () => setLeft((s) => ({ ...s, [k]: true }));

  const shown = (k: string) => left[k] || tried;
  const nameErr = shown("name") && !value.fullName.trim() ? d("required") : undefined;
  const emailErr = shown("email") && !emailValid(value.email) ? (value.email.trim() ? d("emailErr") : d("required")) : undefined;
  const phoneErr =
    shown("phone") && !phoneValid(value.phone)
      ? value.phone.trim()
        ? d("phoneErr")
        : d("required")
      : tried && !value.dialIso
        ? d("required")
        : undefined;
  // a date that can no longer be picked (a draft from days ago) is said at
  // once, as an Address without a postal code is: the field shows a date,
  // so nothing else would say why the plan still waits
  const pickupErr =
    value.pickupDate && !pickupDayAllowed(value.pickupDate)
      ? d("pickupPast")
      : tried && !value.pickupDate
        ? d("required")
        : undefined;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AddressCard
          side="origin"
          label={d("from")}
          country={check.originCountry}
          value={{ place: check.origin, detail: value.originDetail ?? "" }}
          note={changed.origin ? d("originChanged") : undefined}
          onSave={({ place, detail }) => {
            onAddress("origin", place);
            onChange({ originDetail: detail });
          }}
        />
        <AddressCard
          side="destination"
          label={d("to")}
          country="ID"
          value={{ place: check.destination, detail: value.destinationDetail }}
          note={changed.destination ? d("destinationChanged") : undefined}
          onSave={({ place, detail }) => {
            onAddress("destination", place);
            onChange({ destinationDetail: detail });
          }}
        />
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
            // the longest an address can be
            maxLength={254}
          />
        </Field>
        <Field label={d("phone")} error={phoneErr}>
          <PhoneField
            dialIso={value.dialIso}
            phone={value.phone}
            placeholder={d("phonePh")}
            onDial={(dialIso) => onChange({ dialIso, dialTouched: true })}
            onPhone={(phone) => onChange({ phone })}
            onBlur={leave("phone")}
          />
        </Field>
        <div className="sm:col-span-2 sm:max-w-sm">
          <Field label={d("pickup")} hint={pickupErr ? undefined : d("pickupHint")} error={pickupErr}>
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
        {/* plain, as Check Rate's country list is: every country A to Z,
            no "Popular" group (those are the WNI flow's markets) */}
        <DialCodeSelect value={dialIso} onChange={onDial} showPopular={false} />
      </div>
      <Input
        {...wiring}
        className="flex-1 tabular-nums"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        // a number is 15 digits at most; the rest is room for its spaces
        maxLength={20}
        value={phone}
        onChange={(e) => onPhone(e.target.value.replace(/[^0-9 ]/g, ""))}
        onBlur={onBlur}
        placeholder={placeholder}
      />
    </div>
  );
}

/** the Pickup Date: weekdays only, from tomorrow (the epic, section 7, said three days out) */
function PickupPicker({
  value,
  onChange,
  placeholder,
  ariaLabel,
  id,
  "aria-invalid": invalid,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
  id?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
}) {
  return (
    // the picker's field is a button, not an input: the wrapper carries the
    // mark the plan's action looks for
    <div data-missing={invalid ? true : undefined}>
      <DatePicker
        id={id}
        value={value}
        onChange={onChange}
        min={firstPickupIso()}
        isDateDisabled={(iso) => !pickupDayAllowed(iso)}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        className={invalid ? "border-danger" : undefined}
      />
    </div>
  );
}
