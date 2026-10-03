/**
 * VISUALS
 * -------
 * Each frame renders generated artwork (1-bit dithered "photocopy flyer" studies)
 * until you give it a `src`. Drop your own photos in /public/visuals and set `src`.
 * Only use images you own or have permission to use.
 *
 * Layout values are for desktop (percent of the gallery box). Mobile ignores them
 * and turns the gallery into a swipe strip.
 */
export type VisualStyle = "strobe" | "floor" | "rings" | "crowd" | "scan" | "type";

export type Visual = {
  id: string;
  code: string;
  caption: string;
  style: VisualStyle;
  src?: string;
  alt: string;
  /** left / top / width in % of the gallery; ratio = width / height */
  x: number;
  y: number;
  w: number;
  ratio: number;
  /** parallax depth: negative = slower (farther), positive = faster (closer) */
  depth: number;
  z: number;
};

export const VISUALS: Visual[] = [
  { id: "v1", code: "FRM_001", caption: "STROBE STUDY / 04:12", style: "strobe", alt: "Strobe beams in a dark warehouse", x: 2, y: 2, w: 34, ratio: 0.78, depth: -0.12, z: 2 },
  { id: "v2", code: "FRM_002", caption: "WAREHOUSE FLOOR", style: "floor", alt: "Perspective grid of a warehouse floor", x: 42, y: 0, w: 28, ratio: 1.3, depth: 0.1, z: 3 },
  { id: "v3", code: "FRM_003", caption: "SUB / 42HZ", style: "rings", alt: "Concentric speaker rings", x: 74, y: 8, w: 24, ratio: 0.72, depth: -0.05, z: 1 },
  { id: "v4", code: "FRM_004", caption: "FIRST ROW", style: "crowd", alt: "Silhouettes of a crowd under lights", x: 30, y: 34, w: 40, ratio: 1.55, depth: 0.2, z: 4 },
  { id: "v5", code: "FRM_005", caption: "SIGNAL LOSS", style: "scan", alt: "CRT signal noise", x: 0, y: 52, w: 26, ratio: 0.85, depth: 0.05, z: 2 },
  { id: "v6", code: "FRM_006", caption: "FLYER / SB 26", style: "type", alt: "Typographic techno flyer", x: 72, y: 50, w: 27, ratio: 0.7, depth: -0.15, z: 3 },
];
