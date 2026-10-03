/**
 * Generated artwork: rave scenes drawn with Canvas 2D, then 1-bit ordered-dithered
 * into a photocopied-flyer look (bone / void / signal red).
 * Runs once per frame element at a tiny resolution; scaled up with pixelated rendering.
 */
import { mulberry } from "./engine";
import type { VisualStyle } from "@/data/visuals";

const BONE: [number, number, number] = [236, 232, 225];
const VOID: [number, number, number] = [9, 9, 10];
const RED: [number, number, number] = [255, 45, 26];
const RED_DK: [number, number, number] = [70, 10, 8];

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

export function drawArt(canvas: HTMLCanvasElement, style: VisualStyle, seed: number, ratio: number, base = 180) {
  const W = base;
  const H = Math.max(40, Math.round(base / ratio));
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const rnd = mulberry(seed * 9973 + 17);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  const red = "rgb(255,45,26)";
  switch (style) {
    case "strobe": {
      ctx.globalCompositeOperation = "lighter";
      const beams = 7;
      for (let i = 0; i < beams; i++) {
        const x0 = W * (0.2 + rnd() * 0.6);
        const x1 = W * (rnd() * 1.4 - 0.2);
        const spread = W * (0.05 + rnd() * 0.12);
        const g = ctx.createLinearGradient(x0, 0, x1, H);
        const isRed = i === 3;
        g.addColorStop(0, isRed ? "rgba(255,45,26,0.95)" : "rgba(255,255,255,0.8)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x0 - 1.5, -2);
        ctx.lineTo(x0 + 1.5, -2);
        ctx.lineTo(x1 + spread, H);
        ctx.lineTo(x1 - spread, H);
        ctx.closePath();
        ctx.fill();
      }
      const haze = ctx.createRadialGradient(W / 2, 0, 2, W / 2, 0, H * 0.9);
      haze.addColorStop(0, "rgba(255,255,255,0.55)");
      haze.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      crowd(ctx, W, H, rnd, H * 0.86, 0.9);
      break;
    }
    case "floor": {
      const hz = H * 0.42;
      const glow = ctx.createLinearGradient(0, 0, 0, hz);
      glow.addColorStop(0, "rgba(0,0,0,1)");
      glow.addColorStop(1, "rgba(255,255,255,0.55)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, hz);
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 1;
      for (let i = -14; i <= 14; i++) {
        ctx.beginPath();
        ctx.moveTo(W / 2, hz);
        ctx.lineTo(W / 2 + i * W * 0.16, H);
        ctx.stroke();
      }
      for (let i = 1; i < 14; i++) {
        const t = Math.pow(i / 13, 2.2);
        const y = hz + (H - hz) * t;
        ctx.globalAlpha = 0.3 + t * 0.7;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = red;
      ctx.fillRect(0, hz - 1, W, 2);
      // pillars
      for (let i = 0; i < 4; i++) {
        const x = (i + 0.5) * (W / 4) + (rnd() - 0.5) * 10;
        ctx.fillStyle = "rgba(0,0,0,0.9)";
        ctx.fillRect(x - 3, hz - H * 0.3, 6, H * 0.3);
      }
      break;
    }
    case "rings": {
      const cx = W / 2;
      const cy = H * 0.52;
      const max = Math.hypot(W, H) * 0.6;
      for (let r = max; r > 2; r -= 3 + rnd() * 5) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        const l = 0.15 + 0.85 * Math.abs(Math.sin(r * 0.09 + seed));
        ctx.strokeStyle = `rgba(255,255,255,${(l * (1 - r / max)).toFixed(3)})`;
        ctx.lineWidth = 1 + rnd() * 2.5;
        ctx.stroke();
      }
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.16);
      core.addColorStop(0, red);
      core.addColorStop(0.6, "rgba(255,45,26,0.6)");
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, W * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(cx, cy, W * 0.035, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "crowd": {
      const light = ctx.createRadialGradient(W * 0.5, H * 0.1, 2, W * 0.5, H * 0.2, W * 0.8);
      light.addColorStop(0, "rgba(255,255,255,1)");
      light.addColorStop(0.35, "rgba(255,45,26,0.8)");
      light.addColorStop(1, "rgba(0,0,0,1)");
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, W, H);
      crowd(ctx, W, H, rnd, H * 0.7, 1.3);
      crowd(ctx, W, H, rnd, H * 0.9, 1.8);
      break;
    }
    case "scan": {
      for (let y = 0; y < H; y += 1) {
        const band = Math.sin(y * 0.07 + seed) * 0.5 + 0.5;
        const n = rnd();
        const l = Math.pow(band, 3) * 0.8 + n * 0.25;
        ctx.fillStyle = `rgba(255,255,255,${l.toFixed(3)})`;
        const off = Math.sin(y * 0.21) * 6 * (y > H * 0.55 && y < H * 0.65 ? 3 : 1);
        ctx.fillRect(off, y, W, 1);
      }
      ctx.fillStyle = red;
      ctx.fillRect(0, H * 0.58, W, H * 0.05);
      ctx.fillStyle = "rgba(0,0,0,0.9)";
      ctx.font = `900 ${Math.round(W * 0.2)}px Archivo, Arial, sans-serif`;
      ctx.fillText("NO", W * 0.08, H * 0.35);
      ctx.fillText("SIG", W * 0.08, H * 0.35 + W * 0.19);
      break;
    }
    case "type": {
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      for (let i = 0; i < 400; i++) ctx.fillRect(rnd() * W, rnd() * H, 1, 1);
      ctx.fillStyle = "#fff";
      ctx.font = `900 ${Math.round(W * 0.62)}px Archivo, "Arial Black", Arial, sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillText("SB", -W * 0.04, H * 0.04);
      ctx.fillStyle = red;
      ctx.fillText("26", W * 0.12, H * 0.42);
      ctx.fillStyle = "#fff";
      ctx.font = `700 ${Math.round(W * 0.055)}px "JetBrains Mono", monospace`;
      ["HARD TECHNO", "CASTELLDEFELS / BCN", "IZIAL × DBØ", "02:00 — CLOSE"].forEach((t, i) =>
        ctx.fillText(t, W * 0.06, H * 0.8 + i * W * 0.065),
      );
      break;
    }
  }

  // ── 1-bit ordered dither with a red channel
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const lum = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
      const th = BAYER[(y & 3) * 4 + (x & 3)];
      const isRed = r > g + 70 && r > 90;
      let c: [number, number, number];
      if (isRed) c = r / 255 > th * 0.9 ? RED : RED_DK;
      else c = lum > th ? BONE : VOID;
      d[i] = c[0];
      d[i + 1] = c[1];
      d[i + 2] = c[2];
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function crowd(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  rnd: () => number,
  baseY: number,
  scale: number,
) {
  ctx.fillStyle = "#000";
  let x = -10;
  while (x < W + 10) {
    const s = (8 + rnd() * 6) * scale;
    const hy = baseY - s * (1.4 + rnd() * 0.6);
    ctx.beginPath();
    ctx.ellipse(x, hy, s * 0.55, s * 0.68, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - s * 1.3, H);
    ctx.quadraticCurveTo(x - s * 1.2, hy + s * 0.9, x, hy + s * 0.7);
    ctx.quadraticCurveTo(x + s * 1.2, hy + s * 0.9, x + s * 1.3, H);
    ctx.fill();
    if (rnd() > 0.78) {
      ctx.lineWidth = s * 0.35;
      ctx.strokeStyle = "#000";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x + s * 0.8, hy + s);
      ctx.lineTo(x + s * (0.9 + rnd()), hy - s * (2 + rnd() * 1.5));
      ctx.stroke();
    }
    x += s * (1.6 + rnd() * 0.8);
  }
}
