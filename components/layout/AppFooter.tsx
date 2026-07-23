import Link from "next/link";
import { Logo } from "./Logo";

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm text-muted">
              Partner pengiriman & pindahan internasional. Dari mana pun kamu berada,
              pulang atau pindah dengan tenang.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <FooterCol
              title="Layanan"
              links={[
                ["Back For Good", "/#layanan"],
                ["Moving Abroad", "/#layanan"],
                ["Hitung Tarif", "/#kalkulator"],
              ]}
            />
            <FooterCol
              title="Perusahaan"
              links={[
                ["Kenapa Rimkirim", "/#kenapa"],
                ["Testimoni", "/#kenapa"],
                ["Blog", "#"],
              ]}
            />
            <FooterCol
              title="Bantuan"
              links={[
                ["WhatsApp", "https://wa.me/6281234567890"],
                ["FAQ", "#"],
                ["Lacak Kiriman", "#"],
              ]}
            />
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-2 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Rimkirim. Semua hak dilindungi.</span>
          <span>Tarif bersifat estimasi & dapat berubah sesuai detail kiriman.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="mb-3 font-medium text-foreground">{title}</h4>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-muted transition-colors hover:text-brand">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
