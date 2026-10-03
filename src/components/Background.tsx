"use client";

import { useEffect, useRef } from "react";
import { emit, env, on, onTick, state } from "@/lib/engine";

/**
 * Layered background (back → front):
 *  1. tint glow — radial light whose colour/position shifts per section
 *  2. grid — 1px lines, scroll-parallaxed, radially masked
 *  3. canvas — ~60 dust particles with depth + proximity links + rare laser sweeps
 *  4. grain — a generated noise tile, jittered with CSS steps()
 *  5. scanlines + vignette (pure CSS)
 * Canvas pauses off-tab (shared engine loop) and drops to 24 particles on mobile.
 */
export function Background() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const grain = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  // grain tile, generated once
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    if (!ctx || !grain.current) return;
    const img = ctx.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 26;
    }
    ctx.putImageData(img, 0, 0);
    grain.current.style.backgroundImage = `url(${c.toDataURL()})`;
  }, []);

  // section tracking → tint + HUD label
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          document.documentElement.dataset.section = el.dataset.section;
          emit("section", { id: el.dataset.section, label: el.dataset.label, idx: el.dataset.idx });
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // particles
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0;
    let H = 0;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = env.small || env.touch ? 22 : 42;
    const P = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: 0.2 + Math.random() * 0.8,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -0.05 - Math.random() * 0.2,
      ox: 0,
      oy: 0,
    }));

    let laser = -1; // y position of an active sweep, -1 = none
    let laserT = 0;
    let nextLaser = performance.now() + 4000;
    let rave = false;
    const offRave = on("rave", (v) => (rave = !!v));
    let lastScroll = state.scroll;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const dy = state.scroll - lastScroll;
      lastScroll = state.scroll;
      const linkDist = env.small ? 80 : 120;

      for (const p of P) {
        if (!env.reduced) {
          p.x += p.vx * p.z;
          p.y += p.vy * p.z - dy * p.z * 0.25;
        }
        // pointer repel
        const dx = p.x - state.sx;
        const dyy = p.y - state.sy;
        const d2 = dx * dx + dyy * dyy;
        if (d2 < 22000 && state.pointerActive) {
          const f = (1 - d2 / 22000) * 14 * p.z;
          const d = Math.sqrt(d2) || 1;
          p.ox += ((dx / d) * f - p.ox) * 0.1;
          p.oy += ((dyy / d) * f - p.oy) * 0.1;
        } else {
          p.ox *= 0.94;
          p.oy *= 0.94;
        }
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
      }

      // proximity links
      ctx.lineWidth = 0.5;
      for (let i = 0; i < P.length; i++) {
        const a = P[i];
        for (let j = i + 1; j < P.length; j++) {
          const b = P[j];
          const dx = a.x + a.ox - b.x - b.ox;
          const dy2 = a.y + a.oy - b.y - b.oy;
          const d = Math.abs(dx) + Math.abs(dy2);
          if (d < linkDist) {
            ctx.strokeStyle = `rgba(236,232,225,${((1 - d / linkDist) * 0.12 * Math.min(a.z, b.z)).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x + a.ox, a.y + a.oy);
            ctx.lineTo(b.x + b.ox, b.y + b.oy);
            ctx.stroke();
          }
        }
      }
      for (const p of P) {
        const s = p.z > 0.85 ? 2 : 1;
        ctx.fillStyle = `rgba(236,232,225,${(0.15 + p.z * 0.5).toFixed(3)})`;
        ctx.fillRect(p.x + p.ox, p.y + p.oy, s, s);
      }

      // laser sweep
      if (!env.reduced) {
        if (laser < 0 && t > nextLaser) {
          laser = Math.random() * H;
          laserT = 0;
          nextLaser = t + (rave ? 900 : 5000 + Math.random() * 6000);
        }
        if (laser >= 0) {
          laserT += 0.035;
          const a = Math.sin(Math.min(laserT, 1) * Math.PI);
          const g = ctx.createLinearGradient(0, 0, W, 0);
          const head = Math.min(1, laserT);
          const tail = Math.max(0, head - 0.3);
          g.addColorStop(0, "rgba(255,45,26,0)");
          g.addColorStop(tail, "rgba(255,45,26,0)");
          g.addColorStop(head, `rgba(255,45,26,${(0.55 * a).toFixed(3)})`);
          g.addColorStop(Math.min(1, head + 0.001), "rgba(255,45,26,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, laser, W, 1);
          if (laserT >= 1.3) laser = -1;
        }
      }
    };

    // particles are slow: 30fps is visually identical and halves the cost
    let odd = false;
    const off = onTick((t) => {
      odd = !odd;
      if (odd || env.reduced) draw(t);
      if (grid.current) {
        const y = -(state.scroll * 0.15) % 80;
        grid.current.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      }
      // glow follows pointer/scroll with a transform (composited, no repaint)
      if (glow.current) {
        const gx = state.nx * state.vw * 0.08;
        const gy = (state.progress - 0.3) * state.vh * 0.5;
        glow.current.style.transform = `translate3d(${gx.toFixed(0)}px, ${gy.toFixed(0)}px, 0)`;
      }
    });

    return () => {
      off();
      offRave();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="bg" aria-hidden="true">
      <div ref={glow} className="bg__glow" />
      <div className="bg__grid-wrap">
        <div ref={grid} className="bg__grid" />
      </div>
      <canvas ref={canvas} className="bg__canvas" />
      <div ref={grain} className="bg__grain" />
      <div className="bg__scan" />
    </div>
  );
}
