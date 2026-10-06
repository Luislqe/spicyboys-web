"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { VISUALS, type Visual } from "@/data/visuals";
import { env, lerp, onTick, progressOf, rectOf, state } from "@/lib/engine";
import { Art } from "./Art";
import { SectionHead } from "./SectionHead";
import { Split } from "./Split";

/** Muted looping clip that only plays while on screen (saves battery + bandwidth). */
function LoopVideo({ v }: { v: Visual }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !reduced) {
          if (el.preload === "none") el.preload = "auto";
          el.play().catch(() => {});
        } else el.pause();
      },
      { rootMargin: "15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={v.video}
      poster={v.poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={v.alt}
    />
  );
}

/** Full-screen viewer for clips (with sound) and photos. */
function Lightbox({ v, onClose }: { v: Visual | null; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!v) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    document.documentElement.classList.add("is-locked");
    box.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      window.removeEventListener("keydown", key);
      document.documentElement.classList.remove("is-locked");
    };
  }, [v, onClose]);
  return (
    <div
      ref={box}
      className={`lightbox ${v ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={v ? v.alt : undefined}
      aria-hidden={!v}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {v && (
        <>
          <div className="lightbox__bar mono">
            <span>
              {v.code} — {v.caption}
            </span>
            <button onClick={onClose} data-cursor="hover">
              CLOSE ✕
            </button>
          </div>
          <div className="lightbox__media">
            {v.video ? (
              <video src={v.video} poster={v.poster} controls autoPlay playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.src} alt={v.alt} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Height of the desktop composition, in % of its width.
const H = Math.max(...VISUALS.map((v) => v.y + v.w / v.ratio)) + 4;

/**
 * VISUALS — editorial, overlapping composition.
 * Frames sit at different depths (scroll parallax), tilt toward the pointer,
 * open through a clip-path mask and warp through an SVG displacement filter on hover.
 * Mobile: a swipeable strip.
 */
export function Visuals() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const [open, setOpen] = useState<Visual | null>(null);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const sec = section.current;
    const st = stage.current;
    if (!sec || !st) return;
    const frames = Array.from(st.querySelectorAll<HTMLElement>(".frame"));
    const tilt = frames.map(() => ({ x: 0, y: 0 }));
    let hovered = -1;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(sec);

    // displacement pulse on hover
    let pulse = 0;
    const enter = (i: number) => () => {
      hovered = i;
      pulse = 1;
    };
    const leave = () => (hovered = -1);
    const handlers = frames.map((f, i) => {
      const h = enter(i);
      f.addEventListener("pointerenter", h);
      f.addEventListener("pointerleave", leave);
      return h;
    });

    const off = onTick(() => {
      if (!visible) return;
      pulse = lerp(pulse, 0, 0.06);
      if (disp.current) disp.current.setAttribute("scale", (pulse * 34 + (hovered >= 0 ? 4 : 0)).toFixed(2));
      if (env.small || env.reduced) return;
      const p = progressOf(sec) - 0.5;
      frames.forEach((f, i) => {
        const depth = Number(f.dataset.depth || 0);
        const ty = p * depth * state.vh * 1.6;
        const tx = state.nx * depth * -40;
        let rx = 0;
        let ry = 0;
        if (i === hovered) {
          const r = rectOf(f.parentElement as Element);
          const fx = r.left + (f.offsetLeft || 0);
          const fy = r.top + (f.offsetTop || 0);
          const fr = { left: fx, top: fy, width: f.offsetWidth || 1, height: f.offsetHeight || 1 };
          rx = ((state.my - fr.top) / fr.height - 0.5) * -8;
          ry = ((state.mx - fr.left) / fr.width - 0.5) * 10;
        }
        tilt[i].x = lerp(tilt[i].x, rx, 0.1);
        tilt[i].y = lerp(tilt[i].y, ry, 0.1);
        f.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) perspective(900px) rotateX(${tilt[i].x.toFixed(2)}deg) rotateY(${tilt[i].y.toFixed(2)}deg)`;
      });
    });

    return () => {
      off();
      io.disconnect();
      frames.forEach((f, i) => {
        f.removeEventListener("pointerenter", handlers[i]);
        f.removeEventListener("pointerleave", leave);
      });
    };
  }, []);

  return (
    <section
      ref={section}
      id="visuals"
      className="visuals"
      data-section="visuals"
      data-label="VISUALS"
      data-idx="04"
      aria-labelledby="visuals-title"
    >
      <svg className="sr-only" aria-hidden="true" focusable="false">
        <filter id="sb-displace" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="1" seed="7" result="n" />
          <feDisplacementMap ref={disp} in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <SectionHead idx="04" label="VISUALS" note={`FRAMES ${String(VISUALS.length).padStart(2, "0")}`} />

      <div className="visuals__head">
        <h2 id="visuals-title" className="visuals__title" data-reveal data-fit data-fit-max="17">
          <Split text="VISUALS" className="fit-in" />
        </h2>
        <p className="visuals__lede mono" data-reveal>
          Nights, flyers and clips from the GRUVINK archive. Hover a frame to break the signal.
        </p>
      </div>

      <div
        ref={stage}
        className="visuals__stage"
        style={{ "--h": H } as CSSProperties}
      >
        {VISUALS.map((v, i) => (
          <figure
            key={v.id}
            className="frame"
            data-reveal
            data-cursor={v.video ? "play" : "view"}
            data-cursor-label={v.video ? "WATCH" : undefined}
            tabIndex={v.video || v.src ? 0 : undefined}
            role={v.video || v.src ? "button" : undefined}
            aria-label={v.video ? `Play video: ${v.caption}` : v.src ? `Open photo: ${v.caption}` : undefined}
            onClick={() => (v.video || v.src) && setOpen(v)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (v.video || v.src) && (e.preventDefault(), setOpen(v))}
            data-depth={v.depth}
            style={
              {
                "--x": v.x,
                "--y": v.y,
                "--w": v.w,
                "--ratio": v.ratio,
                "--z": v.z,
                "--i": i,
              } as CSSProperties
            }
          >
            <div className="frame__media">
              {v.video ? (
                <LoopVideo v={v} />
              ) : (
                <Art style={v.style} seed={i * 7 + 3} ratio={v.ratio} src={v.src} alt={v.alt} base={200} />
              )}
              {v.video && <span className="frame__rec mono" aria-hidden="true">● REC</span>}
            </div>
            <figcaption className="frame__cap mono">
              <span>{v.code}</span>
              <span>{v.caption}</span>
            </figcaption>
            <span className="frame__corners" aria-hidden="true" />
          </figure>
        ))}
      </div>
      <Lightbox v={open} onClose={close} />
    </section>
  );
}
