import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo, JetBrains_Mono } from "next/font/google";
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
    default: "SPICY BOYS — Hard Techno · Castelldefels / BCN",
    template: "%s · SPICY BOYS",
  },
  description: SITE.description,
  keywords: [
    "SPICY BOYS",
    "IZIAL",
    "DBØ",
    "hard techno",
    "techno Barcelona",
    "Castelldefels",
    "DJ",
    "rave",
    "underground",
  ],
  authors: [{ name: "SPICY BOYS" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "SPICY BOYS",
    title: "SPICY BOYS — Hard Techno · Castelldefels / BCN",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "SPICY BOYS — Hard Techno",
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* flag JS early so reveal/loader styles never flash for no-JS visitors */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link rel="preconnect" href="https://w.soundcloud.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
