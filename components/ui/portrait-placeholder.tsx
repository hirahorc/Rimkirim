import { cn } from "@/lib/utils/cn";

/**
 * Honest stand-in for a customer photo that doesn't exist yet: an abstract
 * head-and-shoulders silhouette on ink, a ghosted initial, and a small label
 * saying what belongs here. Never a stock human — the slot is social proof.
 * Fills its (positioned) parent.
 */
export function PortraitPlaceholder({
  initial,
  label,
  className,
}: {
  initial: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 overflow-hidden bg-brand-ink text-background",
        className,
      )}
    >
      {/* silhouette: head + shoulders, drawn to the box's bottom edge */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full fill-background/[0.08]"
      >
        <circle cx="50" cy="42" r="17" />
        <path d="M14 100c0-21 16-33 36-33s36 12 36 33z" />
      </svg>
      {/* ghosted initial, same device as the Why-cards' index */}
      <span className="pointer-events-none absolute -bottom-[0.18em] -right-[0.05em] font-display text-[9rem] font-bold leading-none opacity-[0.07] sm:text-[12rem]">
        {initial}
      </span>
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-background/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-background/60">
        <span className="size-1.5 rounded-full bg-background/40" />
        {label}
      </span>
    </div>
  );
}
