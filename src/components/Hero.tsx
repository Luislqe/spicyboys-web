"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { SITE } from "@/data/site";
import { clamp, env, lerp, onTick, rectOf, state } from "@/lib/engine";

/** Where the wordmark splits: the middle of the "v" (measured on the logo). */
const SPLIT = 53.6;
/** Extrusion layers behind the face (real 3D depth). */
const DEPTH = 9;

function Half({ side }: { side: "l" | "r" }) {
  return (
    <div className={`hero__half hero__half--${side}`}>
      {Array.from({ length: DEPTH }, (_, k) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={k}
          className="hero__slice hero__slice--depth"
          src={SITE.logo}
          alt=""
          draggable={false}
          style={{ "--z": DEPTH - k } as CSSProperties}
        />
      ))}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero__slice hero__slice--face" src={SITE.logo} alt="" draggable={false} />
    </div>
  );
}

/**
 * HERO — the GRUVINK wordmark as a real 3D object, full width.
 * The logo is extruded (stacked layers in 3D space) and tilts with the pointer
 * (finger on touch). On scroll it opens through the "v" like two doors.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const st = stage.current;
    const sec = section.current;
    if (!st || !sec) return;
    const left = st.querySelector<HTMLElement>(".hero__half--l");
    const right = st.querySelector<HTMLElement>(".hero__half--r");

    let touching = false;
    const touch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      touching = true;
      state.mx = t.clientX;
      state.my = t.clientY;
      state.nx = (t.clientX / state.vw) * 2 - 1;
      state.ny = (t.clientY / state.vh) * 2 - 1;
      state.pointerActive = true;
    };
    const touchEnd = () => (touching = false);
    sec.addEventListener("touchstart", touch, { passive: true });
    sec.addEventListener("touchmove", touch, { passive: true });
    sec.addEventListener("touchend", touchEnd, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(sec);

    const tilt = { x: 0, y: 0 };
    const off = onTick((t) => {
      if (!visible || env.reduced) return;
      const secH = rectOf(sec).height || state.vh;
      const p = clamp(state.scroll / (secH * 0.8), 0, 1);

      // pointer → real 3D rotation (idle sway on touch screens)
      let tx = state.pointerActive ? state.ny * -16 : 0;
      let ty = state.pointerActive ? state.nx * 24 : 0;
      if (env.touch && !touching) {
        tx = Math.sin(t / 1700) * 8;
        ty = Math.sin(t / 2300) * 14;
      }
      tilt.x = lerp(tilt.x, tx, 0.08);
      tilt.y = lerp(tilt.y, ty, 0.08);
      st.style.transform = `rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`;
      // the face catches the light as it turns
      st.style.setProperty("--glare-x", `${(50 + tilt.y * 2).toFixed(1)}%`);

      // scroll → open through the "v" like two doors
      const e = 1 - Math.pow(1 - p, 2);
      const gap = e * state.vw * 0.26;
      const swing = e * 38;
      if (left) left.style.transform = `translate3d(${(-gap).toFixed(1)}px, ${(e * 30).toFixed(1)}px, ${(e * 60).toFixed(1)}px) rotateY(${swing.toFixed(2)}deg)`;
      if (right) right.style.transform = `translate3d(${gap.toFixed(1)}px, ${(e * 30).toFixed(1)}px, ${(e * 60).toFixed(1)}px) rotateY(${(-swing).toFixed(2)}deg)`;
      st.style.opacity = (1 - p * 0.7).toFixed(3);
    });

    return () => {
      off();
      io.disconnect();
      sec.removeEventListener("touchstart", touch);
      sec.removeEventListener("touchmove", touch);
      sec.removeEventListener("touchend", touchEnd);
    };
  }, []);

  return (
    <section
      ref={section}
      id="top"
      className="hero"
      data-section="top"
      data-label="SIGNAL"
      data-idx="00"
      aria-label="GRUVINK"
      style={{ "--split": `${SPLIT}%` } as CSSProperties}
    >
      <div className="hero__meta hero__meta--tl mono">
        <span className="hero__meta-k">FILE</span>
        <span>GVK_ARCHIVE / 001</span>
        <span>{SITE.tagline}</span>
      </div>
      <div className="hero__meta hero__meta--tr mono">
        <span className="hero__meta-k">LOC</span>
        <span>{SITE.city}</span>
        <span>{SITE.links.instagramHandle.toUpperCase()}</span>
      </div>

      <h1 className="hero__title">
        <span className="sr-only">GRUVINK — electronic music collective, Barcelona</span>
        <div ref={stage} className="hero__stage" aria-hidden="true">
          <Half side="l" />
          <Half side="r" />
        </div>
      </h1>

      <div className="hero__bottom mono">
        <div className="hero__cell">
          <span className="hero__meta-k">TYPE</span>
          <span>{SITE.kind}</span>
        </div>
        <div className="hero__cell">
          <span className="hero__meta-k">SERIES</span>
          <span>PODCAST · KORA</span>
        </div>
        <div className="hero__cell">
          <span className="hero__meta-k">YEAR</span>
          <span>{SITE.year}</span>
        </div>
        <div className="hero__cell hero__cell--hint">
          <span className="hero__meta-k">INPUT</span>
          <span className="hero__hint-desk">MOVE THE MOUSE · SCROLL TO OPEN</span>
          <span className="hero__hint-touch">DRAG · SCROLL TO OPEN</span>
        </div>
        <a href="#sounds" className="hero__scroll" aria-label="Scroll to music">
          <span>SCROLL</span>
          <i aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
