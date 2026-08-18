import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/articles/shared";
import { ArticleBody } from "./ArticleBody";

/** FAQ pairs as native disclosure rows (same pattern as /faq). */
export function ArticleFaq({ id, title, items }: { id: string; title: string; items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <section id={id} className="mt-12 scroll-mt-28">
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4 divide-y divide-border rounded-md border border-border px-5">
        {items.map((f) => (
          <details key={f.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 [&::-webkit-details-marker]:hidden">
              <span>{f.q}</span>
              <ChevronDown className="size-4 shrink-0 text-muted-2 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="max-w-[65ch] pb-4 text-sm [&_p]:mt-0 [&_p]:text-muted">
              <ArticleBody markdown={f.a} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
