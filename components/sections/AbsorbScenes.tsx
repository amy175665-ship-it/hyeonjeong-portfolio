"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { profile } from "@/data/profile";
import styles from "./AbsorbScenes.module.css";

// ABSORB. — two pinned scenes after the about page (approved redesign mockup, artifacts/mockup-living-desert-20261008).
// 1. Portrait: the profile photo drawn as sand grains (dot size from the photo's darkness, four sand colours). Tied to
//    the scroll, the grains blow in and settle into the face, the big "ABSORB." rises, then the grains blow off to the
//    right. The mouse pushes grains aside.
// 2. Statement: the about sentence in large type; word by word it soaks from pale sand to ink, then the highlighter
//    strokes in under the marked phrase (CSS from --p, set here).
// Both repeat what the about page already says, so they are hidden from screen readers. Reduced motion: the settled
// portrait and the inked sentence, one screen each.
const SAND = ["#eadbc2", "#d9b07e", "#b8864c", "#8a6238"];
const WORD = "ABSORB";
const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const ramp = (value: number, from: number, to: number) => clamp((value - from) / (to - from));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// The sentence as words, each flagged when it belongs to the highlighted phrase.
const markWords = new Set((profile.statement.mark ?? "").split(/\s+/).filter(Boolean));
const words = profile.statement.lines.join(" ").split(/\s+/).map(text => ({ text, mark: markWords.has(text) }));

export default function AbsorbScenes() {
  const portrait = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const statement = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = portrait.current, box = stage.current, paper = canvas.current, big = word.current, sentence = statement.current;
    const g = paper?.getContext("2d");
    if (!root || !box || !paper || !big || !sentence || !g || !profile.photo) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chars = Array.from(big.children) as HTMLElement[];
    const pointer = { x: -9999, y: -9999 };
    let lum: Uint8ClampedArray | null = null, lumW = 0, lumH = 0, ratio = 0.73;
    let W = 0, H = 0, sp = 10, cols = 0, rows = 0, phone = false;
    let ox = new Float32Array(0), oy = ox, scatterX = ox, scatterY = ox, lag = ox, size = ox, band = new Uint8Array(0);
    let frame = 0, alive = true;

    // Lightness (0..1) of the photo at a point given in photo-relative coordinates.
    const lightAt = (u: number, v: number) => {
      if (!lum || u < 0 || u > 1 || v < 0 || v > 1) return 0.97;
      const x = Math.min(lumW - 1, (u * lumW) | 0), y = Math.min(lumH - 1, (v * lumH) | 0), i = (y * lumW + x) * 4;
      return (lum[i] * 0.3 + lum[i + 1] * 0.59 + lum[i + 2] * 0.11) / 255;
    };

    // Grid of grains over the stage: the portrait is fitted to the stage height, kept to the right on wide screens
    // (room for the word on the left) and centred (cropped at the sides) on narrow ones.
    const setup = () => {
      W = box.clientWidth; H = box.clientHeight; phone = W <= 700;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      paper.width = Math.round(W * dpr); paper.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      sp = phone ? 7 : W > 900 ? 10 : 8;
      cols = Math.ceil(W / sp) + 1; rows = Math.ceil(H / sp) + 1;
      const n = cols * rows, sw = H * ratio, x0 = sw >= W ? (W - sw) / 2 : (W - sw) * 0.9;
      ox = new Float32Array(n); oy = new Float32Array(n); scatterX = new Float32Array(n); scatterY = new Float32Array(n);
      lag = new Float32Array(n); size = new Float32Array(n); band = new Uint8Array(n);
      let seed = 3;
      const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const k = j * cols + i, x = i * sp + (j % 2 ? sp / 2 : 0), y = j * sp;
        const dark = Math.pow(1 - lightAt((x - x0) / sw, y / H), 1.15);
        size[k] = 0.45 + dark * sp * 0.52;
        band[k] = dark > 0.62 ? 3 : dark > 0.36 ? 2 : dark > 0.14 ? 1 : 0;
        // Blown in from the left and below; the left side settles first.
        scatterX[k] = -(0.3 + random() * 0.9) * W; scatterY[k] = (random() - 0.3) * H * 0.8;
        lag[k] = (x / W) * 0.6 + random() * 0.4;
      }
    };

    // p: the pinned portrait scene, 0 → 1.
    const paint = (p: number) => {
      const paths = SAND.map(() => new Path2D());
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        let x = i * sp + (j % 2 ? sp / 2 : 0), y = j * sp;
        if (!still) {
          const come = easeInOut(clamp((ramp(p, 0, 0.42) - lag[k] * 0.4) / 0.6));
          const go = easeInOut(clamp((ramp(p, 0.8, 1) - (1 - lag[k]) * 0.3) / 0.7));
          x += scatterX[k] * (1 - come) + (W * 0.9 + lag[k] * W * 0.5) * go;
          y += scatterY[k] * (1 - come) - lag[k] * H * 0.3 * go;
          // The pointer pushes grains aside; they ease back.
          let tx = 0, ty = 0;
          const dx = x - pointer.x, dy = y - pointer.y, d = Math.hypot(dx, dy), reach = phone ? 70 : 110;
          if (d < reach && d > 0.01) { const push = Math.pow(1 - d / reach, 2) * (phone ? 22 : 34); tx = (dx / d) * push; ty = (dy / d) * push; }
          ox[k] += (tx - ox[k]) * 0.16; oy[k] += (ty - oy[k]) * 0.16;
          x += ox[k]; y += oy[k];
        }
        if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
        const r = size[k];
        paths[band[k]].moveTo(x + r, y); paths[band[k]].arc(x, y, r, 0, Math.PI * 2);
      }
      g.clearRect(0, 0, W, H);
      paths.forEach((path, i) => { g.fillStyle = SAND[i]; g.fill(path); });
      if (still) return;
      chars.forEach((char, i) => {
        const k = easeOut(ramp(p, 0.4 + i * 0.03, 0.6 + i * 0.03)), leave = ramp(p, 0.85, 1);
        char.style.transform = `translateY(${((1 - k) * 105).toFixed(1)}%)`;
        char.style.opacity = (k > 0 ? 1 - leave : 0).toFixed(3);
      });
    };

    const progress = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect(), height = element.offsetHeight - H;
      return { top: rect.top, bottom: rect.bottom, p: clamp(-rect.top / Math.max(height, 1)) };
    };
    const loop = () => {
      frame = 0;
      const shot = progress(root), text = progress(sentence);
      sentence.style.setProperty("--p", text.p.toFixed(4));
      // Grains ease toward their places every frame, so this keeps going while the portrait is near the screen.
      if (shot.top < window.innerHeight * 1.5 && shot.bottom > -window.innerHeight * 0.5) {
        paint(shot.p);
        frame = requestAnimationFrame(loop);
      }
    };
    const wake = () => { if (!frame && alive) frame = requestAnimationFrame(loop); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = paper.getBoundingClientRect();
      pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top;
    };

    // The photo (already loaded by the about page) is read once, small, for its lightness.
    const image = new Image();
    image.onload = () => {
      if (!alive) return;
      lumW = 160; lumH = Math.round(160 * image.naturalHeight / image.naturalWidth); ratio = image.naturalWidth / image.naturalHeight;
      const sample = document.createElement("canvas");
      sample.width = lumW; sample.height = lumH;
      const sg = sample.getContext("2d");
      if (!sg) return;
      sg.drawImage(image, 0, 0, lumW, lumH);
      lum = sg.getImageData(0, 0, lumW, lumH).data;
      setup();
      if (still) paint(1); else wake();
    };
    image.src = profile.photo;

    const resize = () => { setup(); if (still) paint(1); else wake(); };
    window.addEventListener("resize", resize);
    if (!still) {
      window.addEventListener("scroll", wake, { passive: true });
      window.addEventListener("pointermove", move, { passive: true });
    }
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <div aria-hidden="true">
      <section ref={portrait} className={styles.portrait}>
        <div ref={stage} className={styles.stage}>
          <canvas ref={canvas} className={styles.canvas} />
          <p ref={word} className={styles.word} lang="en">
            {[...WORD].map((char, i) => <span key={i}>{char}</span>)}<span className={styles.dot}>.</span>
          </p>
        </div>
      </section>
      <section ref={statement} className={styles.statement} style={{ "--n": words.length } as CSSProperties}>
        <div className={styles.stage}>
          <p className={styles.sentence}>
            {/* Inside the marked phrase the space goes into the word (a no-break space), so the highlighter runs on. */}
            {words.map((item, i) => {
              const joined = item.mark && words[i + 1]?.mark;
              return <span key={i}>{i > 0 && !(item.mark && words[i - 1].mark) && " "}<span className={item.mark ? `${styles.w} ${styles.mark}` : styles.w} style={{ "--i": i } as CSSProperties}>{item.text}{joined && " "}</span></span>;
            })}
          </p>
        </div>
      </section>
    </div>
  );
}
