"use client";

import type * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgePercent,
  MessageCircle,
  PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import { ReviewNote } from "@/components/expat/ReviewNote";
import { ORDER_REVIEW_NOTES } from "@/lib/data/expat-order-notes";
import { waLink } from "@/lib/contact";
import {
  useExpatOrderHydrated,
  useExpatOrderStore,
} from "@/lib/store/useExpatOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { bookingFacts } from "./booking-facts";
import { BookingTicketHead } from "./BookingTicketHead";
import { CustomsPaths } from "./CustomsPaths";
import { FlowLoading } from "./FlowLoading";

/** one block on the ticket's stub: a label, then what it holds */
function Stub({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-display text-xs font-medium uppercase tracking-[0.04em] text-dusk-soft">
        {label}
      </dt>
      <dd className="mt-2 space-y-0.5 text-sm leading-relaxed text-background/90">
        {children}
      </dd>
    </div>
  );
}

/**
 * The Booking Summary: the booking set as the landing's dusk ticket (DESIGN.md,
 * The dusk ticket), where the trip the pages walk from sky through violet
 * lands. Above the tear line, that it's received and its number; on the stub,
 * the route, the rate, what's shipping, the pickup and the contact. Then, on
 * the desk, what happens next, the other answers folded, the documents each
 * Customs Path needs, and a way to ask. The Customs Category never shows.
 */
export function BookingView({ number }: { number: string }) {
  const t = useT();
  const bk = (k: string) => t(`expatOrder.booking.${k}`);
  const hydrated = useExpatOrderHydrated();
  const booking = useExpatOrderStore((s) =>
    s.bookings.find((b) => b.number === number),
  );

  if (!hydrated) return <FlowLoading />;

  if (!booking) {
    return (
      <div
        data-tone="magenta"
        className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6"
      >
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {bk("notFoundTitle")}
        </h1>
        <p className="mt-3 text-muted">{bk("notFoundBody")}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/expat-relocation/rates">{bk("notFoundCta")}</Link>
        </Button>
      </div>
    );
  }

  const f = bookingFacts(booking, t);

  return (
    <div data-tone="magenta" className="pb-20">
      <div className="mx-auto max-w-6xl px-3 pt-8 sm:px-6 sm:pt-10">
        <ReviewNote note={ORDER_REVIEW_NOTES.booking} className="mb-6" />

        <article
          aria-labelledby="booking-heading"
          className="rounded-lg bg-dusk text-background"
        >
          <header className="px-5 pb-10 pt-10 sm:px-10 sm:pt-12 lg:px-14">
            <BookingTicketHead number={f.number} email={f.contact.email} headingId="booking-heading" />
          </header>

          {/* the landing ticket's tear line: notches where the desk shows through */}
          <div aria-hidden className="ticket-tear relative">
            <div className="ticket-tear-line mx-5 border-t border-dashed border-background/25 sm:mx-10 lg:mx-14" />
            <span className="absolute left-0 top-0 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />
            <span className="absolute right-0 top-0 size-6 -translate-y-1/2 translate-x-1/2 rounded-full bg-background" />
          </div>

          <dl className="grid gap-x-10 gap-y-8 px-5 pb-10 pt-8 sm:grid-cols-2 sm:px-10 lg:grid-cols-3 lg:px-14 lg:pb-14">
            <Stub label={bk("route")}>
              <p className="font-medium text-background">{f.from.country}</p>
              <p>{f.from.address}</p>
              {f.from.detail && (
                <p className="text-dusk-soft">{f.from.detail}</p>
              )}
              <p className="pt-2 font-medium text-background">{f.to.country}</p>
              <p>{f.to.address}</p>
              {f.to.detail && <p className="text-dusk-soft">{f.to.detail}</p>}
            </Stub>
            <Stub label={bk("shipping")}>
              <p className="font-medium text-background">
                {f.shipping.service}
              </p>
              {f.shipping.special && (
                <p className="inline-flex items-center gap-1 text-dusk-soft">
                  <BadgePercent aria-hidden className="size-3.5" />{" "}
                  {t("expatOrder.rates.special")}
                </p>
              )}
              <p>
                {f.shipping.transit} · {f.shipping.weight}
              </p>
              <p className="pt-2 font-display text-2xl font-bold tracking-tight text-background tabular-nums">
                {f.shipping.estimate}
              </p>
              <p className="text-xs text-dusk-soft">
                {t("expatOrder.service.note")}
              </p>
            </Stub>
            <Stub label={bk("items")}>
              <ul className="space-y-0.5">
                {f.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              {f.furniture && (
                <p className="flex gap-2 pt-2 text-dusk-soft">
                  <PackageOpen aria-hidden className="mt-0.5 size-4 shrink-0" />
                  {bk("furnitureReminder")}
                </p>
              )}
            </Stub>
            <Stub label={bk("pickup")}>
              <p className="font-medium text-background">{f.pickup}</p>
            </Stub>
            <Stub label={bk("contact")}>
              <p className="font-medium text-background">{f.contact.name}</p>
              <p>{f.contact.email}</p>
              <p className="tabular-nums">{f.contact.phone}</p>
            </Stub>
          </dl>
        </article>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <section aria-labelledby="next-heading">
            <h2
              id="next-heading"
              className="font-display text-2xl font-semibold tracking-tight"
            >
              {bk("nextTitle")}
            </h2>
            <ol className="mt-6 space-y-6">
              {f.next.map((n, i) => (
                <li key={n.title} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-3 font-display text-sm font-semibold tabular-nums text-tone-ink">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold tracking-tight">
                      {n.title}
                    </h3>
                    <p className="mt-1 leading-relaxed text-muted">{n.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className="space-y-8">
            {/* two folded rows, one list: the answers' rule, then the paths' */}
            <div>
              <div className="border-t border-border">
                <Disclosure id="your-answers" question={bk("answers")}>
                  <dl className="space-y-2 text-sm">
                    {f.answers.map(([k, v]) => (
                      <div
                        key={k}
                        className="grid grid-cols-[10rem_minmax(0,1fr)] gap-3"
                      >
                        <dt className="text-muted">{k}</dt>
                        <dd className="font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </Disclosure>
              </div>
              <CustomsPaths
                id="documents"
                title={t("expatOrder.customs.docsTitle")}
              />
            </div>
            <p className="text-sm text-muted">
              {bk("help")}{" "}
              <a
                href={waLink(bk("helpWa").replace("{number}", f.number))}
                target="_blank"
                rel="noreferrer"
                className="link-mark tap-row relative inline-flex items-start gap-1.5"
              >
                <MessageCircle aria-hidden className="mt-0.5 size-4 shrink-0" />{" "}
                {bk("helpCta")}
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
    </div>
  );
}
