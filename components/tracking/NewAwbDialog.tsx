"use client";

import * as React from "react";
import { toast } from "sonner";
import { PackageX, Truck, Store } from "lucide-react";
import {
  useOrderStore,
  type AwbService,
} from "@/lib/store/useOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { SegmentedRoot, SegmentedItem } from "@/components/ui/toggle-group";

/**
 * New-AWB request: after 3 customer-fault pickup failures the customer picks a
 * handling method (re-pickup / drop-off) + a new date. Submitting hands the
 * request to ops, which issues a fresh AWB + a new quotation to approve — the
 * order then restarts the pickup phase with the same Rimkirim tracking number.
 */
export function NewAwbDialog({
  orderId,
  open,
  onOpenChange,
}: {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const requestNewAwb = useOrderStore((s) => s.requestNewAwb);
  const [service, setService] = React.useState<AwbService>("pickup");
  const [date, setDate] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setService("pickup");
      setDate("");
    }
  }, [open]);

  const today = new Date().toISOString().slice(0, 10);

  const submit = () => {
    if (!date) {
      toast.error(t("order.awbDialogDateRequired"));
      return;
    }
    requestNewAwb(orderId, { service, date });
    onOpenChange(false);
    toast.info(t("order.pickAwbRequestedToast"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="p-5 pb-4 sm:p-6 sm:pb-4">
          <DialogTitle className="flex items-center gap-2">
            <PackageX className="size-5 text-brand" />
            {t("order.awbDialogTitle")}
          </DialogTitle>
          <DialogDescription>{t("order.awbDialogBody")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
          <div>
            <Label>{t("order.awbDialogService")}</Label>
            <SegmentedRoot
              type="single"
              value={service}
              onValueChange={(v) => v && setService(v as AwbService)}
              className="mt-1.5"
            >
              <SegmentedItem value="pickup">
                <Truck className="size-4" /> {t("order.awbServicePickup")}
              </SegmentedItem>
              <SegmentedItem value="drop-off">
                <Store className="size-4" /> {t("order.awbServiceDropOff")}
              </SegmentedItem>
            </SegmentedRoot>
          </div>

          <div>
            <Label htmlFor="awb-date">{t("order.awbDialogDate")}</Label>
            <Input
              id="awb-date"
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {t("order.awbDialogCancel")}
            </Button>
            <Button className="flex-1" onClick={submit}>
              {t("order.awbDialogSubmit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
