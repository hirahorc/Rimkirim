import { ShieldCheck, Globe2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-backdrop pointer-events-none absolute inset-0" />
      <div className="brand-glow pointer-events-none absolute inset-x-0 top-0 h-72" />
      <div className="relative mx-auto max-w-3xl px-4 pt-16 text-center sm:px-6 sm:pt-24">
        <Badge variant="brand" className="mx-auto mb-5">
          <Sparkles className="size-3.5" /> Pengiriman internasional yang transparan
        </Badge>
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          Pulang atau pindah,
          <br />
          <span className="text-brand">tanpa drama.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
          Rimkirim bantu kamu kirim barang lintas negara — dari luar negeri pulang ke
          Indonesia, atau dari Indonesia ke seluruh dunia. Cek tarifnya sekarang,
          harga jelas di depan.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-brand" /> Clearance ditangani penuh
          </span>
          <span className="flex items-center gap-1.5">
            <Globe2 className="size-4 text-brand" /> 60+ negara
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-brand" /> Estimasi instan
          </span>
        </div>
      </div>
    </section>
  );
}
