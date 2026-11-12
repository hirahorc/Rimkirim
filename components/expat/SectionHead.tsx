import { cn } from "@/lib/utils/cn";

/**
 * The expat page's section heading: a landing headline and one line under it.
 * The eyebrow is for sections whose headline alone doesn't say what they
 * cover (a question, or "help with the details"); headlines that already
 * name their subject go without one, so the label keeps meaning something.
 */
export function SectionHead({
  id,
  eyebrow,
  title,
  subtitle,
  compact = false,
  className,
}: {
  /** set when the section is labelled by this heading */
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** a head set in a side column (the FAQ's): it keeps the heading size
   *  at every width, where the display size would stack it four lines deep */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow && (
        // the route's gradient, as on the header's "Expat Relocation"
        // (globals.css, .eyebrow-expat): one colour for every section's label
        <p className="eyebrow-expat mb-3 font-display text-xs font-medium uppercase tracking-[0.14em]">
          {eyebrow}
        </p>
      )}
      <h2 id={id} className={cn("text-balance font-display text-heading font-bold tracking-tight", !compact && "lg:text-display")}>
        {title}
      </h2>
      {subtitle && <p className="mt-3 max-w-xl text-muted">{subtitle}</p>}
    </div>
  );
}
