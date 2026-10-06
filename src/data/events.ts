/**
 * EVENTOS — GRUVINK nights, upcoming and past.
 * ---------------------------------------------
 * Add an event by copying a block. Fields you don't know yet can stay empty:
 * the page shows "TBA" for them.
 *
 * status: "upcoming" → shown under PRÓXIMOS (sorted by date)
 *         "past"     → shown under PASADOS (newest first)
 * date:   "YYYY-MM-DD" when known (used for sorting and the big day/month)
 * sets:   public SoundCloud URL (track or playlist) to listen to the night
 * tickets: link to tickets / RSVP for upcoming events
 * flyer:  your own image in /public/events, e.g. "/events/kora-002.jpg"
 */
export type GvkEvent = {
  id: string;
  name: string;
  series?: string;
  status: "upcoming" | "past";
  date?: string;
  /** shown when there is no exact date, e.g. "PRIMAVERA 2026" */
  when?: string;
  venue?: string;
  city?: string;
  lineup: string[];
  sets?: string;
  tickets?: string;
  flyer?: string;
};

export const EVENTS: GvkEvent[] = [
  {
    id: "kora-002",
    name: "KORA 002",
    series: "KORA",
    status: "upcoming",
    when: "PRÓXIMAMENTE",
    city: "BARCELONA",
    lineup: [],
  },
  {
    id: "kora-001",
    name: "KORA 001",
    series: "KORA",
    status: "past",
    when: "2026",
    city: "BARCELONA",
    lineup: ["AVRAXAS B2B DBØ (VINYL ONLY)", "CHAMÓX", "NANDES"],
    sets: "https://soundcloud.com/gruvink/sets/fiesta-kora",
  },
];

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

/** Big date label: { day: "14", month: "MAR 26" } or null when unknown. */
export function dateParts(e: GvkEvent) {
  if (!e.date) return null;
  const [y, m, d] = e.date.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { day: String(d).padStart(2, "0"), month: `${MONTHS[m - 1]} ${String(y).slice(2)}` };
}

export const upcomingEvents = () =>
  EVENTS.filter((e) => e.status === "upcoming").sort((a, b) => (a.date ?? "9").localeCompare(b.date ?? "9"));
export const pastEvents = () =>
  EVENTS.filter((e) => e.status === "past").sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
