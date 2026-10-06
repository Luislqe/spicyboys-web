"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { KIND_LABEL, MUSIC, type MusicItem } from "@/data/music";
import { SITE } from "@/data/site";
import { clamp, emit, env, lerp, on, onTick, progressOf, rectOf, state } from "@/lib/engine";
import { Art } from "./Art";
import { SectionHead } from "./SectionHead";
import { Split } from "./Split";

const STYLE_BY_SEED = ["rings", "strobe", "floor", "scan", "crowd", "type"] as const;
const styleFor = (seed: number) => STYLE_BY_SEED[seed % STYLE_BY_SEED.length];

/**
 * SOUNDS — discography-style index.
 * Hover: row inverts, title stretches, a cover follows the cursor.
 * Click: the official SoundCloud widget opens in the player dock.
 */
export function Music() {
  const section = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number>(-1);
  const [active, setActive] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const podcasts = MUSIC.filter((m) => m.kind === "podcast").length;
  const sets = MUSIC.filter((m) => m.kind === "set").length;

  useEffect(() => {
    const offs = [
      on("player", (p) => {
        const s = p as { id?: string; playing: boolean };
        setActive(s.id ?? null);
        setPlaying(!!s.playing);
      }),
    ];
    const sec = section.current;
    const h = titleRef.current;
    const pv = preview.current;
    const pos = { x: 0, y: 0, r: 0 };
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (sec) io.observe(sec);

    const off = onTick(() => {
      if (!visible || !sec) return;
      // giant title grows + tracks in as the section enters
      if (h && !env.reduced) {
        const p = progressOf(sec);
        const e = clamp(p * 2.2, 0, 1);
        const s = 0.78 + e * 0.22;
        h.style.transform = `translate3d(${((1 - e) * -6).toFixed(2)}vw,0,0) scale(${s.toFixed(3)})`;
      }
      // floating cover follows the pointer inside the list
      if (pv && list.current && !env.touch) {
        const lr = rectOf(list.current);
        const tx = state.mx - lr.left;
        const ty = state.my - lr.top;
        const px = pos.x;
        pos.x = lerp(pos.x, tx, 0.14);
        pos.y = lerp(pos.y, ty, 0.14);
        pos.r = lerp(pos.r, clamp((pos.x - px) * 0.6, -14, 14), 0.1);
        pv.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${pos.r.toFixed(2)}deg)`;
      }
    });
    return () => {
      offs.forEach((o) => o());
      off();
      io.disconnect();
    };
  }, []);

  const play = (m: MusicItem) => {
    if (!m.url) {
      emit("toast", `${m.title} · SIGNAL PENDING — FIRST ORIGINAL INCOMING`);
      return;
    }
    emit("play", m);
  };

  return (
    <section
      ref={section}
      id="sounds"
      className="music"
      data-section="sounds"
      data-label="SOUNDS"
      data-idx="01"
      aria-labelledby="sounds-title"
    >
      <SectionHead idx="01" label="SOUNDS" note="PODCAST / LIVE SETS" />

      <div className="music__head">
        <h2 id="sounds-title" ref={titleRef} className="music__title" data-reveal data-fit data-fit-max="24">
          <Split text="SOUNDS" className="fit-in" />
        </h2>
        <div className="music__stats mono" data-reveal>
          <span>
            <b>{String(podcasts).padStart(2, "0")}</b> PODCASTS ONLINE
          </span>
          <span>
            <b>{String(sets).padStart(2, "0")}</b> LIVE SETS FROM KORA
          </span>
          <span>NEW EPISODES ON SOUNDCLOUD</span>
          <a href={SITE.links.soundcloud} target="_blank" rel="noopener noreferrer" data-cursor="open">
            FULL PROFILE ON SOUNDCLOUD ↗
          </a>
        </div>
      </div>

      <div className="music__cols mono" aria-hidden="true">
        <span>NO.</span>
        <span>ARTIST</span>
        <span>SERIES</span>
        <span>INFO</span>
        <span>YEAR</span>
        <span />
      </div>

      <div className="music__list-wrap" onPointerLeave={() => setHover(-1)}>
        <ol ref={list} className={`music__list ${hover >= 0 ? "has-hover" : ""}`}>
          {MUSIC.map((m, i) => {
            const locked = !m.url;
            const isActive = active === m.id;
            return (
              <li
                key={m.id}
                className={`track ${locked ? "is-locked" : ""} ${isActive ? "is-active" : ""} ${hover === i ? "is-hover" : ""}`}
                style={{ "--i": i } as CSSProperties}
                data-reveal
                data-cursor={locked ? "soon" : "play"}
                data-cursor-label={locked ? "SOON" : isActive && playing ? "PLAYING" : "PLAY"}
                onPointerEnter={() => setHover(i)}
              >
                <button
                  className="track__btn"
                  onClick={() => play(m)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(-1)}
                  aria-label={
                    locked
                      ? `${m.title} — coming soon`
                      : `Play ${m.title}${m.artist ? ` — ${m.artist}` : ""}, ${KIND_LABEL[m.kind].toLowerCase()}`
                  }
                >
                  <span className="track__fill" aria-hidden="true" />
                  <span className="track__idx mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="track__thumb" aria-hidden="true">
                    <Art style={styleFor(m.seed)} seed={m.seed} ratio={1} alt="" base={72} src={m.cover} />
                  </span>
                  <span className="track__title">
                    <span className="track__title-in">{m.artist ?? m.title}</span>
                  </span>
                  <span className="track__kind mono">{m.artist ? m.title : KIND_LABEL[m.kind]}</span>
                  <span className="track__meta mono">{m.meta}</span>
                  <span className="track__year mono">{m.year}</span>
                  <span className="track__cta mono">
                    {locked ? (
                      "LOCKED"
                    ) : isActive ? (
                      <span className={`eq ${playing ? "is-on" : ""}`} aria-hidden="true">
                        <i />
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : (
                      "PLAY ▶"
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div ref={preview} className={`music__preview ${hover >= 0 ? "is-on" : ""}`} aria-hidden="true">
          {MUSIC.map((m, i) => (
            <div key={m.id} className={`music__cover ${hover === i ? "is-on" : ""}`}>
              <Art style={styleFor(m.seed)} seed={m.seed} ratio={1} alt="" base={160} src={m.cover} />
              <span className="music__cover-tag mono">
                {m.title} / {KIND_LABEL[m.kind]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="music__note mono" data-reveal>
        Podcasts and live sets from GRUVINK, played through SoundCloud’s official player. Each mix
        belongs to the artist who recorded it.
      </p>
    </section>
  );
}
