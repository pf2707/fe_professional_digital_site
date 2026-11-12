"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  Procedural textures. Every "printed" surface in the room (screen, window,
//  certificates, corkboard, neon sign) is drawn on a 2D canvas, so the scene
//  ships no image or model files and stays sharp at any size.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo } from "react";
import * as THREE from "three";

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

// next/font exposes the hashed family names as CSS variables on <html>.
export function cssFont(variable: "--font-display" | "--font-body") {
  if (typeof document === "undefined") return "sans-serif";
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value || "sans-serif";
}

export function useCanvasTexture(draw: Draw, w: number, h: number, deps: unknown[]) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [w, h]);

  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const paint = () => {
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h);
      texture.needsUpdate = true;
    };
    paint();
    // Repaint once web fonts are ready so canvas text uses the real typefaces.
    document.fonts?.ready.then(paint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture, ...deps]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

// ── Monitor: an agent session scrolling in a terminal ───────────────────────
export const TERMINAL_LINES = [
  "$ claude --agents fde-team",
  "› discovery   reading client brief…",
  "› architect   drafting agent harness",
  "› builder     wiring MCP: crm, calendar",
  "› reviewer    12 checks passed",
  "› deploy      shipped to production ✓",
  "$ n8n run lead-pipeline",
  "› 48 leads scored · 9 booked calls",
  "$ twin --answer \"why hire Thai?\"",
  "› ships AI that works in production.",
];

export function drawTerminal(step: number): Draw {
  return (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0b1a2c");
    g.addColorStop(1, "#08121f");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#13283f";
    ctx.fillRect(0, 0, w, 44);
    ["#ff6b5e", "#f5c04a", "#3fd18b"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(26 + i * 26, 22, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.font = `500 26px ui-monospace, Menlo, monospace`;
    const visible = Math.min(step, TERMINAL_LINES.length);
    const start = Math.max(0, visible - 9);
    TERMINAL_LINES.slice(start, visible).forEach((line, i) => {
      ctx.fillStyle = line.startsWith("$") ? "#f5a945" : line.includes("✓") ? "#5ee6c8" : "#b9cbe0";
      ctx.fillText(line, 28, 92 + i * 44);
    });
    // cursor
    if (step % 2 === 0) {
      ctx.fillStyle = "#5ee6c8";
      ctx.fillRect(28, 92 + Math.min(visible - start, 9) * 44 - 22, 14, 28);
    }
  };
}

// ── Window: Saigon skyline, by day or by night ──────────────────────────────
export function drawSkyline(night: boolean): Draw {
  return (ctx, w, h) => {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    if (night) {
      sky.addColorStop(0, "#0c1630");
      sky.addColorStop(0.7, "#2a2350");
      sky.addColorStop(1, "#5a3358");
    } else {
      sky.addColorStop(0, "#7fb2d9");
      sky.addColorStop(0.75, "#cfe2ee");
      sky.addColorStop(1, "#f3dcc0");
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    if (night) {
      ctx.fillStyle = "#fff8e0";
      ctx.beginPath();
      ctx.arc(w * 0.78, h * 0.2, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // Deterministic pseudo-random so the skyline is the same every render.
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    const layers = night ? ["#1a2340", "#111a33"] : ["#9fb6c8", "#7d93a6"];
    layers.forEach((color, layer) => {
      let x = 0;
      while (x < w) {
        const bw = 40 + rand() * 70;
        const bh = h * (0.25 + rand() * (layer ? 0.35 : 0.5));
        ctx.fillStyle = color;
        ctx.fillRect(x, h - bh, bw, bh);
        // The Landmark 81 spire, once.
        if (layer === 1 && x > w * 0.3 && x < w * 0.3 + 110) {
          ctx.fillRect(x + bw / 2 - 14, h - bh - 140, 28, 140);
          ctx.beginPath();
          ctx.moveTo(x + bw / 2 - 14, h - bh - 140);
          ctx.lineTo(x + bw / 2, h - bh - 200);
          ctx.lineTo(x + bw / 2 + 14, h - bh - 140);
          ctx.fill();
        }
        if (night) {
          for (let wy = h - bh + 12; wy < h - 8; wy += 16) {
            for (let wx = x + 8; wx < x + bw - 8; wx += 14) {
              if (rand() > 0.62) {
                ctx.fillStyle = rand() > 0.8 ? "#7fe3d6" : "#f6c875";
                ctx.fillRect(wx, wy, 6, 8);
              }
            }
          }
        }
        x += bw + 4;
      }
    });
  };
}

// ── Certificate in a frame ──────────────────────────────────────────────────
export function drawCertificate(cert: {
  title: string;
  issuer: string;
  instructor: string;
  date: string;
}): Draw {
  return (ctx, w, h) => {
    ctx.fillStyle = "#f6f1e7";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#c9a96a";
    ctx.lineWidth = 6;
    ctx.strokeRect(22, 22, w - 44, h - 44);

    const display = cssFont("--font-display");
    const body = cssFont("--font-body");

    ctx.fillStyle = "#7a6440";
    ctx.font = `500 26px ${body}`;
    ctx.fillText(`Certificate of completion · ${cert.issuer}`, 60, 90);

    ctx.fillStyle = "#1d2433";
    ctx.font = `700 46px ${display}`;
    wrap(ctx, cert.title, w - 120).slice(0, 4).forEach((line, i) => {
      ctx.fillText(line, 60, 170 + i * 56);
    });

    ctx.fillStyle = "#3a4256";
    ctx.font = `400 26px ${body}`;
    ctx.fillText(`Thai Tran — ${cert.instructor}`, 60, h - 90);
    ctx.fillText(
      new Date(cert.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      60,
      h - 54,
    );

    // seal
    ctx.fillStyle = "#c9a96a";
    ctx.beginPath();
    ctx.arc(w - 110, h - 110, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f6f1e7";
    ctx.font = `700 30px ${display}`;
    ctx.textAlign = "center";
    ctx.fillText("AI", w - 110, h - 99);
    ctx.textAlign = "left";
  };
}

// ── Corkboard with pinned career cards ──────────────────────────────────────
export function drawCorkboard(
  items: { period: string; role: string }[],
): Draw {
  return (ctx, w, h) => {
    ctx.fillStyle = "#b98a5a";
    ctx.fillRect(0, 0, w, h);
    let seed = 3;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 2600; i++) {
      ctx.fillStyle = rand() > 0.5 ? "rgba(90,55,25,0.25)" : "rgba(240,210,160,0.2)";
      ctx.fillRect(rand() * w, rand() * h, 3, 3);
    }

    const display = cssFont("--font-display");
    const body = cssFont("--font-body");
    // Oldest on the left, so the board reads as a timeline.
    const cards = [...items].reverse();
    const cw = (w - 120) / cards.length - 40;
    const pins: [number, number][] = [];
    cards.forEach((item, i) => {
      const x = 60 + i * (cw + 80);
      const y = 70 + (i % 2) * 40;
      ctx.save();
      ctx.translate(x + cw / 2, y + 120);
      ctx.rotate((i % 2 ? 1 : -1) * 0.03);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(-cw / 2 + 8, -112, cw, 250);
      ctx.fillStyle = i === cards.length - 1 ? "#fff3c4" : "#f6f1e7";
      ctx.fillRect(-cw / 2, -120, cw, 250);
      ctx.fillStyle = "#7a6440";
      ctx.font = `500 30px ${body}`;
      ctx.fillText(item.period, -cw / 2 + 28, -62);
      ctx.fillStyle = "#1d2433";
      ctx.font = `700 40px ${display}`;
      wrap(ctx, item.role, cw - 56).slice(0, 3).forEach((line, li) => {
        ctx.fillText(line, -cw / 2 + 28, -6 + li * 46);
      });
      ctx.restore();
      pins.push([x + cw / 2, y + 10]);
    });

    // red string between the pins
    ctx.strokeStyle = "#c2412d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    pins.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.stroke();
    pins.forEach(([px, py]) => {
      ctx.fillStyle = "#c2412d";
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fill();
    });
  };
}

// ── Neon sign ───────────────────────────────────────────────────────────────
export function drawNeon(text: string, color: string): Draw {
  return (ctx, w, h) => {
    // One tube per line ("\n"); the font shrinks until the widest line fits.
    const lines = text.split("\n");
    const family = cssFont("--font-display");
    let size = Math.round(h / (lines.length * 1.18));
    ctx.font = `700 ${size}px ${family}`;
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
    if (widest > w - 60) size = Math.floor((size * (w - 60)) / widest);
    ctx.font = `700 ${size}px ${family}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lead = size * 1.18;
    const top = h / 2 - (lead * (lines.length - 1)) / 2;
    const pass = (alpha: number, blur: number, fill: string) => {
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = blur;
      ctx.fillStyle = fill;
      lines.forEach((l, i) => ctx.fillText(l, w / 2, top + i * lead));
    };
    // A tight halo, then a solid pale core on top so the letters stay crisp.
    ctx.shadowColor = color;
    pass(0.9, size * 0.16, color);
    pass(1, 0, "#e9fffb");
    ctx.globalAlpha = 1;
  };
}

// ── Drawer label card ───────────────────────────────────────────────────────
export function drawLabel(text: string): Draw {
  return (ctx, w, h) => {
    ctx.fillStyle = "#efe6d2";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#3a2a1c";
    ctx.font = `600 ${Math.round(h * 0.5)}px ${cssFont("--font-body")}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2 + 2);
  };
}
