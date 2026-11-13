"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CollapseHeight } from "@/components/ui/disclosure";
import { ReviewNote } from "@/components/expat/ReviewNote";
import { ORDER_REVIEW_NOTES } from "@/lib/data/expat-order-notes";
import { waLink } from "@/lib/contact";
import { useExpatOrderHydrated, useExpatOrderStore } from "@/lib/store/useExpatOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { bookingFacts } from "./booking-facts";
import { BookingHead } from "./BookingHead";
import { CustomsPaths } from "./CustomsPaths";
import { FlowLoading } from "./FlowLoading";
import { Fold, TYPE } from "./kit";
import { clearJustBooked, justBooked } from "./visit";

/** how many packages the summary lists before it folds the rest */
const PACKAGES_SHOWN = 5;

/**
 * The page is set in a cut of the flow's system (kit.tsx), and nothing else:
 *   Type   24/32 the head's two (the title, the booking number), 16/24 a
 *          card's heading and the estimate, 14/20 what's read (500 for the
 *          line that leads), 12/16 a label, small print, a step's number
 *   Space  4 8 12 16 24 48
 *   Colour paper, wash, ink, muted. No lime: there's nothing left to act on.
 */

/** one row of the record: its label over what it holds on a phone, beside it
 *  from sm, on one baseline. The label is small and muted, so it never reads
 *  as a line of the value */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-t border-border py-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/** one package in the record: what it is, its measures, what's inside */
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
 * The Booking Summary, on the flow's field like the steps before it, in the
 * order the customer needs it: the received head with the booking number,
 * then what happens next, then the record of what they booked, then a way to
 * ask. On a phone that's one column, so what happens next is a screen up, not
 * after the whole record. From lg the head runs across, the record takes the
 * wide column (its rows want the width) and what happens next stands beside
 * it, as the Selected Service did on the plan, with the way to ask under it.
 * Each fold sits in the card it belongs to: the documents under the steps
 * that ask for them, the other answers at the foot of the record. The
 * Customs Category never shows.
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
  // the pickup date is the one day the customer prepares for: inside its
  // step's sentence it's set in ink, so it isn't lost in the line
  const dated = (body: string) => {
    const at = f.pickup ? body.indexOf(f.pickup) : -1;
    if (at < 0) return body;
    return (
      <>
        {body.slice(0, at)}
        <span className="font-medium text-foreground">{f.pickup}</span>
        {body.slice(at + f.pickup.length)}
      </>
    );
  };

  return (
    <div data-field data-flow className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6">
      <ReviewNote note={ORDER_REVIEW_NOTES.booking} className="mb-6" />

      {/* what the customer typed is shown as typed, and some of it can't
          wrap by itself (an email, a long word in an address): it may break
          anywhere, and the columns are stated (minmax(0, 1fr)) so nothing
          unbreakable can widen the page past the screen. From lg the record
          spans the last two rows, and the last row is the flexible one, so
          the way to ask sits right under what happens next however long the
          record runs */}
      <div className="grid grid-cols-1 gap-4 [overflow-wrap:anywhere] lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_auto_1fr] lg:items-start lg:gap-x-12 lg:gap-y-6">
        <Card className="min-w-0 p-4 sm:p-6 lg:col-span-2">
          <BookingHead number={f.number} email={f.contact.email} headingId="booking-heading" fresh={fresh} />
        </Card>

        <Card className="min-w-0 px-4 pt-4 sm:px-6 sm:pt-6 lg:col-start-2 lg:row-start-2">
          <section aria-labelledby="next-heading">
            <h2 id="next-heading" className={TYPE.subhead}>
              {bk("nextTitle")}
            </h2>
            <ol className="mt-4 grid grid-cols-1 gap-4">
              {f.next.map((n, i) => (
                <li key={n.title} className="flex gap-3">
                  {/* as tall as its title's line, so the two sit level;
                      wash, as a part still ahead is on the plan */}
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-medium tabular-nums">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium">{n.title}</h3>
                    <p className="mt-1 text-pretty text-sm text-muted">{dated(n.body)}</p>
                  </div>
                </li>
              ))}
            </ol>
            {/* not a step: when the invoice comes, under the steps and apart from the pickup */}
            <p className="mt-4 border-t border-border py-4 text-pretty text-sm text-muted">{f.invoice}</p>
            <CustomsPaths id="documents" title={t("expatOrder.customs.docsTitle")} edges="top" />
          </section>
        </Card>

        <Card className="min-w-0 px-4 pt-4 sm:px-6 sm:pt-6 lg:col-start-1 lg:row-span-2 lg:row-start-2">
          <section aria-labelledby="record-heading">
            <h2 id="record-heading" className={TYPE.subhead}>
              {bk("record")}
            </h2>
            <dl className="mt-4">
              <Row label={bk("route")}>
                <p className="font-medium">{f.from.country}</p>
                <p className="text-muted">{f.from.address}</p>
                {f.from.detail && <p className="text-muted">{f.from.detail}</p>}
                <p className="mt-2 font-medium">{f.to.country}</p>
                <p className="text-muted">{f.to.address}</p>
                {f.to.detail && <p className="text-muted">{f.to.detail}</p>}
              </Row>
              <Row label={bk("shipping")}>
                <p className="font-medium">{f.shipping.service}</p>
                <p className="text-muted">
                  {[f.shipping.special && t("expatOrder.rates.special"), f.shipping.transit, f.shipping.weight]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {/* an estimate, not the figure to keep: the booking number is */}
                <p className="mt-2 font-mono text-base font-semibold tabular-nums">{f.shipping.estimate}</p>
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
                <p className="mt-1 text-xs text-muted">{f.packReminder}</p>
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
            <Fold id="your-answers" title={bk("answers")} className="border-t border-border">
              <dl className="grid grid-cols-1 gap-2 text-sm">
                {f.answers.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-1 gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </Fold>
          </section>
        </Card>

        <div className="grid grid-cols-1 justify-items-start gap-4 lg:col-start-2 lg:row-start-3">
          <p className="text-sm text-muted">
            {bk("help")}{" "}
            <a
              href={waLink(bk("helpWa").replace("{number}", f.number))}
              target="_blank"
              rel="noreferrer"
              className="link-mark tap-row relative"
            >
              {bk("helpCta")}
            </a>
          </p>
          {/* a link as the help's is, so its arrow stands on the line the
              help starts on (a ghost button's padding set it in) and its
              focus ring stays inside the gutter on a phone */}
          <Link href="/expat-relocation" className="link-mark tap-row relative inline-flex items-center gap-2 text-sm">
            <ArrowLeft aria-hidden className="size-4 shrink-0" />
            {bk("home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
