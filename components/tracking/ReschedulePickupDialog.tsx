"use client";

import * as React from "react";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { PICKUP_WINDOWS } from "@/components/order/module-options";
import { useT } from "@/lib/i18n/LanguageProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { DatePicker, todayIso } from "@/components/ui/date-picker";
import { SelectField } from "@/components/ui/select-field";

/**
 * Re-pickup scheduling: after a failed attempt the customer names the new date
 * and window themselves rather than the app silently picking one. The chosen
 * slot overwrites the pickup module's schedule, so the order record stays true.
 */
export function ReschedulePickupDialog({
  orderId,
  open,
  onOpenChange,
}: {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const reschedulePickup = useOrderStore((s) => s.reschedulePickup);
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setDate("");
      setTime("");
    }
  }, [open]);

  const submit = () => {
    if (!date || !time) {
      toast.error(t("order.pickReschedDateRequired"));
      return;
    }
    reschedulePickup(orderId, { date, time });
    const now = useOrderStore.getState().orders.find((o) => o.id === orderId);
    onOpenChange(false);
    if (now && !now.pickupChoicePending)
      toast.success(t("order.pickChoiceRepickupToast"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="p-5 pb-4 sm:p-6 sm:pb-4">
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="size-5 text-foreground" />
            {t("order.pickReschedTitle")}
          </DialogTitle>
          <DialogDescription>{t("order.pickReschedBody")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 sm:px-6">
          <div>
            <Label htmlFor="resched-date">{t("order.puDate")}</Label>
            <DatePicker
              id="resched-date"
              value={date}
              onChange={setDate}
              min={todayIso()}
              ariaLabel={t("order.puDate")}
              className="mt-1.5"
            />
          </div>

          <div>
            {/* SelectField's trigger is a button, not a labelable control —
                it carries its own accessible name via ariaLabel */}
            <Label>{t("order.puTime")}</Label>
            <SelectField
              value={time}
              onChange={setTime}
              options={PICKUP_WINDOWS.map((w) => ({ value: w, label: w }))}
              placeholder={t("order.pickReschedTimePlaceholder")}
              ariaLabel={t("order.puTime")}
              wrapperClassName="mt-1.5"
            />
          </div>

        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t("order.awbDialogCancel")}
          </Button>
          <Button onClick={submit}>{t("order.pickReschedSubmit")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
