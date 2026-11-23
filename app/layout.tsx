import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Toaster } from "@/components/ui/toaster";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { EnvBadge } from "@/components/system/EnvBadge";
import { BreakData } from "@/components/expat-order/dev/BreakData";
import { ScrollLanding } from "@/components/system/ScrollLanding";
import { CanvasSwitch } from "@/components/canvas/CanvasSwitch";
import { SceneRunner } from "@/components/canvas/SceneRunner";
import { SCENE_BOOT_SCRIPT } from "@/lib/canvas/boot";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { APP_ENV, IS_PRODUCTION } from "@/lib/env";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      // only ever applies to same-page anchor jumps (globals.css, motion-safe).
      // A page opened at a #fragment lands at once as well: the smooth scroll
      // waits for data-landed, which ScrollLanding sets once the page is up
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* scene mode (the canvas's frames, `?scene=`): a page opened as a
            scene gets storage of its own before any store reads it, so this
            has to be an inline script, first in the body (lib/canvas/boot.ts).
            Never in production */}
        {!IS_PRODUCTION && <script dangerouslySetInnerHTML={{ __html: SCENE_BOOT_SCRIPT }} />}
        <LanguageProvider>
          <AppHeader />
          <main className="flex-1">{children}</main>
          <AppFooter />
          <Toaster />
          <LoginDialog />
          <EnvBadge />
          {/* the break-ui data toggle for the expat order flow: local dev only */}
          {APP_ENV === "development" && <BreakData />}
          {/* plays a scene's steps and reports to the canvas: never in production */}
          {!IS_PRODUCTION && <SceneRunner />}
          {/* the switch between a page and its board on the canvas: never in production */}
          {!IS_PRODUCTION && <CanvasSwitch />}
          <ScrollLanding />
        </LanguageProvider>
      </body>
    </html>
  );
}
