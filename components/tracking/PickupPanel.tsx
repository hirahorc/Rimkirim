"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Truck,
  PackageX,
  MapPin,
  CheckCircle2,
  Clock3,
  RefreshCcw,
  Store,
} from "lucide-react";
import {
  useOrderStore,
  MAX_CUSTOMER_PICKUP_FAILS,
  type Order,
} from "@/lib/store/useOrderStore";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Customer-facing pickup status: after a failed pickup the customer chooses
 * re-pickup or drop-off; 3 customer-fault fails escalate to a new-AWB request.
 */
export function PickupPanel({ order }: { order: Order }) {
  const t = useT();
  const { locale } = useLanguage();
  const requestNewAwb = useOrderStore((s) => s.requestNewAwb);
  const reschedulePickup = useOrderStore((s) => s.reschedulePickup);
  const chooseDropOff = useOrderStore((s) => s.chooseDropOff);
  const confirmDropOff = useOrderStore((s) => s.confirmDropOff);

  if (order.status !== "pickup") return null;

  const customerFails = order.pickupFails.filter(
    (f) => f.cause === "customer",
  ).length;
  const carrierFails = order.pickupFails.filter(
    (f) => f.cause === "carrier",
  ).length;
  const needsAwb = customerFails >= MAX_CUSTOMER_PICKUP_FAILS;
  const dropOff = order.dropOff;
  const deadlineFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-base font-semibold tracking-tight">
        <span className="grid size-6 place-items-center rounded-md bg-brand/10 text-brand">
          <Truck className="size-3.5" />
        </span>
        {t("order.pickStatus")}
      </h2>

      {(customerFails > 0 || carrierFails > 0) && (
        <p className="mt-3 text-sm text-muted">
          {t("order.pickAttempts")}:{" "}
          <span className="font-medium text-foreground">
            {customerFails}× {t("order.pickFailCustomer")}
          </span>
          {carrierFails > 0 && (
            <>
              {" · "}
              <span className="font-medium text-foreground">
                {carrierFails}× {t("order.pickFailFedEx")}
              </span>
            </>
          )}
          {!needsAwb && (
            <span className="ml-1 text-muted-2">
              · {MAX_CUSTOMER_PICKUP_FAILS - customerFails}{" "}
              {t("order.pickFailRemaining")}
            </span>
          )}
        </p>
      )}

      {!needsAwb && order.pickupChoicePending && (
        <div className="mt-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
          <p className="text-sm font-semibold text-warning">
            {t("order.pickChoiceTitle")}
          </p>
          <p className="mt-0.5 text-sm text-muted">{t("order.pickChoiceBody")}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              onClick={() => {
                reschedulePickup(order.id);
                toast.success(t("order.pickChoiceRepickupToast"));
              }}
            >
              <RefreshCcw /> {t("order.pickChoiceRepickup")}
            </Button>
            <Button
              className="flex-1"
              variant="secondary"
              onClick={() => {
                chooseDropOff(order.id);
                toast.info(t("order.pickChoiceDropOffToast"));
              }}
            >
              <Store /> {t("order.pickChoiceDropOff")}
            </Button>
          </div>
        </div>
      )}

      {needsAwb && (
        <div className="mt-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
          <p className="text-sm font-semibold text-warning">
            {t("order.pickAwbNeededTitle")}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {t("order.pickAwbNeededBody")}
          </p>
          <Button
            className="mt-3"
            onClick={() => {
              requestNewAwb(order.id);
              toast.info(t("order.pickAwbRequestedToast"));
            }}
          >
            <PackageX /> {t("order.pickAwbCta")}
          </Button>
        </div>
      )}

      {dropOff && !dropOff.expired && !dropOff.fulfilledAt && (
        <div className="mt-3 rounded-lg border border-info/40 bg-info/10 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-info">
            <MapPin /> {t("order.pickDropOffTitle")}
          </p>
          <p className="mt-0.5 text-sm text-muted">{t("order.pickDropOffBody")}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-2">
            <Clock3 className="size-3.5" /> {t("order.pickDropOffDeadline")}:{" "}
            {deadlineFmt.format(dropOff.deadline)}
          </p>
          <Button
            className="mt-3"
            variant="secondary"
            onClick={() => {
              confirmDropOff(order.id);
              toast.success(t("order.pickDropOffConfirmedToast"));
            }}
          >
            <CheckCircle2 /> {t("order.pickDropOffCta")}
          </Button>
        </div>
      )}

      {dropOff?.fulfilledAt && (
        <p className="mt-3 text-sm text-muted-2">
          {t("order.pickDropOffAwaitOps")}
        </p>
      )}
    </Card>
  );
}
