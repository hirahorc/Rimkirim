import Link from "next/link";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2", className)}
      aria-label="Rimkirim beranda"
    >
      <span className="grid size-8 place-items-center rounded-lg bg-brand text-brand-ink transition-transform group-hover:-rotate-12">
        <Send className="size-4" strokeWidth={2.5} />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-foreground">
        rim<span className="text-brand">kirim</span>
      </span>
    </Link>
  );
}
