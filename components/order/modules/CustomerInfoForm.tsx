"use client";

import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Info, Copy } from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { INDONESIA } from "@/lib/data/countries";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { ModuleShell, useSaveModule, readModuleData, Field } from "./shared";

interface Party {
  fullName: string;
  country: string;
  address: string;
  email: string;
  phone: string;
}
interface CustomerForm {
  sender: Party;
  receiver: Party;
  owner: {
    fullName: string;
    phoneOrigin: string;
    phoneDestination: string;
    email: string;
  };
}

const emptyParty: Party = {
  fullName: "",
  country: "",
  address: "",
  email: "",
  phone: "",
};

export function CustomerInfoForm() {
  const t = useT();
  const save = useSaveModule("customerInfo");
  const context = useOrderStore((s) => s.context);
  const prev = readModuleData("customerInfo") as Partial<CustomerForm>;

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CustomerForm>({
    defaultValues: {
      sender: {
        ...emptyParty,
        country: context?.originCountry ?? "",
        ...prev.sender,
      },
      receiver: { ...emptyParty, country: INDONESIA.code, ...prev.receiver },
      owner: {
        fullName: "",
        phoneOrigin: "",
        phoneDestination: "",
        email: "",
        ...prev.owner,
      },
    },
  });

  const req = { required: t("err.required") };

  const receiverFromSender = () => {
    const s = getValues("sender");
    setValue("receiver.fullName", s.fullName);
    setValue("receiver.address", s.address);
    setValue("receiver.email", s.email);
    setValue("receiver.phone", s.phone);
  };
  const ownerFrom = (who: "sender" | "receiver") => {
    const p = getValues(who);
    setValue("owner.fullName", p.fullName);
    setValue("owner.email", p.email);
    if (who === "sender") setValue("owner.phoneOrigin", p.phone);
    else setValue("owner.phoneDestination", p.phone);
  };

  return (
    <ModuleShell moduleId="customerInfo">
      {/* packing-list difference note */}
      <Card className="mb-4 flex gap-2.5 border-warning/25 bg-warning/10 p-4 text-sm text-muted">
        <Info className="mt-0.5 size-4 shrink-0 text-warning" />
        <div>
          <p className="font-medium text-foreground">{t("order.ciNoteTitle")}</p>
          <ul className="mt-1.5 space-y-1">
            {[t("order.ciNoteName"), t("order.ciNoteEmail"), t("order.ciNoteAddress")].map(
              (n) => (
                <li key={n} className="flex gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-2" />
                  <span>{n}</span>
                </li>
              ),
            )}
          </ul>
        </div>
      </Card>

      <form
        onSubmit={handleSubmit(
          (d) => save(d as unknown as Record<string, unknown>),
          () => toast.error(t("calc.invalidTitle")),
        )}
        className="space-y-4"
      >
        {/* Sender */}
        <Card className="space-y-4 p-5">
          <h2 className="font-display font-semibold">{t("order.ciSectionSender")}</h2>
          <Field label={t("order.ciFullName")} error={errors.sender?.fullName?.message}>
            <Input {...register("sender.fullName", req)} />
          </Field>
          <Field label={t("order.ciCountry")} error={errors.sender?.country?.message}>
            <Controller
              control={control}
              name="sender.country"
              rules={{ required: t("err.selectCountry") }}
              render={({ field }) => (
                <CountrySelect value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
          <Field label={t("order.ciFullAddress")} error={errors.sender?.address?.message}>
            <Input {...register("sender.address", req)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("order.ciEmail")} error={errors.sender?.email?.message}>
              <Input type="email" {...register("sender.email", req)} />
            </Field>
            <Field label={t("order.ciPhoneOrigin")} error={errors.sender?.phone?.message}>
              <Input {...register("sender.phone", req)} />
            </Field>
          </div>
        </Card>

        {/* Receiver */}
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display font-semibold">{t("order.ciSectionReceiver")}</h2>
            <Button type="button" variant="ghost" size="sm" onClick={receiverFromSender}>
              <Copy className="size-3.5" /> {t("order.ciSameAsSender")}
            </Button>
          </div>
          <Field label={t("order.ciFullName")} error={errors.receiver?.fullName?.message}>
            <Input {...register("receiver.fullName", req)} />
          </Field>
          <Field label={t("order.ciCountry")}>
            <Controller
              control={control}
              name="receiver.country"
              render={({ field }) => (
                <CountrySelect value={field.value} onChange={field.onChange} locked />
              )}
            />
          </Field>
          <Field
            label={t("order.ciFullAddress")}
            error={errors.receiver?.address?.message}
          >
            <Input {...register("receiver.address", req)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("order.ciEmail")} error={errors.receiver?.email?.message}>
              <Input type="email" {...register("receiver.email", req)} />
            </Field>
            <Field
              label={t("order.ciPhoneDestination")}
              error={errors.receiver?.phone?.message}
            >
              <Input {...register("receiver.phone", req)} />
            </Field>
          </div>
        </Card>

        {/* Shipment Owner */}
        <Card className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display font-semibold">{t("order.ciSectionOwner")}</h2>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => ownerFrom("sender")}>
                <Copy className="size-3.5" /> {t("order.ciSameAsSender")}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => ownerFrom("receiver")}>
                <Copy className="size-3.5" /> {t("order.ciSameAsReceiver")}
              </Button>
            </div>
          </div>
          <Field label={t("order.ciFullName")} error={errors.owner?.fullName?.message}>
            <Input {...register("owner.fullName", req)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("order.ciPhoneOrigin")} error={errors.owner?.phoneOrigin?.message}>
              <Input {...register("owner.phoneOrigin", req)} />
            </Field>
            <Field
              label={t("order.ciPhoneDestination")}
              error={errors.owner?.phoneDestination?.message}
            >
              <Input {...register("owner.phoneDestination", req)} />
            </Field>
          </div>
          <Field label={t("order.ciEmail")} error={errors.owner?.email?.message}>
            <Input type="email" {...register("owner.email", req)} />
          </Field>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          {t("order.saveModule")}
        </Button>
      </form>
    </ModuleShell>
  );
}
