import type { FaqItem } from "@/lib/articles/shared";
import { Disclosure } from "@/components/ui/disclosure";
import { ArticleBody } from "./ArticleBody";

/**
 * FAQ pairs as disclosure rows — the same component, and therefore the same
 * design, motion and states, as the /faq page: height animated at a duration
 * computed from the content, chevron swapped not rotated, square full-width
 * hit box with the panel-fill hover. De-boxed like /faq too: the hairline
 * between rows carries the structure, not a card border.
 */
export function ArticleFaq({ id, title, items }: { id: string; title: string; items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <section id={id} className="mt-12 scroll-mt-28">
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-2 divide-y divide-border">
        {items.map((f) => (
          <Disclosure key={f.q} question={f.q}>
            <div className="max-w-[65ch] text-sm [&_p]:mt-0 [&_p]:text-muted">
              <ArticleBody markdown={f.a} />
            </div>
          </Disclosure>
        ))}
      </div>
    </section>
  );
}
