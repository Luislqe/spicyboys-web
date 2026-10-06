"use client";

import { useEffect, useRef } from "react";
import { SITE } from "@/data/site";
import Link from "next/link";
import { pastEvents, upcomingEvents } from "@/data/events";
import { clamp, env, lerp, onTick, rectOf, state } from "@/lib/engine";
import { EventRow } from "./EventRow";

/**
 * EVENTOS — the only lime section: upcoming and past GRUVINK nights.
 * The panel opens from a slit as you scroll in; the pointer (or finger) is a
 * torch that reveals the next event's name. Data: src/data/events.ts
 * When idle, the torch drifts on its own so the word is always discoverable.
 */
export function Events() {
  const section = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = section.current;
    const pn = panel.current;
    const fd = field.current;
    if (!sec || !pn || !fd) return;
    let visible = false;
    const root = document.documentElement;
    const setHud = (top: boolean, bottom: boolean) => {
      if (root.classList.contains("hud-dark") !== top) root.classList.toggle("hud-dark", top);
      if (root.classList.contains("corners-dark") !== bottom) root.classList.toggle("corners-dark", bottom);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (!visible) setHud(false, false);
      },
      { rootMargin: "10% 0px" },
    );
    io.observe(sec);

    let inside = false;
    let lastMove = 0;
    const pos = { x: 0.5, y: 0.5, r: 0 };
    const move = (x: number, y: number) => {
      const r = rectOf(fd);
      pos.x = lerp(pos.x, (x - r.left) / r.width, 1);
      pos.y = lerp(pos.y, (y - r.top) / r.height, 1);
      inside = true;
      lastMove = performance.now();
    };
    const pm = (e: PointerEvent) => move(e.clientX, e.clientY);
    const tm = (e: TouchEvent) => e.touches[0] && move(e.touches[0].clientX, e.touches[0].clientY);
    const leave = () => (inside = false);
    fd.addEventListener("pointermove", pm, { passive: true });
    fd.addEventListener("touchmove", tm, { passive: true });
    fd.addEventListener("touchstart", tm, { passive: true });
    fd.addEventListener("pointerleave", leave);

    const cur = { x: 0.5, y: 0.5, r: 0 };
    let lastClip = "";
    let lastMask = "";
    const off = onTick((t) => {
      if (!visible) return;
      // slit → full panel as the section arrives
      const r = rectOf(sec);
      const enter = clamp((state.vh - r.top) / (state.vh * 0.75), 0, 1);
      const e = env.reduced ? 1 : 1 - Math.pow(1 - enter, 3);
      const clip =
        e >= 0.999
          ? "none"
          : `inset(${((1 - e) * 18).toFixed(1)}% ${((1 - e) * 42).toFixed(1)}% ${((1 - e) * 18).toFixed(1)}% ${((1 - e) * 42).toFixed(1)}%)`;
      if (clip !== lastClip) {
        pn.style.clipPath = clip;
        lastClip = clip;
      }
      // HUD turns dark only where the light panel is actually behind it
      const pr = rectOf(pn);
      const open = e > 0.9;
      setHud(open && pr.top < 56 && pr.bottom > 30, open && pr.top < state.vh - 30 && pr.bottom > state.vh - 20);

      // torch
      const idle = !inside || performance.now() - lastMove > 2500;
      const tx = idle ? 0.5 + 0.34 * Math.sin(t / 2100) : pos.x;
      const ty = idle ? 0.5 + 0.22 * Math.sin(t / 1300 + 1) : pos.y;
      const tr = idle ? (env.small ? 120 : 190) : env.small ? 150 : 240;
      cur.x = lerp(cur.x, tx, 0.12);
      cur.y = lerp(cur.y, ty, 0.12);
      cur.r = lerp(cur.r, tr, 0.08);
      // only repaint the mask when the torch actually moved
      const key = `${(cur.x * 100).toFixed(1)}|${(cur.y * 100).toFixed(1)}|${cur.r.toFixed(0)}`;
      if (key !== lastMask) {
        lastMask = key;
        fd.style.setProperty("--tx", `${(cur.x * 100).toFixed(1)}%`);
        fd.style.setProperty("--ty", `${(cur.y * 100).toFixed(1)}%`);
        fd.style.setProperty("--tr", `${cur.r.toFixed(0)}px`);
      }
    });

    return () => {
      off();
      io.disconnect();
      setHud(false, false);
      fd.removeEventListener("pointermove", pm);
      fd.removeEventListener("touchmove", tm);
      fd.removeEventListener("touchstart", tm);
      fd.removeEventListener("pointerleave", leave);
    };
  }, []);

  const upcoming = upcomingEvents();
  const past = pastEvents();
  const next = upcoming[0];
  const nextWord = next ? next.name : "SOON";
  const under = [nextWord, ...(next?.lineup ?? []), "GRUVINK", "BARCELONA"].join(" ● ") + " ● ";

  return (
    <section
      ref={section}
      id="events"
      className="connected"
      data-section="events"
      data-label="EVENTOS"
      data-idx="03"
      aria-labelledby="events-title"
    >
      <div ref={panel} className="connected__panel">
        <div className="connected__top mono">
          <span>[03] EVENTOS</span>
          <span>GRUVINK NIGHTS</span>
          <span>
            {String(upcoming.length).padStart(2, "0")} PRÓXIMOS · {String(past.length).padStart(2, "0")} PASADOS
          </span>
        </div>

        <h2 id="events-title" className="connected__title">
          <span className="connected__kicker">EVENTOS</span>
        </h2>

        <div className="ev-block">
          <h3 className="ev-label mono">
            <i aria-hidden="true" /> PRÓXIMOS
          </h3>
          <div className="ev-next">
            <div ref={field} className="torch" aria-hidden="true">
              <div className="torch__under">
                {Array.from({ length: 12 }, (_, i) => (
                  <span key={i}>{under.repeat(6)}</span>
                ))}
              </div>
              <div className="torch__reveal">
                <span className="torch__word" data-fit data-fit-max="22" data-fit-k="0.9">
                  <span className="fit-in">{nextWord}</span>
                </span>
                <span className="torch__scan" />
              </div>
              <span className="torch__hint mono">
                <span className="hint-desk">MOVE TO REVEAL</span>
                <span className="hint-touch">DRAG TO REVEAL</span>
              </span>
            </div>
            <ul className="ev-list">
              {upcoming.slice(0, 2).map((e) => (
                <EventRow key={e.id} e={e} />
              ))}
              {upcoming.length === 0 && (
                <li className="ev-row ev-row--empty">
                  <span className="ev-date mono">TBA</span>
                  <span className="ev-name">NUEVAS FECHAS</span>
                  <span className="ev-info mono">SE ANUNCIAN EN {SITE.links.instagramHandle.toUpperCase()}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="ev-block">
          <h3 className="ev-label mono">
            <i aria-hidden="true" /> PASADOS
          </h3>
          <ul className="ev-list ev-list--past">
            {past.slice(0, 3).map((e) => (
              <EventRow key={e.id} e={e} />
            ))}
          </ul>
        </div>

        <Link href="/eventos" className="ev-all" data-cursor="open" data-cursor-label="VER">
          <span>VER TODOS LOS EVENTOS</span>
          <i aria-hidden="true">→</i>
        </Link>
      </div>
    </section>
  );
}
