/**
 * GRUVINK — single source of truth for identity, links and metadata.
 * Edit here; every section reads from this file.
 */
export const SITE = {
  name: "GRUVINK",
  handle: "GVK",
  tagline: "COLLECTIVE / PODCAST / EVENTS",
  kind: "COLLECTIVE",
  city: "BARCELONA",
  region: "BCN",
  year: "2026",
  bpm: 150,
  /** brand files live in /public/brand */
  logo: "/brand/gruvink.svg",
  icon: "/brand/gruvink-icon.svg",
  /** colour-swapped wordmark used inside the hero lens */
  logoSwap: "/brand/gruvink-swap.svg",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gruvink.es",
  links: {
    instagram: "https://www.instagram.com/gruvink/",
    instagramHandle: "@gruvink",
    soundcloud: "https://soundcloud.com/gruvink",
    youtube: "https://www.youtube.com/@gruvink",
  },
  manifesto: ["SELECTION", "STORYTELLING", "THE MOMENT"],
  description:
    "GRUVINK — colectivo de música electrónica de Barcelona. Podcasts, fiestas KORA y artistas como SPICY BOYS.",
} as const;

/** Main menu. `page` items open their own page; the rest scroll on the home page. */
export const NAV: { id: string; label: string; idx: string; page?: string }[] = [
  { id: "sounds", label: "SOUNDS", idx: "01" },
  { id: "artists", label: "ARTISTS", idx: "02" },
  { id: "events", label: "EVENTOS", idx: "03", page: "/eventos" },
  { id: "visuals", label: "VIDEOS", idx: "04" },
  { id: "follow", label: "FOLLOW", idx: "05" },
];
