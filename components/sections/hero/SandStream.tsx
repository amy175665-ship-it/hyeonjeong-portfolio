"use client";

import { useEffect, useRef } from "react";
import styles from "./SandStream.module.css";

// A broad, granular mass of fine dry sand falling from above ABSORB.'s S into the dunes (Canvas 2D, decorative).
// Each grain sits at curvedPath(y) * its own wind response + its own lateral offset, so the whole mass follows one
// gentle wind-blown curve while the grains stay loose and uneven around it.
const SAND_COLORS = ["#f0cf98", "#e6bd82", "#ddb276", "#d0a165", "#c08f55", "#ae7f4a"];
const ALPHAS = [0.35, 0.55, 0.75, 0.95];
const STREAM = {
  desktop: { count: 10000, fallbackX: 0.08, curve: 1, band: 1 },
  mobile: { count: 2500, fallbackX: 0.08, curve: 0.25, band: 0.5 }, // left edge, clear of the avatar's face
  // Center path: sideways offset (fraction of width) at each height (fraction). Pushed right by the breeze,
  // strongest around BUILD., then easing back left toward the left/center of GROW. before the dunes.
  path: [[0, 0], [0.12, 0.004], [0.25, 0.035], [0.36, 0.09], [0.47, 0.13], [0.6, 0.1], [0.75, 0.06], [1, 0.045]],
  // Total width (px) of the scattered band at each height (fraction).
  band: [[0, 40], [0.18, 75], [0.33, 105], [0.47, 95], [0.7, 120], [1, 130]],
  gravity: 240,
  startLetter: 2, // index among [data-sand-letter]: ABSORB.'s S
  dunes: { desktop: 0.87, mobile: 0.8 }, // matches --sand-crest in Hero.module.css
};

type Grain = {
  y: number; vy: number; terminal: number; lane: number; response: number; phase: number;
  size: number; sink: number; style: number;
};

// Smooth (Catmull-Rom) interpolation through [t, value] points.
function curve(points: number[][], t: number) {
  const clamped = Math.min(Math.max(t, 0), 1);
  let index = 0;
  while (index < points.length - 2 && clamped > points[index + 1][0]) index++;
  const [t1, v1] = points[index], [t2, v2] = points[index + 1];
  const v0 = points[Math.max(index - 1, 0)][1], v3 = points[Math.min(index + 2, points.length - 1)][1];
  const u = (clamped - t1) / (t2 - t1);
  return 0.5 * (2 * v1 + (-v0 + v2) * u + (2 * v0 - 5 * v1 + 4 * v2 - v3) * u * u + (-v0 + 3 * v1 - 3 * v2 + v3) * u * u * u);
}
const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2; // roughly -1..1, center-heavy
// Dense inner core, a medium ring, and sparse grains farther out. Offsets are in half-band units.
function laneOffset() {
  const roll = Math.random();
  if (roll < 0.5) return gauss() * 0.45;
  if (roll < 0.85) return gauss() * 0.9;
  return (Math.random() * 2 - 1) * 1.35;
}

export default function SandStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const wide = matchMedia("(min-width: 1024px)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0, height = 0, startX = 0, grains: Grain[] = [], previous: Grain | null = null;
    let pathRows = new Float32Array(0), bandRows = new Float32Array(0); // per-pixel-row lookups, rebuilt on resize
    let frame = 0, last = 0, time = 0, visible = true;

    const mode = () => (wide.matches ? STREAM.desktop : STREAM.mobile);
    // Reset a grain at the top. Some grains copy the one just respawned, forming small separated clumps.
    const respawn = (grain: Grain, y: number) => {
      const clump = previous && Math.random() < 0.12 ? previous : null;
      grain.y = clump ? clump.y + (Math.random() - 0.5) * 8 : y;
      grain.terminal = clump ? clump.terminal * (0.97 + Math.random() * 0.06) : 105 + Math.random() * 65;
      grain.vy = clump ? clump.vy : 60 + Math.random() * 40;
      grain.lane = clump ? clump.lane + (Math.random() - 0.5) * 0.08 : laneOffset();
      grain.response = clump ? clump.response : 0.85 + Math.random() * 0.3; // how strongly the breeze carries it
      grain.phase = Math.random() * Math.PI * 2;
      grain.sink = Math.random(); // varies where it disappears into the dunes
      previous = grain;
    };
    const make = (style: number): Grain => {
      const large = Math.random() < 0.15;
      const grain: Grain = {
        y: 0, vy: 0, terminal: 0, lane: 0, response: 1, phase: 0, sink: 0, style,
        size: large ? 1.8 + Math.random() * 0.7 : 0.7 + Math.random() * 1.1,
      };
      respawn(grain, 0);
      return grain;
    };
    const xAt = (grain: Grain) => {
      const t = grain.y / height;
      const row = Math.min(Math.max(Math.round(grain.y), 0), pathRows.length - 1);
      const center = startX + pathRows[row] * grain.response;
      const halfBand = bandRows[row];
      // Slow shared breathing plus a small per-grain flutter, so the band never reads as a clean edge.
      const breathing = Math.sin(time * 0.35 + t * 5) * 6 * t + Math.sin(time * 1.3 + grain.phase + t * 12) * 2.5;
      return center + grain.lane * halfBand + breathing;
    };
    const step = (delta: number) => {
      time += delta;
      for (const grain of grains) {
        grain.vy += STREAM.gravity * delta;
        if (grain.vy > grain.terminal) grain.vy += (grain.terminal - grain.vy) * Math.min(1, 3 * delta);
        grain.y += grain.vy * delta;
        if (grain.y > height) respawn(grain, -Math.random() * 30);
      }
    };
    const draw = () => {
      const dunes = height * (wide.matches ? STREAM.dunes.desktop : STREAM.dunes.mobile);
      context.clearRect(0, 0, width, height);
      let style = -1;
      // Grains are sorted by style, so fill colour and alpha change only a few dozen times per frame.
      for (const grain of grains) {
        if (grain.y < -2 || grain.y > dunes - 40 + grain.sink * 90) continue;
        if (grain.style !== style) {
          style = grain.style;
          context.fillStyle = SAND_COLORS[style % SAND_COLORS.length];
          context.globalAlpha = ALPHAS[Math.floor(style / SAND_COLORS.length)];
        }
        context.fillRect(xAt(grain), grain.y, grain.size, grain.size);
      }
      context.globalAlpha = 1;
    };
    // The sand starts above ABSORB.'s S (from GrowthScene, desktop only); otherwise near the left edge.
    const measure = () => {
      const area = canvas.getBoundingClientRect();
      const first = wide.matches ? document.querySelectorAll<HTMLElement>("[data-sand-letter]")[STREAM.startLetter]?.getBoundingClientRect() : null;
      const next = first ? (first.left + first.right) / 2 - area.left : width * mode().fallbackX;
      const changed = Math.abs(next - startX) > 2;
      startX = next;
      return changed;
    };
    // Start in a steady state: grains spread over the whole height at their falling speed.
    const fill = () => {
      const styles = SAND_COLORS.length * ALPHAS.length;
      grains = Array.from({ length: mode().count }, () => make(Math.floor(Math.random() * styles))).sort((a, b) => a.style - b.style);
      previous = null;
      for (const grain of grains) {
        grain.y = Math.random() * height * 1.05 - height * 0.05;
        grain.vy = grain.terminal;
      }
    };
    const setup = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const { curve: strength, band } = mode();
      pathRows = Float32Array.from({ length: Math.ceil(height) + 1 }, (_, row) => curve(STREAM.path, row / height) * width * strength);
      bandRows = Float32Array.from({ length: Math.ceil(height) + 1 }, (_, row) => curve(STREAM.band, row / height) * band / 2);
      measure();
      fill();
    };
    const tick = (now: number) => {
      const delta = Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      // Covered by ConceptScenes' sand: keep the loop alive but skip all work.
      if (canvas.closest("[data-paused]")) { frame = requestAnimationFrame(tick); return; }
      step(delta);
      draw();
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      last = 0;
      // Reduced motion: a single still frame of the stream.
      if (motion.matches || !visible) { draw(); return; }
      frame = requestAnimationFrame(tick);
    };

    setup();
    start();
    // GrowthScene mounts after this and its words float, so re-read the start letter now and then.
    const remeasure = window.setInterval(() => {
      if (measure() && (motion.matches || !visible)) draw();
    }, 1000);
    const resize = new ResizeObserver(() => { setup(); start(); });
    resize.observe(canvas);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start(); });
    observer.observe(canvas);
    const change = () => { setup(); start(); };
    wide.addEventListener("change", change);
    motion.addEventListener("change", change);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(remeasure);
      resize.disconnect();
      observer.disconnect();
      wide.removeEventListener("change", change);
      motion.removeEventListener("change", change);
    };
  }, []);
  return <canvas ref={canvasRef} className={styles.stream} aria-hidden="true" />;
}
