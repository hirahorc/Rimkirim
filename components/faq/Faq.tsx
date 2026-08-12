"use client";

import * as React from "react";
import { ChevronDown, Info, Search, X, MessageCircle } from "lucide-react";
import { FAQ_TABS, type FaqTab, type FaqCategory } from "@/lib/data/faq";
import { SegmentedRoot, SegmentedItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/LanguageProvider";

type TabId = FaqTab["id"];

const WA_URL = "https://wa.me/6281234567890";

export function Faq() {
  const t = useT();
  const [tabId, setTabId] = React.useState<TabId>("bfg");
  const [query, setQuery] = React.useState("");
  const tab = FAQ_TABS.find((x) => x.id === tabId) ?? FAQ_TABS[0];

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  // Filter to categories with matching questions (match on question + answer,
  // so content is findable too), dropping empty categories.
  const filtered: FaqCategory[] = React.useMemo(() => {
    if (!searching) return tab.categories;
    return tab.categories
      .map((cat) => ({
        ...cat,
        faqs: cat.faqs.filter((f) =>
          `${f.q} ${f.a}`.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.faqs.length > 0);
  }, [tab, q, searching]);

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
            {FAQ_TABS.map((x) => (
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
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t("faq.searchClear")}
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
            >
              <X className="size-4" />
            </button>
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
                  <div key={cat.name}>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-2">
                      {cat.name}
                    </h2>
                    <div className="mt-1 divide-y divide-border">
                      {cat.faqs.map((f) => (
                        <div key={f.q} className="py-4">
                          <p className="text-sm font-medium text-foreground">
                            {f.q}
                          </p>
                          <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-muted">
                            {f.a}
                          </p>
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
            {/* direction note (Moving Abroad) */}
            {tab.note && (
              <div className="mt-6 flex items-start gap-2.5 rounded-md border border-border bg-surface-2/60 p-3.5 text-sm text-muted">
                <Info className="mt-0.5 size-4 shrink-0 text-muted-2" />
                <p>{tab.note}</p>
              </div>
            )}

            {/* categories → Q/A accordions. No card container: the wide gap between
                categories vs the hairline between questions carries the hierarchy. */}
            <div className="mt-10 space-y-12">
              {tab.categories.map((cat) => (
                <div key={cat.name}>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-2">
                    {cat.name}
                  </h2>
                  <div className="mt-1 divide-y divide-border">
                    {cat.faqs.map((f) => (
                      <details key={f.q} className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 [&::-webkit-details-marker]:hidden">
                          <span>{f.q}</span>
                          <ChevronDown className="size-4 shrink-0 text-muted-2 transition-transform duration-200 group-open:rotate-180" />
                        </summary>
                        <p className="max-w-[65ch] pb-4 text-sm leading-relaxed text-muted">
                          {f.a}
                        </p>
                      </details>
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
