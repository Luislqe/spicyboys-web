/**
 * ARTISTS — the GRUVINK roster.
 * -----------------------------
 * Copy a block to add an artist. Everything except `name` is optional:
 * unknown fields show "—" / "TBA".
 *
 * from:       where they are from (city / town)
 * lastEvent / nextEvent: { name, url } → the url can point to the event page
 *             ("/eventos#kora-001"), tickets, or an Instagram post.
 * members:    sub-artists shown under the main name as 01.A, 01.B…
 * links:      instagram = handle without "@" · soundcloud = full URL
 * photo:      your own image in /public/artists, e.g. "/artists/spicyboys.jpg"
 */
export type EventRef = { name: string; url?: string };

export type Member = {
  name: string;
  role?: string;
  links?: { instagram?: string; soundcloud?: string };
};

export type Artist = {
  id: string;
  name: string;
  from?: string;
  tags: string[];
  lastEvent?: EventRef;
  nextEvent?: EventRef;
  members?: Member[];
  links?: { instagram?: string; soundcloud?: string };
  photo?: string;
  seed: number;
};

export const ARTISTS: Artist[] = [
  {
    id: "spicyboys",
    name: "SPICY BOYS",
    from: "CASTELLDEFELS",
    tags: ["DJ DUO"],
    lastEvent: { name: "KORA 001 · DBØ B2B AVRAXAS", url: "/eventos#kora-001" },
    // nextEvent: { name: "KORA 002", url: "/eventos#kora-002" },
    members: [
      { name: "IZIAL", role: "DJ" },
      { name: "DBØ", role: "DJ · VINYL" },
    ],
    links: {
      instagram: "spicyboys.gvk",
      soundcloud: "https://soundcloud.com/sasha-borrego-672612851",
    },
    seed: 3,
  },
];
