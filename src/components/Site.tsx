"use client";

import { useEffect } from "react";
import { About } from "./About";
import { Background } from "./Background";
import { Artists } from "./Artists";
import { Events } from "./Events";
import { Cursor } from "./Cursor";
import { Extras } from "./Extras";
import { Follow } from "./Follow";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { HUD } from "./HUD";
import { Loader } from "./Loader";
import { Marquee } from "./Marquee";
import { Music } from "./Music";
import { Player } from "./Player";
import { Visuals } from "./Visuals";

/** Reveal-on-enter for every [data-reveal] (adds .is-in once). */
function useReveal() {
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
function useFit() {
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

export function Site() {
  useReveal();
  useFit();
  return (
    <>
      <Loader />
      <Background />
      <Cursor />
      <HUD />
      <main id="main">
        <Hero />
        <div className="bands" aria-hidden="true">
          <Marquee
            variant="solid"
            speed={70}
            followScroll
            items={["GRUVINK", "PODCAST", "KORA", "BARCELONA"]}
          />
          <Marquee
            variant="outline"
            speed={45}
            reverse
            followScroll
            sep="✕"
            items={["SPICY BOYS", "IZIAL", "DBØ", "AVRAXAS", "CHAMÓX", "NANDES"]}
          />
          <Marquee
            variant="tape"
            speed={120}
            sep="■"
            items={[
              "GROOVE",
              "INK",
              "AFTER DARK",
              "NO VIP",
              "PODCAST Nº26 OUT NOW",
              "GROOVE",
              "INK",
              "AFTER DARK",
              "NO VIP",
              "PODCAST Nº26 OUT NOW",
            ]}
          />
        </div>
        <Music />
        <Marquee
          className="mq--divider"
          variant="mono"
          speed={40}
          reverse
          sep="//"
          items={Array.from({ length: 4 }, () => ["GVK—SYS", "41.3874°N 2.1686°E", "SIGNAL OK", "ARTISTS INCOMING"]).flat()}
        />
        <Artists />
        <Events />
        <Visuals />
        <About />
        <Follow />
      </main>
      <Footer />
      <Player />
      <Extras />
    </>
  );
}
