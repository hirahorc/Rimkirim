"use client";

import type * as React from "react";

import {
  Controller,
  type Control,
  type UseFormRegister,
  type FieldErrors,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import type { Party } from "@/lib/types/packing";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Input } from "@/components/ui/input";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { Field } from "./Field";
import { PhoneInput } from "./PhoneInput";

type PartyForm = { sender: Party; receiver: Party };

/**
 * The sender / receiver field group (name, country, address, email, phone),
 * shared by the order's Customer Information module and the standalone packing
 * list. The parent owns the card + heading; this only renders the fields.
 */
export function PartyFields<T extends FieldValues & PartyForm>({
  control,
  register,
  errors,
  name,
  countryLocked = false,
  countryRequired = true,
  phoneLabelKey,
  hints,
}: {
  control: Control<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  name: "sender" | "receiver";
  /** pin the country to Indonesia (order flow's domestic side) */
  countryLocked?: boolean;
  countryRequired?: boolean;
  phoneLabelKey: string;
  /** contextual notes shown under specific fields (e.g. what the packing list changes) */
  hints?: Partial<Record<"fullName" | "email" | "address", React.ReactNode>>;
}) {
  const t = useT();
  const req = { required: t("err.required") };
  const p = (k: keyof Party) => `${name}.${k}` as FieldPath<T>;
  const e = (errors as FieldErrors<PartyForm>)[name];

  return (
    <>
      <Field
        label={t("order.ciFullName")}
        hint={hints?.fullName}
        error={e?.fullName?.message}
      >
        <Input placeholder={t("order.ciPhName")} {...register(p("fullName"), req)} />
      </Field>
      <Field label={t("order.ciCountry")} error={e?.country?.message}>
        <Controller
          control={control}
          name={p("country")}
          rules={countryRequired ? { required: t("err.selectCountry") } : undefined}
          render={({ field }) => (
            <CountrySelect
              value={field.value as string}
              onChange={field.onChange}
              locked={countryLocked}
              ariaLabel={t("order.ciCountry")}
            />
          )}
        />
      </Field>
      <Field
        label={t("order.ciFullAddress")}
        hint={hints?.address}
        error={e?.address?.message}
      >
        <Input placeholder={t("order.ciPhAddress")} {...register(p("address"), req)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("order.ciEmail")} hint={hints?.email} error={e?.email?.message}>
          <Input type="email" placeholder={t("order.ciPhEmail")} {...register(p("email"), req)} />
        </Field>
        <Field label={t(phoneLabelKey)} error={e?.phone?.message}>
          <PhoneInput
            control={control}
            register={register}
            codeName={p("phoneCountry")}
            numberName={p("phone")}
          />
        </Field>
      </div>
    </>
  );
}
