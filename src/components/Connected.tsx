"use client";

import { useEffect, useRef } from "react";
import { SITE } from "@/data/site";
import { clamp, env, lerp, onTick, rectOf, state } from "@/lib/engine";

/**
 * CONNECTED — the only light section. The panel opens from a slit as you scroll in,
 * and the pointer (or finger) is a torch that reveals GRUVINK under the page.
 * When idle, the torch drifts on its own so the word is always discoverable.
 * Copy stays neutral: a scene link, not a claimed partnership.
 */
export function Connected() {
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

  return (
    <section
      ref={section}
      id="connected"
      className="connected"
      data-section="connected"
      data-label="CONNECTED"
      data-idx="04"
      aria-labelledby="connected-title"
    >
      <div ref={panel} className="connected__panel">
        <div className="connected__top mono">
          <span>[04] CONNECTED</span>
          <span>EXT. LINK / SCENE</span>
          <span>{SITE.links.gruvinkHandle.toUpperCase()}</span>
        </div>

        <h2 id="connected-title" className="connected__title">
          <span className="connected__kicker">CONNECTED</span>
          <span className="sr-only">GRUVINK</span>
        </h2>

        <div ref={field} className="torch" aria-hidden="true">
          <div className="torch__under">
            {Array.from({ length: 14 }, (_, i) => (
              <span key={i}>{"GRUVINK ● ".repeat(18)}</span>
            ))}
          </div>
          <div className="torch__reveal">
            <span className="torch__word" data-fit data-fit-max="20" data-fit-k="0.9">
              <span className="fit-in">GRUVINK</span>
            </span>
            <span className="torch__scan" />
          </div>
          <span className="torch__hint mono">
            <span className="hint-desk">MOVE TO REVEAL</span>
            <span className="hint-touch">DRAG TO REVEAL</span>
          </span>
        </div>

        <div className="connected__foot">
          <p className="connected__copy">
            A scene we move with — crews, nights and people around the same sound.
            <span className="mono"> External Instagram link — shown as a scene reference.</span>
          </p>
          <a
            className="connected__cta mono"
            href={SITE.links.gruvink}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="open"
          >
            <span>OPEN {SITE.links.gruvinkHandle.toUpperCase()}</span>
            <i aria-hidden="true">↗</i>
          </a>
        </div>
      </div>
    </section>
  );
}
