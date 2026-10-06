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
  /** cover image — the session artwork from SoundCloud (or your own file) */
  cover?: string;
};

const SC = "https://soundcloud.com/gruvink";

export const MUSIC: MusicItem[] = [
  { id: "p26", title: "PODCAST 26", artist: "4R15", kind: "podcast", year: "2026", url: `${SC}/podcast-26-4r15`, meta: "AUG 2026", seed: 26, cover: "https://i1.sndcdn.com/artworks-dVgz7lCzTldI2r0h-5XLdrg-t500x500.png" },
  { id: "p25", title: "PODCAST 25", artist: "POL VERDÉS", kind: "podcast", year: "2026", url: `${SC}/podcast-25-pol-verdes`, meta: "JUL 2026", seed: 25, cover: "https://i1.sndcdn.com/artworks-uVa9XZNjaDkEqGAV-G9z43w-t500x500.jpg" },
  { id: "p23", title: "PODCAST 23", artist: "ALBERT VERYN", kind: "podcast", year: "2026", url: `${SC}/podcast-23-albert-veryn`, meta: "MAY 2026", seed: 23, cover: "https://i1.sndcdn.com/artworks-Hz16IDRCsikwCZOD-titPMA-t500x500.png" },
  { id: "p22", title: "PODCAST 22", artist: "ROUXXE", kind: "podcast", year: "2026", url: `${SC}/podcast-22-rouxxe`, meta: "MAY 2026", seed: 22, cover: "https://i1.sndcdn.com/artworks-yRpof1J74Hee9qqK-Rm76mA-t500x500.png" },
  { id: "p21", title: "PODCAST 21", artist: "MEDINA", kind: "podcast", year: "2026", url: `${SC}/podcast-21-medina`, meta: "MAY 2026", seed: 21, cover: "https://i1.sndcdn.com/artworks-ZsimY2GOkDB1hBKv-0kMwiw-t500x500.png" },
  { id: "p20", title: "PODCAST 20", artist: "BRANDO", kind: "podcast", year: "2026", url: `${SC}/podcast-20-brando`, meta: "MAR 2026", seed: 20, cover: "https://i1.sndcdn.com/artworks-yoQAVHYzDylyCBsy-J8hQlw-t500x500.png" },
  { id: "k-avraxas", title: "KORA 001", artist: "AVRAXAS B2B DBØ", kind: "set", year: "2026", url: `${SC}/avraxas-b2b-dbo-1`, meta: "VINYL ONLY", seed: 11, cover: "https://i1.sndcdn.com/artworks-gAv6caQuPZriYPWp-pEzO1w-t500x500.png" },
  { id: "k-chamox", title: "KORA 001", artist: "CHAMÓX", kind: "set", year: "2026", url: `${SC}/kora-001-chamox`, meta: "LIVE AT KORA", seed: 12, cover: "https://i1.sndcdn.com/artworks-8Ze5IfPl3Fq5ebQm-Ws1HaA-t500x500.png" },
  { id: "k-nandes", title: "KORA 001", artist: "NANDES", kind: "set", year: "2026", url: `${SC}/kora-001-nandes`, meta: "LIVE AT KORA", seed: 13, cover: "https://i1.sndcdn.com/artworks-dK5s0GWQtkt7VSc2-4FBCUw-t500x500.png" },
];

/**
 * RADIO GRUVINK — the mini player that starts from the entry page.
 * SESSIONS = every item above with a SoundCloud URL, in page order.
 * Each day the radio starts on a different session (rotates at midnight,
 * Barcelona time) and then keeps going: when one ends, the next one starts.
 */
export const SESSIONS: MusicItem[] = MUSIC.filter((m) => !!m.url);

/** Day number in Europe/Madrid, so the "session of the day" flips at local midnight. */
function madridDay(d = new Date()) {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(d); // YYYY-MM-DD
  return Math.floor(Date.parse(`${ymd}T00:00:00Z`) / 86_400_000);
}

/** Index in SESSIONS of today's session. */
export function todayIndex(d = new Date()) {
  return SESSIONS.length ? madridDay(d) % SESSIONS.length : -1;
}

/** Kept for compatibility: today's session. */
export const INTRO_TRACK: MusicItem | null = SESSIONS[0] ?? null;

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
