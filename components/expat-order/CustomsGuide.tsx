"use client";

import * as React from "react";
import { ChevronRight, ShieldCheck } from "lucide-react";
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
import { cn } from "@/lib/utils/cn";
import { CustomsBody } from "./CustomsPaths";
import { PRESS, QUIET } from "./kit";

/** remembered once the guide has been closed, so it opens itself only the
 *  first time (the device's, like the draft: storage that isn't there only
 *  means it opens itself again next time) */
const SEEN = "rimkirim:expat-order:customs-seen";
/** the plan is on screen this long before the guide opens itself, so the
 *  page is seen first and the guide is seen coming out of its button */
const FIRST_OPEN_MS = 500;
/** the panel's flight back into its button (globals.css, .customs-panel) */
const FLIGHT_MS = 350;
/** how long the words under the button stay, the first time */
const HINT_MS = 6000;
/** the words' own fade out (globals.css, .customs-hint) */
const HINT_OUT_MS = 200;

type Hint = "on" | "off" | null;

const Ctx = React.createContext<{
  open: boolean;
  show: () => void;
  register: (el: HTMLButtonElement | null) => (() => void) | undefined;
  caught: number;
  hint: Hint;
} | null>(null);

/** the one button on screen: there's one beside the form on a wide screen
 *  and one in the phone's bar, and only one is ever shown */
function onScreen(buttons: Set<HTMLButtonElement>) {
  return [...buttons].find((el) => el.getClientRects().length > 0) ?? null;
}

/** where the panel's centre goes to, and comes from: the centre of the
 *  button's words (in the phone's bar the button runs the bar's width, and
 *  its middle is the gap between the words and the chevron), measured from
 *  the screen's, where the modal's own centre is */
function aimAt(el: HTMLElement | null) {
  if (!el) return { x: 0, y: 0 };
  const r = (el.querySelector("[data-aim]") ?? el).getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2 - window.innerWidth / 2), y: Math.round(r.top + r.height / 2 - window.innerHeight / 2) };
}

/**
 * How the customer's belongings clear customs, on the plan wherever they
 * are in it: one button that's always on screen (beside the form under its
 * action on a wide screen, at the top of the bar on a phone) opens the
 * three Customs Paths in a dialog. The first time the plan opens, the guide
 * opens itself, half a second in, coming out of that button; closed, it
 * goes back into it (on a phone, the sheet slides into the bar it lives
 * in), the button takes it with one ring, and the first time, words under
 * it say it opens again from there. Focus comes back to the button, whose
 * name says the same to a screen reader.
 */
export function CustomsGuide({ children }: { children: React.ReactNode }) {
  const t = useT();
  const c = (k: string) => t(`expatOrder.customs.${k}`);
  const buttons = React.useRef(new Set<HTMLButtonElement>());
  const [open, setOpen] = React.useState(false);
  const [aim, setAim] = React.useState({ x: 0, y: 0 });
  // each landing replays the button's ring
  const [caught, setCaught] = React.useState(0);
  const [hint, setHint] = React.useState<Hint>(null);
  // the opening the guide made itself: closing that one teaches where it lives
  const first = React.useRef(false);
  const landing = React.useRef<number | undefined>(undefined);

  // the first time on the plan, it opens itself
  React.useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(SEEN) === "1";
    } catch {
      /* no storage: it opens itself on each visit */
    }
    if (seen) return;
    const id = window.setTimeout(() => {
      first.current = true;
      setAim(aimAt(onScreen(buttons.current)));
      setOpen(true);
    }, FIRST_OPEN_MS);
    return () => window.clearTimeout(id);
  }, []);
  React.useEffect(() => () => window.clearTimeout(landing.current), []);

  // the words stay a while, then fade
  React.useEffect(() => {
    if (!hint) return;
    const id = window.setTimeout(() => setHint(hint === "on" ? "off" : null), hint === "on" ? HINT_MS : HINT_OUT_MS);
    return () => window.clearTimeout(id);
  }, [hint]);

  const change = (next: boolean) => {
    // measured each way: the page may have moved while it was open
    setAim(aimAt(onScreen(buttons.current)));
    setOpen(next);
    if (next) {
      setHint(null);
      return;
    }
    try {
      window.localStorage.setItem(SEEN, "1");
    } catch {
      /* it opens itself again next time */
    }
    const lesson = first.current;
    first.current = false;
    // as it lands: the button takes it, and the first time says so
    window.clearTimeout(landing.current);
    landing.current = window.setTimeout(() => {
      setCaught((n) => n + 1);
      if (lesson) setHint("on");
    }, FLIGHT_MS);
  };

  const register = React.useCallback((el: HTMLButtonElement | null) => {
    if (!el) return;
    buttons.current.add(el);
    return () => {
      buttons.current.delete(el);
    };
  }, []);

  return (
    <Ctx.Provider value={{ open, show: () => change(true), register, caught, hint }}>
      {children}
      <Dialog open={open} onOpenChange={change}>
        <DialogContent
          className="customs-panel"
          style={{ "--to-x": `${aim.x}px`, "--to-y": `${aim.y}px` } as React.CSSProperties}
          // the dialog itself takes focus, as the sheet does, not "Got it":
          // it opened itself, and a ring on a button nobody reached for reads
          // as a fault (and stays on the guide's button once it's back).
          // Tab starts inside it, and a screen reader reads its title first
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.target as HTMLElement | null)?.focus({ preventScroll: true });
          }}
          // back to the button it went into: its name is the way back
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            onScreen(buttons.current)?.focus({ preventScroll: true });
          }}
        >
          <DialogHeader>
            {/* clear of the modal's close button; the sheet has none */}
            <DialogTitle className="sm:pr-10">{c("title")}</DialogTitle>
            <DialogDescription>{c("lead")}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <CustomsBody lead={false} inspection />
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" className={QUIET}>
                {c("gotIt")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* the words under the button, for who can't see them */}
      <p role="status" className="sr-only">
        {hint === "on" ? c("reopen") : ""}
      </p>
    </Ctx.Provider>
  );
}

/**
 * The guide's button. `side`: a paper card beside the form, under its
 * action. `bar`: a line at the top of the phone's bar, over the estimate.
 * The same words and mark in both, the guide's own title, so the button is
 * what the dialog is called.
 */
export function CustomsGuideButton({ placement, className }: { placement: "side" | "bar"; className?: string }) {
  const g = React.useContext(Ctx);
  const t = useT();
  if (!g) return null;
  // apart, so only the ref callback is a ref's (the compiler reads a whole
  // object as one once a field of it is passed as `ref`)
  const { open, show, register, caught, hint } = g;
  const below = placement === "side";
  return (
    <div className={cn("relative", className)}>
      <button
        ref={register}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={show}
        className={cn(
          "group flex w-full items-center gap-2 text-left text-sm font-medium",
          below
            ? // a card of its own on the field: the press tints the whole of it
              "relative rounded-lg bg-background px-4 py-3 transition-colors active:bg-surface-2 active:duration-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
            : // a line in the bar: the press tints the line, past its words
              cn(PRESS, "h-8"),
        )}
      >
        <ShieldCheck aria-hidden className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 underline-offset-[3px] group-hover:underline">
          {/* inline, so it's as wide as the words: what the panel aims at */}
          <span data-aim>{t("expatOrder.customs.title")}</span>
        </span>
        <ChevronRight aria-hidden className="size-4 shrink-0 text-muted transition-colors group-hover:text-foreground" />
        {/* the panel landing: one ring of Ink that fades */}
        {caught > 0 && (
          <span
            key={caught}
            aria-hidden
            className={cn("customs-catch pointer-events-none absolute", below ? "inset-0 rounded-lg" : "-inset-x-2 inset-y-0 rounded-sm")}
          />
        )}
      </button>
      {/* the first time it's closed: where it opens again, said beside the
          button, pointing at its mark. Above the bar on a phone, under the
          card beside the form */}
      {hint && (
        <p
          aria-hidden
          data-state={hint}
          style={{ "--hint-from": below ? "-4px" : "4px" } as React.CSSProperties}
          className={cn(
            "customs-hint pointer-events-none absolute left-0 z-10 w-max max-w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background",
            below ? "top-full mt-2" : "bottom-full mb-2",
          )}
        >
          {/* the bubble's point, under the button's mark */}
          <span
            aria-hidden
            className={cn("absolute size-2 rotate-45 bg-foreground", below ? "-top-1 left-5" : "-bottom-1 left-1")}
          />
          {t("expatOrder.customs.reopen")}
        </p>
      )}
    </div>
  );
}
