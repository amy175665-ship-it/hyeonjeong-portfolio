"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import type { MotionValue } from "framer-motion";
import { sceneProgress, type Wind } from "./scenes";
import styles from "./ConceptScenes.module.css";

// Sideways sand gusts for SCENE 2 (Canvas 2D, same grain look as SandStream). Also owns the shared wind value:
// a slow base gust plus a push from pointer movement on desktop.
const SAND_COLORS = ["#f0cf98", "#e6bd82", "#ddb276", "#d0a165", "#c08f55"];
const ALPHAS = [0.3, 0.5, 0.7, 0.9];
const GUST = { desktop: 1400, mobile: 420, band: [0.38, 0.86] as const };

type Grain = { x: number; y: number; speed: number; lift: number; phase: number; size: number; style: number };

type Props = { progress: MotionValue<number>; wind: MutableRefObject<Wind>; reduced: boolean; running: boolean; desktop: boolean };

export default function WindGust({ progress, wind, reduced, running, desktop }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let width = 0, height = 0, grains: Grain[] = [], frame = 0, last = 0, time = 0, push = 0;
    const styleCount = SAND_COLORS.length * ALPHAS.length;
    const respawn = (grain: Grain, anywhere: boolean) => {
      const [top, bottom] = GUST.band;
      grain.x = anywhere ? Math.random() * width : -20 - Math.random() * width * 0.3;
      grain.y = height * (top + Math.random() * (bottom - top));
      grain.speed = 0.7 + Math.random() * 0.6;
      grain.lift = (Math.random() - 0.5) * 40;
      grain.phase = Math.random() * Math.PI * 2;
    };
    const setup = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      grains = Array.from({ length: desktop ? GUST.desktop : GUST.mobile }, () => {
        const grain: Grain = { x: 0, y: 0, speed: 1, lift: 0, phase: 0, size: 0.7 + Math.random() * 1.3, style: Math.floor(Math.random() * styleCount) };
        respawn(grain, true);
        return grain;
      }).sort((a, b) => a.style - b.style);
    };
    // Gust visibility over SCENE 2: fades in, peaks in the middle, fades out.
    const presence = () => {
      const local = sceneProgress(progress.get(), "build");
      return Math.min(local / 0.12, 1) * Math.min((1 - local) / 0.1, 1);
    };
    const draw = (strength: number) => {
      context.clearRect(0, 0, width, height);
      if (strength <= 0.01) return;
      let style = -1;
      for (const grain of grains) {
        if (grain.style !== style) {
          style = grain.style;
          context.fillStyle = SAND_COLORS[style % SAND_COLORS.length];
          context.globalAlpha = ALPHAS[Math.floor(style / SAND_COLORS.length)] * strength;
        }
        context.fillRect(grain.x, grain.y + Math.sin(time * 2 + grain.phase) * 6, grain.size * 1.8, grain.size);
      }
      context.globalAlpha = 1;
    };
    const tick = (now: number) => {
      const delta = Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      time += delta;
      const strength = presence();
      push *= Math.exp(-2.5 * delta);
      // Base gust breathes between calm and strong; the pointer can push it further either way.
      const base = (0.6 + 0.4 * Math.sin(time * 0.9)) * strength;
      wind.current.value = base + push;
      const speed = 520 + 380 * Math.max(wind.current.value, 0.2);
      for (const grain of grains) {
        grain.x += speed * grain.speed * delta * Math.sign(wind.current.value || 1);
        grain.y += grain.lift * delta;
        if (grain.x > width + 20 || grain.x < -40) respawn(grain, false);
      }
      draw(strength);
      frame = requestAnimationFrame(tick);
    };
    const pointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      push = Math.max(-1.6, Math.min(1.6, push + event.movementX * 0.012));
    };
    setup();
    if (reduced || !running) { wind.current.value = 0; draw(reduced ? 0 : presence()); }
    else frame = requestAnimationFrame(tick);
    if (desktop && !reduced) window.addEventListener("pointermove", pointer, { passive: true });
    const resize = new ResizeObserver(setup);
    resize.observe(canvas);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", pointer);
      resize.disconnect();
    };
  }, [progress, wind, reduced, running, desktop]);
  return <canvas ref={canvasRef} className={styles.gust} aria-hidden="true" />;
}
