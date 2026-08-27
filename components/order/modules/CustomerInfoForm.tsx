"use client";

import { useForm } from "react-hook-form";
import { Copy } from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { INDONESIA } from "@/lib/data/countries";
import { emptyParty, type Party } from "@/lib/types/packing";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PartyFields } from "@/components/shared/forms/PartyFields";
import { PhoneInput } from "@/components/shared/forms/PhoneInput";
import {
  ModuleShell,
  useSaveModule,
  useInvalidHandler,
  useDraftAutosave,
  readModuleData,
  Field,
} from "./shared";

export interface CustomerForm {
  sender: Party;
  receiver: Party;
  owner: {
    fullName: string;
    phoneOriginCountry: string;
    phoneOrigin: string;
    phoneDestinationCountry: string;
    phoneDestination: string;
    email: string;
  };
}

export function CustomerInfoForm() {
  const t = useT();
  const save = useSaveModule("customerInfo");
  const context = useOrderStore((s) => s.context);
  const prev = readModuleData("customerInfo") as Partial<CustomerForm>;
  const isExport = context?.service === "moving-abroad";
  const originDial = context?.originCountry || INDONESIA.code;
  const destDial = context?.destCountry || INDONESIA.code;

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CustomerForm>({
    // focus is handled by useInvalidHandler, in document order
    shouldFocusError: false,
    defaultValues: {
      sender: {
        ...emptyParty,
        country: context?.originCountry ?? "",
        phoneCountry: originDial,
        ...prev.sender,
      },
      receiver: {
        ...emptyParty,
        country: isExport ? (context?.destCountry ?? "") : INDONESIA.code,
        phoneCountry: destDial,
        ...prev.receiver,
      },
      owner: {
        fullName: "",
        phoneOriginCountry: originDial,
        phoneOrigin: "",
        phoneDestinationCountry: destDial,
        phoneDestination: "",
        email: "",
        ...prev.owner,
      },
    },
  });

  const req = { required: t("err.required") };
  const onInvalid = useInvalidHandler();
  useDraftAutosave(
    "customerInfo",
    getValues as unknown as () => Record<string, unknown>,
    isDirty,
  );

  const receiverFromSender = () => {
    const s = getValues("sender");
    setValue("receiver.fullName", s.fullName);
    setValue("receiver.address", s.address);
    setValue("receiver.email", s.email);
    setValue("receiver.phoneCountry", s.phoneCountry);
    setValue("receiver.phone", s.phone);
  };
  const ownerFrom = (who: "sender" | "receiver") => {
    const p = getValues(who);
    setValue("owner.fullName", p.fullName);
    setValue("owner.email", p.email);
    if (who === "sender") {
      setValue("owner.phoneOriginCountry", p.phoneCountry);
      setValue("owner.phoneOrigin", p.phone);
    } else {
      setValue("owner.phoneDestinationCountry", p.phoneCountry);
      setValue("owner.phoneDestination", p.phone);
    }
  };

  return (
    <ModuleShell moduleId="customerInfo">
      <form
        noValidate
        onSubmit={handleSubmit(
          (d) => save(d as unknown as Record<string, unknown>),
          onInvalid,
        )}
        className="space-y-4"
      >
        {/* Sender */}
        <Card className="space-y-4 px-5 py-7">
          <h2 className="font-display font-semibold">{t("order.ciSectionSender")}</h2>
          <PartyFields
            control={control}
            register={register}
            errors={errors}
            name="sender"
            countryLocked={isExport}
            phoneLabelKey="order.ciPhoneOrigin"
          />
        </Card>

        {/* Receiver */}
        <Card className="space-y-4 px-5 py-7">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display font-semibold">{t("order.ciSectionReceiver")}</h2>
            <Button type="button" variant="ghost" size="sm" className="min-h-9" onClick={receiverFromSender}>
              <Copy className="size-3.5" /> {t("order.ciSameAsSender")}
            </Button>
          </div>
          <PartyFields
            control={control}
            register={register}
            errors={errors}
            name="receiver"
            countryLocked={!isExport}
            countryRequired={false}
            phoneLabelKey="order.ciPhoneDestination"
            // what the packing list will change, said where it applies
            hints={{
              fullName: t("order.ciNoteName"),
              email: t("order.ciNoteEmail"),
              address: isExport
                ? t("order.ciNoteAddressExport")
                : t("order.ciNoteAddress"),
            }}
          />
        </Card>

        {/* Shipment Owner */}
        <Card className="space-y-4 px-5 py-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display font-semibold">{t("order.ciSectionOwner")}</h2>
            <div className="flex flex-wrap justify-end gap-1">
              <Button type="button" variant="ghost" size="sm" className="min-h-9" onClick={() => ownerFrom("sender")}>
                <Copy className="size-3.5" /> {t("order.ciSameAsSender")}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="min-h-9" onClick={() => ownerFrom("receiver")}>
                <Copy className="size-3.5" /> {t("order.ciSameAsReceiver")}
              </Button>
            </div>
          </div>
          <p className="-mt-1 text-sm text-muted">{t("order.ciOwnerHint")}</p>
          <Field label={t("order.ciFullName")} error={errors.owner?.fullName?.message}>
            <Input placeholder={t("order.ciPhName")} {...register("owner.fullName", req)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("order.ciPhoneOrigin")} error={errors.owner?.phoneOrigin?.message}>
              <PhoneInput
                control={control}
                register={register}
                codeName="owner.phoneOriginCountry"
                numberName="owner.phoneOrigin"
              />
            </Field>
            <Field
              label={t("order.ciPhoneDestination")}
              error={errors.owner?.phoneDestination?.message}
            >
              <PhoneInput
                control={control}
                register={register}
                codeName="owner.phoneDestinationCountry"
                numberName="owner.phoneDestination"
              />
            </Field>
          </div>
          <Field label={t("order.ciEmail")} error={errors.owner?.email?.message}>
            <Input
              type="email"
              placeholder={t("order.ciPhEmail")}
              {...register("owner.email", {
                ...req,
                pattern: { value: /^\S+@\S+\.\S+$/, message: t("err.emailInvalid") },
              })}
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
