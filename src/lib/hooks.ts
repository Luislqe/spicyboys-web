"use client";

import { useEffect, useRef, type RefObject } from "react";
import { env, onTick, rectOf, state, type Tick } from "./engine";

/** Subscribe to the shared frame loop. `fn` is kept fresh via a ref. */
export function useTick(fn: Tick, enabled = true) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    if (!enabled) return;
    return onTick((t, dt) => saved.current(t, dt));
  }, [enabled]);
}

/** True while the element is (roughly) on screen — used to pause work off-screen. */
export function useVisibility(ref: RefObject<Element | null>, margin = "20% 0px") {
  const visible = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting;
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return visible;
}

/** Magnetic pull toward the pointer. Pointer devices only. */
export function useMagnetic<T extends HTMLElement>(ref: RefObject<T | null>, strength = 0.35, radius = 90) {
  const pos = useRef({ x: 0, y: 0 });
  useTick(() => {
    const el = ref.current;
    if (!el || env.touch || env.reduced) return;
    // cached, untransformed position (no forced layout per frame)
    const r = rectOf(el.parentElement ?? el);
    if (r.bottom < -radius || r.top > state.vh + radius) return;
    const own = rectOf(el);
    const cx = own.left + own.width / 2;
    const cy = own.top + own.height / 2;
    const dx = state.mx - cx;
    const dy = state.my - cy;
    const inside =
      Math.abs(dx) < own.width / 2 + radius && Math.abs(dy) < own.height / 2 + radius && state.pointerActive;
    const tx = inside ? dx * strength : 0;
    const ty = inside ? dy * strength : 0;
    pos.current.x += (tx - pos.current.x) * 0.16;
    pos.current.y += (ty - pos.current.y) * 0.16;
    if (Math.abs(pos.current.x) < 0.05 && Math.abs(pos.current.y) < 0.05 && !inside) {
      if (el.style.transform) el.style.transform = "";
      return;
    }
    el.style.transform = `translate3d(${pos.current.x.toFixed(2)}px, ${pos.current.y.toFixed(2)}px, 0)`;
  });
}
