"use client";

import Link from "next/link";
import Image from "next/image";
import { useT } from "@/lib/i18n/LanguageProvider";
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
  const t = useT();
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
        className,
      )}
      aria-label={t("nav.homeAria")}
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
