"use client";

import { useEffect, useRef, useState } from "react";
import { NAV, SITE } from "@/data/site";
import { emit, env, on, scrollToId } from "@/lib/engine";

const RAVE_MS = Math.round((60000 / SITE.bpm) * 32); // 8 bars at 150 BPM

/**
 * Hidden layer:
 *  - type R·A·V·E → 8 bars of rave mode (150 BPM pulse, faster marquees, laser rain)
 *  - G → design grid overlay
 *  - 1–5 → jump to sections
 *  - ? → the booth answers
 *  - toast messages + a console signature for the curious
 * Rave mode's flash is low-contrast and < 3 Hz; disabled with reduced motion.
 */
export function Extras() {
  const [toast, setToast] = useState<string | null>(null);
  const [grid, setGrid] = useState(false);
  const buf = useRef("");
  const raveTimer = useRef(0);
  const toastTimer = useRef(0);

  useEffect(() => {
    const show = (m: unknown) => {
      setToast(String(m));
      window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 2800);
    };
    const offToast = on("toast", show);

    const startRave = () => {
      const root = document.documentElement;
      root.classList.add("is-rave");
      root.style.setProperty("--beat", `${60000 / SITE.bpm}ms`);
      emit("rave", true);
      show(env.reduced ? "RAVE MODE · MOTION REDUCED" : `RAVE MODE · ${SITE.bpm} BPM · 8 BARS`);
      window.clearTimeout(raveTimer.current);
      raveTimer.current = window.setTimeout(() => {
        root.classList.remove("is-rave");
        emit("rave", false);
      }, RAVE_MS);
    };

    const answers = [
      "THE BOOTH SAYS: LOUDER.",
      "THE BOOTH SAYS: ONE MORE.",
      "THE BOOTH SAYS: NO REQUESTS.",
      "THE BOOTH SAYS: HYDRATE.",
    ];

    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable)) return;
      const k = e.key.toLowerCase();
      buf.current = (buf.current + k).slice(-4);
      if (buf.current === "rave") return startRave();
      if (k === "g") setGrid((g) => !g);
      if (k === "?") show(answers[(Math.random() * answers.length) | 0]);
      const n = Number(k);
      if (n >= 1 && n <= NAV.length) {
        const item = NAV[n - 1];
        if (document.getElementById(item.id) && !item.page) scrollToId(item.id);
        else window.location.href = item.page ?? `/#${item.id}`;
      }
    };
    window.addEventListener("keydown", key);

    console.log(
      "%c GRUVINK %c GVK—SYS v3.0 · BCN · type R-A-V-E on the page ",
      "background:#bff851;color:#482581;font-weight:900;padding:4px 6px",
      "background:#050505;color:#ece8e1;padding:4px 6px",
    );

    return () => {
      offToast();
      window.removeEventListener("keydown", key);
    };
  }, []);

  return (
    <>
      <div className={`gridlay ${grid ? "is-on" : ""}`} aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <div className="rave-flash" aria-hidden="true" />
      <div className={`toast mono ${toast ? "is-on" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}
