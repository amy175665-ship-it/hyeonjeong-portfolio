"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import { sceneProgress } from "./scenes";
import styles from "./ConceptScenes.module.css";

// SCENE 4: sand falls from above the stage and settles into the word "GROW." (Canvas 2D), letter by letter.
// Every grain's position is a pure function of scroll progress, so scrolling back lifts it away again.
// Settled grains keep the colors of sand (deeper, toasted tones so the word reads against the bright sky);
// the G and the period keep the GROW. accent.
const COLORS = { accent: "#e9a33a", sand: "#e2b878", settled: ["#a8763f", "#b8864c", "#946233", "#c4955a"] };
const FORM = { start: 0.22, length: 0.3, sweep: 0.55, scatter: 0.25 }; // local SCENE 4 progress
const GAP = { desktop: 3, mobile: 2 }; // px between sampled glyph points

type Grain = { tx: number; ty: number; sx: number; sy: number; drift: number; delay: number; color: string; size: number };

type Props = { progress: MotionValue<number>; desktop: boolean };

export default function PollenGrow({ progress, desktop }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let width = 0, height = 0, grains: Grain[] = [];
    // Sample the word from an offscreen canvas set in the hero's serif.
    const sample = () => {
      const family = getComputedStyle(document.body).getPropertyValue("--font-editorial").trim() || "Georgia";
      const size = Math.min(Math.max(width * 0.11, 84), 168);
      const scratch = document.createElement("canvas");
      scratch.width = Math.ceil(width);
      scratch.height = Math.ceil(height);
      const pen = scratch.getContext("2d");
      if (!pen) return [];
      pen.font = `400 ${size}px ${family}, Georgia, serif`;
      pen.textAlign = "left";
      pen.textBaseline = "alphabetic";
      const word = "GROW.";
      const total = pen.measureText(word).width;
      // Keep in step with .closing (desktop top: 33% + 40px, mobile 30% + 28px) in ConceptScenes.module.css.
      const left = (width - total) / 2, baseline = height * (desktop ? 0.33 : 0.3);
      const firstEnd = left + pen.measureText("G").width, dotStart = left + pen.measureText("GROW").width;
      pen.fillText(word, left, baseline);
      const pixels = pen.getImageData(0, 0, scratch.width, scratch.height).data;
      const gap = desktop ? GAP.desktop : GAP.mobile;
      const points: Grain[] = [];
      for (let y = 0; y < scratch.height; y += gap) {
        for (let x = 0; x < scratch.width; x += gap) {
          if (pixels[(y * scratch.width + x) * 4 + 3] < 128) continue;
          const accent = x < firstEnd || x >= dotStart; // the G and the period carry the accent, like the hero
          // Jitter off the sampling grid so the letters read as loose grains, not a halftone pattern.
          const tx = x + (Math.random() - 0.5) * gap * 1.4, ty = y + (Math.random() - 0.5) * gap * 1.4;
          points.push({
            tx, ty,
            // Starts above the stage, roughly over its spot, and falls nearly straight down.
            sx: tx + (Math.random() - 0.5) * 80, sy: -20 - Math.random() * height * 0.35,
            drift: (Math.random() - 0.5) * 30,
            // Left-to-right sweep (G first, period last) with a little randomness per grain.
            delay: ((tx - left) / total) * FORM.sweep + Math.random() * FORM.scatter,
            color: accent ? COLORS.accent : COLORS.settled[Math.floor(Math.random() * COLORS.settled.length)], size: 1 + Math.random() * 1.2,
          });
        }
      }
      return points;
    };
    const draw = () => {
      context.clearRect(0, 0, width, height);
      const local = sceneProgress(progress.get(), "grow");
      if (local < FORM.start) return;
      for (const grain of grains) {
        const t = Math.min(Math.max((local - FORM.start - grain.delay * FORM.length) / FORM.length, 0), 1);
        if (t <= 0) continue;
        // Falls in, then slows as it settles onto its place; a slight sideways sway on the way down.
        const ease = 1 - Math.pow(1 - t, 3);
        const x = grain.sx + (grain.tx - grain.sx) * ease + Math.sin(ease * Math.PI) * grain.drift;
        const y = grain.sy + (grain.ty - grain.sy) * ease;
        context.globalAlpha = 0.45 + 0.55 * ease;
        context.fillStyle = t < 1 ? COLORS.sand : grain.color;
        context.fillRect(x, y, grain.size, grain.size);
      }
      context.globalAlpha = 1;
    };
    const setup = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      grains = sample();
      draw();
    };
    // Wait for the serif to load so the sampled letters match the hero's typeface.
    document.fonts.ready.then(setup);
    const unsubscribe = progress.on("change", draw);
    const resize = new ResizeObserver(setup);
    resize.observe(canvas);
    return () => { unsubscribe(); resize.disconnect(); };
  }, [progress, desktop]);
  return <canvas ref={canvasRef} className={styles.pollen} aria-hidden="true" />;
}
