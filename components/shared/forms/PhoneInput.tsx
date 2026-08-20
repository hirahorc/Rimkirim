"use client";

import type * as React from "react";

import {
  Controller,
  type Control,
  type UseFormRegister,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Input } from "@/components/ui/input";
import { DialCodeSelect } from "@/components/order/DialCodeSelect";

/** Country dial-code dropdown glued to a phone-number input. `Field`'s wiring
 * (id, aria-invalid, aria-describedby) lands on the number input. */
export function PhoneInput<T extends FieldValues>({
  control,
  register,
  codeName,
  numberName,
  placeholder,
  ...wiring
}: {
  control: Control<T>;
  register: UseFormRegister<T>;
  codeName: FieldPath<T>;
  numberName: FieldPath<T>;
  placeholder?: string;
} & Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  "id" | "aria-invalid" | "aria-describedby"
>) {
  const t = useT();
  return (
    <div className="flex gap-2">
      <div className="w-28 shrink-0">
        <Controller
          control={control}
          name={codeName}
          render={({ field }) => (
            <DialCodeSelect
              value={(field.value as string) || ""}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      <Input
        className="flex-1"
        placeholder={placeholder ?? t("order.ciPhPhone")}
        {...wiring}
        {...register(numberName, { required: t("err.required") })}
      />
    </div>
  );
}
