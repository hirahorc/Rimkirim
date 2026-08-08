import { carrierBrand } from "@/lib/data/carriers";
import { cn } from "@/lib/utils/cn";

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
