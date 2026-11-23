"use client";

import * as React from "react";
import { ClipboardDocumentListIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n/LanguageProvider";
import { QUIET } from "./kit";

/** once the head's three beats have landed: the mark, its check, the
 *  booking number's pop (450ms in, 200ms its own delay, 450ms long) */
const AFTER_BEATS_MS = 1000;

/** what customer experience completes with the customer, in the order it
 *  comes: the path's documents, then the packing list for customs */
const THINGS = [
  { key: "docs", Icon: DocumentTextIcon },
  { key: "list", Icon: ClipboardDocumentListIcon },
] as const;

/**
 * Said once, on arriving from Confirm application (`fresh`): who gets in touch
 * next, when, where, and what for. Customer experience contacts the customer
 * on WhatsApp and email within 1 working day, before the quotation, to
 * complete the customs documents (Document Compliance) and the packing list
 * (Create Packing List). It opens after the received head has had its
 * moment, and never on a reload or a link back. A dialog is gone once it's
 * closed, so the same facts stand in What happens next (step 1) and its email.
 * There's nothing left to act on: "Got it" is quiet, no lime.
 */
export function ContactDialog({ fresh }: { fresh: boolean }) {
  const t = useT();
  const r = (k: string) => t(`expatOrder.booking.reach.${k}`);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!fresh) return;
    // with motion reduced the beats don't play, so there's nothing to wait for
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(() => setOpen(true), still ? 0 : AFTER_BEATS_MS);
    return () => window.clearTimeout(id);
  }, [fresh]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-md"
        // the dialog itself takes focus, as the customs guide does: it
        // opened itself, and a ring on a button nobody reached for reads as
        // a fault. Tab starts inside it, and a screen reader reads its title
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.target as HTMLElement | null)?.focus({ preventScroll: true });
        }}
      >
        <DialogHeader>
          {/* clear of the modal's close button; the sheet has none */}
          <DialogTitle className="text-balance sm:pr-10">{r("title")}</DialogTitle>
          <DialogDescription className="text-pretty">{r("lead")}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <ul className="grid grid-cols-1 gap-4">
            {THINGS.map(({ key, Icon }) => (
              <li key={key} className="flex gap-3">
                {/* wash, as a step still ahead wears on the summary */}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2">
                  <Icon aria-hidden className="size-4" strokeWidth={2} />
                </span>
                {/* its first line level with the mark's middle */}
                <div className="min-w-0 pt-1.5">
                  <h3 className="text-sm font-medium">{r(`${key}Title`)}</h3>
                  <p className="mt-1 text-pretty text-sm text-muted">{r(`${key}Body`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" className={QUIET}>
              {r("gotIt")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
