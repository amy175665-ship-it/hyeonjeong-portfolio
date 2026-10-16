"use client";

import { useEffect, useRef } from "react";
import DesignStory, { createOrbit } from "@/components/sections/DesignStory";
import { onScrollFrame } from "@/components/motion/scrollFrame";
import { styleWriter } from "@/components/motion/styleWriter";
import type { DesignItem } from "@/data/design";
import { workPrinciples } from "@/data/workStyle";
import styles from "./GrowStory.module.css";

// GROW. (the DESIGN tab: the sand circle leads into the design works), after the project panels (approved redesign mockup, artifacts/mockup-living-desert-20261008).
// The section starts two screens early, under the last project panel, which closes into a circle (WorkStory); that
// circle is drawn here in sand grains, split into the three ways of working. Then, tied to the scroll:
// the grains are blown apart → drift → gather into the cactus "H" of the logo (with "GROW.") → spread out as five rings
// that settle as circles fitting the screen under the title bar and stay there: the design part (DesignStory) puts the
// works on three of them as planets (user, 2026-10-14: the works show up on these rings). The pointer pushes grains
// aside (mouse). Reduced motion: the circle and its words, then (one screen on) the rings with the works, no movement.
const SAND = ["#b8864c", "#8a6238", "#d9b07e"];
// Held rings (k = 0..4): circles (user, 2026-10-14) as a share of the smaller of the width and the height under the
// title bar, the gaps widening outwards; the outer two run past the screen edges. The works ride on the inner three.
const RING = [0.3, 0.4, 0.5, 0.64, 0.8];
const ORBIT_RINGS = [0, 1, 2];
// Leaving (user, 2026-10-14): scrolling on after the hold, each ring grows (the outer ones faster, so the gaps open up)
// and the grains and works fade, before the contact part comes in.
const growth = (k: number, exit: number) => 1 + exit * (0.9 + 0.45 * k);
// g where the rings have grown apart and faded out (the end of the pinned stage); past it nothing is left to draw.
const END = 1.43;
const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const ramp = (value: number, from: number, to: number) =>
  clamp((value - from) / (to - from));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Points inside the logo's cactus "H" (left stem with a small arm, cross bar, right stem curling left at the foot),
// in a 140 × 120 box.
function cactusPoints() {
  const canvas = document.createElement("canvas");
  canvas.width = 140;
  canvas.height = 120;
  const g = canvas.getContext("2d");
  if (!g) return [[70, 60]];
  const pill = (x: number, y: number, w: number, h: number, r: number) => {
    g.beginPath();
    g.roundRect(x, y, w, h, r);
    g.fill();
  };
  pill(36, 6, 30, 106, 15);
  pill(12, 44, 18, 30, 9);
  pill(20, 62, 22, 10, 5);
  pill(60, 52, 30, 12, 6);
  pill(86, 20, 30, 86, 15);
  g.beginPath();
  g.ellipse(92, 104, 22, 9, -0.2, 0, Math.PI * 2);
  g.fill();
  const data = g.getImageData(0, 0, 140, 120).data,
    points: number[][] = [];
  for (let y = 0; y < 120; y += 2)
    for (let x = 0; x < 140; x += 2)
      if (data[(y * 140 + x) * 4 + 3] > 128) points.push([x, y]);
  return points;
}

export default function GrowStory({
  designItems = [],
}: {
  designItems?: DesignItem[];
}) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLUListElement>(null);
  const word = useRef<HTMLParagraphElement>(null);
  // The held rings and how far the works are in, shared with DesignStory.
  const orbit = useRef(createOrbit()).current;

  useEffect(() => {
    const root = section.current,
      box = stage.current,
      paper = canvas.current,
      list = labels.current,
      grow = word.current;
    const g2 = paper?.getContext("2d");
    if (!root || !box || !paper || !list || !grow || !g2) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -9999, y: -9999 };
    let W = 0,
      H = 0,
      N = 0,
      cx = 0,
      cy = 0,
      R = 0,
      phone = false,
      oy = 0;
    let RX = [0, 0, 0, 0, 0],
      RY = RX;
    let A = new Float32Array(0),
      B = A,
      C = A,
      X = A,
      Y = A,
      delay = A,
      ring = new Uint8Array(0),
      angle = A;

    const setup = () => {
      W = box.clientWidth;
      H = box.clientHeight;
      phone = W <= 700;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      paper.width = Math.round(W * dpr);
      paper.height = Math.round(H * dpr);
      g2.setTransform(dpr, 0, 0, dpr, 0, 0);
      N = phone ? 560 : 1000;
      cx = W / 2;
      cy = H / 2;
      R = Math.min(W, H) * (phone ? 0.4 : 0.3);
      // The held rings sit in the part of the screen the title bar (or floating header) does not cover.
      const chrome =
          parseFloat(getComputedStyle(box).getPropertyValue("--chrome")) || 0,
        below = H - chrome;
      oy = chrome + below / 2;
      // Phones: a little narrower, so the planets on the outer ring stay inside the screen edges.
      const fit = Math.min(W * (phone ? 0.86 : 1), below);
      RX = RING.map((share) => share * fit);
      RY = RX;
      orbit.cx = cx;
      orbit.cy = oy;
      orbit.rx = ORBIT_RINGS.map((k) => RX[k]);
      orbit.ry = ORBIT_RINGS.map((k) => RY[k]);
      box.style.setProperty("--r", `${R.toFixed(1)}px`);
      let seed = 11;
      const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      A = new Float32Array(N * 2);
      B = new Float32Array(N * 2);
      C = new Float32Array(N * 2);
      X = new Float32Array(N);
      Y = new Float32Array(N);
      delay = new Float32Array(N);
      angle = new Float32Array(N);
      ring = new Uint8Array(N);
      const cactus = cactusPoints(),
        scale = (R * 2) / 140;
      for (let i = 0; i < N; i++) {
        // A: the circle (74% of the grains) and its three dividers (down, upper left, upper right).
        if (i < N * 0.74) {
          const a = (i / (N * 0.74)) * Math.PI * 2,
            jitter = (random() - 0.5) * 3;
          A[i * 2] = cx + Math.cos(a) * (R + jitter);
          A[i * 2 + 1] = cy + Math.sin(a) * (R + jitter);
        } else {
          const a = ([90, 210, 330][i % 3] * Math.PI) / 180,
            t = random();
          A[i * 2] = cx + Math.cos(a) * R * t;
          A[i * 2 + 1] = cy + Math.sin(a) * R * t;
        }
        // B: blown across the screen. C: the cactus.
        B[i * 2] = random() * W;
        B[i * 2 + 1] = random() * H;
        const point = cactus[Math.floor(random() * cactus.length)];
        C[i * 2] = cx + (point[0] - 70) * scale + (random() - 0.5) * 2;
        C[i * 2 + 1] = cy + (point[1] - 62) * scale + (random() - 0.5) * 2;
        ring[i] = i % 5;
        angle[i] = random() * Math.PI * 2;
        delay[i] = random();
        X[i] = A[i * 2];
        Y[i] = A[i * 2 + 1];
      }
    };

    const draw = () => {
      g2.clearRect(0, 0, W, H);
      const size = phone ? 1.8 : 2.2;
      SAND.forEach((color, band) => {
        g2.fillStyle = color;
        g2.beginPath();
        for (let i = band; i < N; i += 3) {
          g2.moveTo(X[i] + size, Y[i]);
          g2.arc(X[i], Y[i], size * (band === 2 ? 0.8 : 1), 0, Math.PI * 2);
        }
        g2.fill();
      });
    };

    // Where a grain sits on its ring: the small circle the rings form at (`hold` 0), its held circle (`hold` 1), grown
    // as it leaves (`exit` 0 → 1).
    const onRing = (i: number, hold: number, t: number, exit: number) => {
      const k = ring[i],
        circle = R * (0.25 + 0.08 * k),
        wobble = Math.sin(t + i) * 2,
        grow = growth(k, exit);
      const a = angle[i] + t * 0.05 * (k % 2 ? 1 : -1);
      return [
        cx + Math.cos(a) * (lerp(circle, RX[k], hold) * grow + wobble),
        lerp(cy, oy, hold) +
          Math.sin(a) * (lerp(circle, RY[k], hold) * grow + wobble),
      ];
    };
    let fade = "";
    const put = styleWriter(); // writes only changed values (see styleWriter)

    // top: the section's top on screen. Until one screen in, the circle sits under the closing project panel; the
    // shape changes run over the next three screens (g 0 → 1), the rings hold with the works on them (g 0.85 → 1.1) and
    // then grow apart and fade (g 1.1 → END, the end of the pinned stage).
    const paint = (top: number, time: number) => {
      const g = Math.max((-top - H) / (3 * H), 0);
      const into = ramp(-top, H * 0.7, H),
        off = ramp(g, 0.12, 0.24);
      put(list, "opacity", (into * (1 - off)).toFixed(3));
      put(list, "filter", off > 0 ? `blur(${(off * 10).toFixed(1)}px)` : "");
      put(
        grow,
        "opacity",
        (ramp(g, 0.46, 0.54) * (1 - ramp(g, 0.6, 0.66))).toFixed(3),
      );
      const hold = easeInOut(ramp(g, 0.64, 0.78)),
        exit = easeInOut(ramp(g, 1.1, END)),
        t = time / 1000;
      orbit.presence = ramp(g, 0.76, 0.85) * (1 - ramp(exit, 0, 0.55));
      orbit.active = true;
      orbit.rx = ORBIT_RINGS.map((k) => RX[k] * growth(k, exit));
      orbit.ry = ORBIT_RINGS.map((k) => RY[k] * growth(k, exit));
      orbit.wake();
      const opacity = (1 - ramp(exit, 0.45, 1)).toFixed(3);
      if (opacity !== fade) {
        fade = opacity;
        paper.style.opacity = opacity;
      }
      for (let i = 0; i < N; i++) {
        const lag = delay[i] * 0.5;
        const rings = easeInOut(clamp((ramp(g, 0.58, 0.68) - lag * 0.3) / 0.7));
        let tx = 0,
          ty = 0;
        // Once a grain is on its ring (rings 1) the loose and gathered places no longer count, so they are skipped;
        // before the rings form (rings 0) its ring place is skipped.
        if (rings < 1) {
          const scatter = easeInOut(
            clamp((ramp(g, 0.18, 0.36) - lag * 0.4) / 0.6),
          );
          // The gathering starts as the scattering ends (2026-10-14, user: shorter drift of loose grains).
          const gather = easeInOut(
            clamp((ramp(g, 0.34, 0.52) - lag * 0.4) / 0.6),
          );
          const bx = B[i * 2] + Math.sin(t * 0.6 + i) * 10,
            by = B[i * 2 + 1] + Math.cos(t * 0.5 + i * 1.3) * 8;
          tx = lerp(A[i * 2], bx, scatter);
          ty = lerp(A[i * 2 + 1], by, scatter);
          tx = lerp(tx, C[i * 2], gather);
          ty = lerp(ty, C[i * 2 + 1], gather);
        }
        if (rings > 0) {
          const [rx, ry] = onRing(i, hold, t, exit);
          tx = lerp(tx, rx, rings);
          ty = lerp(ty, ry, rings);
        }
        const dx = tx - pointer.x,
          dy = ty - pointer.y,
          d = Math.hypot(dx, dy);
        if (d < 90 && d > 0.01) {
          const push = (1 - d / 90) * 26;
          tx += (dx / d) * push;
          ty += (dy / d) * push;
        }
        X[i] += (tx - X[i]) * 0.14;
        Y[i] += (ty - Y[i]) * 0.14;
      }
      draw();
    };

    setup();
    if (still) {
      // No movement: the circle and its words, and from one screen on the held rings with the works, each at once.
      let held: boolean | null = null,
        stillTop = 0;
      const show = (rings: boolean) => {
        if (rings === held) return;
        held = rings;
        for (let i = 0; i < N; i++) {
          const [rx, ry] = rings
            ? onRing(i, 1, 0, 0)
            : [A[i * 2], A[i * 2 + 1]];
          X[i] = rx;
          Y[i] = ry;
        }
        list.style.opacity = rings ? "0" : "1";
        orbit.presence = rings ? 1 : 0;
        orbit.active = true;
        orbit.wake();
        draw();
      };
      const offStill = onScrollFrame({
        read: () => {
          stillTop = root.getBoundingClientRect().top;
        },
        write: () => show(-stillTop > H * 0.6),
      });
      show(-root.getBoundingClientRect().top > H * 0.6);
      const resize = () => {
        setup();
        held = null;
        show(-root.getBoundingClientRect().top > H * 0.6);
      };
      window.addEventListener("resize", resize);
      return () => {
        offStill();
        window.removeEventListener("resize", resize);
      };
    }

    // Grains ease toward their targets every frame, so the loop runs while the section is near the screen and stops
    // otherwise; scrolling restarts it. The section's place is read in the shared scroll pass (scrollFrame), so the
    // loop itself only draws and never makes the browser lay the page out mid-frame.
    let frame = 0,
      top = 0,
      height = 0,
      faded = false;
    // Far from the screen the works' layer stops too.
    const rest = () => {
      orbit.active = false;
      orbit.presence = 0;
      orbit.wake();
    };
    const measure = () => {
      top = root.getBoundingClientRect().top;
      height = root.offsetHeight;
    };
    const loop = (time: number) => {
      if (
        top > window.innerHeight * 1.5 ||
        top + height < -window.innerHeight * 0.5
      ) {
        frame = 0;
        rest();
        return;
      }
      // Past the end (the contact part overlaps this section) the rings have faded out: one last paint leaves them
      // invisible, then the loop rests until the page scrolls back up.
      if (-top - H >= 3 * H * END) {
        if (!faded) {
          paint(top, time);
          rest();
          faded = true;
        }
        frame = 0;
        return;
      }
      faded = false;
      paint(top, time);
      frame = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = paper.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const leave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const resize = () => {
      setup();
      measure();
      wake();
    };
    const offScroll = onScrollFrame({ read: measure, write: wake });
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    measure();
    wake();
    return () => {
      cancelAnimationFrame(frame);
      offScroll();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <section
      ref={section}
      aria-labelledby="grow-title"
      className={styles.section}
    >
      {/* Menu target (#design): the held rings with the works on them. */}
      <span
        id="design"
        className={styles.anchor}
        aria-hidden="true"
      />
      <div
        ref={stage}
        className={styles.stage}
      >
        <h2
          id="grow-title"
          className="sr-only"
        >
          Design
        </h2>
        <canvas
          ref={canvas}
          className={styles.canvas}
          aria-hidden="true"
        />
        <ul
          ref={labels}
          className={styles.labels}
        >
          {workPrinciples.map((item) => (
            <li key={item.en}>
              {item.name}
              <small lang="en">{item.en}</small>
            </li>
          ))}
        </ul>
        <p
          ref={word}
          className={styles.word}
          aria-hidden="true"
          lang="en"
        >
          GROW<b>.</b>
        </p>
        <DesignStory
          designItems={designItems}
          orbit={orbit}
        />
      </div>
    </section>
  );
}
