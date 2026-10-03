"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as RME } from "react";
import { NAV, SITE } from "@/data/site";
import { emit, on, onTick, scramble, scrollToId, state } from "@/lib/engine";

type SectionInfo = { id?: string; label?: string; idx?: string };

export function HUD() {
  const [clock, setClock] = useState("--:--:--");
  const [menu, setMenu] = useState(false);
  const [rave, setRave] = useState(false);
  const [now, setNow] = useState<{ playing: boolean; title: string } | null>(null);
  const secLabel = useRef<HTMLSpanElement>(null);
  const secIdx = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const taps = useRef<number[]>([]);

  // Barcelona local time
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tickClock = () => setClock(fmt.format(new Date()));
    tickClock();
    const id = window.setInterval(tickClock, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const offs = [
      on("section", (p) => {
        const s = p as SectionInfo;
        if (secLabel.current && s.label) scramble(secLabel.current, s.label, 300);
        if (secIdx.current && s.idx) secIdx.current.textContent = s.idx;
      }),
      on("rave", (v) => setRave(!!v)),
      on("player", (p) => setNow(p as { playing: boolean; title: string })),
      on("menu", (v) => setMenu(!!v)),
    ];
    let lastPct = -1;
    const offTick = onTick(() => {
      const p = state.progress;
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
      const n = Math.round(p * 100);
      if (n !== lastPct && pct.current) {
        pct.current.textContent = String(n).padStart(3, "0");
        lastPct = n;
      }
    });
    return () => {
      offs.forEach((o) => o());
      offTick();
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("is-locked-menu", menu);
    if (!menu) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [menu]);

  const go = (id: string) => (e: RME) => {
    e.preventDefault();
    setMenu(false);
    scrollToId(id);
    history.replaceState(null, "", `#${id}`);
  };

  // hidden detail: tap the logo 3× quickly
  const logoTap = (e: RME) => {
    e.preventDefault();
    const t = performance.now();
    taps.current = [...taps.current.filter((x) => t - x < 700), t];
    if (taps.current.length >= 3) {
      taps.current = [];
      emit("toast", "SB—SYS v2.6 · BUILT IN CASTELLDEFELS · TYPE “RAVE”");
    } else scrollToId("top");
  };

  return (
    <>
      <a className="skip mono" href="#sounds">
        Skip to music
      </a>
      <header className="hud">
        <a href="#top" className="hud__logo" onClick={logoTap} aria-label="SPICY BOYS — back to top">
          <span className="hud__logo-mark">SB</span>
          <span className="hud__logo-sys mono">—SYS</span>
        </a>
        <nav className="hud__nav mono" aria-label="Sections">
          {NAV.map((n, i) => (
            <a key={n.id} href={`#${n.id}`} onClick={go(n.id)} className="hud__link">
              <span className="hud__key">{i + 1}</span>
              <span className="hud__link-text">{n.label}</span>
            </a>
          ))}
        </nav>
        <div className="hud__right mono">
          <span className="hud__clock" suppressHydrationWarning>
            BCN {clock}
          </span>
          <span className={`hud__bpm ${rave ? "is-rave" : ""}`} style={{ "--bpm": SITE.bpm } as CSSProperties}>
            <i aria-hidden="true" /> {rave ? "RAVE MODE" : `${SITE.bpm} BPM`}
          </span>
          <button
            className="hud__menu-btn"
            aria-expanded={menu}
            aria-controls="menu"
            onClick={() => setMenu((m) => !m)}
          >
            <span>{menu ? "CLOSE" : "MENU"}</span>
            <i aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="hud__corner hud__corner--bl mono" aria-hidden="true">
        <span ref={secIdx}>00</span>
        <span className="hud__sep">/</span>
        <span ref={secLabel}>SIGNAL</span>
      </div>
      <div className="hud__corner hud__corner--br mono" aria-hidden="true">
        {now?.title ? (
          <span className={`hud__now ${now.playing ? "is-playing" : ""}`}>
            <i />
            <i />
            <i />
            <em>{now.playing ? "NOW PLAYING" : "PAUSED"}</em> {now.title}
          </span>
        ) : (
          <span className="hud__coords">
            {SITE.coords.castelldefels.lat} {SITE.coords.castelldefels.lon}
          </span>
        )}
        <span className="hud__progress">
          <span ref={bar} className="hud__progress-bar" />
        </span>
        <span ref={pct}>000</span>
      </div>

      <div id="menu" className={`menu ${menu ? "is-open" : ""}`} aria-hidden={!menu}>
        <div className="menu__inner">
          <p className="menu__meta mono">
            SB—SYS / INDEX · {SITE.city} / {SITE.region}
          </p>
          <ul className="menu__list">
            {NAV.map((n, i) => (
              <li key={n.id} style={{ "--i": i } as CSSProperties}>
                <a href={`#${n.id}`} onClick={go(n.id)} tabIndex={menu ? 0 : -1}>
                  <span className="mono">{n.idx}</span>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="menu__foot mono">
            <a href={SITE.links.instagram} target="_blank" rel="noopener noreferrer" tabIndex={menu ? 0 : -1}>
              INSTAGRAM ↗
            </a>
            <a href={SITE.links.soundcloud} target="_blank" rel="noopener noreferrer" tabIndex={menu ? 0 : -1}>
              SOUNDCLOUD ↗
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
