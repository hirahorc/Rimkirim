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
  DialogBody,
  DialogFooter,
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
        <DialogHeader>
          <DialogTitle>
            <PackageX />
            {t("order.awbDialogTitle")}
          </DialogTitle>
          <DialogDescription>{t("order.awbDialogBody")}</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
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
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t("order.awbDialogCancel")}
          </Button>
          <Button onClick={submit}>{t("order.awbDialogSubmit")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
