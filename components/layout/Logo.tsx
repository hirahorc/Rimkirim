import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/** Official Rimkirim wordmark (neon/lime version for the dark UI). */
export function Logo({
  className,
  height = 28,
}: {
  className?: string;
  /** rendered height in px; width scales from the 1796×618 source */
  height?: number;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center transition-opacity hover:opacity-80",
        className,
      )}
      aria-label="Rimkirim beranda"
    >
      <Image
        src="/rimkirim-logo.png"
        alt="Rimkirim"
        width={1796}
        height={618}
        priority
        style={{ height, width: "auto" }}
      />
    </Link>
  );
}
