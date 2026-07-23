import { cn } from "@/lib/utils/cn";

/**
 * Country flag rendered from the 4:3 SVG set (lipis/flag-icons),
 * served from /public/flags/4x3. Replaces emoji flags for consistent
 * rendering across platforms.
 */
export function Flag({
  code,
  /** rendered height in px; width follows the 4:3 ratio */
  size = 14,
  className,
}: {
  code: string | undefined;
  size?: number;
  className?: string;
}) {
  if (!code || code.length !== 2) return null;
  const width = Math.round((size * 4) / 3);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static SVG; Next's optimizer skips SVG anyway
    <img
      src={`/flags/4x3/${code.toLowerCase()}.svg`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      width={width}
      height={size}
      style={{ width, height: size }}
      className={cn(
        "inline-block shrink-0 rounded-[2px] object-cover ring-1 ring-white/15",
        className,
      )}
    />
  );
}
