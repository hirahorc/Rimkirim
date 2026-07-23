import {
  Home,
  Plane,
  ShieldCheck,
  Headset,
  FileCheck2,
  Package,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export function ServiceSection() {
  return (
    <section id="layanan" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Dua arah, satu tim yang sama
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Apapun tujuanmu, proses, tim, dan standar layanan kami tetap sama.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="relative overflow-hidden p-6">
          <div className="brand-glow pointer-events-none absolute inset-x-0 top-0 h-24" />
          <div className="relative">
            <span className="grid size-11 place-items-center rounded-lg bg-brand/15 text-brand">
              <Home className="size-5" />
            </span>
            <h3 className="mt-4 font-display text-xl font-semibold">Back For Good</h3>
            <p className="mt-1 text-sm text-brand">Luar Negeri → Indonesia</p>
            <p className="mt-3 text-sm text-muted">
              Buat kamu yang selesai studi atau kerja di luar negeri dan mau pulang
              untuk selamanya. Kami bantu urus semua barang & clearance sampai rumah.
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <span className="grid size-11 place-items-center rounded-lg bg-surface-3 text-foreground">
            <Plane className="size-5" />
          </span>
          <h3 className="mt-4 font-display text-xl font-semibold">Moving Abroad</h3>
          <p className="mt-1 text-sm text-muted">Indonesia → Luar Negeri</p>
          <p className="mt-3 text-sm text-muted">
            Pindah ke luar negeri untuk kerja, studi, atau menetap? Kirim barang
            personal maupun household goods dengan penanganan yang pasti.
          </p>
        </Card>
      </div>
    </section>
  );
}

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Aman & terpercaya",
    body: "Barangmu ditangani dengan standar internasional dan asuransi opsional.",
  },
  {
    icon: FileCheck2,
    title: "Clearance beres",
    body: "Urusan bea cukai dan dokumen kami tangani penuh, kamu tinggal terima.",
  },
  {
    icon: Headset,
    title: "Asisten yang hadir",
    body: "Tim kami mendampingi lewat WhatsApp dari awal sampai barang tiba.",
  },
  {
    icon: Package,
    title: "Harga transparan",
    body: "Breakdown tarif jelas — base rate, chargeable weight, sampai surcharge.",
  },
];

export function WhySection() {
  return (
    <section id="kenapa" className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Kenapa Rimkirim
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Ribuan orang mempercayakan kepindahan mereka ke kami.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="p-5">
              <span className="grid size-10 place-items-center rounded-lg bg-brand/15 text-brand">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-medium">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
