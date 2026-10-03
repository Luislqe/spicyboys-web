/**
 * SPICY BOYS — single source of truth for identity, links and metadata.
 * Edit here; every section reads from this file.
 */
export const SITE = {
  name: "SPICY BOYS",
  members: ["IZIAL", "DBØ"],
  genre: "HARD TECHNO",
  role: "DJ / PRODUCER",
  city: "CASTELLDEFELS",
  region: "BCN",
  year: "2026",
  bpm: 150,
  // Castelldefels & Barcelona — used as HUD data, not as tracking.
  coords: {
    castelldefels: { lat: "41.2800°N", lon: "1.9700°E" },
    barcelona: { lat: "41.3874°N", lon: "2.1686°E" },
  },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://spicyboys.example",
  links: {
    soundcloud: "https://soundcloud.com/sasha-borrego-672612851",
    instagram: "https://www.instagram.com/spicyboys.gvk/",
    instagramHandle: "@spicyboys.gvk",
    gruvink: "https://www.instagram.com/gruvink/",
    gruvinkHandle: "@gruvink",
  },
  // Paraphrased from the SoundCloud bio.
  manifesto: ["SELECTION", "STORYTELLING", "THE MOMENT"],
  description:
    "SPICY BOYS — IZIAL & DBØ. Hard techno desde Castelldefels / Barcelona. Selecciones, sets y ruido underground.",
} as const;

export const NAV = [
  { id: "sounds", label: "SOUNDS", idx: "01" },
  { id: "visuals", label: "VISUALS", idx: "02" },
  { id: "about", label: "INDEX", idx: "03" },
  { id: "connected", label: "CONNECTED", idx: "04" },
  { id: "follow", label: "FOLLOW", idx: "05" },
] as const;
