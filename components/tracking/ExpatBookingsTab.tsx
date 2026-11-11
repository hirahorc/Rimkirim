"use client";

import * as React from "react";
import { Mail, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingEmail } from "@/components/expat-order/BookingEmail";
import { bookingFacts, englishT } from "@/components/expat-order/booking-facts";
import type { ExpatBooking } from "@/lib/order/expat-order";
import { useExpatOrderHydrated, useExpatOrderStore } from "@/lib/store/useExpatOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * The internal system's view of expat bookings (mock): each ticket with its
 * provisional Customs Category, the full eligibility payload and contact the
 * epic carries into the ticket, the packages with each item's value and
 * how many photos came with it, who the confirmation went to, and the email
 * itself. The one place the Customs Category is shown, because it's ops'.
 */
export function ExpatBookingsTab() {
  const t = useT();
  const hydrated = useExpatOrderHydrated();
  const bookings = useExpatOrderStore((s) => s.bookings);
  const [preview, setPreview] = React.useState<ExpatBooking | null>(null);

  if (!hydrated) return null;
  if (bookings.length === 0) {
    return <Card className="p-10 text-center text-sm text-muted">{t("expatOrder.ops.empty")}</Card>;
  }

  return (
    <div className="max-w-3xl space-y-4">
      {bookings.map((b) => {
        // the payload in the customer's words (English), as the ticket holds it
        const f = bookingFacts(b, englishT);
        return (
          <Card key={b.number} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold tabular-nums">{b.number}</p>
                <p className="text-xs text-muted">
                  {new Date(b.createdAt).toLocaleString()} · {f.from.country} → Indonesia · {f.shipping.service} ·{" "}
                  {f.shipping.estimate}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 font-mono text-xs font-medium text-warning-ink">
                <ShieldAlert aria-hidden className="size-3.5" />
                {b.customsCategory}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-2">
              {t("expatOrder.ops.category")} · {t("expatOrder.ops.internal")}
            </p>

            <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium text-muted">{t("expatOrder.ops.answers")}</p>
                <dl className="space-y-1 text-sm">
                  <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-2">
                    <dt className="text-muted">{englishT("expatOrder.booking.items")}</dt>
                    <dd>{f.items.join(", ")}</dd>
                  </div>
                  {f.answers.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-2">
                      <dt className="text-muted">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted">{t("expatOrder.ops.contact")}</p>
                <p className="text-sm">{f.contact.name}</p>
                <p className="text-sm">{f.contact.email}</p>
                <p className="text-sm tabular-nums">{f.contact.phone}</p>
                <p className="mt-3 text-sm text-muted">
                  {englishT("expatOrder.booking.pickup")}: {f.pickup}
                </p>
                {f.pickupLines.map((line) => (
                  <p key={line} className="text-sm text-muted">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {f.packing && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-1 text-xs font-medium text-muted">{t("expatOrder.ops.packing")}</p>
                <p className="text-sm">{f.packing.summary}</p>
                <p className="text-xs text-muted">{t("expatOrder.ops.checked").replace("{kg}", f.checkedKg)}</p>
                <ol className="mt-3 space-y-3">
                  {f.packing.packages.map((pk) => (
                    <li key={pk.title} className="text-sm">
                      <p className="font-medium">{pk.title}</p>
                      <p className="text-xs tabular-nums text-muted">
                        {pk.measures} · {t("expatOrder.ops.photos").replace("{n}", String(pk.photos))}
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {pk.items.map((it, i) => (
                          <li key={i} className="grid grid-cols-[minmax(0,1fr)_3rem_7rem] gap-2 tabular-nums">
                            <span>{it.name}</span>
                            <span className="text-right">× {it.quantity}</span>
                            <span className="text-right text-muted">{it.value || "–"}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-xs text-muted">
                {t("expatOrder.ops.emailTo")}: {b.emailTo.join(", ")}
              </p>
              <Button type="button" variant="secondary" size="sm" onClick={() => setPreview(b)}>
                <Mail /> {t("expatOrder.ops.preview")}
              </Button>
            </div>
          </Card>
        );
      })}

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("expatOrder.ops.previewTitle")}</DialogTitle>
            {preview && (
              <DialogDescription>
                {englishT("expatOrder.email.subject").replace("{number}", preview.number)} · {preview.emailTo.join(", ")}
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogBody className="pb-6">
            {preview && <BookingEmail facts={bookingFacts(preview, englishT)} t={englishT} />}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
