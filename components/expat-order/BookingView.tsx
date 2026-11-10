"use client";

import type * as React from "react";
import Link from "next/link";
import { ArrowLeft, BadgePercent, MessageCircle, PackageOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Disclosure } from "@/components/ui/disclosure";
import { ReviewNote } from "@/components/expat/ReviewNote";
import { ORDER_REVIEW_NOTES } from "@/lib/data/expat-order-notes";
import { waLink } from "@/lib/contact";
import { useExpatOrderHydrated, useExpatOrderStore } from "@/lib/store/useExpatOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { bookingFacts } from "./booking-facts";
import { BookingHead } from "./BookingHead";
import { CustomsPaths } from "./CustomsPaths";
import { FlowLoading } from "./FlowLoading";

/** one row of the summary: its label on the left, what it holds beside it,
 *  a hairline between rows (the app's line-item reading) */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-border py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="space-y-0.5 text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

/**
 * The Booking Summary, on the app's field like the steps before it: a white
 * card with the received head and the booking number, then the summary as
 * rows (route, shipping, what's shipping, the packages, pickup, contact). Beside it, what
 * happens next, the other answers and the documents each Customs Path needs,
 * folded, and a way to ask. The Customs Category never shows.
 */
export function BookingView({ number }: { number: string }) {
  const t = useT();
  const bk = (k: string) => t(`expatOrder.booking.${k}`);
  const hydrated = useExpatOrderHydrated();
  const booking = useExpatOrderStore((s) => s.bookings.find((b) => b.number === number));

  if (!hydrated) return <FlowLoading />;

  if (!booking) {
    return (
      <div data-field className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">{bk("notFoundTitle")}</h1>
        <p className="mt-3 text-muted">{bk("notFoundBody")}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/expat-relocation/rates">{bk("notFoundCta")}</Link>
        </Button>
      </div>
    );
  }

  const f = bookingFacts(booking, t);

  return (
    <div data-field className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
      <ReviewNote note={ORDER_REVIEW_NOTES.booking} className="mb-6" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <Card className="px-5 py-6 sm:px-8 sm:py-8">
          <article aria-labelledby="booking-heading">
            <BookingHead number={f.number} email={f.contact.email} headingId="booking-heading" />

            <dl className="mt-6">
              <Row label={bk("route")}>
                <p className="font-medium">{f.from.country}</p>
                <p className="text-muted">{f.from.address}</p>
                {f.from.detail && <p className="text-muted">{f.from.detail}</p>}
                <p className="pt-2 font-medium">{f.to.country}</p>
                <p className="text-muted">{f.to.address}</p>
                {f.to.detail && <p className="text-muted">{f.to.detail}</p>}
              </Row>
              <Row label={bk("shipping")}>
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {f.shipping.service}
                  {f.shipping.special && (
                    <Badge variant="brand">
                      <BadgePercent aria-hidden className="size-3.5" /> {t("expatOrder.rates.special")}
                    </Badge>
                  )}
                </p>
                <p className="text-muted">
                  {f.shipping.transit} · {f.shipping.weight}
                </p>
                <p className="pt-2 font-display text-2xl font-bold tracking-tight tabular-nums">{f.shipping.estimate}</p>
                <p className="text-xs text-muted">{t("expatOrder.service.note")}</p>
              </Row>
              <Row label={bk("items")}>
                <ul className="space-y-0.5">
                  {f.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
                <p className="flex gap-2 pt-2 text-muted">
                  <PackageOpen aria-hidden className="mt-0.5 size-4 shrink-0 text-info" />
                  {f.packReminder}
                </p>
              </Row>
              {f.packing && (
                <Row label={bk("packing")}>
                  <p className="font-medium">{f.packing.summary}</p>
                  <ol className="space-y-2 pt-2">
                    {f.packing.packages.map((pk) => (
                      <li key={pk.title}>
                        <p>{pk.title}</p>
                        <p className="tabular-nums text-muted">{pk.measures}</p>
                        <p className="text-muted">{pk.items.map((it) => `${it.name} × ${it.quantity}`).join(", ")}</p>
                      </li>
                    ))}
                  </ol>
                </Row>
              )}
              <Row label={bk("pickup")}>
                <p className="font-medium">{f.pickup}</p>
              </Row>
              <Row label={bk("contact")}>
                <p className="font-medium">{f.contact.name}</p>
                <p className="text-muted">{f.contact.email}</p>
                <p className="tabular-nums text-muted">{f.contact.phone}</p>
              </Row>
            </dl>
          </article>
        </Card>

        <div className="space-y-6">
          <Card className="px-5 py-6 sm:px-6">
            <section aria-labelledby="next-heading">
              <h2 id="next-heading" className="font-display text-lg font-semibold tracking-tight">
                {bk("nextTitle")}
              </h2>
              <ol className="mt-5 space-y-5">
                {f.next.map((n, i) => (
                  <li key={n.title} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 font-display text-xs font-semibold tabular-nums">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{n.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{n.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </Card>

          {/* two folded rows, one list: the answers, then the documents */}
          <Card className="px-3 py-1 sm:px-4">
            <Disclosure id="your-answers" question={bk("answers")}>
              <dl className="space-y-2 text-sm">
                {f.answers.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </Disclosure>
            <CustomsPaths id="documents" title={t("expatOrder.customs.docsTitle")} edges="top" />
          </Card>

          <p className="text-sm text-muted">
            {bk("help")}{" "}
            <a
              href={waLink(bk("helpWa").replace("{number}", f.number))}
              target="_blank"
              rel="noreferrer"
              className="link-mark tap-row relative inline-flex items-start gap-1.5"
            >
              <MessageCircle aria-hidden className="mt-0.5 size-4 shrink-0" /> {bk("helpCta")}
            </a>
          </p>
          <Button asChild variant="ghost" className="-ml-4">
            <Link href="/expat-relocation">
              <ArrowLeft /> {bk("home")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
