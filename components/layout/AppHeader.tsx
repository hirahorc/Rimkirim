import Link from "next/link";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm text-muted md:flex">
          <Link
            href="/#kalkulator"
            className="rounded-md px-3 py-2 transition-colors hover:text-foreground"
          >
            Hitung Tarif
          </Link>
          <Link
            href="/#layanan"
            className="rounded-md px-3 py-2 transition-colors hover:text-foreground"
          >
            Layanan
          </Link>
          <Link
            href="/#kenapa"
            className="rounded-md px-3 py-2 transition-colors hover:text-foreground"
          >
            Kenapa Rimkirim
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer">
              Hubungi Kami
            </a>
          </Button>
          <Button asChild size="sm">
            <Link href="/#kalkulator">Cek Tarif</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
