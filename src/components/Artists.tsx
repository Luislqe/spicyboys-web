"use client";

import { useRef, type CSSProperties } from "react";
import { ARTISTS } from "@/data/artists";
import { scramble } from "@/lib/engine";
import { Art } from "./Art";
import { SectionHead } from "./SectionHead";
import { Split } from "./Split";

const STYLES = ["crowd", "strobe", "rings", "floor", "scan", "type"] as const;

/**
 * ARTISTS — the roster as a giant index.
 * Hover (or focus): the row floods lime, the name compresses (width axis),
 * a portrait slides in and the info line decodes.
 */
export function Artists() {
  const infos = useRef<(HTMLSpanElement | null)[]>([]);
  const flip = (i: number, on: boolean) => {
    const el = infos.current[i];
    const a = ARTISTS[i];
    if (el) scramble(el, on ? a.tags.join(" / ") : a.info, 300);
  };

  return (
    <section id="artists" className="artists" data-section="artists" data-label="ARTISTS" data-idx="02" aria-labelledby="artists-title">
      <SectionHead idx="02" label="ARTISTS" note={`ROSTER ${String(ARTISTS.length).padStart(2, "0")}`} />
      <div className="artists__head">
        <h2 id="artists-title" className="artists__title" data-reveal data-fit data-fit-max="17">
          <Split text="ARTISTS" className="fit-in" />
        </h2>
        <p className="artists__lede mono" data-reveal>
          The crew behind the podcasts and the KORA nights.
        </p>
      </div>

      <ol className="roster">
        {ARTISTS.map((a, i) => (
          <li
            key={a.id}
            className="artist"
            data-reveal
            style={{ "--i": i } as CSSProperties}
            onPointerEnter={() => flip(i, true)}
            onPointerLeave={() => flip(i, false)}
            onFocus={() => flip(i, true)}
            onBlur={() => flip(i, false)}
          >
            <span className="artist__fill" aria-hidden="true" />
            <span className="artist__n mono">{String(i + 1).padStart(2, "0")}</span>
            <span className="artist__photo" aria-hidden="true">
              <Art style={STYLES[a.seed % STYLES.length]} seed={a.seed} ratio={0.8} alt="" base={120} src={a.photo} />
            </span>
            <h3 className="artist__name">{a.name}</h3>
            <span
              className="artist__info mono"
              ref={(el) => {
                infos.current[i] = el;
              }}
            >
              {a.info}
            </span>
            <span className="artist__links mono">
              {a.links?.soundcloud && (
                <a href={a.links.soundcloud} target="_blank" rel="noopener noreferrer" data-cursor="open" data-cursor-label="SC">
                  SOUNDCLOUD ↗
                </a>
              )}
              {a.links?.instagram && (
                <a href={a.links.instagram} target="_blank" rel="noopener noreferrer" data-cursor="follow">
                  INSTAGRAM ↗
                </a>
              )}
            </span>
          </li>
        ))}
        <li className="artist artist--more" data-reveal style={{ "--i": ARTISTS.length } as CSSProperties}>
          <span className="artist__n mono">+</span>
          <span className="artist__name artist__name--more">MORE SOON</span>
        </li>
      </ol>
    </section>
  );
}
