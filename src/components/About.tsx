"use client";

import { useRef, type CSSProperties } from "react";
import { SITE } from "@/data/site";
import { scramble } from "@/lib/engine";
import { SectionHead } from "./SectionHead";

const ROWS = [
  { word: "SPICY BOYS", meta: `${SITE.members[0]} × ${SITE.members[1]}`, alt: "TWO ARTISTS / ONE BOOTH" },
  { word: "CASTELLDEFELS", meta: `${SITE.coords.castelldefels.lat} ${SITE.coords.castelldefels.lon}`, alt: "HOME NODE / 08860" },
  { word: "BARCELONA", meta: `${SITE.coords.barcelona.lat} ${SITE.coords.barcelona.lon}`, alt: "20.4 KM / BEARING 054°" },
  { word: "HARD TECHNO", meta: "145 — 160 BPM", alt: "KICK FIRST. ALWAYS." },
  { word: "RAVE", meta: "02:00 — 07:00", alt: "UNTIL THE LIGHTS COME ON" },
  { word: "UNDERGROUND", meta: SITE.manifesto.join(" / "), alt: "NO VIP. NO FILTER." },
];

/**
 * INDEX — the "about" as an archive card. Almost no prose.
 * Radar shows Barcelona's real bearing/distance from Castelldefels.
 */
export function About() {
  const metas = useRef<(HTMLSpanElement | null)[]>([]);

  const flip = (i: number, on: boolean) => {
    const el = metas.current[i];
    if (el) scramble(el, on ? ROWS[i].alt : ROWS[i].meta, 320);
  };

  return (
    <section
      id="about"
      className="about"
      data-section="about"
      data-label="INDEX"
      data-idx="03"
      aria-labelledby="about-title"
    >
      <SectionHead idx="03" label="INDEX" note="SB_ID / CARD" />
      <h2 id="about-title" className="sr-only">
        About SPICY BOYS
      </h2>

      <div className="about__grid">
        <aside className="about__side">
          <div className="radar" aria-hidden="true">
            <svg viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="96" />
              <circle cx="100" cy="100" r="64" />
              <circle cx="100" cy="100" r="32" />
              <line x1="100" y1="0" x2="100" y2="200" />
              <line x1="0" y1="100" x2="200" y2="100" />
              {/* BCN: 20.4 km at 054° → scaled on the 32 km outer ring */}
              <circle className="radar__blip" cx={100 + 61 * Math.sin((54 * Math.PI) / 180)} cy={100 - 61 * Math.cos((54 * Math.PI) / 180)} r="3.5" />
              <circle className="radar__home" cx="100" cy="100" r="4" />
            </svg>
            <span className="radar__sweep" />
            <span className="radar__lbl radar__lbl--home mono">CDF</span>
            <span className="radar__lbl radar__lbl--bcn mono">BCN</span>
          </div>
          <dl className="about__data mono">
            <div>
              <dt>ID</dt>
              <dd>SB—001</dd>
            </div>
            <div>
              <dt>CREW</dt>
              <dd>
                {SITE.members[0]} / {SITE.members[1]}
              </dd>
            </div>
            <div>
              <dt>BASE</dt>
              <dd>
                {SITE.city} / {SITE.region}
              </dd>
            </div>
            <div>
              <dt>STATUS</dt>
              <dd>ACTIVE / 2026</dd>
            </div>
          </dl>
          <p className="about__line">
            Two artists. One way of reading the dancefloor: <em>selection, storytelling and the moment.</em>
          </p>
        </aside>

        <ol className="about__list">
          {ROWS.map((r, i) => (
            <li
              key={r.word}
              className="idx"
              data-reveal
              style={{ "--i": i } as CSSProperties}
              onPointerEnter={() => flip(i, true)}
              onPointerLeave={() => flip(i, false)}
            >
              <span className="idx__n mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="idx__word" data-fit="idx" data-fit-max="8">
                <span className="fit-in">{r.word}</span>
              </span>
              <span
                className="idx__meta mono"
                ref={(el) => {
                  metas.current[i] = el;
                }}
              >
                {r.meta}
              </span>
              <span className="idx__rule" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
