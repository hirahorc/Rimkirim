import { carrierBrand, carrierLogo } from "@/lib/data/carriers";
import { cn } from "@/lib/utils/cn";

/**
 * Official carrier logo (public/carriers) at an optically balanced height:
 * `k / aspect^0.3`, the same ramp the landing logo cloud uses, so a 6:1 DHL
 * wordmark and the compact UPS shield read at equal presence. Renders nothing
 * for carriers without a logo file — callers fall back to `CarrierMark`.
 */
export function CarrierLogo({
  carrier,
  k = 30,
  className,
}: {
  carrier: string;
  /** ramp constant — the height a 1:1 (square) mark would get */
  k?: number;
  className?: string;
}) {
  const logo = carrierLogo(carrier);
  if (!logo) return null;
  const height = Math.round((k / Math.pow(logo.aspect, 0.3)) * (logo.capScale ?? 1));
  return (
    // eslint-disable-next-line @next/next/no-img-element -- height from the
    // ramp, width stays natural to the file's aspect
    <img
      src={logo.src}
      alt={carrier}
      className={cn("w-auto shrink-0 object-contain", className)}
      style={{ height }}
    />
  );
}

/**
 * Branded monogram tile for a carrier (initials on the carrier's accent color).
 * A lightweight visual identity — not the official carrier logo.
 */
export function CarrierMark({
  carrier,
  className,
}: {
  carrier: string;
  className?: string;
}) {
  const b = carrierBrand(carrier);
  return (
    <span
      aria-label={carrier}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-md text-xs font-bold leading-none tracking-tight",
        className,
      )}
      style={{ backgroundColor: b.bg, color: b.fg }}
    >
      {b.mark}
    </span>
  );
}

/** Small brand dot for compact spots (e.g. the modal carrier switcher). */
export function CarrierDot({ carrier }: { carrier: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-2 shrink-0 rounded-full"
      style={{ backgroundColor: carrierBrand(carrier).dot }}
    />
  );
}
