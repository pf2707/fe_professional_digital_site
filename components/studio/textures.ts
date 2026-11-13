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
// Lines starting with "$" are commands; lines containing "✓" are highlighted.
export function drawTerminal(lines: string[], step: number): Draw {
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
    const visible = Math.min(step, lines.length);
    const start = Math.max(0, visible - 9);
    lines.slice(start, visible).forEach((line, i) => {
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
export function drawCertificate(
  cert: { title: string; issuer: string; instructor: string; date: string; badge?: string },
  holder: string,
): Draw {
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
    ctx.fillText(`${holder} — ${cert.instructor}`, 60, h - 90);
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
    ctx.fillText((cert.badge || "✓").slice(0, 3), w - 110, h - 99);
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

// ── Hologram face when there's no photo ─────────────────────────────────────
export function drawInitials(initials: string): Draw {
  return (ctx, w, h) => {
    ctx.fillStyle = "#1a3a40";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${Math.round(h * 0.38)}px ${cssFont("--font-display")}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials.slice(0, 3), w / 2, h / 2 + 6);
  };
}

// ── Café: chalkboard menu ───────────────────────────────────────────────────
// The heading, then one dish per project: its icon, name and a dotted leader.
export function drawChalkboard(title: string, items: { icon: string; name: string }[]): Draw {
  return (ctx, w, h) => {
    ctx.fillStyle = "#1f2a24";
    ctx.fillRect(0, 0, w, h);
    // chalk dust smudges
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 70; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.015 + rand() * 0.03})`;
      ctx.beginPath();
      ctx.ellipse(rand() * w, rand() * h, 40 + rand() * 120, 14 + rand() * 40, rand() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    const display = cssFont("--font-display");
    const body = cssFont("--font-body");
    ctx.fillStyle = "#f3efe4";
    ctx.textAlign = "center";
    ctx.font = `700 ${Math.round(h * 0.1)}px ${display}`;
    ctx.fillText(title, w / 2, h * 0.17, w - 80);
    // a chalk underline
    ctx.strokeStyle = "rgba(243,239,228,0.7)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.22);
    ctx.quadraticCurveTo(w / 2, h * 0.235, w * 0.7, h * 0.215);
    ctx.stroke();

    const list = items.slice(0, 6);
    const top = h * 0.32;
    const step = (h * 0.62) / Math.max(list.length, 1);
    const size = Math.min(Math.round(step * 0.5), Math.round(h * 0.065));
    ctx.textAlign = "left";
    list.forEach((item, i) => {
      const y = top + i * step + size;
      ctx.font = `${size}px ${body}`;
      ctx.fillText(item.icon, 70, y);
      ctx.font = `600 ${size}px ${body}`;
      ctx.fillStyle = "#f3efe4";
      const name = item.name;
      ctx.fillText(name, 70 + size * 1.6, y, w - 260);
      const end = Math.min(70 + size * 1.6 + ctx.measureText(name).width + 20, w - 160);
      ctx.fillStyle = "rgba(243,239,228,0.45)";
      for (let x = end; x < w - 110; x += 18) ctx.fillRect(x, y - 6, 6, 6);
      // a star where the price would be
      ctx.fillStyle = "#f0c66a";
      ctx.font = `700 ${size}px ${display}`;
      ctx.fillText("★", w - 95, y);
      ctx.fillStyle = "#f3efe4";
    });
  };
}

// ── Café: polaroids on the photo wall (career) ──────────────────────────────
export function drawPolaroids(items: { period: string; role: string }[], accent: string): Draw {
  return (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const display = cssFont("--font-display");
    const body = cssFont("--font-body");
    // Oldest on the left, so the wall reads as a timeline.
    const cards = [...items].reverse().slice(-4);
    const cw = Math.min(300, (w - 40) / Math.max(cards.length, 1) - 30);
    const gap = (w - cards.length * cw) / (cards.length + 1);
    const tints = ["#c98d5a", "#7fa7a0", "#b9846f", "#8b9fc2"];
    cards.forEach((item, i) => {
      const x = gap + i * (cw + gap);
      const y = 40 + (i % 2) * 36;
      const ch = cw * 1.25;
      ctx.save();
      ctx.translate(x + cw / 2, y + ch / 2);
      ctx.rotate((i % 2 ? 1 : -1) * 0.05);
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(-cw / 2 + 8, -ch / 2 + 10, cw, ch);
      ctx.fillStyle = "#f7f3ea";
      ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
      // the "photo": a warm café scene in two tones, with a cup
      const ph = cw - 36;
      const g = ctx.createLinearGradient(0, -ch / 2 + 18, 0, -ch / 2 + 18 + ph);
      g.addColorStop(0, tints[i % tints.length]);
      g.addColorStop(1, "#3a2a22");
      ctx.fillStyle = g;
      ctx.fillRect(-cw / 2 + 18, -ch / 2 + 18, ph, ph);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.ellipse(0, -ch / 2 + 18 + ph * 0.66, ph * 0.18, ph * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-ph * 0.13, -ch / 2 + 18 + ph * 0.42, ph * 0.26, ph * 0.24);
      // caption
      ctx.fillStyle = "#7a6440";
      ctx.font = `500 ${Math.round(cw * 0.085)}px ${body}`;
      ctx.fillText(item.period, -cw / 2 + 20, ch / 2 - cw * 0.2);
      ctx.fillStyle = "#1d2433";
      ctx.font = `700 ${Math.round(cw * 0.1)}px ${display}`;
      ctx.fillText(item.role, -cw / 2 + 20, ch / 2 - cw * 0.07, cw - 40);
      ctx.restore();
      // washi tape
      ctx.save();
      ctx.translate(x + cw / 2, y + 4);
      ctx.rotate((i % 2 ? -1 : 1) * 0.12);
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.75;
      ctx.fillRect(-46, -14, 92, 28);
      ctx.restore();
    });
  };
}

// ── Café: brick wall in the design's wall colour ────────────────────────────
export function drawBricks(color: string): Draw {
  return (ctx, w, h) => {
    const base = new THREE.Color(color);
    ctx.fillStyle = `#${base.clone().multiplyScalar(0.72).getHexString()}`; // mortar
    ctx.fillRect(0, 0, w, h);
    const bw = 64;
    const bh = 26;
    let seed = 5;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let row = 0; row * (bh + 6) < h; row++) {
      const offset = row % 2 ? bw / 2 : 0;
      for (let x = -offset; x < w; x += bw + 6) {
        const shade = 0.9 + rand() * 0.2;
        ctx.fillStyle = `#${base.clone().multiplyScalar(shade).getHexString()}`;
        ctx.fillRect(x, row * (bh + 6), bw, bh);
      }
    }
  };
}

// ── Park: notice board with one pinned note per project (work) ──────────────
export function drawNoticeBoard(title: string, items: { icon: string; name: string }[], accent: string): Draw {
  return (ctx, w, h) => {
    ctx.fillStyle = "#b98a5a";
    ctx.fillRect(0, 0, w, h);
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 2600; i++) {
      ctx.fillStyle = rand() > 0.5 ? "rgba(90,55,25,0.25)" : "rgba(240,210,160,0.2)";
      ctx.fillRect(rand() * w, rand() * h, 3, 3);
    }
    const display = cssFont("--font-display");
    const body = cssFont("--font-body");

    // the heading, on a paper strip
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(w * 0.18 + 8, 38, w * 0.64, h * 0.15);
    ctx.fillStyle = "#f6f1e7";
    ctx.fillRect(w * 0.18, 30, w * 0.64, h * 0.15);
    ctx.fillStyle = "#1d2433";
    ctx.font = `700 ${Math.round(h * 0.075)}px ${display}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, w / 2, 30 + h * 0.075, w * 0.6);

    const list = items.slice(0, 6);
    const cols = Math.min(3, Math.max(list.length, 1));
    const rows = Math.max(1, Math.ceil(list.length / cols));
    const top = h * 0.25;
    const cw = (w - 60) / cols - 40;
    const ch = (h - top - 30) / rows - 30;
    const papers = ["#fff3c4", "#f6f1e7", "#dff0e3", "#fde2e4", "#e2ecf8", "#f6f1e7"];
    list.forEach((item, i) => {
      const x = 50 + (i % cols) * (cw + 40) + cw / 2;
      const y = top + Math.floor(i / cols) * (ch + 30) + ch / 2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((i % 2 ? 1 : -1) * (0.02 + (i % 3) * 0.012));
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(-cw / 2 + 7, -ch / 2 + 9, cw, ch);
      ctx.fillStyle = papers[i % papers.length];
      ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
      ctx.textAlign = "center";
      ctx.font = `${Math.round(ch * 0.26)}px ${body}`;
      ctx.fillStyle = "#1d2433";
      ctx.fillText(item.icon, 0, -ch * 0.18);
      ctx.font = `700 ${Math.round(Math.min(ch * 0.13, cw * 0.1))}px ${display}`;
      wrap(ctx, item.name, cw - 40)
        .slice(0, 2)
        .forEach((line, li) => ctx.fillText(line, 0, ch * 0.15 + li * ch * 0.15));
      ctx.restore();
      // pin
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(x, y - ch / 2 + 14, 11, 0, Math.PI * 2);
      ctx.fill();
    });
  };
}

// ── Park: one arrow on the signpost (a job) ─────────────────────────────────
export function drawPlank(role: string, period: string, left: boolean): Draw {
  return (ctx, w, h) => {
    const tip = h * 0.5;
    ctx.save();
    if (left) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.fillStyle = "#8a5a35";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w - tip, 0);
    ctx.lineTo(w, h / 2);
    ctx.lineTo(w - tip, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.clip();
    // wood grain
    ctx.strokeStyle = "rgba(40,20,8,0.25)";
    ctx.lineWidth = 2;
    for (let y = 10; y < h; y += 14) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y + 4, w * 0.6, y - 4, w, y + 2);
      ctx.stroke();
    }
    ctx.restore();
    const pad = left ? tip + 10 : 30;
    const room = w - tip - 40;
    ctx.fillStyle = "#f7ecd6";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    let size = Math.round(h * 0.34);
    ctx.font = `700 ${size}px ${cssFont("--font-display")}`;
    while (size > 22 && ctx.measureText(role).width > room) ctx.font = `700 ${--size}px ${cssFont("--font-display")}`;
    ctx.fillText(role, pad, h * 0.38, room);
    ctx.fillStyle = "rgba(247,236,214,0.75)";
    ctx.font = `500 ${Math.round(h * 0.22)}px ${cssFont("--font-body")}`;
    ctx.fillText(period, pad, h * 0.75, room);
  };
}

// ── Shop: the poster in the window (work) ───────────────────────────────────
export function drawShopPoster(title: string, items: { icon: string; name: string }[], accent: string): Draw {
  return (ctx, w, h) => {
    ctx.fillStyle = "#fbf6ec";
    ctx.fillRect(0, 0, w, h);
    const display = cssFont("--font-display");
    const body = cssFont("--font-body");
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, w, h * 0.2);
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${Math.round(h * 0.1)}px ${display}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, w / 2, h * 0.1, w - 60);

    const list = items.slice(0, 6);
    const top = h * 0.26;
    const step = (h * 0.7) / Math.max(list.length, 1);
    const size = Math.min(Math.round(step * 0.42), Math.round(h * 0.06));
    ctx.textAlign = "left";
    list.forEach((item, i) => {
      const y = top + i * step + step / 2;
      ctx.fillStyle = "#1d2433";
      ctx.font = `${size}px ${body}`;
      ctx.fillText(item.icon, 50, y);
      ctx.font = `600 ${size}px ${body}`;
      ctx.fillText(item.name, 50 + size * 1.7, y, w - 250);
      // a price tag with a star on it
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(w - 150, y - size * 0.6);
      ctx.lineTo(w - 50, y - size * 0.6);
      ctx.lineTo(w - 50, y + size * 0.6);
      ctx.lineTo(w - 150, y + size * 0.6);
      ctx.lineTo(w - 175, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = `700 ${size}px ${display}`;
      ctx.fillText("★", w - 100, y + 2);
      ctx.textAlign = "left";
      if (i < list.length - 1) {
        ctx.fillStyle = "rgba(29,36,51,0.12)";
        ctx.fillRect(50, y + step / 2, w - 100, 2);
      }
    });
  };
}

// ── Shop: the wall calendar, one row per job (career) ───────────────────────
export function drawCalendar(title: string, items: { period: string; role: string; org: string }[], accent: string): Draw {
  return (ctx, w, h) => {
    ctx.fillStyle = "#fbf6ec";
    ctx.fillRect(0, 0, w, h);
    const display = cssFont("--font-display");
    const body = cssFont("--font-body");
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, w, h * 0.17);
    // spiral binding
    ctx.fillStyle = "#3a3f4a";
    for (let x = 40; x < w - 20; x += 46) ctx.fillRect(x, -4, 10, 28);
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${Math.round(h * 0.075)}px ${display}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, w / 2, h * 0.1, w - 60);

    const list = items.slice(0, 5);
    const top = h * 0.21;
    const step = (h * 0.76) / Math.max(list.length, 1);
    ctx.textAlign = "left";
    list.forEach((item, i) => {
      const y = top + i * step;
      // the current job is circled in the accent colour
      if (i === 0) {
        ctx.strokeStyle = accent;
        ctx.lineWidth = 5;
        ctx.strokeRect(24, y + 6, w - 48, step - 12);
      }
      ctx.fillStyle = "#7a6440";
      ctx.font = `600 ${Math.round(step * 0.22)}px ${body}`;
      ctx.fillText(item.period, 46, y + step * 0.32, w * 0.3);
      ctx.fillStyle = "#1d2433";
      // Shrink a long title to fit rather than squash it.
      let size = Math.round(step * 0.26);
      ctx.font = `700 ${size}px ${display}`;
      while (size > 18 && ctx.measureText(item.role).width > w * 0.6) ctx.font = `700 ${--size}px ${display}`;
      ctx.fillText(item.role, w * 0.36, y + step * 0.34, w * 0.6);
      ctx.fillStyle = "#5a6070";
      ctx.font = `500 ${Math.round(step * 0.2)}px ${body}`;
      ctx.fillText(item.org, w * 0.36, y + step * 0.7, w * 0.6);
      ctx.fillStyle = "rgba(29,36,51,0.12)";
      ctx.fillRect(24, y + step - 1, w - 48, 2);
    });
  };
}

// ── Shop: the wall clock's face ─────────────────────────────────────────────
export function drawClockFace(): Draw {
  return (ctx, w, h) => {
    ctx.fillStyle = "#fbf6ec";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1d2433";
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const long = i % 5 === 0;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(a);
      ctx.fillRect(-(long ? 5 : 2), -w * 0.46, long ? 10 : 4, long ? 34 : 14);
      ctx.restore();
    }
    ctx.font = `700 ${Math.round(w * 0.11)}px ${cssFont("--font-display")}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    [12, 3, 6, 9].forEach((n, i) => {
      const a = (i / 4) * Math.PI * 2;
      ctx.fillText(String(n), w / 2 + Math.sin(a) * w * 0.32, h / 2 - Math.cos(a) * h * 0.32);
    });
  };
}
