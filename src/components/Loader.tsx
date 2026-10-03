"use client";

import { useEffect, useRef, useState } from "react";
import { emit } from "@/lib/engine";

const BLOCKS = 16;
const LOG = ["CASTELLDEFELS NODE", "BCN UPLINK", "SUB 42HZ", "STROBE ARRAY"];

/**
 * Boot screen. ~0.9s on first visit, ~0.25s on repeat visits this session,
 * skipped with reduced motion. Never waits on anything but fonts (max 1.4s).
 */
export function Loader() {
  const [phase, setPhase] = useState<"run" | "out" | "gone">("run");
  const bar = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const log = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("sb-boot") === "1";
      sessionStorage.setItem("sb-boot", "1");
    } catch {}
    const dur = reduced ? 0 : seen ? 260 : 900;
    let fontsReady = false;
    (document.fonts?.ready ?? Promise.resolve()).then(() => (fontsReady = true));

    root.classList.add("is-locked");
    const t0 = performance.now();
    let raf = 0;
    let lastBlocks = -1;

    const finish = () => {
      root.classList.remove("is-locked");
      root.classList.add("is-booted");
      emit("boot");
      setPhase("out");
      window.setTimeout(() => setPhase("gone"), reduced ? 0 : 520);
    };

    if (dur === 0) {
      finish();
      return;
    }

    const step = (now: number) => {
      const el = now - t0;
      let p = Math.min(1, el / dur);
      // hold at 92% for fonts, but never longer than 1.4s total
      if (p > 0.92 && !fontsReady && el < 1400) p = 0.92;
      const eased = 1 - Math.pow(1 - p, 3);
      const n = Math.round(eased * BLOCKS);
      if (n !== lastBlocks && bar.current) {
        bar.current.textContent = "█".repeat(n) + "░".repeat(BLOCKS - n);
        lastBlocks = n;
        const items = log.current?.children;
        if (items) for (let i = 0; i < items.length; i++) items[i].classList.toggle("ok", eased > (i + 1) / (items.length + 1));
      }
      if (pct.current) pct.current.textContent = String(Math.round(eased * 100)).padStart(3, "0") + "%";
      if (p < 1) raf = requestAnimationFrame(step);
      else finish();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (phase === "gone") return null;

  return (
    <div className={`loader ${phase === "out" ? "is-out" : ""}`} aria-hidden="true">
      <div className="loader__grid">
        <div className="loader__top mono">
          <span>SB—SYS / BOOT SEQUENCE</span>
          <span>v2.6</span>
        </div>
        <div className="loader__name">
          <span>SPICY</span>
          <span>BOYS</span>
        </div>
        <div className="loader__side mono">
          <span className="loader__idx">01</span>
          <span>LOADING SYSTEM</span>
          <ol ref={log} className="loader__log">
            {LOG.map((l) => (
              <li key={l}>
                <span>&gt; {l}</span>
                <b>OK</b>
              </li>
            ))}
          </ol>
        </div>
        <div className="loader__bar mono">
          <span ref={bar}>{"░".repeat(BLOCKS)}</span>
          <span ref={pct} className="loader__pct">
            000%
          </span>
        </div>
      </div>
    </div>
  );
}
