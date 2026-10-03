/**
 * SB ENGINE
 * One requestAnimationFrame loop for the whole site.
 * Every animated component subscribes here instead of running its own rAF,
 * so there is exactly one frame callback, one scroll read and one pointer read.
 *
 * Also contains a tiny smooth-scroll (wheel easing) that stays in sync with
 * native scrolling (keyboard, scrollbar, anchors, touch). No dependency needed.
 */

export type Tick = (time: number, dt: number) => void;

export const env = {
  reduced: false,
  touch: false,
  small: false,
};

export const state = {
  /** real scroll position */
  scroll: 0,
  /** smoothed velocity in px/frame (signed) */
  velocity: 0,
  /** scroll direction 1 / -1 */
  dir: 1,
  vw: 1440,
  vh: 900,
  /** pointer in px + normalised -1..1 */
  mx: 0,
  my: 0,
  nx: 0,
  ny: 0,
  /** smoothed pointer */
  sx: 0,
  sy: 0,
  pointerActive: false,
  /** 0..1 page progress */
  progress: 0,
  beat: 0,
};

const subs = new Set<Tick>();
let raf = 0;
let last = 0;
let prevScroll = 0;
let started = false;

// ── smooth scroll state
let smoothOn = false;
let target = 0;
let current = 0;
let selfScrolling = false;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export { clamp };

function maxScroll() {
  return document.documentElement.scrollHeight - window.innerHeight;
}

function frame(time: number) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(64, time - (last || time));
  last = time;

  if (smoothOn && Math.abs(target - current) > 0.4) {
    current = lerp(current, target, 1 - Math.pow(1 - 0.12, dt / 16.67));
    selfScrolling = true;
    window.scrollTo(0, current);
  }

  const y = window.scrollY;
  state.scroll = y;
  const raw = y - prevScroll;
  prevScroll = y;
  state.velocity = lerp(state.velocity, raw, 0.18);
  if (Math.abs(raw) > 0.5) state.dir = raw > 0 ? 1 : -1;
  const ms = maxScroll();
  state.progress = ms > 0 ? clamp(y / ms, 0, 1) : 0;

  state.sx = lerp(state.sx, state.mx, 0.12);
  state.sy = lerp(state.sy, state.my, 0.12);

  subs.forEach((fn) => fn(time, dt));
}

function onResize() {
  state.vw = window.innerWidth;
  state.vh = window.innerHeight;
  env.small = state.vw < 768;
  target = clamp(target, 0, maxScroll());
}

function onPointer(e: PointerEvent) {
  state.mx = e.clientX;
  state.my = e.clientY;
  state.nx = (e.clientX / state.vw) * 2 - 1;
  state.ny = (e.clientY / state.vh) * 2 - 1;
  if (!state.pointerActive) {
    state.pointerActive = true;
    state.sx = state.mx;
    state.sy = state.my;
  }
}

function onWheel(e: WheelEvent) {
  if (e.ctrlKey || e.defaultPrevented) return;
  const t = e.target as Element | null;
  if (t && t.closest && t.closest("[data-native-scroll]")) return;
  if (document.documentElement.classList.contains("is-locked")) return;
  e.preventDefault();
  const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1;
  target = clamp(target + e.deltaY * unit, 0, maxScroll());
}

function onNativeScroll() {
  // If the page moved somewhere we didn't send it (keyboard, scrollbar,
  // find-in-page, anchor, focus) → resync the smooth engine to it.
  const y = window.scrollY;
  if (!selfScrolling || Math.abs(y - current) > 3) current = target = y;
  selfScrolling = false;
}

/** Programmatic scroll that respects the smooth engine. */
export function scrollToY(y: number) {
  const dest = clamp(y, 0, maxScroll());
  if (smoothOn) {
    target = dest;
  } else {
    window.scrollTo({ top: dest, behavior: env.reduced ? "auto" : "smooth" });
  }
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  scrollToY(el.getBoundingClientRect().top + window.scrollY);
}

export function initEngine() {
  if (started || typeof window === "undefined") return;
  started = true;
  env.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  env.touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  onResize();
  prevScroll = current = target = window.scrollY;

  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("scroll", onNativeScroll, { passive: true });

  // Smooth wheel only on real mice / trackpads, never with reduced motion.
  if (!env.reduced && !env.touch) {
    smoothOn = true;
    document.documentElement.classList.add("has-smooth");
    window.addEventListener("wheel", onWheel, { passive: false });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  });

  raf = requestAnimationFrame(frame);
}

export function onTick(fn: Tick) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

/** Section progress: 0 when the element's top hits the viewport bottom, 1 when its bottom leaves the top. */
export function progressOf(el: Element) {
  const r = el.getBoundingClientRect();
  const total = r.height + state.vh;
  return clamp((state.vh - r.top) / total, 0, 1);
}

/** Tiny event bus for cross-component signals (rave mode, player, cursor). */
type Handler = (payload?: unknown) => void;
const bus = new Map<string, Set<Handler>>();
export function on(evt: string, fn: Handler) {
  if (!bus.has(evt)) bus.set(evt, new Set());
  bus.get(evt)!.add(fn);
  return () => {
    bus.get(evt)?.delete(fn);
  };
}
export function emit(evt: string, payload?: unknown) {
  bus.get(evt)?.forEach((fn) => fn(payload));
}

/** Deterministic PRNG so SSR and client render the same "random" details. */
export function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GLYPHS = "▓▒░█/\\<>_-=+*#01";
/** Scramble text into place. Returns a cancel function. */
export function scramble(el: HTMLElement, finalText: string, duration = 420) {
  if (env.reduced) {
    el.textContent = finalText;
    return () => {};
  }
  const start = performance.now();
  let id = 0;
  const run = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const reveal = Math.floor(p * finalText.length);
    let out = "";
    for (let i = 0; i < finalText.length; i++) {
      const c = finalText[i];
      if (i < reveal || c === " ") out += c;
      else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (p < 1) id = requestAnimationFrame(run);
  };
  id = requestAnimationFrame(run);
  return () => cancelAnimationFrame(id);
}

// Boot as soon as the module is evaluated in the browser, so every component's
// effect already sees correct `env` values (child effects run before parents').
if (typeof window !== "undefined") initEngine();
