import Link from "next/link";
import type { AnswerExtras as AnswerExtrasData } from "@/lib/data/faq";

/**
 * What an FAQ answer can carry past its paragraph, shared by /faq, the
 * landing's FAQ and the expat page's: a two-column table (domestic delivery
 * days per region, after OPS's ETA infographic), a closing paragraph, and a
 * line that ends on a link. Inherits the answer's size and ink; only the
 * table's values step up to the foreground, so the eye lands on the number
 * it came for. Quantities, so sans with tabular figures, not mono (DESIGN.md,
 * The Numbers-Are-Mono Rule). The table stays narrow, so a region and its
 * days never sit a screen apart.
 */
export function AnswerExtras({ rows, after, cta }: AnswerExtrasData) {
  return (
    <>
      {rows && (
        <dl className="mt-3 max-w-sm divide-y divide-border border-y border-border">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-4 py-1.5">
              <dt>{r.label}</dt>
              <dd className="whitespace-nowrap font-medium tabular-nums text-foreground">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {after && <p className="mt-3">{after}</p>}
      {cta && (
        <p className="mt-3">
          {cta.lead}{" "}
          {/* the link never breaks inside itself, as AskLine's doesn't */}
          <Link href={cta.href} className="link-mark whitespace-nowrap">
            {cta.label}
          </Link>
        </p>
      )}
    </>
  );
}
