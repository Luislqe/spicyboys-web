"use client";

import { type CSSProperties } from "react";
import { PLATFORM_LABEL, VIDEOS, thumbFor } from "@/data/visuals";
import { igUrl, splitNames } from "@/data/people";
import { SITE } from "@/data/site";
import { Art } from "./Art";
import { SectionHead } from "./SectionHead";
import { Split } from "./Split";

const STYLES = ["strobe", "crowd", "floor", "rings", "scan", "type"] as const;

/**
 * VIDEOS — session clips. Each card opens the video where it lives
 * (Instagram / YouTube / Facebook…). Data: src/data/visuals.ts
 */
export function Visuals() {
  return (
    <section id="visuals" className="videos" data-section="visuals" data-label="VIDEOS" data-idx="04" aria-labelledby="visuals-title">
      <svg className="sr-only" aria-hidden="true" focusable="false">
        <filter id="sb-displace" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="1" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <SectionHead idx="04" label="VIDEOS" note="SESIONES EN VÍDEO" />

      <div className="visuals__head">
        <h2 id="visuals-title" className="visuals__title" data-reveal data-fit data-fit-max="17">
          <Split text="VIDEOS" className="fit-in" />
        </h2>
        <p className="visuals__lede mono" data-reveal>
          Sessions on video. Each one opens where it was posted.
        </p>
      </div>

      <ul className="vgrid">
        {VIDEOS.map((v, i) => {
          const thumb = thumbFor(v);
          const label = PLATFORM_LABEL[v.platform];
          const card = (
            <>
              <span className="vcard__media">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" loading="lazy" />
                ) : (
                  <Art style={STYLES[v.seed % STYLES.length]} seed={v.seed} ratio={16 / 10} alt="" base={220} />
                )}
                <span className="vcard__play" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M7 4v16l13-8z" />
                  </svg>
                </span>
                <span className="vcard__badge mono">{v.url ? label : "PRÓXIMAMENTE"}</span>
              </span>
              <span className="vcard__meta">
                <span className="vcard__title">{v.title}</span>
                <span className="vcard__artist mono">{v.artist}</span>
              </span>
            </>
          );
          return (
            <li key={v.id} className={`vcard ${i === 0 ? "vcard--big" : ""} ${v.url ? "" : "is-soon"}`} data-reveal style={{ "--i": i } as CSSProperties}>
              {v.url ? (
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="play"
                  data-cursor-label="VER"
                  aria-label={`Ver ${v.title}${v.artist ? ` — ${v.artist}` : ""} en ${label}`}
                >
                  {card}
                </a>
              ) : (
                <a
                  href={v.platform === "youtube" ? SITE.links.youtube : SITE.links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="soon"
                  aria-label={`${v.title} — próximamente. Abrir ${label} de GRUVINK`}
                >
                  {card}
                </a>
              )}
              {v.artist && (
                <span className="vcard__names mono">
                  {splitNames(v.artist)
                    .filter((n) => n !== "SESIÓN")
                    .map((n) => (
                      <a key={n} href={igUrl(n)} target="_blank" rel="noopener noreferrer" data-cursor="follow" data-cursor-label="INSTAGRAM">
                        {n} ↗
                      </a>
                    ))}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
