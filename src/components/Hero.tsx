"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { SITE } from "@/data/site";
import { clamp, env, invalidateRects, lerp, onTick, rectOf, state } from "@/lib/engine";

const LINES = ["SPICY", "BOYS"] as const;

function Lines() {
  let k = 0;
  return (
    <>
      {LINES.map((word, li) => (
        <span key={word} className={`hero__line hero__line--${li + 1}`}>
          {Array.from(word).map((c) => {
            const i = k++;
            return (
              <span key={i} className="hero__ch" style={{ "--i": i } as CSSProperties}>
                <span className="hero__ch-in">{c}</span>
              </span>
            );
          })}
        </span>
      ))}
    </>
  );
}

/**
 * HERO — "thermal lens".
 * Two identical type layers. The top one (signal red, scanlined) is clipped to a
 * circle that follows the pointer, like a heat camera passing over the logo.
 * Letters near the pointer stretch; scroll tears the two words apart.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const lens = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const h1 = title.current;
    const sec = section.current;
    const lensEl = lens.current;
    if (!h1 || !sec || !lensEl) return;

    const layers = Array.from(h1.querySelectorAll<HTMLElement>(".hero__layer"));
    const lines = layers.map((l) => Array.from(l.querySelectorAll<HTMLElement>(".hero__line")));
    const chars = layers.map((l) => Array.from(l.querySelectorAll<HTMLElement>(".hero__ch")));
    let centers: { x: number; y: number; line: number }[] = [];

    // ── fit "SPICY" to the full width, measure letter centres
    const fit = () => {
      const base = layers[0];
      const word = lines[0][0];
      const avail = h1.clientWidth;
      h1.style.fontSize = "100px";
      const w = word.scrollWidth || 1;
      // fill the width, but never push the words + footer row below the fold (desktop)
      const byW = (100 * avail) / w;
      const byH = window.innerWidth > 767 ? (window.innerHeight - 320) / (2 * 0.79) : Infinity;
      const fs = Math.max(40, Math.min(byW, byH));
      h1.style.fontSize = `${fs.toFixed(2)}px`;
      const l2 = lines[0][1];
      h1.style.setProperty("--boys-w", `${l2.scrollWidth}px`);
      invalidateRects();
      centers = chars[0].map((c) => {
        const line = c.parentElement as HTMLElement;
        return {
          x: line.offsetLeft + c.offsetLeft + c.offsetWidth / 2,
          y: line.offsetTop + c.offsetTop + c.offsetHeight / 2,
          line: line.classList.contains("hero__line--1") ? 0 : 1,
        };
      });
      void base;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(h1);
    document.fonts?.ready.then(fit).catch(() => {});

    // ── touch: dragging a finger over the logo drives the lens
    let touching = false;
    const touch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      touching = true;
      state.mx = t.clientX;
      state.my = t.clientY;
      if (!state.pointerActive) {
        state.pointerActive = true;
        state.sx = t.clientX;
        state.sy = t.clientY;
      }
    };
    const touchEnd = () => (touching = false);
    h1.addEventListener("touchstart", touch, { passive: true });
    h1.addEventListener("touchmove", touch, { passive: true });
    h1.addEventListener("touchend", touchEnd, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(sec);

    let lensR = 0;
    let lx = 0;
    let ly = 0;
    let deformed = true;

    const off = onTick((t) => {
      if (!visible) return;
      const r = rectOf(h1);
      const secH = rectOf(sec).height || state.vh;
      const p = env.reduced ? 0 : clamp(state.scroll / (secH * 0.85), 0, 1);

      // pointer (or an idle scanner on touch screens)
      let px = state.sx - r.left;
      let py = state.sy - r.top;
      const inside =
        state.pointerActive && px > -40 && px < r.width + 40 && py > -40 && py < r.height + 40 && (!env.touch || touching);
      if (env.touch && !touching) {
        px = r.width * (0.5 + 0.45 * Math.sin(t / 1400));
        py = r.height * (0.5 + 0.3 * Math.sin(t / 900));
      }

      // lens
      const targetR = inside ? Math.min(r.width * 0.16, 260) : env.touch && !env.reduced ? r.width * 0.09 : 0;
      lensR = lerp(lensR, targetR, 0.14);
      lx = lerp(lx, px, 0.35);
      ly = lerp(ly, py, 0.35);
      lensEl.style.clipPath = `circle(${lensR.toFixed(1)}px at ${lx.toFixed(1)}px ${ly.toFixed(1)}px)`;
      lensEl.style.setProperty("--lx", `${lx.toFixed(1)}px`);
      lensEl.style.setProperty("--ly", `${ly.toFixed(1)}px`);
      lensEl.style.setProperty("--lr", `${lensR.toFixed(1)}px`);

      // chromatic split only while scrolling fast (class toggle = no per-frame repaint)
      const fast = Math.abs(state.velocity) > 14;
      if (fast !== h1.classList.contains("is-fast")) h1.classList.toggle("is-fast", fast);

      if (env.reduced) return;

      // lines: parallax + scroll tear
      const vw = state.vw;
      const tx1 = -p * vw * 0.22 - state.nx * 14;
      const tx2 = p * vw * 0.22 + state.nx * 14;
      const ty1 = p * state.vh * 0.22 - state.ny * 8;
      const ty2 = p * state.vh * 0.08 + state.ny * 8;
      const sc = 1 + p * 0.18;
      const l1 = `translate3d(${tx1.toFixed(1)}px, ${ty1.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
      const l2 = `translate3d(${tx2.toFixed(1)}px, ${ty2.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
      for (const ls of lines) {
        ls[0].style.transform = l1;
        ls[1].style.transform = l2;
      }
      h1.style.opacity = (1 - p * 0.85).toFixed(3);

      // per-letter deformation near the pointer
      const active = inside || env.touch;
      if (!active && !deformed) return;
      const radius = Math.max(140, r.width * 0.16);
      const skew = clamp(state.velocity * -0.25, -10, 10);
      let any = false;
      for (let i = 0; i < centers.length; i++) {
        const c = centers[i];
        const ox = c.line === 0 ? tx1 : tx2;
        const dx = px - (c.x + ox);
        const dy = py - c.y;
        const f = active ? Math.exp(-(dx * dx + dy * dy) / (radius * radius)) : 0;
        if (f > 0.002) any = true;
        const tf =
          f > 0.002 || Math.abs(skew) > 0.05
            ? `translate3d(${(-dx * f * 0.06).toFixed(1)}px, ${(-f * 7).toFixed(2)}%, 0) scale(${(1 - f * 0.1).toFixed(3)}, ${(1 + f * 0.34).toFixed(3)}) skewX(${skew.toFixed(2)}deg)`
            : "";
        for (const layer of chars) if (layer[i]) layer[i].style.transform = tf;
      }
      deformed = any || Math.abs(skew) > 0.05;
    });

    return () => {
      off();
      ro.disconnect();
      io.disconnect();
      h1.removeEventListener("touchstart", touch);
      h1.removeEventListener("touchmove", touch);
      h1.removeEventListener("touchend", touchEnd);
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
      aria-label="SPICY BOYS"
    >
      <div className="hero__frame" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="hero__meta hero__meta--tl mono">
        <span className="hero__meta-k">FILE</span>
        <span>SB_ARCHIVE / 001</span>
        <span>
          {SITE.members[0]} × {SITE.members[1]}
        </span>
      </div>
      <div className="hero__meta hero__meta--tr mono">
        <span className="hero__meta-k">LOC</span>
        <span>
          {SITE.city} / {SITE.region}
        </span>
        <span>
          {SITE.coords.castelldefels.lat} {SITE.coords.castelldefels.lon}
        </span>
      </div>

      <h1 ref={title} className="hero__title" data-cursor="lens">
        <span className="sr-only">SPICY BOYS — hard techno DJs from Castelldefels, Barcelona</span>
        <span className="hero__layer hero__layer--base" aria-hidden="true">
          <Lines />
        </span>
        <span ref={lens} className="hero__layer hero__layer--lens" aria-hidden="true">
          <Lines />
        </span>
        <span className="hero__tag mono" aria-hidden="true">
          <span>
            <b>■</b> {SITE.genre}
          </span>
          <span>{SITE.role}</span>
          <span>{SITE.bpm}—160 BPM</span>
        </span>
      </h1>

      <div className="hero__bottom mono">
        <div className="hero__cell">
          <span className="hero__meta-k">GENRE</span>
          <span>{SITE.genre}</span>
        </div>
        <div className="hero__cell">
          <span className="hero__meta-k">ROLE</span>
          <span>{SITE.role}</span>
        </div>
        <div className="hero__cell">
          <span className="hero__meta-k">YEAR</span>
          <span>{SITE.year}</span>
        </div>
        <div className="hero__cell hero__cell--hint">
          <span className="hero__meta-k">INPUT</span>
          <span className="hero__hint-desk">MOVE OVER THE LOGO</span>
          <span className="hero__hint-touch">DRAG ACROSS THE LOGO</span>
        </div>
        <a href="#sounds" className="hero__scroll" aria-label="Scroll to music">
          <span>SCROLL</span>
          <i aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
