/**
 * SOUNDS — GRUVINK on SoundCloud (https://soundcloud.com/gruvink)
 * ---------------------------------------------------------------
 * Everything plays through the OFFICIAL SoundCloud widget (iframe + Widget API).
 * No audio is downloaded or proxied.
 *
 * To add a new podcast or set: copy a line, paste it at the top, change the
 * title, date and public SoundCloud URL. Order in the array = order on the page.
 * An entry without `url` renders as a locked "coming soon" slot.
 */
export type MusicKind = "podcast" | "set" | "playlist" | "original";

export type MusicItem = {
  id: string;
  title: string;
  /** small line under/next to the title (artist, venue…) */
  artist?: string;
  kind: MusicKind;
  year: string;
  url?: string;
  meta: string;
  /** seed for the generated cover (used when no `cover`) */
  seed: number;
  cover?: string;
};

const SC = "https://soundcloud.com/gruvink";

export const MUSIC: MusicItem[] = [
  { id: "p26", title: "PODCAST 26", artist: "4R15", kind: "podcast", year: "2026", url: `${SC}/podcast-26-4r15`, meta: "AUG 2026", seed: 26 },
  { id: "p25", title: "PODCAST 25", artist: "POL VERDÉS", kind: "podcast", year: "2026", url: `${SC}/podcast-25-pol-verdes`, meta: "JUL 2026", seed: 25 },
  { id: "p23", title: "PODCAST 23", artist: "ALBERT VERYN", kind: "podcast", year: "2026", url: `${SC}/podcast-23-albert-veryn`, meta: "MAY 2026", seed: 23 },
  { id: "p22", title: "PODCAST 22", artist: "ROUXXE", kind: "podcast", year: "2026", url: `${SC}/podcast-22-rouxxe`, meta: "MAY 2026", seed: 22 },
  { id: "p21", title: "PODCAST 21", artist: "MEDINA", kind: "podcast", year: "2026", url: `${SC}/podcast-21-medina`, meta: "MAY 2026", seed: 21 },
  { id: "p20", title: "PODCAST 20", artist: "BRANDO", kind: "podcast", year: "2026", url: `${SC}/podcast-20-brando`, meta: "MAR 2026", seed: 20 },
  { id: "k-avraxas", title: "KORA 001", artist: "AVRAXAS B2B DBØ", kind: "set", year: "2026", url: `${SC}/avraxas-b2b-dbo-1`, meta: "VINYL ONLY", seed: 11 },
  { id: "k-chamox", title: "KORA 001", artist: "CHAMÓX", kind: "set", year: "2026", url: `${SC}/kora-001-chamox`, meta: "LIVE AT KORA", seed: 12 },
  { id: "k-nandes", title: "KORA 001", artist: "NANDES", kind: "set", year: "2026", url: `${SC}/kora-001-nandes`, meta: "LIVE AT KORA", seed: 13 },
];

/**
 * Track offered when entering the site ("ENTRAR CON SONIDO").
 * By default the newest item in MUSIC. Set to null to disable the sound gate.
 */
export const INTRO_TRACK: MusicItem | null = MUSIC[0] ?? null;

/** The KORA 001 playlist (used by the KORA section's "listen" button). */
export const KORA_PLAYLIST: MusicItem = {
  id: "kora-001",
  title: "KORA 001",
  artist: "FULL NIGHT",
  kind: "playlist",
  year: "2026",
  url: `${SC}/sets/fiesta-kora`,
  meta: "ALL SETS",
  seed: 1,
};

export const KIND_LABEL: Record<MusicKind, string> = {
  podcast: "PODCAST",
  set: "LIVE SET",
  playlist: "PLAYLIST",
  original: "ORIGINAL",
};

export const widgetSrc = (url: string, autoPlay = true) =>
  "https://w.soundcloud.com/player/?" +
  new URLSearchParams({
    url,
    color: "#bff851",
    auto_play: String(autoPlay),
    hide_related: "true",
    show_comments: "false",
    show_user: "true",
    show_reposts: "false",
    show_teaser: "false",
    visual: "false",
  }).toString();
