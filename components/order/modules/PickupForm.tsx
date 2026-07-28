"use client";

import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { INDONESIA } from "@/lib/data/countries";
import { BUILDING_TYPES, PICKUP_WINDOWS } from "../module-options";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialCodeSelect } from "@/components/order/DialCodeSelect";
import { ModuleShell, useSaveModule, readModuleData, Field } from "./shared";
import { cn } from "@/lib/utils/cn";

interface PickupData {
  picName: string;
  buildingType: string;
  address: string;
  notesCourier: string;
  picPhoneCountry: string;
  picPhone: string;
  date: string;
  time: string;
}

export function PickupForm() {
  const t = useT();
  const save = useSaveModule("pickup");
  const context = useOrderStore((s) => s.context);
  const customerData = useOrderStore((s) => s.modules.customerInfo.data) as
    | {
        sender?: {
          fullName?: string;
          phone?: string;
          phoneCountry?: string;
          address?: string;
        };
      }
    | undefined;
  const sender = customerData?.sender;
  const prev = readModuleData("pickup") as Partial<PickupData>;
  const originDial = context?.originCountry || INDONESIA.code;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PickupData>({
    defaultValues: {
      picName: "",
      buildingType: "",
      address: "",
      notesCourier: "",
      picPhoneCountry: originDial,
      picPhone: "",
      date: "",
      time: "",
      ...prev,
    },
  });
  const req = { required: t("err.required") };

  const fillFromSender = () => {
    setValue("picName", sender?.fullName ?? "");
    setValue("picPhoneCountry", sender?.phoneCountry ?? originDial);
    setValue("picPhone", sender?.phone ?? "");
    setValue("address", sender?.address ?? "");
  };

  return (
    <ModuleShell moduleId="pickup">
      <form
        onSubmit={handleSubmit(
          (d) => save(d as unknown as Record<string, unknown>),
          () => toast.error(t("calc.invalidTitle")),
        )}
        className="space-y-4"
      >
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display font-semibold">{t("order.modPickup")}</h2>
            {sender && (
              <Button type="button" variant="ghost" size="sm" onClick={fillFromSender}>
                <Copy className="size-3.5" /> {t("order.puSameAsSender")}
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("order.puPicName")} error={errors.picName?.message}>
              <Input placeholder={t("order.puPhName")} {...register("picName", req)} />
            </Field>
            <Field label={t("order.puPicPhone")} error={errors.picPhone?.message}>
              <div className="flex gap-2">
                <div className="w-28 shrink-0">
                  <Controller
                    control={control}
                    name="picPhoneCountry"
                    render={({ field }) => (
                      <DialCodeSelect value={field.value || ""} onChange={field.onChange} />
                    )}
                  />
                </div>
                <Input className="flex-1" placeholder={t("order.puPhPhone")} {...register("picPhone", req)} />
              </div>
            </Field>
          </div>

          <Field label={t("order.puBuildingType")} error={errors.buildingType?.message}>
            <Controller
              control={control}
              name="buildingType"
              rules={req}
              render={({ field }) => (
                <ChipGroup
                  value={field.value}
                  onChange={field.onChange}
                  options={BUILDING_TYPES.map((b) => ({
                    value: b.value,
                    label: t(b.labelKey),
                  }))}
                />
              )}
            />
          </Field>

          <Field label={t("order.puAddress")} error={errors.address?.message}>
            <Input placeholder={t("order.puPhAddress")} {...register("address", req)} />
          </Field>

          <Field label={t("order.puNotesCourier")}>
            <Input placeholder={t("order.puPhNotes")} {...register("notesCourier")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("order.puDate")} error={errors.date?.message}>
              <Input type="date" {...register("date", req)} />
            </Field>
            <Field label={t("order.puTime")} error={errors.time?.message}>
              <Controller
                control={control}
                name="time"
                rules={req}
                render={({ field }) => (
                  <ChipGroup
                    value={field.value}
                    onChange={field.onChange}
                    options={PICKUP_WINDOWS.map((w) => ({ value: w, label: w }))}
                  />
                )}
              />
            </Field>
          </div>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          {t("order.saveModule")}
        </Button>
      </form>
    </ModuleShell>
  );
}

/** Selectable option chips (single-select), styled like the app's brand-accent selection. */
function ChipGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup">
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex min-h-11 items-center justify-center gap-1.5 rounded-sm border px-3 py-2.5 text-center text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
              selected
                ? "border-brand bg-brand/10 font-medium text-foreground ring-1 ring-brand/60"
                : "border-border text-muted hover:border-border-strong hover:text-foreground",
            )}
          >
            {o.label}
            {selected && <Check className="size-3.5 shrink-0 text-brand" strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}
