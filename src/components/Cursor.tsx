"use client";

import { useEffect, useRef } from "react";
import { env, lerp, onTick, scramble, state } from "@/lib/engine";

/**
 * Cursor states (set with data-cursor="…" on any element, optional data-cursor-label):
 *   default → small ring + dot
 *   hover   → bigger ring (links / buttons)
 *   play    → big disc "PLAY"
 *   open    → big disc "OPEN"
 *   follow  → big disc "FOLLOW"
 *   view    → square viewfinder "VIEW" (images)
 *   lens    → ring collapses to crosshair (hero thermal lens)
 *   soon    → dashed ring "SOON"
 * Disabled on touch devices.
 */
const LABELS: Record<string, string> = {
  play: "PLAY",
  open: "OPEN",
  follow: "FOLLOW",
  view: "VIEW",
  soon: "SOON",
  drag: "DRAG",
};

const TRAIL = 6;

export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const trail = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (env.touch || window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const r = { x: state.mx, y: state.my };
    const tr = Array.from({ length: TRAIL }, () => ({ x: state.mx, y: state.my }));
    let mode = "default";
    let cancel = () => {};

    const setMode = (m: string, text?: string) => {
      if (!ring.current || !label.current) return;
      if (m === mode && !text) return;
      mode = m;
      ring.current.dataset.mode = m;
      cancel();
      const t = text ?? LABELS[m] ?? "";
      if (t) cancel = scramble(label.current, t, 260);
      else label.current.textContent = "";
    };

    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t || !t.closest) return;
      const c = t.closest<HTMLElement>("[data-cursor]");
      if (c) return setMode(c.dataset.cursor!, c.dataset.cursorLabel);
      if (t.closest("a, button, [role='button'], input, select, textarea, label")) return setMode("hover");
      setMode("default");
    };
    const down = () => ring.current?.classList.add("is-down");
    const up = () => ring.current?.classList.remove("is-down");
    const leave = () => root.classList.add("cursor-out");
    const enter = () => root.classList.remove("cursor-out");

    document.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    document.documentElement.addEventListener("mouseenter", enter);

    const off = onTick((_t, dt) => {
      if (!state.pointerActive) return;
      const k = 1 - Math.pow(1 - (env.reduced ? 1 : 0.2), dt / 16.67);
      const px = r.x;
      const py = r.y;
      r.x = lerp(r.x, state.mx, k);
      r.y = lerp(r.y, state.my, k);
      const vx = r.x - px;
      const vy = r.y - py;
      const speed = Math.min(Math.hypot(vx, vy), 40);
      const angle = (Math.atan2(vy, vx) * 180) / Math.PI;
      const stretch = 1 + speed / 90;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`;
        ring.current.style.setProperty(
          "--squash",
          `rotate(${angle.toFixed(1)}deg) scale(${stretch.toFixed(3)}, ${(1 / stretch).toFixed(3)}) rotate(${(-angle).toFixed(1)}deg)`,
        );
      }
      if (dot.current) dot.current.style.transform = `translate3d(${state.mx}px, ${state.my}px, 0)`;
      if (!env.reduced) {
        let lx = state.mx;
        let ly = state.my;
        for (let i = 0; i < TRAIL; i++) {
          tr[i].x = lerp(tr[i].x, lx, 0.42);
          tr[i].y = lerp(tr[i].y, ly, 0.42);
          lx = tr[i].x;
          ly = tr[i].y;
          const el = trail.current[i];
          if (el) el.style.transform = `translate3d(${tr[i].x}px, ${tr[i].y}px, 0)`;
        }
      }
    });

    return () => {
      off();
      cancel();
      root.classList.remove("has-cursor");
      document.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      {Array.from({ length: TRAIL }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            trail.current[i] = el;
          }}
          className="cursor__trail"
          style={{ opacity: 0.5 - i * 0.07 }}
        />
      ))}
      <div ref={ring} className="cursor__ring" data-mode="default">
        <div className="cursor__shape">
          <span ref={label} className="cursor__label" />
        </div>
      </div>
      <div ref={dot} className="cursor__dot" />
    </div>
  );
}
