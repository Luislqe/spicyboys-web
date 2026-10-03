"use client";

import { useEffect, useRef } from "react";
import { clamp, env, lerp, on, onTick, state } from "@/lib/engine";

type Props = {
  items: string[];
  /** px per second */
  speed?: number;
  reverse?: boolean;
  /** flips direction with scroll direction */
  followScroll?: boolean;
  variant?: "solid" | "outline" | "tape" | "mono";
  sep?: string;
  className?: string;
};

/**
 * Seamless marquee driven by the shared loop.
 * Scroll speed boosts it and skews it; rave mode doubles it. Pauses off-screen.
 */
export function Marquee({
  items,
  speed = 60,
  reverse = false,
  followScroll = false,
  variant = "solid",
  sep = "—",
  className = "",
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = wrap.current;
    const tr = track.current;
    if (!w || !tr) return;
    let x = 0;
    let unit = 0;
    let skew = 0;
    let dir = reverse ? 1 : -1;
    let visible = false;
    let rave = false;
    const measure = () => {
      const first = tr.firstElementChild as HTMLElement | null;
      unit = first ? first.offsetWidth : 0;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(tr);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(w);
    const offRave = on("rave", (v) => (rave = !!v));

    const off = onTick((_t, dt) => {
      if (!visible || !unit) return;
      const v = state.velocity;
      if (followScroll && Math.abs(v) > 0.6) dir = (reverse ? -1 : 1) * (v > 0 ? -1 : 1);
      const boost = env.reduced ? 0 : clamp(Math.abs(v) * 0.09, 0, 5);
      const base = env.reduced ? speed * 0.15 : speed;
      x += dir * base * (1 + boost) * (rave ? 2.2 : 1) * (dt / 1000);
      if (x <= -unit) x += unit;
      if (x > 0) x -= unit;
      skew = lerp(skew, env.reduced ? 0 : clamp(-v * 0.18, -9, 9), 0.1);
      tr.style.transform = `translate3d(${x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    });
    return () => {
      off();
      offRave();
      ro.disconnect();
      io.disconnect();
    };
  }, [speed, reverse, followScroll]);

  // three copies of the group: enough to cover ultra-wide screens seamlessly
  const group = (k: number) => (
    <div className="mq__group" key={k} aria-hidden={k > 0}>
      {items.map((it, i) => (
        <span className="mq__item" key={i}>
          <span className="mq__text">{it}</span>
          <span className="mq__sep" aria-hidden="true">
            {sep}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div ref={wrap} className={`mq mq--${variant} ${className}`}>
      <div ref={track} className="mq__track">
        {[0, 1, 2].map(group)}
      </div>
    </div>
  );
}
