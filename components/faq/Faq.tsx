"use client";

import * as React from "react";
import { ChevronDown, Info } from "lucide-react";
import { FAQ_TABS, type FaqTab } from "@/lib/data/faq";
import { SegmentedRoot, SegmentedItem } from "@/components/ui/toggle-group";
import { Card } from "@/components/ui/card";
import { useT } from "@/lib/i18n/LanguageProvider";

type TabId = FaqTab["id"];

export function Faq() {
  const t = useT();
  const [tabId, setTabId] = React.useState<TabId>("bfg");
  const tab = FAQ_TABS.find((x) => x.id === tabId) ?? FAQ_TABS[0];

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

        {/* service tabs */}
        <SegmentedRoot
          type="single"
          value={tabId}
          onValueChange={(v) => v && setTabId(v as TabId)}
          className="mx-auto mt-8 max-w-md"
        >
          {FAQ_TABS.map((x) => (
            <SegmentedItem key={x.id} value={x.id}>
              {x.label}
            </SegmentedItem>
          ))}
        </SegmentedRoot>

        {/* direction note (Moving Abroad) */}
        {tab.note && (
          <div className="mt-5 flex items-start gap-2.5 rounded-md border border-border bg-surface-2/60 p-3.5 text-sm text-muted">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-2" />
            <p>{tab.note}</p>
          </div>
        )}

        {/* categories → Q/A accordions */}
        <div className="mt-8 space-y-8">
          {tab.categories.map((cat) => (
            <div key={cat.name}>
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-2">
                {cat.name}
              </h2>
              <Card className="px-4 sm:px-5">
                {cat.faqs.map((f) => (
                  <details
                    key={f.q}
                    className="group border-b border-border last:border-0"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-sm py-4 text-sm font-medium text-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 [&::-webkit-details-marker]:hidden">
                      <span>{f.q}</span>
                      <ChevronDown className="size-4 shrink-0 text-muted-2 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <p className="pb-4 text-sm leading-relaxed text-muted">
                      {f.a}
                    </p>
                  </details>
                ))}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
