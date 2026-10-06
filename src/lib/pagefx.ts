"use client";

import { useEffect } from "react";
import { invalidateRects } from "./engine";

/** Reveal-on-enter for every [data-reveal] (adds .is-in once). */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/**
 * Fit-to-width typography: every [data-fit] gets the largest font-size at which its
 * `.fit-in` child fits on one line (capped by data-fit-max, in vw).
 * Elements sharing a data-fit value get one common size. Survives any font fallback.
 */
export function useFit() {
  useEffect(() => {
    let raf = 0;
    const run = () => {
      const groups = new Map<string, HTMLElement[]>();
      document.querySelectorAll<HTMLElement>("[data-fit]").forEach((el, i) => {
        const k = el.dataset.fit || `solo-${i}`;
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k)!.push(el);
      });
      const vw = window.innerWidth;
      groups.forEach((els) => {
        let size = Infinity;
        els.forEach((el) => {
          el.style.fontSize = "100px";
          const inner = (el.querySelector(".fit-in") as HTMLElement) || el;
          const k = Number(el.dataset.fitK || 0.98);
          const max = (Number(el.dataset.fitMax || 30) * vw) / 100;
          const w = inner.offsetWidth || 1;
          size = Math.min(size, max, (100 * el.clientWidth * k) / w);
        });
        els.forEach((el) => (el.style.fontSize = `${Math.max(24, size).toFixed(2)}px`));
      });
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(run);
    };
    run();
    document.fonts?.ready.then(schedule).catch(() => {});
    window.addEventListener("resize", schedule);
    return () => window.removeEventListener("resize", schedule);
  }, []);
}


/** Everything a page needs once mounted: reveals, fitted titles, fresh layout cache. */
export function usePageFx() {
  useReveal();
  useFit();
  useEffect(() => {
    // arriving with #anchor (e.g. /#sounds or /eventos#kora-001) → go there, else top
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (target) window.setTimeout(() => target.scrollIntoView({ block: "start" }), 50);
    else window.scrollTo(0, 0);
    invalidateRects();
    const t = window.setTimeout(invalidateRects, 600);
    return () => window.clearTimeout(t);
  }, []);
}
