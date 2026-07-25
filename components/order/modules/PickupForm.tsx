"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { BUILDING_TYPES, PICKUP_WINDOWS } from "../module-options";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModuleShell, useSaveModule, readModuleData, Field } from "./shared";
import { cn } from "@/lib/utils/cn";

interface PickupData {
  picName: string;
  buildingType: string;
  address: string;
  notesCourier: string;
  picPhone: string;
  date: string;
  time: string;
}

const selectCls =
  "flex h-11 w-full rounded-md border border-border bg-surface-2 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:border-brand/70 focus-visible:ring-2 focus-visible:ring-brand/25";

export function PickupForm() {
  const t = useT();
  const save = useSaveModule("pickup");
  const customerData = useOrderStore((s) => s.modules.customerInfo.data) as
    | { sender?: { fullName?: string; phone?: string; address?: string } }
    | undefined;
  const sender = customerData?.sender;
  const prev = readModuleData("pickup") as Partial<PickupData>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PickupData>({
    defaultValues: {
      picName: "",
      buildingType: "",
      address: "",
      notesCourier: "",
      picPhone: "",
      date: "",
      time: "",
      ...prev,
    },
  });
  const req = { required: t("err.required") };

  const fillFromSender = () => {
    setValue("picName", sender?.fullName ?? "");
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
              <Input {...register("picName", req)} />
            </Field>
            <Field label={t("order.puPicPhone")} error={errors.picPhone?.message}>
              <Input {...register("picPhone", req)} />
            </Field>
          </div>

          <Field label={t("order.puBuildingType")} error={errors.buildingType?.message}>
            <select {...register("buildingType", req)} className={selectCls}>
              <option value="">—</option>
              {BUILDING_TYPES.map((b) => (
                <option key={b.value} value={b.value}>
                  {t(b.labelKey)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("order.puAddress")} error={errors.address?.message}>
            <Input {...register("address", req)} />
          </Field>

          <Field label={t("order.puNotesCourier")}>
            <Input {...register("notesCourier")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("order.puDate")} error={errors.date?.message}>
              <Input type="date" {...register("date", req)} />
            </Field>
            <Field label={t("order.puTime")} error={errors.time?.message}>
              <select {...register("time", req)} className={cn(selectCls)}>
                <option value="">—</option>
                {PICKUP_WINDOWS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
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
