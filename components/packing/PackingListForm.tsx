"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, ArrowUpRight, Copy, Download, Loader2, FileQuestion, Package } from "lucide-react";
import { useAllMyOrders, useOrderHydrated } from "@/lib/store/useOrderStore";
import { orderUsingCode } from "@/lib/order/order-packing";
import {
  usePackingListStore,
  usePackingList,
  usePackingHydrated,
} from "@/lib/store/usePackingListStore";
import { useAuthHydrated, useCurrentUser } from "@/lib/store/useAuthStore";
import {
  emptyParty,
  emptyPackage,
  PURPOSE_OPTIONS,
  type Party,
  type ItemsData,
  type PackingListData,
  type ShipmentPurpose,
} from "@/lib/types/packing";
import { packingListToCipl } from "@/lib/pdf/cipl";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectField } from "@/components/ui/select-field";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Field } from "@/components/shared/forms/Field";
import { PartyFields } from "@/components/shared/forms/PartyFields";
import {
  PackagesEditor,
  type PackagesEditorHandle,
} from "@/components/shared/forms/PackagesEditor";
import { CopyButton } from "@/components/order/CopyButton";
import { useDownloadCipl } from "./useDownloadCipl";
import { useOpenOrder } from "./useOpenOrder";

/** Flat form values: the editor expects `currency`/`packages` at the top level. */
interface PackingFormValues extends ItemsData {
  sender: Party;
  receiver: Party;
  shippingDate: string;
  purpose: ShipmentPurpose;
  purposeOther: string;
}

function toData(v: PackingFormValues): PackingListData {
  return {
    sender: v.sender,
    receiver: v.receiver,
    shippingDate: v.shippingDate,
    purpose: v.purpose,
    purposeOther: v.purpose === "other" ? v.purposeOther.trim() : undefined,
    items: { currency: v.currency, packages: v.packages },
  };
}

function today(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Create (no id) or edit (id) a standalone packing list. */
export function PackingListForm({ id }: { id?: string }) {
  const t = useT();
  const router = useRouter();
  const hydrated = usePackingHydrated();
  const authHydrated = useAuthHydrated();
  const user = useCurrentUser();
  const existing = usePackingList(id ?? null);
  const owned = existing && user && existing.ownerEmail === user.email ? existing : undefined;
  const orderHydrated = useOrderHydrated();
  const orders = useAllMyOrders(user?.email ?? null);
  // linked to an order → the order owns it; edit happens there
  const linkedOrder = owned ? orderUsingCode(orders, owned.code) : undefined;
  const openOrder = useOpenOrder();

  const path = id ? `/packing-list/${id}` : "/packing-list/buat";
  React.useEffect(() => {
    if (!hydrated || !authHydrated) return;
    if (!user) router.replace(`/masuk?next=${encodeURIComponent(path)}`);
  }, [hydrated, authHydrated, user, router, path]);

  if (!hydrated || !authHydrated || !orderHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  if (owned && linkedOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Card className="p-10 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-surface-2 text-muted-2">
            <Package className="size-7" />
          </div>
          <p className="mt-4 font-medium">{t("pl.linkedTitle")}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            {linkedOrder.bookingNumber && linkedOrder.status !== "draft"
              ? t("pl.linkedBody").replace("{order}", linkedOrder.bookingNumber)
              : t("pl.linkedBodyDraft")}
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <Button
              onClick={() =>
                openOrder({
                  orderId: linkedOrder.id,
                  bookingNumber: linkedOrder.bookingNumber,
                  draft: linkedOrder.status === "draft",
                })
              }
            >
              <ArrowUpRight className="size-4" /> {t("pl.viewOrder")}
            </Button>
            <Button asChild variant="secondary">
              <Link href="/packing-list">
                <ArrowLeft className="size-4" /> {t("pl.backToList")}
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (id && !owned) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Card className="p-10 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-surface-2 text-muted-2">
            <FileQuestion className="size-7" />
          </div>
          <p className="mt-4 font-medium">{t("pl.notFound")}</p>
          <p className="mt-1 text-sm text-muted">{t("pl.notFoundBody")}</p>
          <Button asChild variant="secondary" className="mt-5">
            <Link href="/packing-list">
              <ArrowLeft className="size-4" /> {t("pl.backToList")}
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return <FormBody key={owned?.id ?? "new"} existing={owned} ownerEmail={user.email} />;
}

function FormBody({
  existing,
  ownerEmail,
}: {
  existing: { id: string; code: string; data: PackingListData } | undefined;
  ownerEmail: string;
}) {
  const t = useT();
  const router = useRouter();
  const create = usePackingListStore((s) => s.create);
  const update = usePackingListStore((s) => s.update);
  const { busy, download } = useDownloadCipl();
  const editorRef = React.useRef<PackagesEditorHandle | null>(null);
  const isEdit = Boolean(existing);

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<PackingFormValues>({
    defaultValues: existing
      ? {
          sender: existing.data.sender,
          receiver: existing.data.receiver,
          shippingDate: existing.data.shippingDate,
          purpose: existing.data.purpose,
          purposeOther: existing.data.purposeOther ?? "",
          currency: existing.data.items.currency,
          packages: existing.data.items.packages,
        }
      : {
          sender: { ...emptyParty },
          receiver: { ...emptyParty },
          shippingDate: today(),
          purpose: "household",
          purposeOther: "",
          currency: "USD",
          packages: [structuredClone(emptyPackage)],
        },
  });
  const purpose = watch("purpose");
  const req = { required: t("err.required") };

  const receiverFromSender = () => {
    const s = getValues("sender");
    setValue("receiver.fullName", s.fullName);
    setValue("receiver.address", s.address);
    setValue("receiver.email", s.email);
    setValue("receiver.phoneCountry", s.phoneCountry);
    setValue("receiver.phone", s.phone);
  };

  // which button submitted — the second one also downloads the PDF
  const wantsPdf = React.useRef(false);

  const onValid = async (v: PackingFormValues) => {
    const data = toData(v);
    let saved: { id: string; code: string; data: PackingListData };
    if (existing) {
      update(existing.id, data);
      saved = { ...existing, data };
      toast.success(t("pl.updatedToast"));
    } else {
      const created = create(ownerEmail, data);
      saved = created;
      toast.success(t("pl.createdToast"), {
        description: t("pl.createdToastBody").replace("{code}", created.code),
      });
    }
    if (wantsPdf.current) {
      wantsPdf.current = false;
      await download(
        packingListToCipl({
          id: saved.id,
          code: saved.code,
          ownerEmail,
          createdAt: 0,
          updatedAt: 0,
          data: saved.data,
        }),
      );
    }
    router.push("/packing-list");
  };
  const onInvalid = () => {
    wantsPdf.current = false;
    editorRef.current?.expandAll();
    toast.error(t("calc.invalidTitle"));
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/packing-list"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {t("pl.backToList")}
        </Link>
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {isEdit ? t("pl.editTitle") : t("pl.createTitle")}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {isEdit ? t("pl.editSubtitle") : t("pl.createSubtitle")}
          </p>
        </header>

        {existing && (
          <Card className="mb-4 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-2">
              {t("pl.codeLabel")}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-lg font-bold tracking-tight text-foreground">
                {existing.code}
              </span>
              <CopyButton value={existing.code} />
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit(onValid, onInvalid)} className="space-y-4">
          <Card className="space-y-4 p-5">
            <h2 className="font-display font-semibold">{t("order.ciSectionSender")}</h2>
            <PartyFields
              control={control}
              register={register}
              errors={errors}
              name="sender"
              phoneLabelKey="order.ciPhoneOrigin"
            />
          </Card>

          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display font-semibold">{t("order.ciSectionReceiver")}</h2>
              <Button type="button" variant="ghost" size="sm" onClick={receiverFromSender}>
                <Copy className="size-3.5" /> {t("order.ciSameAsSender")}
              </Button>
            </div>
            <PartyFields
              control={control}
              register={register}
              errors={errors}
              name="receiver"
              phoneLabelKey="order.ciPhoneDestination"
            />
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="font-display font-semibold">{t("pl.sectionShipment")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("pl.shippingDate")} error={errors.shippingDate?.message}>
                <Controller
                  control={control}
                  name="shippingDate"
                  rules={req}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      ariaLabel={t("pl.shippingDate")}
                    />
                  )}
                />
              </Field>
              <Field label={t("pl.purpose")}>
                <Controller
                  control={control}
                  name="purpose"
                  render={({ field }) => (
                    <SelectField
                      value={field.value}
                      onChange={field.onChange}
                      ariaLabel={t("pl.purpose")}
                      options={PURPOSE_OPTIONS.map((o) => ({
                        value: o.value,
                        label: t(o.labelKey),
                      }))}
                    />
                  )}
                />
              </Field>
            </div>
            {purpose === "other" && (
              <Field label={t("pl.purposeOther")} error={errors.purposeOther?.message}>
                <Input placeholder={t("pl.purposeOtherPh")} {...register("purposeOther", req)} />
              </Field>
            )}
          </Card>

          <PackagesEditor
            control={control}
            register={register}
            errors={errors}
            watch={watch}
            showPhotos={false}
            editorRef={editorRef}
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" size="lg" className="sm:flex-1" disabled={busy}>
              {t("pl.save")}
            </Button>
            <Button
              type="submit"
              size="lg"
              variant="secondary"
              className="sm:flex-1"
              disabled={busy}
              onClick={() => {
                wantsPdf.current = true;
              }}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {busy ? t("pl.downloading") : t("pl.saveAndDownload")}
            </Button>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}
