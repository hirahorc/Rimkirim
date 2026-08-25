"use client";

import * as React from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";
import type { TocItem } from "@/lib/articles/shared";
import { CollapseHeight } from "@/components/ui/disclosure";
import { cn } from "@/lib/utils/cn";

/**
 * Sticky "on this page" list (lg+) with the section in view marked; on
 * smaller screens a collapsible block above the prose.
 */
export function ArticleToc({
  items,
  label,
  variant,
}: {
  items: TocItem[];
  label: string;
  /** `inline`: collapsible block (small screens); `rail`: sticky side list */
  variant: "inline" | "rail";
}) {
  const [active, setActive] = React.useState<string | null>(items[0]?.id ?? null);
  // inline variant only: collapsed by default, same as the old <details>
  const [tocOpen, setTocOpen] = React.useState(false);

  React.useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        // the topmost heading that has crossed the upper 30% of the viewport
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const list = (
    <ol className="space-y-0.5 text-sm">
      {items.map((i) => (
        <li key={i.id}>
          <a
            href={`#${i.id}`}
            aria-current={active === i.id ? "location" : undefined}
            className={cn(
              "-ml-px block border-l-2 py-1.5 pl-3 leading-snug transition-colors",
              active === i.id
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted hover:border-border-strong hover:text-foreground",
            )}
          >
            {i.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "inline") {
    // the same disclosure micro-interactions as the FAQ rows (DESIGN.md,
    // "The disclosure open"): animated height at a content-derived duration,
    // chevron swapped not rotated, colour-channel hover/focus — in this
    // component's own boxed skin, driven by React state via CollapseHeight
    const Chevron = tocOpen ? ChevronUp : ChevronDown;
    return (
      <div className="rounded-md border border-border bg-surface-2">
        <button
          type="button"
          onClick={() => setTocOpen((v) => !v)}
          aria-expanded={tocOpen}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-surface-3/70 focus-visible:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          <List className="size-4 text-muted-2" />
          {label}
          <Chevron aria-hidden className="ml-auto size-4 shrink-0 text-muted-2" />
        </button>
        <CollapseHeight open={tocOpen}>
          <div className="border-t border-border px-4 py-3">{list}</div>
        </CollapseHeight>
      </div>
    );
  }
  return (
    <nav aria-label={label}>
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-2">{label}</p>
      <div className="border-l border-border">{list}</div>
    </nav>
  );
}
