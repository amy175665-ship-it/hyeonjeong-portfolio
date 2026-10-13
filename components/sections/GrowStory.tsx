"use client";

import { useEffect, useRef } from "react";
import { workPrinciples } from "@/data/workStyle";
import styles from "./GrowStory.module.css";

// GROW. (How I Work, no menu entry: it leads into the design part), after the project panels (approved redesign mockup, artifacts/mockup-living-desert-20261008).
// The section starts two screens early, under the last project panel, which closes into a circle (WorkStory); that
// circle is drawn here in sand grains, split into the three ways of working. Then, tied to the scroll:
// the grains are blown apart → drift → gather into the cactus "H" of the logo (with "GROW.") → spread out as rings
// that leave the screen. The pointer pushes grains aside (mouse). Reduced motion: the circle and its words only.
const SAND = ["#b8864c", "#8a6238", "#d9b07e"];
const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const ramp = (value: number, from: number, to: number) => clamp((value - from) / (to - from));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Points inside the logo's cactus "H" (left stem with a small arm, cross bar, right stem curling left at the foot),
// in a 140 × 120 box.
function cactusPoints() {
  const canvas = document.createElement("canvas");
  canvas.width = 140; canvas.height = 120;
  const g = canvas.getContext("2d");
  if (!g) return [[70, 60]];
  const pill = (x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
  pill(36, 6, 30, 106, 15);
  pill(12, 44, 18, 30, 9);
  pill(20, 62, 22, 10, 5);
  pill(60, 52, 30, 12, 6);
  pill(86, 20, 30, 86, 15);
  g.beginPath(); g.ellipse(92, 104, 22, 9, -0.2, 0, Math.PI * 2); g.fill();
  const data = g.getImageData(0, 0, 140, 120).data, points: number[][] = [];
  for (let y = 0; y < 120; y += 2) for (let x = 0; x < 140; x += 2) if (data[(y * 140 + x) * 4 + 3] > 128) points.push([x, y]);
  return points;
}

export default function GrowStory() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLUListElement>(null);
  const word = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = section.current, box = stage.current, paper = canvas.current, list = labels.current, grow = word.current;
    const g2 = paper?.getContext("2d");
    if (!root || !box || !paper || !list || !grow || !g2) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -9999, y: -9999 };
    let W = 0, H = 0, N = 0, cx = 0, cy = 0, R = 0, diag = 0, phone = false;
    let A = new Float32Array(0), B = A, C = A, X = A, Y = A, delay = A, ring = new Uint8Array(0), angle = A;

    const setup = () => {
      W = box.clientWidth; H = box.clientHeight; phone = W <= 700;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      paper.width = Math.round(W * dpr); paper.height = Math.round(H * dpr);
      g2.setTransform(dpr, 0, 0, dpr, 0, 0);
      N = phone ? 560 : 1000; cx = W / 2; cy = H / 2; R = Math.min(W, H) * (phone ? 0.4 : 0.3); diag = Math.hypot(W, H) / 2;
      box.style.setProperty("--r", `${R.toFixed(1)}px`);
      let seed = 11;
      const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      A = new Float32Array(N * 2); B = new Float32Array(N * 2); C = new Float32Array(N * 2);
      X = new Float32Array(N); Y = new Float32Array(N); delay = new Float32Array(N); angle = new Float32Array(N); ring = new Uint8Array(N);
      const cactus = cactusPoints(), scale = (R * 2) / 140;
      for (let i = 0; i < N; i++) {
        // A: the circle (74% of the grains) and its three dividers (down, upper left, upper right).
        if (i < N * 0.74) {
          const a = (i / (N * 0.74)) * Math.PI * 2, jitter = (random() - 0.5) * 3;
          A[i * 2] = cx + Math.cos(a) * (R + jitter); A[i * 2 + 1] = cy + Math.sin(a) * (R + jitter);
        } else {
          const a = [90, 210, 330][i % 3] * Math.PI / 180, t = random();
          A[i * 2] = cx + Math.cos(a) * R * t; A[i * 2 + 1] = cy + Math.sin(a) * R * t;
        }
        // B: blown across the screen. C: the cactus.
        B[i * 2] = random() * W; B[i * 2 + 1] = random() * H;
        const point = cactus[Math.floor(random() * cactus.length)];
        C[i * 2] = cx + (point[0] - 70) * scale + (random() - 0.5) * 2; C[i * 2 + 1] = cy + (point[1] - 62) * scale + (random() - 0.5) * 2;
        ring[i] = i % 5; angle[i] = random() * Math.PI * 2; delay[i] = random();
        X[i] = A[i * 2]; Y[i] = A[i * 2 + 1];
      }
    };

    const draw = () => {
      g2.clearRect(0, 0, W, H);
      const size = phone ? 1.8 : 2.2;
      SAND.forEach((color, band) => {
        g2.fillStyle = color; g2.beginPath();
        for (let i = band; i < N; i += 3) { g2.moveTo(X[i] + size, Y[i]); g2.arc(X[i], Y[i], size * (band === 2 ? 0.8 : 1), 0, Math.PI * 2); }
        g2.fill();
      });
    };

    // top: the section's top on screen. Until one screen in, the circle sits under the closing project panel; the
    // shape changes run over the rest of the section but its last screen (g 0 → 1).
    const paint = (top: number, time: number) => {
      const height = root.offsetHeight, g = clamp((-top - H) / Math.max(height - 2 * H, 1));
      const into = ramp(-top, H * 0.7, H), off = ramp(g, 0.12, 0.24);
      list.style.opacity = (into * (1 - off)).toFixed(3);
      list.style.filter = off > 0 ? `blur(${(off * 10).toFixed(1)}px)` : "";
      grow.style.opacity = (ramp(g, 0.56, 0.64) * (1 - ramp(g, 0.7, 0.76))).toFixed(3);
      const spread = lerp(R * 0.5, diag * 1.35, easeInOut(ramp(g, 0.74, 1))), t = time / 1000;
      for (let i = 0; i < N; i++) {
        const lag = delay[i] * 0.5;
        const scatter = easeInOut(clamp((ramp(g, 0.18, 0.36) - lag * 0.4) / 0.6));
        const gather = easeInOut(clamp((ramp(g, 0.44, 0.62) - lag * 0.4) / 0.6));
        const rings = easeInOut(clamp((ramp(g, 0.68, 0.78) - lag * 0.3) / 0.7));
        const bx = B[i * 2] + Math.sin(t * 0.6 + i) * 10, by = B[i * 2 + 1] + Math.cos(t * 0.5 + i * 1.3) * 8;
        let tx = lerp(A[i * 2], bx, scatter), ty = lerp(A[i * 2 + 1], by, scatter);
        tx = lerp(tx, C[i * 2], gather); ty = lerp(ty, C[i * 2 + 1], gather);
        const r = spread * (0.5 + ring[i] * 0.16) + Math.sin(t + i) * 2, a = angle[i] + t * 0.05 * (ring[i] % 2 ? 1 : -1);
        tx = lerp(tx, cx + Math.cos(a) * r, rings); ty = lerp(ty, cy + Math.sin(a) * r, rings);
        const dx = tx - pointer.x, dy = ty - pointer.y, d = Math.hypot(dx, dy);
        if (d < 90 && d > 0.01) { const push = (1 - d / 90) * 26; tx += (dx / d) * push; ty += (dy / d) * push; }
        X[i] += (tx - X[i]) * 0.14; Y[i] += (ty - Y[i]) * 0.14;
      }
      draw();
    };

    setup();
    if (still) {
      draw();
      list.style.opacity = "1";
      const resize = () => { setup(); draw(); };
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }

    // Grains ease toward their targets every frame, so the loop runs while the section is near the screen and stops
    // otherwise; scrolling restarts it.
    let frame = 0;
    const loop = (time: number) => {
      const top = root.getBoundingClientRect().top;
      if (top > window.innerHeight * 1.5 || top + root.offsetHeight < -window.innerHeight * 0.5) { frame = 0; return; }
      paint(top, time);
      frame = requestAnimationFrame(loop);
    };
    const wake = () => { if (!frame) frame = requestAnimationFrame(loop); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = paper.getBoundingClientRect();
      pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top;
    };
    const leave = () => { pointer.x = -9999; pointer.y = -9999; };
    const resize = () => { setup(); wake(); };
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    wake();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <section ref={section} aria-labelledby="grow-title" className={styles.section}>
      <div ref={stage} className={styles.stage}>
        <h2 id="grow-title" className="sr-only">How I Work</h2>
        <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
        <ul ref={labels} className={styles.labels}>
          {workPrinciples.map(item => <li key={item.en}>{item.name}<small lang="en">{item.en}</small></li>)}
        </ul>
        <p ref={word} className={styles.word} aria-hidden="true" lang="en">GROW<b>.</b></p>
      </div>
    </section>
  );
}
