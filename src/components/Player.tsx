"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as RKE,
  type MouseEvent as RME,
} from "react";
import { KIND_LABEL, widgetSrc, type MusicItem } from "@/data/music";
import { emit, mulberry, on } from "@/lib/engine";

/* Minimal typing for SoundCloud's official Widget API (w.soundcloud.com/player/api.js) */
type SCSound = { title?: string; user?: { username?: string }; permalink_url?: string; duration?: number };
type SCWidget = {
  bind: (ev: string, cb: (e?: { currentPosition: number; relativePosition: number }) => void) => void;
  unbind: (ev: string) => void;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  seekTo: (ms: number) => void;
  getDuration: (cb: (ms: number) => void) => void;
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

const fmt = (ms: number) => {
  if (!Number.isFinite(ms) || ms <= 0) return "00:00";
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

const BARS = 72;

/**
 * NOW PLAYING dock.
 * The official SoundCloud widget is always visible inside the dock (their player,
 * their attribution). Our controls talk to it through SoundCloud's Widget API, so
 * PLAY/PAUSE, time and seek are real. The waveform is a visual only — labelled so.
 * If the API can't load, our controls hide and the official player still works.
 */
export function Player() {
  const [item, setItem] = useState<MusicItem | null>(null);
  const [min, setMin] = useState(false);
  const [api, setApi] = useState<"idle" | "ready" | "failed">("idle");
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [rel, setRel] = useState(0);
  const [dur, setDur] = useState(0);
  const [sound, setSound] = useState<{ title: string; artist: string; url?: string } | null>(null);
  const iframe = useRef<HTMLIFrameElement>(null);
  const widget = useRef<SCWidget | null>(null);

  const current = useRef<MusicItem | null>(null);
  current.current = item;
  useEffect(
    () =>
      on("play", (p) => {
        const m = p as MusicItem;
        // same row again → toggle instead of reloading
        if (current.current?.id === m.id && widget.current) widget.current.toggle();
        else setItem(m);
        setMin(false);
      }),
    [],
  );

  // (re)bind the Widget API every time a new iframe mounts
  const bind = useCallback(() => {
    const el = iframe.current;
    if (!el) return;
    setApi("idle");
    setPlaying(false);
    setPos(0);
    setRel(0);
    setDur(0);
    setSound(null);
    loadWidgetApi()
      .then((SC) => {
        if (iframe.current !== el) return;
        const w = SC.Widget(el);
        widget.current = w;
        const E = SC.Widget.Events;
        const refresh = () => {
          w.getDuration((d) => setDur(d));
          w.getCurrentSound((s) =>
            setSound(
              s
                ? { title: s.title ?? "", artist: s.user?.username ?? "", url: s.permalink_url }
                : null,
            ),
          );
        };
        w.bind(E.READY, () => {
          setApi("ready");
          refresh();
        });
        w.bind(E.PLAY, () => {
          setPlaying(true);
          refresh();
        });
        w.bind(E.PAUSE, () => setPlaying(false));
        w.bind(E.FINISH, () => setPlaying(false));
        w.bind(E.PLAY_PROGRESS, (e) => {
          if (!e) return;
          setPos(e.currentPosition);
          setRel(e.relativePosition);
        });
      })
      .catch(() => setApi("failed"));
  }, []);

  // broadcast to HUD + track list
  useEffect(() => {
    emit("player", item ? { id: item.id, playing, title: sound?.title || item.title } : { playing: false, title: "" });
  }, [item, playing, sound]);

  // keyboard: K / space-less toggle when dock open
  useEffect(() => {
    if (!item) return;
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      if (e.key.toLowerCase() === "k" && widget.current) widget.current.toggle();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [item]);

  const bars = useMemo(() => {
    const seed = (sound?.title || item?.id || "sb").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const r = mulberry(seed);
    return Array.from({ length: BARS }, (_, i) => {
      const env = Math.sin((i / BARS) * Math.PI) * 0.5 + 0.5;
      return 0.18 + r() * 0.55 * env + (i % 8 === 0 ? 0.25 : 0);
    });
  }, [sound?.title, item?.id]);

  const seek = (e: RME<HTMLDivElement>) => {
    if (!widget.current || !dur) return;
    const r = e.currentTarget.getBoundingClientRect();
    widget.current.seekTo(((e.clientX - r.left) / r.width) * dur);
  };
  const seekKey = (e: RKE<HTMLDivElement>) => {
    if (!widget.current || !dur) return;
    if (e.key === "ArrowRight") widget.current.seekTo(Math.min(dur, pos + 10000));
    if (e.key === "ArrowLeft") widget.current.seekTo(Math.max(0, pos - 10000));
  };

  const close = () => {
    widget.current?.pause();
    widget.current = null;
    setItem(null);
    setPlaying(false);
  };

  const ready = api === "ready";

  return (
    <aside
      className={`player ${item ? "is-open" : ""} ${min ? "is-min" : ""}`}
      aria-label="Music player"
      aria-hidden={!item}
    >
      {item && (
        <div className="player__inner">
          <div className="player__hud">
            <div className="player__top mono">
              <span>SPICY BOYS</span>
              <span className={`player__state ${playing ? "is-on" : ""}`}>
                <i aria-hidden="true" /> {playing ? "NOW PLAYING" : ready ? "READY" : api === "failed" ? "OFFLINE" : "LINKING…"}
              </span>
              <span className="player__btns">
                <button onClick={() => setMin((v) => !v)} aria-label={min ? "Expand player" : "Minimise player"}>
                  {min ? "▢" : "—"}
                </button>
                <button onClick={close} aria-label="Close player">
                  ✕
                </button>
              </span>
            </div>

            <div className="player__rule" aria-hidden="true" />

            <div className="player__title">
              <span className="mono player__src">
                {KIND_LABEL[item.kind]} · {item.title}
              </span>
              <strong>{sound?.title || item.title}</strong>
              {sound?.artist && <span className="mono player__by">BY {sound.artist.toUpperCase()}</span>}
            </div>

            {ready && (
              <>
                <div className="player__time mono">
                  <span>{fmt(pos)}</span>
                  <span className="player__line" aria-hidden="true">
                    <span style={{ transform: `scaleX(${rel})` }} />
                  </span>
                  <span>{fmt(dur)}</span>
                </div>
                <div
                  className={`wave ${playing ? "is-on" : ""}`}
                  role="slider"
                  tabIndex={0}
                  aria-label="Seek (arrow keys ±10s)"
                  aria-valuemin={0}
                  aria-valuemax={Math.round(dur / 1000)}
                  aria-valuenow={Math.round(pos / 1000)}
                  onClick={seek}
                  onKeyDown={seekKey}
                  data-cursor="hover"
                >
                  {bars.map((h, i) => (
                    <i
                      key={i}
                      className={i / BARS <= rel ? "is-past" : ""}
                      style={{ "--h": h, "--d": `${(i % 9) * 70}ms` } as CSSProperties}
                    />
                  ))}
                  <span className="wave__tag mono">WAVE / VISUAL</span>
                </div>
                <div className="player__ctrl mono">
                  <button onClick={() => widget.current?.prev()} aria-label="Previous track">
                    ◀◀
                  </button>
                  <button className="player__play" onClick={() => widget.current?.toggle()} data-cursor="play" data-cursor-label={playing ? "PAUSE" : "PLAY"}>
                    {playing ? "PAUSE" : "PLAY"}
                  </button>
                  <button onClick={() => widget.current?.next()} aria-label="Next track">
                    ▶▶
                  </button>
                  <a href={sound?.url || item.url} target="_blank" rel="noopener noreferrer" data-cursor="open">
                    SOUNDCLOUD ↗
                  </a>
                </div>
              </>
            )}
            {api === "failed" && (
              <p className="player__fail mono">
                Custom controls unavailable here — use the SoundCloud player or{" "}
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  open it on SoundCloud ↗
                </a>
              </p>
            )}
          </div>

          <div
            className="player__embed"
            onPointerEnter={() => document.documentElement.classList.add("cursor-out")}
            onPointerLeave={() => document.documentElement.classList.remove("cursor-out")}
          >
            <iframe
              key={item.id}
              ref={iframe}
              title={`SoundCloud player — ${item.title}`}
              src={widgetSrc(item.url!)}
              allow="autoplay; encrypted-media"
              loading="eager"
              onLoad={bind}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
