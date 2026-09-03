"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * Material's getAutoHeightDuration: the open/close duration is derived from
 * the travel distance, so a short panel snaps and a long one glides — the
 * *perceived speed* stays constant where a fixed `transition: height 300ms`
 * cannot. Replicated from the measured reference accordion (392px ⇒ 334ms).
 */
const autoDuration = (h: number) => {
  if (!h) return 0;
  const c = h / 36;
  // capped at 340ms: past that a tall panel reads as slow, not as smooth
  return Math.min(340, Math.round((4 + 15 * Math.pow(c, 0.25) + c / 5) * 10));
};

/** the system's one standard easing (DESIGN.md, Motion) */
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

/**
 * Controlled sibling of Disclosure for collapsibles whose open state lives in
 * React (package rows in the order form and tracking summary, the article
 * ToC): the same motion — height only, duration from content, `auto` when
 * settled — driven by a prop instead of a <details>. While closed the region
 * is `inert` and hidden, so nothing inside it can be tabbed into or read by
 * assistive tech. Instant on first render and under reduced motion.
 */
export function CollapseHeight({
  open,
  children,
  className,
  id,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
  /** lets the toggle point at the region with aria-controls */
  id?: string;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const animToken = React.useRef(0);
  const first = React.useRef(true);
  /* the initial state is frozen into the JSX once; every later change is
     applied imperatively in the effect. Binding height/visibility to `open`
     in JSX would have React write `height: auto` at commit — BEFORE the
     effect can measure the starting height — and silently kill the motion. */
  // frozen via a state initializer (runs once, never set again) — a ref
  // would work too but refs must not be read during render
  const [initialOpen] = React.useState(open);

  React.useEffect(() => {
    const panel = panelRef.current;
    const inner = innerRef.current;
    if (!panel || !inner) return;
    if (first.current) {
      first.current = false;
      if (open === initialOpen) return; // nothing to animate on mount
    }
    const token = ++animToken.current;

    const settle = (cb: () => void) => {
      const onEnd = (e: TransitionEvent) => {
        if (e.target !== panel || e.propertyName !== "height") return;
        panel.removeEventListener("transitionend", onEnd);
        if (animToken.current !== token) return;
        cb();
      };
      panel.addEventListener("transitionend", onEnd);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panel.style.transition = "";
      panel.style.height = open ? "auto" : "0px";
      panel.style.visibility = open ? "" : "hidden";
      return;
    }
    const from = panel.getBoundingClientRect().height;
    if (open) {
      panel.style.visibility = ""; // content must be visible to be measured
      const target = inner.scrollHeight;
      panel.style.transition = "none";
      panel.style.height = `${from}px`;
      void panel.getBoundingClientRect();
      panel.style.transition = `height ${autoDuration(target)}ms ${EASE}`;
      panel.style.height = `${target}px`;
      settle(() => {
        panel.style.transition = "";
        panel.style.height = "auto";
      });
    } else {
      panel.style.transition = "none";
      panel.style.height = `${from}px`;
      void panel.getBoundingClientRect();
      requestAnimationFrame(() => {
        if (animToken.current !== token) return;
        panel.style.transition = `height ${autoDuration(from)}ms ${EASE}`;
        panel.style.height = "0px";
        settle(() => {
          panel.style.transition = "";
          // hidden only once settled, so content stays visible while closing
          panel.style.visibility = "hidden";
        });
      });
    }
    // initialOpen never changes after mount (state initializer, never set)
  }, [open, initialOpen]);

  return (
    <div
      ref={panelRef}
      id={id}
      className="overflow-hidden"
      style={{
        height: initialOpen ? "auto" : 0,
        visibility: initialOpen ? undefined : "hidden",
      }}
      // interactivity gates on `open` directly: a collapsing panel should
      // already be untabbable, and this needs no settled-state bookkeeping
      inert={!open || undefined}
    >
      <div ref={innerRef} className={className}>
        {children}
      </div>
    </div>
  );
}

/**
 * One disclosure row — the site's single accordion idiom (DESIGN.md, Motion,
 * "The disclosure open"), shared by the /faq page and the article FAQs so the
 * two can never drift apart. Native `<details>` (built-in disclosure
 * semantics; the /faq deep link sets `el.open` imperatively) with the answer's
 * height animated open/closed. Behaviours replicated from the reference
 * accordion: height is the only animated property, the duration is computed
 * from the content height (autoDuration above), the chevron is swapped —
 * never rotated — and the open header carries no colour change; the icon
 * alone marks the state. The hit box is squared off and spans exactly the
 * divider width; the answer indents 12px past the question.
 */
export function Disclosure({
  id,
  question,
  children,
}: {
  /** DOM id on the <details> — /faq deep-links rely on it; optional elsewhere */
  id?: string;
  question: string;
  children: React.ReactNode;
}) {
  const detailsRef = React.useRef<HTMLDetailsElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  /* every toggle mints a new token; stale transitionend/rAF callbacks from an
     interrupted animation compare and bail, so rapid clicks can never leave
     the panel stuck at half height */
  const animToken = React.useRef(0);
  /* distinguishes our own details.open writes from external ones (deep-link) */
  const selfToggle = React.useRef(false);
  const [open, setOpen] = React.useState(false);

  const settle = (token: number, cb: () => void) => {
    const panel = panelRef.current;
    if (!panel) return;
    const onEnd = (e: TransitionEvent) => {
      if (e.target !== panel || e.propertyName !== "height") return;
      panel.removeEventListener("transitionend", onEnd);
      if (animToken.current !== token) return; // superseded by a newer toggle
      cb();
    };
    panel.addEventListener("transitionend", onEnd);
  };

  const toggle = () => {
    const details = detailsRef.current;
    const panel = panelRef.current;
    const inner = innerRef.current;
    if (!details || !panel || !inner) return;
    const token = ++animToken.current;
    const willOpen = !details.open;
    setOpen(willOpen); // the chevron swaps immediately, not after the motion

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      selfToggle.current = true;
      details.open = willOpen;
      panel.style.transition = "";
      panel.style.height = willOpen ? "auto" : "0px";
      return;
    }

    // an interrupted animation restarts from wherever the panel actually is
    const from = panel.getBoundingClientRect().height;

    if (willOpen) {
      selfToggle.current = true;
      details.open = true; // content must be live before it can be measured
      const target = inner.scrollHeight;
      panel.style.transition = "none";
      panel.style.height = `${from}px`;
      void panel.getBoundingClientRect(); // commit the start frame
      panel.style.transition = `height ${autoDuration(target)}ms ${EASE}`;
      panel.style.height = `${target}px`;
      settle(token, () => {
        // auto, so content that changes height while open is never clipped
        panel.style.transition = "";
        panel.style.height = "auto";
      });
    } else {
      // auto → measured px in one frame, then → 0 in the next: transitions
      // from `auto` don't run
      panel.style.transition = "none";
      panel.style.height = `${from}px`;
      void panel.getBoundingClientRect();
      requestAnimationFrame(() => {
        if (animToken.current !== token) return;
        panel.style.transition = `height ${autoDuration(from)}ms ${EASE}`;
        panel.style.height = "0px";
        settle(token, () => {
          // details closes only after the motion, or the content would vanish
          selfToggle.current = true;
          details.open = false;
          panel.style.transition = "";
        });
      });
    }
  };

  // External open/close (the #slug deep link sets `el.open = true` directly):
  // no animation — it is immediately followed by scrollIntoView, so the panel
  // must already be at its full height.
  const onToggle = () => {
    if (selfToggle.current) {
      selfToggle.current = false;
      return;
    }
    const details = detailsRef.current;
    const panel = panelRef.current;
    if (!details || !panel) return;
    animToken.current++; // cancel any in-flight animation callbacks
    setOpen(details.open);
    panel.style.transition = "";
    panel.style.height = details.open ? "auto" : "0px";
  };

  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <details ref={detailsRef} id={id} className="scroll-mt-24" onToggle={onToggle}>
      {/* hover fills the row, focus-visible fills it harder (the system's
          panel-fill idiom); the open header stays uncoloured on purpose */}
      <summary
        onClick={(e) => {
          e.preventDefault();
          toggle();
        }}
        className="flex cursor-pointer list-none items-center justify-between gap-4 px-2 py-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-2/70 focus-visible:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 [&::-webkit-details-marker]:hidden"
      >
        <span>{question}</span>
        <Chevron aria-hidden className="size-4 shrink-0 text-muted-2" />
      </summary>
      <div ref={panelRef} className="overflow-hidden" style={{ height: 0 }}>
        {/* the answer steps in past the question (8px padding + 12px indent):
            the extra level reads as "belongs to the row above", not a sibling */}
        <div ref={innerRef} className="pb-4 pl-5 pr-2">
          {children}
        </div>
      </div>
    </details>
  );
}
