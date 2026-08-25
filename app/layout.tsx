import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Toaster } from "@/components/ui/toaster";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { EnvBadge } from "@/components/system/EnvBadge";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { IS_PRODUCTION } from "@/lib/env";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://rimkirim.com";
const TITLE = "Rimkirim · Kirim & Pindahan Internasional";
const DESCRIPTION =
  "Hitung tarif pengiriman internasional Rimkirim. Back For Good (pulang ke Indonesia) & Moving Abroad (kirim ke luar negeri). Transparan, terpercaya.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "Rimkirim",
    type: "website",
    locale: "id_ID",
    images: [{ url: "/rimkirim-logo.png", width: 1796, height: 618, alt: "Rimkirim" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/rimkirim-logo.png"],
  },
  // keep staging / preview builds out of search results — only production is indexable
  robots: IS_PRODUCTION ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      // Next 16 no longer forces scroll-behavior:auto during SPA navigations;
      // this attribute restores that override so the CSS smooth scroll below
      // only ever applies to same-page anchor jumps (globals.css, motion-safe)
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LanguageProvider>
          <AppHeader />
          <main className="flex-1">{children}</main>
          <AppFooter />
          <Toaster />
          <LoginDialog />
          <EnvBadge />
        </LanguageProvider>
      </body>
    </html>
  );
}
