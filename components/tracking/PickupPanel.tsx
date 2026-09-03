"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Truck,
  PackageX,
  MapPin,
  MessageCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  RefreshCcw,
  Store,
  CalendarClock,
} from "lucide-react";
import {
  useOrderStore,
  MAX_CUSTOMER_PICKUP_FAILS,
  type Order,
} from "@/lib/store/useOrderStore";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { AttentionStrip } from "@/components/tracking/AttentionStrip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { NewAwbDialog } from "./NewAwbDialog";
import { ReschedulePickupDialog } from "./ReschedulePickupDialog";
import { WA_URL } from "@/lib/contact";

/**
 * Customer-facing pickup status: after a failed pickup the customer chooses
 * re-pickup or drop-off; 3 customer-fault fails escalate to a new-AWB request.
 */
export function PickupPanel({
  order,
  attention = null,
}: {
  order: Order;
  /** the order's attention state, worn as this card's head */
  attention?: string | null;
}) {
  const t = useT();
  const { locale } = useLanguage();
  const chooseDropOff = useOrderStore((s) => s.chooseDropOff);
  const confirmDropOff = useOrderStore((s) => s.confirmDropOff);
  const [awbOpen, setAwbOpen] = React.useState(false);
  const [reschedOpen, setReschedOpen] = React.useState(false);
  const [dropConfirmOpen, setDropConfirmOpen] = React.useState(false);
  const deadlineFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [locale],
  );

  if (order.status !== "pickup") return null;

  const customerFails = order.pickupFails.filter(
    (f) => f.cause === "customer",
  ).length;
  const carrierFails = order.pickupFails.filter(
    (f) => f.cause === "carrier",
  ).length;
  const needsAwb = customerFails >= MAX_CUSTOMER_PICKUP_FAILS;
  const dropOff = order.dropOff;

  // the quiet states: nothing is being asked of the customer. without these the
  // card would render as a lone heading — right after the booking, and again
  // once a rescheduled pickup is back on the calendar.
  const schedule = order.modules.pickup.data as
    | { date?: string; time?: string }
    | undefined;
  // a malformed persisted date must not take the whole card down
  const scheduledAt = schedule?.date ? new Date(`${schedule.date}T00:00:00`) : null;
  const scheduledDate =
    scheduledAt && !Number.isNaN(scheduledAt.getTime())
      ? deadlineFmt.format(scheduledAt)
      : null;
  const awaiting =
    !needsAwb &&
    !order.pickupChoicePending &&
    (!dropOff || dropOff.expired) &&
    !dropOff?.fulfilledAt;

  return (
    <Card className="rounded-md p-5 sm:p-6">
      <AttentionStrip attention={attention} />
      {/* a 48px heading row: on the strip's 16px shoulder it puts the title
          28px under the tint, the way the Figma revamp draws it */}
      <h2 className="flex h-12 items-center gap-2 font-display text-base font-semibold tracking-tight">
        <Truck className="size-4 text-foreground" />
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

      {awaiting && (
        <div className="mt-3 text-sm">
          {/* after an expired drop-off the AWB is replaced and ops re-books, so
              the module's old slot is stale — fall through to "being scheduled" */}
          {scheduledDate && !dropOff?.expired ? (
            <>
              <p className="flex flex-wrap items-center gap-x-1.5 text-muted">
                <CalendarClock className="size-4 text-muted-2" />
                {t("order.pickAwaitingLabel")}:{" "}
                <span className="font-medium text-foreground">
                  {scheduledDate}
                  {schedule?.time ? `, ${schedule.time}` : ""}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-2">
                {t("order.pickAwaitingHint")}
              </p>
            </>
          ) : (
            <p className="text-muted">{t("order.pickAwaitingNone")}</p>
          )}
        </div>
      )}

      {/* both asks below wait on the customer, so they wear the "your move"
          purple as a tint with no outline (Whose-Move + Stroke rules). The
          heading stays foreground: the tint and the card's head already say
          whose move it is, a third purple would be shouting. */}
      {!needsAwb && order.pickupChoicePending && (
        <div className="mt-3 rounded-md bg-accent/10 p-4">
          <p className="text-sm font-semibold text-foreground">
            {t("order.pickChoiceTitle")}
          </p>
          <p className="mt-0.5 text-sm text-muted">{t("order.pickChoiceBody")}</p>
          {/* two equal doors, not one CTA plus a fallback — so they read as
              option rows (icon, label, chevron), never as stretched pills.
              Surface on the tint with a hairline, as the Figma revamp draws them.
              The row shape survives any width; no per-breakpoint layout. */}
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setReschedOpen(true)}
              className="flex w-full items-center gap-2.5 rounded-sm border border-border bg-surface px-3.5 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
            >
              <RefreshCcw className="size-4 shrink-0 text-muted-2" />
              {t("order.pickChoiceRepickup")}
              <ChevronRight className="ml-auto size-4 shrink-0 text-muted-2" />
            </button>
            {/* both doors open something to read first: the sibling opens the
                reschedule dialog, this one a confirm sheet — tapping a row
                that looks like navigation must never commit on its own */}
            <button
              type="button"
              onClick={() => setDropConfirmOpen(true)}
              className="flex w-full items-center gap-2.5 rounded-sm border border-border bg-surface px-3.5 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
            >
              <Store className="size-4 shrink-0 text-muted-2" />
              {t("order.pickChoiceDropOff")}
              <ChevronRight className="ml-auto size-4 shrink-0 text-muted-2" />
            </button>
          </div>
        </div>
      )}

      <Dialog open={dropConfirmOpen} onOpenChange={setDropConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              <Store />
              {t("order.pickDropOffConfirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("order.pickDropOffConfirmBody")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDropConfirmOpen(false)}>
              {t("order.baCancel")}
            </Button>
            <Button
              onClick={() => {
                chooseDropOff(order.id);
                setDropConfirmOpen(false);
                const now = useOrderStore
                  .getState()
                  .orders.find((o) => o.id === order.id);
                if (now?.dropOff) toast.info(t("order.pickChoiceDropOffToast"));
              }}
            >
              <Store /> {t("order.pickDropOffConfirmCta")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {needsAwb && (
        <div className="mt-3 rounded-md bg-accent/10 p-4">
          <p className="text-sm font-semibold text-foreground">
            {t("order.pickAwbNeededTitle")}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {t("order.pickAwbNeededBody")}
          </p>
          <Button className="mt-3" onClick={() => setAwbOpen(true)}>
            <PackageX /> {t("order.pickAwbCta")}
          </Button>
        </div>
      )}

      <NewAwbDialog
        orderId={order.id}
        open={awbOpen}
        onOpenChange={setAwbOpen}
      />

      <ReschedulePickupDialog
        orderId={order.id}
        open={reschedOpen}
        onOpenChange={setReschedOpen}
      />

      {dropOff && !dropOff.expired && !dropOff.fulfilledAt && (
        <div className="mt-3 rounded-md bg-info/10 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-info-ink">
            <MapPin className="size-4 text-info" /> {t("order.pickDropOffTitle")}
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
              const now = useOrderStore
                .getState()
                .orders.find((o) => o.id === order.id);
              if (now?.dropOff?.fulfilledAt)
                toast.success(t("order.pickDropOffConfirmedToast"));
            }}
          >
            <CheckCircle2 /> {t("order.pickDropOffCta")}
          </Button>
          {/* "the nearest FedEx location" must not be a scavenger hunt —
              the assistant hands over the address on request */}
          <a
            href={WA_URL}
            target="_blank"
            rel="noreferrer"
            className="link-mark tap-row relative mt-3 flex w-fit items-center gap-1.5 text-sm font-medium"
          >
            <MessageCircle className="size-3.5" /> {t("order.pickDropOffAsk")}
          </a>
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
