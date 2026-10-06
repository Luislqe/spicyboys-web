"use client";

import Link from "next/link";
import { type CSSProperties } from "react";
import { ARTISTS, type EventRef } from "@/data/artists";
import { igUrl } from "@/data/people";
import { Art } from "./Art";
import { SectionHead } from "./SectionHead";
import { Split } from "./Split";

const STYLES = ["crowd", "strobe", "rings", "floor", "scan", "type"] as const;

const ig = (name: string, handle?: string) => (handle ? `https://www.instagram.com/${handle}/` : igUrl(name));

function EventLink({ label, ev }: { label: string; ev?: EventRef }) {
  const text = ev?.name ?? "TBA";
  const url = ev?.url;
  return (
    <span className="artist__ev">
      <span className="artist__ev-k">{label}</span>
      {url ? (
        url.startsWith("/") ? (
          <Link href={url} data-cursor="open" data-cursor-label="VER">
            {text} →
          </Link>
        ) : (
          <a href={url} target="_blank" rel="noopener noreferrer" data-cursor="open">
            {text} ↗
          </a>
        )
      ) : (
        <span className="artist__ev-tba">{text}</span>
      )}
    </span>
  );
}

/**
 * ARTISTS — the roster. Every name opens that artist's Instagram.
 * Each row: where they're from, last and next event (linked), sub-members
 * (01.A, 01.B…) and SoundCloud / Instagram buttons. Data: src/data/artists.ts
 */
export function Artists() {
  return (
    <section id="artists" className="artists" data-section="artists" data-label="ARTISTS" data-idx="02" aria-labelledby="artists-title">
      <SectionHead idx="02" label="ARTISTS" note={`ROSTER ${String(ARTISTS.length).padStart(2, "0")}`} />
      <div className="artists__head">
        <h2 id="artists-title" className="artists__title" data-reveal data-fit data-fit-max="17">
          <Split text="ARTISTS" className="fit-in" />
        </h2>
        <p className="artists__lede mono" data-reveal>
          The crew behind the podcasts and the KORA nights. Click a name to open their Instagram.
        </p>
      </div>

      <ol className="roster">
        {ARTISTS.map((a, i) => {
          const n = String(i + 1).padStart(2, "0");
          return (
            <li key={a.id} className="artist" data-reveal style={{ "--i": i } as CSSProperties}>
              <span className="artist__fill" aria-hidden="true" />
              <span className="artist__n mono">{n}</span>
              <span className="artist__photo" aria-hidden="true">
                <Art style={STYLES[a.seed % STYLES.length]} seed={a.seed} ratio={0.8} alt="" base={120} src={a.photo} />
              </span>

              <div className="artist__main">
                <h3 className="artist__name">
                  <a
                    href={ig(a.name, a.links?.instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="follow"
                    data-cursor-label="INSTAGRAM"
                  >
                    {a.name}
                  </a>
                </h3>
                {a.members && a.members.length > 0 && (
                  <ul className="artist__members">
                    {a.members.map((m, k) => (
                      <li key={m.name}>
                        <span className="artist__code mono">
                          {n}.{String.fromCharCode(65 + k)}
                        </span>
                        <a
                          className="artist__member"
                          href={ig(m.name, m.links?.instagram)}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor="follow"
                          data-cursor-label="INSTAGRAM"
                        >
                          {m.name}
                        </a>
                        {m.role && <span className="artist__role mono">{m.role}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="artist__data mono">
                <span className="artist__ev">
                  <span className="artist__ev-k">DE</span>
                  <span>{a.from ?? "—"}</span>
                </span>
                <EventLink label="ÚLTIMO" ev={a.lastEvent} />
                <EventLink label="PRÓXIMO" ev={a.nextEvent} />
              </div>

              <span className="artist__links mono">
                {a.links?.soundcloud && (
                  <a href={a.links.soundcloud} target="_blank" rel="noopener noreferrer" data-cursor="open" data-cursor-label="SC">
                    SOUNDCLOUD ↗
                  </a>
                )}
                <a href={ig(a.name, a.links?.instagram)} target="_blank" rel="noopener noreferrer" data-cursor="follow">
                  INSTAGRAM ↗
                </a>
              </span>
            </li>
          );
        })}
        <li className="artist artist--more" data-reveal style={{ "--i": ARTISTS.length } as CSSProperties}>
          <span className="artist__n mono">+</span>
          <span className="artist__name artist__name--more">MORE SOON</span>
        </li>
      </ol>
    </section>
  );
}
