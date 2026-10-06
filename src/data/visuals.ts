/**
 * VIDEOS (sección VISUALS) — vídeos de las sesiones.
 * -------------------------------------------------
 * Cada tarjeta abre el vídeo en su plataforma (Instagram, YouTube, Facebook,
 * TikTok…). Copia un bloque para añadir uno.
 *
 * url:   enlace al vídeo (post/reel de Instagram, vídeo de YouTube, etc.)
 * thumb: imagen de portada. En YouTube se saca sola del enlace si lo dejas vacío.
 *        Para Instagram/Facebook pon una captura tuya en /public/visuals,
 *        p. ej. "/visuals/kora-001.jpg".
 * Sin url, la tarjeta sale como "PRÓXIMAMENTE".
 */
/** Styles for the generated placeholder art (src/lib/generative.ts). */
export type VisualStyle = "strobe" | "floor" | "rings" | "crowd" | "scan" | "type";

export type Platform = "instagram" | "youtube" | "facebook" | "tiktok" | "soundcloud";

export type Video = {
  id: string;
  title: string;
  artist?: string;
  platform: Platform;
  url?: string;
  thumb?: string;
  date?: string;
  /** seed for the generated placeholder when there's no thumbnail */
  seed: number;
};

export const VIDEOS: Video[] = [
  { id: "v1", title: "KORA 001", artist: "AVRAXAS B2B DBØ", platform: "instagram", seed: 3 },
  { id: "v2", title: "KORA 001", artist: "CHAMÓX", platform: "instagram", seed: 7 },
  { id: "v3", title: "KORA 001", artist: "NANDES", platform: "youtube", seed: 11 },
  { id: "v4", title: "GRUVINK", artist: "SESIÓN", platform: "instagram", seed: 16 },
];

export const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "INSTAGRAM",
  youtube: "YOUTUBE",
  facebook: "FACEBOOK",
  tiktok: "TIKTOK",
  soundcloud: "SOUNDCLOUD",
};

/** YouTube thumbnail straight from the video link. */
export function thumbFor(v: Video) {
  if (v.thumb) return v.thumb;
  if (v.platform === "youtube" && v.url) {
    const id = /(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/.exec(v.url)?.[1];
    if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }
  return undefined;
}
