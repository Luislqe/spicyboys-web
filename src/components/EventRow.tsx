"use client";

import { dateParts, type GvkEvent } from "@/data/events";
import { SESSIONS, type MusicItem } from "@/data/music";
import { igUrl, splitNames } from "@/data/people";
import { SITE } from "@/data/site";
import { emit } from "@/lib/engine";

/** Play the first recorded set of that night on the radio (then it keeps going). */
export function listenTo(e: GvkEvent) {
  const first = SESSIONS.find((m) => m.title === e.name);
  if (first) return emit("play", first);
  if (e.sets)
    emit("play", {
      id: `event-${e.id}`,
      title: e.name,
      artist: "SETS",
      kind: "playlist",
      year: e.date?.slice(0, 4) ?? e.when ?? "",
      url: e.sets,
      meta: e.lineup.join(" · "),
      seed: 1,
    } satisfies MusicItem);
}

/** Lineup act → each artist name links to their Instagram ("AVRAXAS B2B DBØ (VINYL ONLY)"). */
function Act({ act }: { act: string }) {
  const note = act.match(/\((.*?)\)/)?.[1];
  const names = splitNames(act);
  return (
    <span className="ev-act">
      ✕{" "}
      {names.map((n, k) => (
        <span key={n}>
          {k > 0 && " B2B "}
          <a href={igUrl(n)} target="_blank" rel="noopener noreferrer" data-cursor="follow" data-cursor-label="INSTAGRAM">
            {n}
          </a>
        </span>
      ))}
      {note && <em> {note}</em>}
    </span>
  );
}

/** One event line, shared by the home section and the /eventos page. */
export function EventRow({ e }: { e: GvkEvent }) {
  const d = dateParts(e);
  const upcoming = e.status === "upcoming";
  return (
    <li id={e.id} className={`ev-row ${upcoming ? "is-upcoming" : "is-past"}`}>
      <span className="ev-date mono">
        {d ? (
          <>
            <b>{d.day}</b> {d.month}
          </>
        ) : (
          e.when ?? "TBA"
        )}
      </span>
      <span className="ev-name">{e.name}</span>
      <span className="ev-info mono">
        <span className="ev-where">{[e.venue ?? (upcoming ? "LUGAR TBA" : undefined), e.city].filter(Boolean).join(" · ")}</span>
        {e.lineup.length ? e.lineup.map((l) => <Act key={l} act={l} />) : <span>LINE UP TBA</span>}
      </span>
      {upcoming ? (
        e.tickets ? (
          <a className="connected__cta mono" href={e.tickets} target="_blank" rel="noopener noreferrer" data-cursor="open">
            <span>ENTRADAS</span>
            <i aria-hidden="true">↗</i>
          </a>
        ) : (
          <a
            className="connected__cta connected__cta--ghost mono"
            href={SITE.links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="open"
          >
            <span>AVISOS EN {SITE.links.instagramHandle.toUpperCase()}</span>
            <i aria-hidden="true">↗</i>
          </a>
        )
      ) : e.sets ? (
        <button className="connected__cta mono" onClick={() => listenTo(e)} data-cursor="play">
          <span>ESCUCHAR SETS</span>
          <i aria-hidden="true">▶</i>
        </button>
      ) : (
        <span />
      )}
    </li>
  );
}
