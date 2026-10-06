import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { Shell } from "@/components/Shell";
import { SITE } from "@/data/site";
import "./globals.css";

// Archivo variable: weight 100–900 + width 62–125 → the whole identity is one family.
const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "GRUVINK — Collective · Podcast · KORA · Barcelona",
    template: "%s · GRUVINK",
  },
  description: SITE.description,
  keywords: [
    "GRUVINK",
    "KORA",
    "podcast techno",
    "electronic music collective",
    "Barcelona",
    "SPICY BOYS",
    "IZIAL",
    "DBØ",
    "underground",
  ],
  authors: [{ name: "GRUVINK" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "GRUVINK",
    title: "GRUVINK — Collective · Podcast · KORA",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "GRUVINK",
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        {/* flag JS before hydration so reveal/loader styles never flash for no-JS visitors */}
        <Script id="sb-js-flag" strategy="beforeInteractive">
          {"document.documentElement.classList.add('js')"}
        </Script>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
