import { cn } from "@/lib/utils/cn";

/** The expat page's section heading: a landing headline and one line under it. */
export function SectionHead({
  id,
  title,
  subtitle,
  className,
}: {
  /** set when the section is labelled by this heading */
  id?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <h2 id={id} className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 max-w-xl text-muted">{subtitle}</p>}
    </div>
  );
}
