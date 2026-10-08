"use client";

import { useEffect, useRef } from "react";

// A thin thread of sand falling straight down from the logo to the menu item under the pointer (menu panel only).
// Grains are spawned while `to` is set and vanish when they reach it, the bottom of the hovered word; when the pointer
// leaves, the grains already falling finish their drop. Decorative: drawn behind the menu words, ignores the pointer.
type Point = { x: number; from: number; to: number };
type Grain = { x: number; y: number; vy: number; size: number; color: string };
const COLORS = ["#c4955a", "#b8864c", "#a8763f", "#d9b27e"]; // sand tones from the desert scene
const GRAVITY = 0.32; // px per (60 fps) frame²
const PER_FRAME = 4; // grains spawned per (60 fps) frame while hovering
const SPREAD = 7; // width of the thread in px

export default function MenuSand({ point }: { point: Point | null }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const target = useRef(point);
  target.current = point;
  const wake = useRef<() => void>(() => {});

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const grains: Grain[] = [];
    let frame = 0, debt = 0, then = 0, last = { x: 0, to: 0 };
    const resize = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      element.width = element.clientWidth * ratio;
      element.height = element.clientHeight * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    // Steps are scaled by the time since the last frame, so the sand falls at the same speed on slow screens.
    const tick = (now: number) => {
      frame = 0;
      const step = then ? Math.min((now - then) / (1000 / 60), 3) : 1;
      then = now;
      const aim = target.current;
      if (aim) {
        last = aim;
        for (debt += PER_FRAME * step; debt >= 1; debt--) {
          grains.push({ x: aim.x + (Math.random() - 0.5) * SPREAD, y: aim.from + Math.random() * 4, vy: 1.2 + Math.random() * 1.4, size: 2 + Math.random() * 1.6, color: COLORS[(Math.random() * COLORS.length) | 0] });
        }
      }
      context.clearRect(0, 0, element.clientWidth, element.clientHeight);
      const floor = aim ? aim.to : last.to;
      for (let i = grains.length - 1; i >= 0; i--) {
        const grain = grains[i];
        grain.vy += GRAVITY * step;
        grain.y += grain.vy * step;
        if (grain.y >= floor) { grains.splice(i, 1); continue; }
        context.fillStyle = grain.color;
        context.fillRect(grain.x, grain.y, grain.size, grain.size);
      }
      if (aim || grains.length) frame = requestAnimationFrame(tick);
      else then = 0;
    };
    wake.current = () => { if (!frame) frame = requestAnimationFrame(tick); };
    resize();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      wake.current = () => {};
    };
  }, []);

  useEffect(() => { if (point) wake.current(); }, [point]);

  return <canvas ref={canvas} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}
