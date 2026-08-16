"use client";

import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Copy, Check, Minus, Plus } from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { INDONESIA } from "@/lib/data/countries";
import { BUILDING_TYPES, PICKUP_WINDOWS } from "../module-options";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Input, DateInput, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { DialCodeSelect } from "@/components/order/DialCodeSelect";
import { ModuleShell, useSaveModule, readModuleData, Field } from "./shared";
import { cn } from "@/lib/utils/cn";

interface PickupData {
  picName: string;
  buildingType: string;
  /** shared-building access, asked only when buildingType !== "house" */
  freightElevator: string;
  receptionist: string;
  address: string;
  notesCourier: string;
  picPhoneCountry: string;
  picPhone: string;
  date: string;
  time: string;
  standbyDuration: string;
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
    watch,
    formState: { errors },
  } = useForm<PickupData>({
    defaultValues: {
      picName: "",
      buildingType: "",
      freightElevator: "",
      receptionist: "",
      address: "",
      notesCourier: "",
      picPhoneCountry: originDial,
      picPhone: "",
      date: "",
      time: "",
      standbyDuration: "0",
      ...prev,
    },
  });
  const req = { required: t("err.required") };
  // shared buildings (anything but a house) have access logistics the courier
  // needs; a house — and the unselected placeholder — asks neither
  const needsAccessQs =
    watch("buildingType") !== "" && watch("buildingType") !== "house";

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
        {/* Details — who the courier meets and where. The page <h1> already
            says "Pickup Details & Schedule"; these two cards are its two halves,
            so the section titles name the parts without repeating the whole. */}
        <Card className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <h2 className="font-display text-base font-semibold tracking-tight">
              {t("order.puSecDetails")}
            </h2>
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
                <SelectField
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    // switching to a house retires the access questions — drop
                    // any stale answers so they aren't saved on a house pickup
                    if (v === "house") {
                      setValue("freightElevator", "");
                      setValue("receptionist", "");
                    }
                  }}
                  ariaLabel={t("order.puBuildingType")}
                  placeholder={t("order.puBuildingTypePlaceholder")}
                  options={BUILDING_TYPES.map((b) => ({
                    value: b.value,
                    label: t(b.labelKey),
                  }))}
                />
              )}
            />
          </Field>

          {needsAccessQs && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("order.puFreightElevator")}
                error={errors.freightElevator?.message}
              >
                <Controller
                  control={control}
                  name="freightElevator"
                  rules={{ required: needsAccessQs ? t("err.required") : false }}
                  render={({ field }) => (
                    <ChipGroup
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: "yes", label: t("order.yes") },
                        { value: "no", label: t("order.no") },
                      ]}
                    />
                  )}
                />
              </Field>
              <Field
                label={t("order.puReceptionist")}
                error={errors.receptionist?.message}
              >
                <Controller
                  control={control}
                  name="receptionist"
                  rules={{ required: needsAccessQs ? t("err.required") : false }}
                  render={({ field }) => (
                    <ChipGroup
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: "yes", label: t("order.yes") },
                        { value: "no", label: t("order.no") },
                      ]}
                    />
                  )}
                />
              </Field>
            </div>
          )}

          <Field label={t("order.puAddress")} error={errors.address?.message}>
            <Input placeholder={t("order.puPhAddress")} {...register("address", req)} />
          </Field>

          <Field label={t("order.puNotesCourier")}>
            <Textarea placeholder={t("order.puPhNotes")} {...register("notesCourier")} />
          </Field>
        </Card>

        {/* Schedule — when the courier comes. Split into its own card so the
            time-window chips get full width and never cram into a half column;
            the date and the standby stepper cap at max-w-xs so a lone control
            doesn't stretch across the whole page. */}
        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold tracking-tight">
            {t("order.puSecSchedule")}
          </h2>

          <Field label={t("order.puDate")} error={errors.date?.message}>
            <div className="sm:max-w-xs">
              <DateInput {...register("date", req)} />
            </div>
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

          <Field label={t("order.puStandbyLabel")} hint={t("order.puStandbyHint")}>
            <Controller
              control={control}
              name="standbyDuration"
              render={({ field }) => (
                <Stepper
                  value={Number(field.value) || 0}
                  onChange={(n) => field.onChange(String(n))}
                  min={0}
                  max={30}
                  unit={t("order.puStandbyUnit")}
                  zeroLabel={t("order.puStandbyNone")}
                />
              )}
            />
          </Field>
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
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
              selected
                ? "border-foreground bg-surface-2 font-medium text-foreground"
                : "border-border text-muted hover:border-border-strong hover:text-foreground",
            )}
          >
            {o.label}
            {selected && <Check className="size-3.5 shrink-0 text-foreground" strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}

/** Numeric −/+ stepper (buttons only; no free typing). */
function Stepper({
  value,
  onChange,
  min = 1,
  max,
  unit,
  zeroLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  zeroLabel?: string;
}) {
  const v = Number.isFinite(value) ? value : min;
  const atMin = v <= min;
  const atMax = max != null && v >= max;
  const btn =
    "grid size-9 shrink-0 place-items-center rounded-md text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted";
  return (
    <div className="flex h-11 w-full items-center justify-between rounded-md border border-border bg-surface-2 px-1.5 sm:max-w-xs">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, v - 1))}
        disabled={atMin}
        aria-label="−"
        className={btn}
      >
        <Minus className="size-4" />
      </button>
      <span className="text-sm font-medium tabular-nums text-foreground">
        {v === 0 && zeroLabel ? (
          <span className="text-muted">{zeroLabel}</span>
        ) : (
          <>
            {v}
            {unit && <span className="ml-1 font-normal text-muted">{unit}</span>}
          </>
        )}
      </span>
      <button
        type="button"
        onClick={() => onChange(max != null ? Math.min(max, v + 1) : v + 1)}
        disabled={atMax}
        aria-label="+"
        className={btn}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
