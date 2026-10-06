/**
 * ARTISTS — the GRUVINK roster.
 * Add a member by copying a block. Every link is optional.
 * `photo` (optional) → your own image in /public/artists, e.g. "/artists/spicyboys.jpg".
 */
export type Artist = {
  id: string;
  name: string;
  /** small line: members, role… */
  info: string;
  tags: string[];
  links?: { soundcloud?: string; instagram?: string };
  photo?: string;
  seed: number;
};

export const ARTISTS: Artist[] = [
  {
    id: "spicyboys",
    name: "SPICY BOYS",
    info: "IZIAL × DBØ",
    tags: ["DJ DUO", "CASTELLDEFELS"],
    links: {
      soundcloud: "https://soundcloud.com/sasha-borrego-672612851",
      instagram: "https://www.instagram.com/spicyboys.gvk/",
    },
    seed: 3,
  },
  {
    id: "izial",
    name: "IZIAL",
    info: "SPICY BOYS",
    tags: ["DJ"],
    seed: 7,
  },
  {
    id: "dbo",
    name: "DBØ",
    info: "SPICY BOYS · KORA 001 B2B AVRAXAS",
    tags: ["DJ", "VINYL"],
    seed: 9,
  },
];
