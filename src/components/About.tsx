"use client";

import { useRef, type CSSProperties } from "react";
import { SITE } from "@/data/site";
import { scramble } from "@/lib/engine";
import { SectionHead } from "./SectionHead";

const ROWS = [
  { word: "GRUVINK", meta: "COLLECTIVE / BCN", alt: "SAY IT: GROOVE-INK" },
  { word: "PODCAST", meta: "Nº 20 — 26 / SOUNDCLOUD", alt: "A NEW GUEST EVERY EDITION" },
  { word: "KORA", meta: "EDITION 001 / 2026", alt: "THE GRUVINK NIGHT" },
  { word: "SPICY BOYS", meta: "IZIAL × DBØ", alt: "TWO ARTISTS / ONE BOOTH" },
  { word: "BARCELONA", meta: "41.3874°N 2.1686°E", alt: "HOME NODE" },
  { word: "UNDERGROUND", meta: "AFTER DARK", alt: "NO VIP. NO FILTER." },
];

/**
 * INDEX — the "about" as an archive card. Almost no prose.
 * The radar is decorative: one blip per roster entry.
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
      data-idx="05"
      aria-labelledby="about-title"
    >
      <SectionHead idx="05" label="INDEX" note="GVK_ID / CARD" />
      <h2 id="about-title" className="sr-only">
        About GRUVINK
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
              <circle className="radar__blip" cx="149" cy="64" r="3.5" />
              <circle className="radar__blip" cx="62" cy="128" r="3" />
              <circle className="radar__blip" cx="128" cy="150" r="2.5" />
              <circle className="radar__home" cx="100" cy="100" r="4" />
            </svg>
            <span className="radar__sweep" />
            <span className="radar__lbl radar__lbl--home mono">GVK</span>
            <span className="radar__lbl radar__lbl--bcn mono">SB</span>
          </div>
          <dl className="about__data mono">
            <div>
              <dt>ID</dt>
              <dd>GVK—001</dd>
            </div>
            <div>
              <dt>TYPE</dt>
              <dd>{SITE.kind}</dd>
            </div>
            <div>
              <dt>BASE</dt>
              <dd>{SITE.city}</dd>
            </div>
            <div>
              <dt>OUTPUT</dt>
              <dd>PODCAST · KORA</dd>
            </div>
          </dl>
          <p className="about__line">
            A collective built around the dancefloor: <em>podcasts, nights and the people who play them.</em>
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
