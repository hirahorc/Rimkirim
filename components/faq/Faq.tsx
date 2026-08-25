"use client";

import * as React from "react";
import { Check, Search, X, MessageCircle } from "lucide-react";
import {
  faqTabs,
  type FaqTab,
  type FaqCategory,
  type FaqItem,
} from "@/lib/data/faq";
import { SegmentedRoot, SegmentedItem } from "@/components/ui/toggle-group";
import { Disclosure } from "@/components/ui/disclosure";
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
                      <Disclosure key={f.slug} id={f.slug} question={f.q}>
                        <AnswerBody f={f} />
                      </Disclosure>
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
