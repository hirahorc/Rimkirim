"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ReceiptText,
  CheckCircle2,
  MessageCircle,
  PenLine,
  Clock3,
} from "lucide-react";
import { useOrderStore, type Order } from "@/lib/store/useOrderStore";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils/currency";
import { RevisionDialog } from "./RevisionDialog";

const WA_URL = "https://wa.me/6281234567890";

/** The ops-issued quotation with approve / contact-support / revise actions. */
export function QuotationCard({ order }: { order: Order }) {
  const t = useT();
  const { locale } = useLanguage();
  const approveQuotation = useOrderStore((s) => s.approveQuotation);
  const [revOpen, setRevOpen] = React.useState(false);

  if (!order.quotation) return null;
  const qu = order.quotation;
  const pendingApproval = order.status === "quotation";
  const approved = [
    "pickup",
    "in-transit",
    "clearance",
    "delivery",
    "delivered",
  ].includes(order.status);

  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold tracking-tight">
            <ReceiptText className="size-4 text-brand" />
            {t("order.tdQuotationSection")}
          </h2>
          {pendingApproval ? (
            <Badge variant="brand">{t("order.quPending")}</Badge>
          ) : approved ? (
            <Badge variant="success">
              <CheckCircle2 className="size-3" /> {t("order.quApproved")}
            </Badge>
          ) : (
            <Badge variant="warning">{t("order.quInRevision")}</Badge>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted-2">{t("order.quTotal")}</p>
            <p className="mt-0.5 font-display text-3xl font-bold tracking-tight text-brand">
              {formatIDR(qu.total)}
            </p>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-2">
            <Clock3 className="size-3.5" />
            {t("order.quValidUntil")}: {dateFmt.format(qu.validUntil)}
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-2">
          {formatIDR(qu.perKg)} / {t("order.tdPerKg")} · {qu.chargeableKg} kg ·{" "}
          {t("order.quIssued")} {dateFmt.format(qu.issuedAt)}
        </p>

        <div className="mt-4 divide-y divide-border rounded-lg border border-border">
          {qu.items.map((it) => (
            <div
              key={it.labelKey}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <span className="text-muted">{t(it.labelKey)}</span>
              <span className="font-medium tabular-nums">
                {formatIDR(it.amount)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 bg-surface-2 px-3 py-2 text-sm font-semibold">
            <span>{t("order.quTotal")}</span>
            <span className="tabular-nums">{formatIDR(qu.total)}</span>
          </div>
        </div>

        {pendingApproval && (
          <div className="mt-4 space-y-2">
            <Button
              className="w-full"
              onClick={() => {
                approveQuotation(order.id);
                toast.success(t("order.quApprovedToast"));
              }}
            >
              <CheckCircle2 /> {t("order.quApprove")}
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={WA_URL} target="_blank" rel="noreferrer">
                <MessageCircle /> {t("order.quContact")}
              </a>
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setRevOpen(true)}
            >
              <PenLine /> {t("order.quRevise")}
            </Button>
          </div>
        )}
      </Card>

      <RevisionDialog
        orderId={order.id}
        open={revOpen}
        onOpenChange={setRevOpen}
      />
    </>
  );
}
