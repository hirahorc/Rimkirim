"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronUp, Search, X, MessageCircle } from "lucide-react";
import {
  faqTabs,
  type FaqTab,
  type FaqCategory,
  type FaqItem,
} from "@/lib/data/faq";
import { SegmentedRoot, SegmentedItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { useT, useLanguage } from "@/lib/i18n/LanguageProvider";

type TabId = FaqTab["id"];

const WA_URL = "https://wa.me/6281234567890";

const isTabId = (v: string | null): v is TabId =>
  v === "bfg" || v === "moving-abroad";

/** answer text plus the optional document checklist, shared by both views */
function AnswerBody({ f }: { f: FaqItem }) {
  return (
    <div className="max-w-[65ch] text-sm leading-relaxed text-muted">
      <p>{f.a}</p>
      {f.list && (
        <ul className="mt-2.5 space-y-1.5">
          {f.list.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-muted-2" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Material's getAutoHeightDuration: the open/close duration is derived from
 * the travel distance, so a short panel snaps and a long one glides — the
 * *perceived speed* stays constant where a fixed `transition: height 300ms`
 * cannot. Replicated from the measured reference accordion (392px ⇒ 334ms).
 */
const autoDuration = (h: number) => {
  if (!h) return 0;
  const c = h / 36;
  return Math.round((4 + 15 * Math.pow(c, 0.25) + c / 5) * 10);
};

/** the system's one standard easing (DESIGN.md, Motion) */
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

/**
 * One FAQ row: native `<details>` (keeps the built-in disclosure semantics and
 * the deep-link contract — openPendingSlug() sets `el.open` imperatively) with
 * the answer's height animated open/closed. Behaviours replicated from the
 * reference accordion: height is the only animated property, the duration is
 * computed from the content height (autoDuration above), the chevron is
 * swapped — never rotated — and the open header carries no colour change; the
 * icon alone marks the state.
 */
function FaqDisclosure({ f }: { f: FaqItem }) {
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
    <details ref={detailsRef} id={f.slug} className="scroll-mt-24" onToggle={onToggle}>
      {/* hover fills the row, focus-visible fills it harder (the system's
          panel-fill idiom); the open header stays uncoloured on purpose */}
      <summary
        onClick={(e) => {
          e.preventDefault();
          toggle();
        }}
        className="flex cursor-pointer list-none items-center justify-between gap-4 px-2 py-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-2/70 focus-visible:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 [&::-webkit-details-marker]:hidden"
      >
        <span>{f.q}</span>
        <Chevron aria-hidden className="size-4 shrink-0 text-muted-2" />
      </summary>
      <div ref={panelRef} className="overflow-hidden" style={{ height: 0 }}>
        {/* the answer steps in past the question (8px padding + 12px indent):
            the extra level reads as "belongs to the row above", not a sibling */}
        <div ref={innerRef} className="pb-4 pl-5 pr-2">
          <AnswerBody f={f} />
        </div>
      </div>
    </details>
  );
}

export function Faq() {
  const t = useT();
  const { locale } = useLanguage();
  const [tabId, setTabId] = React.useState<TabId>("bfg");
  const [query, setQuery] = React.useState("");
  const tabs = faqTabs(locale);
  const tab = tabs.find((x) => x.id === tabId) ?? tabs[0];

  // A #slug in the URL that still needs opening; kept across the tab switch
  // its owner may require, cleared once the element exists.
  const pendingSlug = React.useRef<string | null>(null);

  // Open + scroll to the pending deep-linked question if it is rendered.
  const openPendingSlug = React.useCallback(() => {
    const slug = pendingSlug.current;
    if (!slug) return;
    const el = document.getElementById(slug);
    if (!(el instanceof HTMLDetailsElement)) return; // other tab not painted yet
    pendingSlug.current = null;
    el.open = true;
    el.scrollIntoView({ block: "start" });
  }, []);

  // Adopt shared state from the URL: ?tab= and ?q= restore the view on
  // arrival, #slug deep-links one question (switching tabs if it lives on
  // the other one). Also follows in-page hash changes, e.g. a footer link.
  React.useEffect(() => {
    const adoptHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      if (!slug) return;
      // slugs are locale-independent, so any locale's tree can answer this
      const owner = faqTabs("id").find((x) =>
        x.categories.some((c) => c.faqs.some((f) => f.slug === slug)),
      );
      if (!owner) return;
      pendingSlug.current = slug;
      setTabId(owner.id);
      openPendingSlug(); // already on the right tab: open now
    };

    const sp = new URLSearchParams(window.location.search);
    const urlTab = sp.get("tab");
    const urlQ = sp.get("q");
    // One-shot adoption of URL state after hydration (same pattern as
    // LanguageProvider's stored-locale read): a single extra render on
    // arrival, no cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (urlQ) setQuery(urlQ);
    if (isTabId(urlTab)) setTabId(urlTab);
    adoptHash();

    window.addEventListener("hashchange", adoptHash);
    return () => window.removeEventListener("hashchange", adoptHash);
  }, [openPendingSlug]);

  // The deep link's tab may only render after the switch above; retry then.
  React.useEffect(() => {
    openPendingSlug();
  }, [tabId, openPendingSlug]);

  // Keep tab + search shareable: reflect them into the URL without adding
  // history entries. The hash is preserved so a followed deep link survives.
  React.useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (tabId === "bfg") sp.delete("tab");
    else sp.set("tab", tabId);
    if (query.trim()) sp.set("q", query.trim());
    else sp.delete("q");
    const qs = sp.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`,
    );
  }, [tabId, query]);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  // Filter to categories with matching questions (match on question + answer,
  // so content is findable too), dropping empty categories. Cheap enough to
  // run per render; the React Compiler memoizes it.
  const filtered: FaqCategory[] = !searching
    ? tab.categories
    : tab.categories
        .map((cat) => ({
          ...cat,
          faqs: cat.faqs.filter((f) =>
            `${f.q} ${f.a}`.toLowerCase().includes(q),
          ),
        }))
        .filter((cat) => cat.faqs.length > 0);

  const resultCount = searching
    ? filtered.reduce((n, c) => n + c.faqs.length, 0)
    : 0;

  return (
    <section id="faq" className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <header className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-2">
            {t("faq.eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("faq.title")}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted sm:text-base">
            {t("faq.subtitle")}
          </p>
        </header>

        {/* service tabs — centered on the page. SegmentedRoot is inline-flex,
            so mx-auto can't center it; a flex-justify-center wrapper does. */}
        <div className="mt-8 flex justify-center">
          <SegmentedRoot
            type="single"
            value={tabId}
            onValueChange={(v) => v && setTabId(v as TabId)}
            className="max-w-md"
          >
            {tabs.map((x) => (
              <SegmentedItem key={x.id} value={x.id}>
                {x.label}
              </SegmentedItem>
            ))}
          </SegmentedRoot>
        </div>

        {/* search across the active tab's questions + answers */}
        <div className="relative mx-auto mt-6 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t("faq.searchPlaceholder")}
            placeholder={t("faq.searchPlaceholder")}
            className="h-11 w-full rounded-md border border-border bg-surface-2 pl-10 pr-10 text-sm text-foreground transition-colors placeholder:text-muted-2 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setQuery("")}
              aria-label={t("faq.searchClear")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-2"
            >
              <X />
            </Button>
          )}
        </div>

        {searching ? (
          <>
            <p
              aria-live="polite"
              className="mt-4 text-center text-xs text-muted-2"
            >
              {resultCount} {t("faq.resultsWord")}
            </p>
            {resultCount === 0 ? (
              <div className="mx-auto mt-8 max-w-sm text-center">
                <MessageCircle className="mx-auto size-8 text-muted-2" />
                <p className="mt-3 font-display text-base font-semibold">
                  {t("faq.noResultsTitle")}
                </p>
                <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted">
                  {t("faq.noResultsBody")}
                </p>
                <Button asChild className="mt-5">
                  <a href={WA_URL} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4" /> {t("faq.chatCta")}
                  </a>
                </Button>
              </div>
            ) : (
              // search results show the answer directly — no extra click to read
              <div className="mt-8 space-y-12">
                {filtered.map((cat) => (
                  <div key={cat.slug}>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-2">
                      {cat.name}
                    </h2>
                    <div className="mt-1 divide-y divide-border">
                      {cat.faqs.map((f) => (
                        <div key={f.slug} className="py-4">
                          <p className="text-sm font-medium text-foreground">
                            {f.q}
                          </p>
                          <div className="mt-1.5">
                            <AnswerBody f={f} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* categories → Q/A accordions. No card container: the wide gap between
                categories vs the hairline between questions carries the hierarchy. */}
            <div className="mt-10 space-y-12">
              {tab.categories.map((cat) => (
                <div key={cat.slug}>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-2">
                    {cat.name}
                  </h2>
                  <div className="mt-1 divide-y divide-border">
                    {cat.faqs.map((f) => (
                      <FaqDisclosure key={f.slug} f={f} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* still-stuck exit after the last category */}
            <div className="mt-14 flex flex-col items-center gap-3 border-t border-border pt-10 text-center">
              <p className="text-sm text-muted">{t("faq.stillStuck")}</p>
              <Button asChild variant="secondary">
                <a href={WA_URL} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" /> {t("faq.chatCta")}
                </a>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
