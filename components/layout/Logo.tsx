import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/** Official Rimkirim wordmark (dark-ink version, for the light UI). */
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
        src="/rimkirim-logo-dark.png"
        alt="Rimkirim"
        width={1796}
        height={618}
        sizes="93px"
        priority
        style={{ height, width: "auto" }}
      />
    </Link>
  );
}
