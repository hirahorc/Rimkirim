"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/LanguageProvider";

export function AppHeader() {
  const t = useT();
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm text-muted md:flex">
          <Link
            href="/#kalkulator"
            className="rounded-md px-3 py-2 transition-colors hover:text-foreground"
          >
            {t("nav.hitungTarif")}
          </Link>
          <Link
            href="/#layanan"
            className="rounded-md px-3 py-2 transition-colors hover:text-foreground"
          >
            {t("nav.layanan")}
          </Link>
          <Link
            href="/#kenapa"
            className="rounded-md px-3 py-2 transition-colors hover:text-foreground"
          >
            {t("nav.kenapa")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Button asChild size="sm">
            <Link href="/#kalkulator">{t("nav.cekTarif")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
