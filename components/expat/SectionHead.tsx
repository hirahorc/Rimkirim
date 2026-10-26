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
  className,
}: {
  /** set when the section is labelled by this heading */
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && (
        <p className="mb-3 font-display text-xs font-medium uppercase tracking-[0.14em] text-muted">
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 max-w-xl text-muted">{subtitle}</p>}
    </div>
  );
}
