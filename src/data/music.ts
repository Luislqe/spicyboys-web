/**
 * MUSIC ARCHIVE
 * -------------
 * Everything here plays through the OFFICIAL SoundCloud widget (iframe + Widget API).
 * No audio is downloaded or proxied.
 *
 * State of the SoundCloud profile when this was built (Sep 2026):
 *   - 0 own uploads
 *   - 3 public playlists curated by SPICY BOYS (tracks by other artists)
 * So they are labelled as SELECTIONS, never as own releases.
 *
 * To add an original track/set: add an entry with kind "original" and the public
 * SoundCloud URL. Order in the array = order in the list.
 * An entry without `url` renders as a locked "incoming" slot.
 */
export type MusicKind = "original" | "set" | "selection";

export type MusicItem = {
  id: string;
  title: string;
  kind: MusicKind;
  year: string;
  /** Public SoundCloud URL (track, set or playlist). */
  url?: string;
  /** Short metadata shown on hover. */
  meta: string;
  /** Seed for the generated cover art (used when no `cover` is provided). */
  seed: number;
  /** Optional own artwork, e.g. "/covers/lake-groove.jpg" (must be yours to use). */
  cover?: string;
};

export const MUSIC: MusicItem[] = [
  {
    id: "the-lake-groove",
    title: "THE LAKE GROOVE",
    kind: "selection",
    year: "2025",
    url: "https://soundcloud.com/sasha-borrego-672612851/sets/the-lake-groove",
    meta: "5 TRACKS · HYPNOTIC / DEEP GROOVE",
    seed: 3,
  },
  {
    id: "electro",
    title: "ELECTRO",
    kind: "selection",
    year: "2025",
    url: "https://soundcloud.com/sasha-borrego-672612851/sets/electro",
    meta: "5 TRACKS · BROKEN / MACHINE FUNK",
    seed: 11,
  },
  {
    id: "localito-16",
    title: "LOCALITO 16",
    kind: "selection",
    year: "2025",
    url: "https://soundcloud.com/sasha-borrego-672612851/sets/localito-16",
    meta: "LIVE SELECTION · IZIAL & DBØ",
    seed: 16,
  },
  {
    id: "sb-001",
    title: "SB—001",
    kind: "original",
    year: "2026",
    meta: "FIRST ORIGINAL · SIGNAL PENDING",
    seed: 1,
  },
];

export const KIND_LABEL: Record<MusicKind, string> = {
  original: "ORIGINAL",
  set: "DJ SET",
  selection: "SELECTION",
};

export const widgetSrc = (url: string, autoPlay = true) =>
  "https://w.soundcloud.com/player/?" +
  new URLSearchParams({
    url,
    color: "#ff2d1a",
    auto_play: String(autoPlay),
    hide_related: "true",
    show_comments: "false",
    show_user: "true",
    show_reposts: "false",
    show_teaser: "false",
    visual: "false",
  }).toString();
