"use client";

import { useEffect, useRef } from "react";
import { SITE } from "@/data/site";
import { clamp, env, lerp, onTick, rectOf, state } from "@/lib/engine";

/** The wordmark split in two halves (they tear apart on scroll). */
function Mark({ src }: { src: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero__half hero__half--l" src={src} alt="" draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero__half hero__half--r" src={src} alt="" draggable={false} />
    </>
  );
}

/**
 * HERO — the GRUVINK wordmark with an "inverted signal" lens.
 * Base layer: the real logo. Lens layer: the same logo with lime/violet swapped
 * and scanlines, clipped to a circle that follows the pointer (finger on touch).
 * Scroll tears the wordmark in two; the pointer tilts it in 3D.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const st = stage.current;
    const sec = section.current;
    const lensEl = lens.current;
    if (!st || !sec || !lensEl) return;
    const halves = Array.from(st.querySelectorAll<HTMLElement>(".hero__half"));
    const lefts = halves.filter((h) => h.classList.contains("hero__half--l"));
    const rights = halves.filter((h) => h.classList.contains("hero__half--r"));

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
    st.addEventListener("touchstart", touch, { passive: true });
    st.addEventListener("touchmove", touch, { passive: true });
    st.addEventListener("touchend", touchEnd, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(sec);

    let lensR = 0;
    let lx = 0;
    let ly = 0;
    const tilt = { x: 0, y: 0 };
    let lastLens = "";

    const off = onTick((t) => {
      if (!visible) return;
      const r = rectOf(st);
      const secH = rectOf(sec).height || state.vh;
      const p = env.reduced ? 0 : clamp(state.scroll / (secH * 0.85), 0, 1);

      let px = state.sx - r.left;
      let py = state.sy - r.top;
      const inside =
        state.pointerActive && px > -60 && px < r.width + 60 && py > -60 && py < r.height + 60 && (!env.touch || touching);
      if (env.touch && !touching) {
        px = r.width * (0.5 + 0.42 * Math.sin(t / 1500));
        py = r.height * (0.5 + 0.25 * Math.sin(t / 950));
      }

      const targetR = inside ? Math.min(r.width * 0.15, 240) : env.touch && !env.reduced ? r.width * 0.12 : 0;
      lensR = lerp(lensR, targetR, 0.14);
      lx = lerp(lx, px, 0.35);
      ly = lerp(ly, py, 0.35);
      // only touch the lens when it is (or just was) visible → no idle repaints
      const lensKey = lensR < 0.5 ? "off" : `${lensR.toFixed(0)}|${lx.toFixed(0)}|${ly.toFixed(0)}`;
      if (lensKey !== lastLens) {
        lastLens = lensKey;
        lensEl.style.visibility = lensKey === "off" ? "hidden" : "visible";
        if (lensKey !== "off") {
          lensEl.style.clipPath = `circle(${lensR.toFixed(1)}px at ${lx.toFixed(1)}px ${ly.toFixed(1)}px)`;
          lensEl.style.setProperty("--lx", `${lx.toFixed(1)}px`);
          lensEl.style.setProperty("--ly", `${ly.toFixed(1)}px`);
          lensEl.style.setProperty("--lr", `${lensR.toFixed(1)}px`);
        }
      }

      if (env.reduced) return;
      // scroll: tear the wordmark apart; pointer: 3D tilt
      const tear = p * state.vw * 0.2;
      const lift = p * state.vh * 0.18;
      const lT = `translate3d(${(-tear).toFixed(1)}px, ${lift.toFixed(1)}px, 0) rotate(${(-p * 4).toFixed(2)}deg)`;
      const rT = `translate3d(${tear.toFixed(1)}px, ${(lift * 0.4).toFixed(1)}px, 0) rotate(${(p * 4).toFixed(2)}deg)`;
      for (const el of lefts) el.style.transform = lT;
      for (const el of rights) el.style.transform = rT;
      tilt.x = lerp(tilt.x, state.pointerActive ? state.ny * -7 : 0, 0.08);
      tilt.y = lerp(tilt.y, state.pointerActive ? state.nx * 9 : 0, 0.08);
      const skew = clamp(state.velocity * -0.2, -8, 8);
      st.style.transform = `perspective(1200px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) skewX(${skew.toFixed(2)}deg)`;
      st.style.opacity = (1 - p * 0.85).toFixed(3);
      const fast = Math.abs(state.velocity) > 14;
      if (fast !== st.classList.contains("is-fast")) st.classList.toggle("is-fast", fast);
    });

    return () => {
      off();
      io.disconnect();
      st.removeEventListener("touchstart", touch);
      st.removeEventListener("touchmove", touch);
      st.removeEventListener("touchend", touchEnd);
    };
  }, []);

  return (
    <section ref={section} id="top" className="hero" data-section="top" data-label="SIGNAL" data-idx="00" aria-label="GRUVINK">
      <div className="hero__frame" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>

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
        <div ref={stage} className="hero__stage" data-cursor="lens" aria-hidden="true">
          <div className="hero__layer hero__layer--base">
            <Mark src={SITE.logo} />
          </div>
          <div ref={lens} className="hero__layer hero__layer--lens">
            <Mark src={SITE.logoSwap} />
          </div>
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
