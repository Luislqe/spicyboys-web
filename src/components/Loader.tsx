"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_TRACK } from "@/data/music";
import { SITE } from "@/data/site";
import { emit } from "@/lib/engine";

const BLOCKS = 16;
const LOG = ["BCN NODE", "PODCAST FEED", "KORA ARRAY", "SUB 42HZ"];

/**
 * Boot screen + sound gate.
 * First visit in a session: ~0.9s boot, then "ENTER WITH SOUND / WITHOUT SOUND".
 * Browsers only allow audio after a click, so this click is what lets the intro
 * track (latest podcast, via the official SoundCloud player) start right away.
 * Repeat visits in the same session skip the gate (~0.25s boot).
 */
export function Loader() {
  const [phase, setPhase] = useState<"run" | "gate" | "out" | "gone">("run");
  const primary = useRef<HTMLButtonElement>(null);
  const done = useRef<() => void>(() => {});
  const bar = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const log = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("sb-boot") === "1";
      sessionStorage.setItem("sb-boot", "1");
    } catch {}
    const dur = reduced ? 0 : seen ? 260 : 900;
    let fontsReady = false;
    (document.fonts?.ready ?? Promise.resolve()).then(() => (fontsReady = true));

    root.classList.add("is-locked");
    const t0 = performance.now();
    let raf = 0;
    let lastBlocks = -1;

    const finish = () => {
      root.classList.remove("is-locked");
      root.classList.add("is-booted");
      emit("boot");
      setPhase("out");
      window.setTimeout(() => setPhase("gone"), reduced ? 0 : 520);
    };
    done.current = finish;
    // first visit → ask about sound; repeat visit → straight in
    const end = () => (seen || !INTRO_TRACK ? finish() : setPhase("gate"));

    if (dur === 0) {
      end();
      return;
    }

    const step = (now: number) => {
      const el = now - t0;
      let p = Math.min(1, el / dur);
      // hold at 92% for fonts, but never longer than 1.4s total
      if (p > 0.92 && !fontsReady && el < 1400) p = 0.92;
      const eased = 1 - Math.pow(1 - p, 3);
      const n = Math.round(eased * BLOCKS);
      if (n !== lastBlocks && bar.current) {
        bar.current.textContent = "█".repeat(n) + "░".repeat(BLOCKS - n);
        lastBlocks = n;
        const items = log.current?.children;
        if (items) for (let i = 0; i < items.length; i++) items[i].classList.toggle("ok", eased > (i + 1) / (items.length + 1));
      }
      if (pct.current) pct.current.textContent = String(Math.round(eased * 100)).padStart(3, "0") + "%";
      if (p < 1) raf = requestAnimationFrame(step);
      else end();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const enter = (withSound: boolean) => {
    if (withSound && INTRO_TRACK) {
      emit("play", INTRO_TRACK);
      emit("player-min", true);
    }
    done.current();
  };

  useEffect(() => {
    if (phase !== "gate") return;
    primary.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") enter(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      className={`loader ${phase === "out" ? "is-out" : ""} ${phase === "gate" ? "is-gate" : ""}`}
      aria-hidden={phase !== "gate"}
      role={phase === "gate" ? "dialog" : undefined}
      aria-label={phase === "gate" ? "Enter GRUVINK" : undefined}
    >
      <div className="loader__grid">
        <div className="loader__top mono">
          <span>GVK—SYS / BOOT SEQUENCE</span>
          <span>v3.1</span>
        </div>
        <div className="loader__name">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="loader__icon" src={SITE.icon} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="loader__logo" src={SITE.logo} alt="GRUVINK" />
        </div>
        <div className="loader__side mono">
          <span className="loader__idx">01</span>
          <span>LOADING SYSTEM</span>
          <ol ref={log} className="loader__log">
            {LOG.map((l) => (
              <li key={l}>
                <span>&gt; {l}</span>
                <b>OK</b>
              </li>
            ))}
          </ol>
        </div>
        {phase === "gate" ? (
          <div className="gate">
            <button ref={primary} className="gate__btn gate__btn--sound mono" onClick={() => enter(true)} data-cursor="play" data-cursor-label="ENTER">
              <span className="gate__eq" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              ENTRAR CON SONIDO
            </button>
            <button className="gate__btn mono" onClick={() => enter(false)} data-cursor="hover">
              ENTRAR SIN SONIDO
            </button>
            {INTRO_TRACK && (
              <span className="gate__now mono">
                SUENA: {INTRO_TRACK.title}
                {INTRO_TRACK.artist ? ` / ${INTRO_TRACK.artist}` : ""}
              </span>
            )}
          </div>
        ) : (
          <div className="loader__bar mono">
            <span ref={bar}>{"░".repeat(BLOCKS)}</span>
            <span ref={pct} className="loader__pct">
              000%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
