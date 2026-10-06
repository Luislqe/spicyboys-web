"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SESSIONS, todayIndex, widgetSrc, type MusicItem } from "@/data/music";
import { SITE } from "@/data/site";
import { emit, on } from "@/lib/engine";

/* Minimal typing for SoundCloud's official Widget API (w.soundcloud.com/player/api.js) */
type SCSound = { title?: string; user?: { username?: string }; permalink_url?: string };
type SCWidget = {
  bind: (ev: string, cb: (e?: { currentPosition: number; relativePosition: number }) => void) => void;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  load: (url: string, opts: Record<string, unknown>) => void;
  getCurrentSound: (cb: (s: SCSound | null) => void) => void;
};
type SCGlobal = {
  Widget: ((el: HTMLIFrameElement) => SCWidget) & {
    Events: Record<"READY" | "PLAY" | "PAUSE" | "FINISH" | "PLAY_PROGRESS" | "ERROR", string>;
  };
};
declare global {
  interface Window {
    SC?: SCGlobal;
  }
}

let apiPromise: Promise<SCGlobal> | null = null;
function loadWidgetApi(): Promise<SCGlobal> {
  if (window.SC?.Widget) return Promise.resolve(window.SC);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<SCGlobal>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://w.soundcloud.com/player/api.js";
    s.async = true;
    const timer = window.setTimeout(() => reject(new Error("timeout")), 8000);
    s.onload = () => {
      window.clearTimeout(timer);
      if (window.SC?.Widget) resolve(window.SC);
      else reject(new Error("no SC"));
    };
    s.onerror = () => {
      window.clearTimeout(timer);
      apiPromise = null;
      reject(new Error("blocked"));
    };
    document.head.appendChild(s);
  });
  return apiPromise;
}

const WIDGET_OPTS = {
  auto_play: true,
  hide_related: true,
  show_comments: false,
  show_user: true,
  show_reposts: false,
  show_teaser: false,
  visual: false,
  color: "#bff851",
};

/**
 * RADIO GRUVINK — a mini MP3-style player: ◀◀  ▶/❚❚  ▶▶
 * Plays the collective's own SoundCloud sessions through the OFFICIAL SoundCloud
 * mini player (20px, always visible = their attribution). Starts on today's
 * session and runs continuously: when a session ends, the next one loads.
 * Clicking any row in SOUNDS / EVENTOS jumps the radio to that session.
 */
export function Player() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(-1);
  const [single, setSingle] = useState<MusicItem | null>(null); // item outside SESSIONS
  const [playing, setPlaying] = useState(false);
  const [rel, setRel] = useState(0);
  const [failed, setFailed] = useState(false);
  const [firstUrl, setFirstUrl] = useState<string | null>(null);
  const iframe = useRef<HTMLIFrameElement>(null);
  const widget = useRef<SCWidget | null>(null);
  const idxRef = useRef(-1);
  idxRef.current = index;

  const current: MusicItem | null = single ?? (index >= 0 ? SESSIONS[index] : null);

  // load an item: first time → create the iframe; afterwards → widget.load (keeps the same player)
  const loadItem = useCallback((item: MusicItem) => {
    if (!item.url) return;
    setRel(0);
    if (widget.current) {
      widget.current.load(item.url, WIDGET_OPTS);
    } else {
      setFirstUrl(item.url);
    }
    setStarted(true);
  }, []);

  const go = useCallback(
    (i: number) => {
      if (!SESSIONS.length) return;
      const n = ((i % SESSIONS.length) + SESSIONS.length) % SESSIONS.length;
      setSingle(null);
      setIndex(n);
      loadItem(SESSIONS[n]);
    },
    [loadItem],
  );

  const next = useCallback(() => go((idxRef.current < 0 ? todayIndex() : idxRef.current) + 1), [go]);
  const prev = useCallback(() => go((idxRef.current < 0 ? todayIndex() : idxRef.current) - 1), [go]);

  const toggle = () => {
    if (!started) return go(todayIndex());
    widget.current?.toggle();
  };

  // events from the rest of the page
  useEffect(() => {
    const offs = [
      on("radio-start", () => go(todayIndex())),
      on("play", (p) => {
        const m = p as MusicItem;
        const i = SESSIONS.findIndex((s) => s.id === m.id || (!!m.url && s.url === m.url));
        if (i === idxRef.current && widget.current && !single) return widget.current.toggle();
        if (i >= 0) go(i);
        else {
          setSingle(m);
          loadItem(m);
        }
      }),
    ];
    return () => offs.forEach((o) => o());
  }, [go, loadItem, single]);

  // bind the Widget API once, when the iframe first loads
  const bind = useCallback(() => {
    const el = iframe.current;
    if (!el || widget.current) return;
    loadWidgetApi()
      .then((SC) => {
        const w = SC.Widget(el);
        widget.current = w;
        const E = SC.Widget.Events;
        w.bind(E.PLAY, () => setPlaying(true));
        w.bind(E.PAUSE, () => setPlaying(false));
        w.bind(E.PLAY_PROGRESS, (e) => e && setRel(e.relativePosition));
        // continuous sessions: when one ends, the next one starts
        w.bind(E.FINISH, () => {
          setPlaying(false);
          next();
        });
      })
      .catch(() => setFailed(true));
  }, [next]);

  // broadcast for the HUD / track list
  useEffect(() => {
    emit(
      "player",
      current
        ? { id: current.id, playing, title: `${current.title}${current.artist ? ` / ${current.artist}` : ""}` }
        : { playing: false, title: "" },
    );
  }, [current, playing]);

  // keyboard: K = play/pause, J / L = previous / next
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === "k") toggle();
      if (k === "l" && started) next();
      if (k === "j" && started) prev();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  return (
    <aside className={`radio ${started ? "is-on" : ""} ${playing ? "is-playing" : ""}`} aria-label="Radio GRUVINK">
      <div className="radio__bar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="radio__icon" src={SITE.icon} alt="" aria-hidden="true" />
        <div className="radio__info mono">
          <span className="radio__label">{started ? (playing ? "SONANDO" : "EN PAUSA") : "RADIO GRUVINK"}</span>
          <span className="radio__title">
            {current ? `${current.title}${current.artist ? ` / ${current.artist}` : ""}` : "SESIONES · PODCAST · KORA"}
          </span>
        </div>
        <div className="radio__ctrl">
          <button onClick={prev} aria-label="Sesión anterior" data-cursor="hover" disabled={!started}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 5h2v14H6zM20 5v14L9 12z" />
            </svg>
          </button>
          <button className="radio__play" onClick={toggle} aria-label={playing ? "Pausa" : "Play"} data-cursor="hover">
            {playing ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 4v16l13-8z" />
              </svg>
            )}
          </button>
          <button onClick={next} aria-label="Siguiente sesión" data-cursor="hover" disabled={!started}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
            </svg>
          </button>
        </div>
        <span className="radio__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${rel})` }} />
        </span>
      </div>

      {firstUrl && (
        <div
          className="radio__embed"
          onPointerEnter={() => document.documentElement.classList.add("cursor-out")}
          onPointerLeave={() => document.documentElement.classList.remove("cursor-out")}
        >
          <iframe
            ref={iframe}
            title="SoundCloud — Radio GRUVINK"
            src={widgetSrc(firstUrl)}
            allow="autoplay; encrypted-media"
            height={20}
            onLoad={bind}
          />
        </div>
      )}
      {failed && current?.url && (
        <a className="radio__fail mono" href={current.url} target="_blank" rel="noopener noreferrer">
          ABRIR EN SOUNDCLOUD ↗
        </a>
      )}
    </aside>
  );
}
