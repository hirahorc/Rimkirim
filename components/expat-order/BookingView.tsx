"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, BadgePercent, MessageCircle, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CollapseHeight } from "@/components/ui/disclosure";
import { ReviewNote } from "@/components/expat/ReviewNote";
import { ORDER_REVIEW_NOTES } from "@/lib/data/expat-order-notes";
import { waLink } from "@/lib/contact";
import { useExpatOrderHydrated, useExpatOrderStore } from "@/lib/store/useExpatOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { bookingFacts } from "./booking-facts";
import { BookingHead } from "./BookingHead";
import { CustomsPaths } from "./CustomsPaths";
import { FlowLoading } from "./FlowLoading";
import { Chip, Fold, TYPE } from "./kit";
import { clearJustBooked, justBooked } from "./visit";

/** how many packages the summary lists before it folds the rest */
const PACKAGES_SHOWN = 5;

/** one row of the summary: its label on the left, what it holds beside it,
 *  a hairline between rows (the app's line-item reading) */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-t border-border py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/** one package in the summary: what it is, its measures, what's inside */
function PackageLine({ pk }: { pk: { title: string; measures: string; items: { name: string; quantity: number }[] } }) {
  return (
    <li>
      <p>{pk.title}</p>
      <p className="tabular-nums text-muted">{pk.measures}</p>
      <p className="text-muted">{pk.items.map((it) => `${it.name} × ${it.quantity}`).join(", ")}</p>
    </li>
  );
}

/**
 * The Booking Summary, on the flow's field like the steps before it: a paper
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
  // a long list shows its first few packages until it's asked for whole
  const [allPackages, setAllPackages] = React.useState(false);
  // arrived from Confirm application, not a reload or a link back to it:
  // read once as the page mounts, then forgotten, so a reload finds nothing
  const [fresh] = React.useState(() => justBooked() === number);
  React.useEffect(clearJustBooked, []);

  if (!hydrated) return <FlowLoading />;

  if (!booking) {
    return (
      <div data-field data-flow className="mx-auto max-w-xl px-4 py-12 text-center sm:px-6">
        <h1 className={TYPE.title}>{bk("notFoundTitle")}</h1>
        <p className="mt-1 text-sm text-muted">{bk("notFoundBody")}</p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/expat-relocation/rates">{bk("notFoundCta")}</Link>
        </Button>
      </div>
    );
  }

  const f = bookingFacts(booking, t);

  return (
    <div data-field data-flow className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
      <ReviewNote note={ORDER_REVIEW_NOTES.booking} className="mb-6" />

      {/* what the customer typed is shown as typed, and some of it can't
          wrap by itself (an email, a long word in an address): it may break
          anywhere, and the column is stated (minmax(0, 1fr)) so nothing
          unbreakable can widen the summary past the screen */}
      <div className="grid grid-cols-1 gap-4 [overflow-wrap:anywhere] lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-12">
        <Card className="min-w-0 p-4 sm:p-6">
          <article aria-labelledby="booking-heading">
            <BookingHead number={f.number} email={f.contact.email} headingId="booking-heading" fresh={fresh} />

            <dl className="mt-6">
              <Row label={bk("route")}>
                <p className="font-medium">{f.from.country}</p>
                <p className="text-muted">{f.from.address}</p>
                {f.from.detail && <p className="text-muted">{f.from.detail}</p>}
                <p className="mt-2 font-medium">{f.to.country}</p>
                <p className="text-muted">{f.to.address}</p>
                {f.to.detail && <p className="text-muted">{f.to.detail}</p>}
              </Row>
              <Row label={bk("shipping")}>
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {f.shipping.service}
                  {f.shipping.special && (
                    <Chip>
                      <BadgePercent aria-hidden /> {t("expatOrder.rates.special")}
                    </Chip>
                  )}
                </p>
                <p className="text-muted">
                  {f.shipping.transit} · {f.shipping.weight}
                </p>
                <p className={cn(TYPE.figure, "mt-2")}>{f.shipping.estimate}</p>
                <p className="mt-1 text-xs text-muted">{t("expatOrder.service.note")}</p>
              </Row>
              <Row label={bk("items")}>
                <ul>
                  {f.items.map((i) => (
                    <li key={i} className="font-medium">
                      {i}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 flex gap-2 text-muted">
                  <span className="flex h-5 shrink-0 items-center">
                    <PackageOpen aria-hidden className="size-4" />
                  </span>
                  {f.packReminder}
                </p>
              </Row>
              {f.packing && (
                <Row label={bk("packing")}>
                  <p className="font-medium">{f.packing.summary}</p>
                  <ol className="mt-2 grid grid-cols-1 gap-2">
                    {f.packing.packages.slice(0, PACKAGES_SHOWN).map((pk) => (
                      <PackageLine key={pk.title} pk={pk} />
                    ))}
                  </ol>
                  {/* the rest of a long list, behind "Show all": it opens with
                      the disclosure's height motion, as every other one does */}
                  {f.packing.packages.length > PACKAGES_SHOWN && (
                    <CollapseHeight open={allPackages} id="booking-packages">
                      <ol start={PACKAGES_SHOWN + 1} className="grid grid-cols-1 gap-2 pt-2">
                        {f.packing.packages.slice(PACKAGES_SHOWN).map((pk) => (
                          <PackageLine key={pk.title} pk={pk} />
                        ))}
                      </ol>
                    </CollapseHeight>
                  )}
                  {f.packing.packages.length > PACKAGES_SHOWN && (
                    <button
                      type="button"
                      aria-expanded={allPackages}
                      aria-controls="booking-packages"
                      onClick={() => setAllPackages((v) => !v)}
                      className="link-mark tap-row relative mt-2"
                    >
                      {allPackages
                        ? bk("packagesFewer")
                        : bk("packagesAll").replace("{n}", String(f.packing.packages.length))}
                    </button>
                  )}
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

        <div className="grid grid-cols-1 gap-4">
          <Card className="p-4 sm:p-6">
            <section aria-labelledby="next-heading">
              <h2 id="next-heading" className={TYPE.subhead}>
                {bk("nextTitle")}
              </h2>
              <ol className="mt-4 grid grid-cols-1 gap-4">
                {f.next.map((n, i) => (
                  <li key={n.title} className="flex gap-3">
                    {/* as tall as its title's line, so the two sit level */}
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-medium tabular-nums">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-medium">{n.title}</h3>
                      <p className="mt-1 text-sm text-muted">{n.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {/* not a step: when the invoice comes, under the steps and apart from the pickup */}
              <p className="mt-4 border-t border-border pt-4 text-sm text-muted">{f.invoice}</p>
            </section>
          </Card>

          {/* two folded rows, one list: the answers, then the documents */}
          <Card className="px-4 sm:px-6">
            <Fold id="your-answers" title={bk("answers")}>
              <dl className="grid grid-cols-1 gap-2 text-sm">
                {f.answers.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </Fold>
            <CustomsPaths id="documents" title={t("expatOrder.customs.docsTitle")} edges="top" />
          </Card>

          <p className="text-sm text-muted">
            {bk("help")}{" "}
            <a
              href={waLink(bk("helpWa").replace("{number}", f.number))}
              target="_blank"
              rel="noreferrer"
              className="link-mark tap-row relative"
            >
              <MessageCircle aria-hidden className="inline size-4 align-text-bottom" /> {bk("helpCta")}
            </a>
          </p>
          <Button asChild variant="ghost" className="justify-self-start">
            <Link href="/expat-relocation">
              <ArrowLeft /> {bk("home")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
