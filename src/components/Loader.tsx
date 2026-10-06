"use client";

import { useEffect, useRef, useState } from "react";
import { SESSIONS, todayIndex, type MusicItem } from "@/data/music";
import { SITE } from "@/data/site";
import { emit } from "@/lib/engine";

const BLOCKS = 16;

/**
 * ENTRY — short boot bar, then a single screen with one big button:
 * MÚSICA ON (starts Radio GRUVINK on today's session) or MÚSICA OFF.
 * Shown on every visit: browsers only allow audio after a click, and this click
 * is what lets the music start straight away.
 */
export function Loader() {
  const [phase, setPhase] = useState<"run" | "gate" | "out" | "gone">("run");
  const [today, setToday] = useState<MusicItem | null>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const done = useRef<() => void>(() => {});

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const idx = todayIndex();
    setToday(idx >= 0 ? SESSIONS[idx] : null);
    root.classList.add("is-locked");

    const finish = () => {
      root.classList.remove("is-locked");
      root.classList.add("is-booted");
      emit("boot");
      setPhase("out");
      window.setTimeout(() => setPhase("gone"), reduced ? 0 : 520);
    };
    done.current = finish;

    const dur = reduced ? 0 : 650;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = dur ? Math.min(1, Math.max(0, (now - t0) / dur)) : 1;
      const n = Math.round((1 - Math.pow(1 - p, 3)) * BLOCKS);
      if (bar.current) bar.current.textContent = "█".repeat(n) + "░".repeat(BLOCKS - n);
      if (p < 1) raf = requestAnimationFrame(step);
      else if (SESSIONS.length) setPhase("gate");
      else finish();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const enter = (music: boolean) => {
    if (music) emit("radio-start");
    done.current();
  };

  useEffect(() => {
    if (phase !== "gate") return;
    primary.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && enter(false);
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
      aria-label={phase === "gate" ? "Entrar en GRUVINK" : undefined}
    >
      <div className="entry">
        <div className="entry__top mono">
          <span>GVK—SYS / RADIO GRUVINK</span>
          <span>v3.3</span>
        </div>

        <div className="entry__center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="entry__logo" src={SITE.logo} alt="GRUVINK" />

          {phase === "gate" ? (
            <div className="entry__choice">
              <button
                ref={primary}
                className="entry__on"
                onClick={() => enter(true)}
                data-cursor="play"
                data-cursor-label="ON"
                aria-label="Entrar con música"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="entry__icon" src={SITE.icon} alt="" />
                <span className="entry__on-label mono">
                  <span className="entry__eq" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  MÚSICA ON
                </span>
              </button>
              <button className="entry__off mono" onClick={() => enter(false)} data-cursor="hover">
                MÚSICA OFF — ENTRAR EN SILENCIO
              </button>
              {today && (
                <p className="entry__today mono">
                  SESIÓN DE HOY · {today.title}
                  {today.artist ? ` / ${today.artist}` : ""}
                </p>
              )}
            </div>
          ) : (
            <div className="entry__bar mono">
              <span ref={bar}>{"░".repeat(BLOCKS)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
