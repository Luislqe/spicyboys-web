"use client";

import { useEffect, useRef } from "react";
import { drawArt } from "@/lib/generative";
import type { VisualStyle } from "@/data/visuals";

type Props = {
  style: VisualStyle;
  seed: number;
  ratio: number;
  src?: string;
  alt: string;
  base?: number;
  className?: string;
};

/** Own photo if provided, generated 1-bit artwork otherwise. */
export function Art({ style, seed, ratio, src, alt, base = 180, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (src || !ref.current) return;
    const c = ref.current;
    const paint = () => drawArt(c, style, seed, ratio, base);
    paint();
    // Repaint once real fonts arrive (the "type" style uses them).
    document.fonts?.ready.then(paint).catch(() => {});
  }, [style, seed, ratio, src, base]);

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={src} alt={alt} loading="lazy" decoding="async" />;
  }
  return <canvas ref={ref} className={className} role="img" aria-label={alt} />;
}
