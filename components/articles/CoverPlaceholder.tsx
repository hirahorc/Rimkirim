import { cn } from "@/lib/utils/cn";

/**
 * Deterministic stand-in for an article cover that isn't in /public yet:
 * a soft panel with a fine token-coloured grid, one small lime mark whose
 * position/shape derive from the slug (so every article looks different but
 * they read as one family), and the article's ghosted initials. Never a stock
 * photo — the slot is for the real cover. Fills a positioned parent.
 */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function CoverPlaceholder({
  slug,
  title,
  className,
}: {
  slug: string;
  title: string;
  className?: string;
}) {
  const h = hash(slug);
  const shape = h % 3; // 0 square, 1 circle, 2 bar
  const x = 12 + ((h >>> 3) % 60); // 12–71%
  const y = 18 + ((h >>> 9) % 50); // 18–67%
  const rot = ((h >>> 15) % 5) * 6 - 12; // -12..12deg
  const initials = title
    .split(/\s+/)
    .filter((w) => /^[a-z]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden bg-surface-3 text-foreground", className)}
    >
      {/* fine grid */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <pattern id={`g-${h}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" className="stroke-border" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#g-${h})`} />
      </svg>
      {/* one lime mark */}
      <span
        className={cn(
          "absolute bg-brand",
          shape === 0 && "size-[14%] rounded-[6px]",
          shape === 1 && "size-[14%] rounded-full",
          shape === 2 && "h-[7%] w-[26%] rounded-full",
        )}
        style={{ left: `${x}%`, top: `${y}%`, transform: `rotate(${rot}deg)` }}
      />
      {/* ghosted initials */}
      <span className="pointer-events-none absolute -bottom-[0.16em] -right-[0.04em] font-display text-[9rem] font-bold leading-none opacity-[0.06] sm:text-[11rem]">
        {initials}
      </span>
    </div>
  );
}
