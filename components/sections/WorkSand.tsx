"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  onScrollFrame,
  requestScrollFrame,
} from "@/components/motion/scrollFrame";
import { styleWriter } from "@/components/motion/styleWriter";
import {
  drawImages,
  drawText,
  order,
  randomFrom,
  scan,
} from "@/components/sections/concept/SandHandoff";
import styles from "./WorkStory.module.css";

// About → projects (2026-10-23, user-picked mockup artifacts/about-to-project-sand-20261023/ A "바람"): as the about
// page lets go of its place under the title bar, it breaks into grains of sand from the left that blow off to the upper
// right, and the grains gather, left letters first, into the projects' heading and names on the stage coming up
// (WorkStory's lead-in), where the real words take over.
// The about page is found by [data-sand-source] (AboutCover), the words to form by [data-sand-target] (WorkStory). The
// progress t runs over the scroll from the about page's release (0) to `gatherEnd` stage heights into the projects'
// pinned stage (1), so every grain's place is a function of the scroll and scrolling up plays it backwards. Both sides
// are read from the screen (shared reading in SandHandoff), ahead of time while the about page still holds its place.
// Reduced motion: nothing here (the pages simply scroll).
const SAND = [
  [227, 191, 145],
  [205, 160, 108],
  [184, 134, 76],
  [196, 149, 90],
];
const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const ramp = (value: number, from: number, to: number) =>
  clamp((value - from) / (to - from));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
// Gentle in and out (sine): no sudden speed-up in the middle and no hard stop at the end (2026-10-23, user: as smooth
// as the green circle opening the first project).
const easeSine = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;

// One typed array per property (tens of thousands of grains).
type Grains = {
  width: number;
  height: number;
  count: number;
  sx: Float32Array;
  sy: Float32Array;
  ex: Float32Array;
  ey: Float32Array;
  source: Uint32Array; // colours as written to the canvas (ABGR)
  target: Uint32Array;
  sand: Uint8Array;
  a: Float32Array;
  c: Float32Array;
  d: Float32Array;
};

type Props = {
  root: RefObject<HTMLElement>; // WorkStory's build: holds [data-track], [data-intro] and the targets
  gatherEnd: number; // stage heights into the pinned stage where the words have formed
};

export default function WorkSand({ root, gatherEnd }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = root.current,
      canvas = canvasRef.current,
      context = canvas?.getContext("2d");
    const source = document.querySelector<HTMLElement>("[data-sand-source]"),
      cover = source?.parentElement;
    const intro = box?.querySelector<HTMLElement>("[data-intro]"),
      track = box?.querySelector<HTMLElement>("[data-track]");
    const targets = box
      ? Array.from(box.querySelectorAll<HTMLElement>("[data-sand-target]"))
      : [];
    if (
      !box ||
      !canvas ||
      !context ||
      !source ||
      !cover ||
      !intro ||
      !track ||
      !targets.length ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let grains: Grains | null = null,
      frame: ImageData | null = null,
      drawn = -1,
      idle = 0;
    // Layout read once per frame (see scrollFrame): t, the screen, how far the about page has moved up from its place
    // (shift) and where the projects' stage is (stageTop, 0 once pinned).
    let view = { t: 0, width: 0, height: 0, shift: 0, stageTop: 0 };

    // Reads both sides as they will be: the about page in its place under the title bar (its sticky top), the words on
    // the stage pinned at the top of the screen. The about page may already be hidden (visibility) by the time this
    // runs, so it is shown for the read.
    const build = (width: number, height: number) => {
      const place = parseFloat(getComputedStyle(source).top) || 0,
        fromShift = place - source.getBoundingClientRect().top,
        toShift = -intro.getBoundingClientRect().top;
      const hidden = source.style.visibility;
      source.style.visibility = "";
      const from = scan(
        width,
        height,
        (ctx) => {
          drawImages(ctx, source, width, height, fromShift);
          drawText(ctx, source, fromShift);
        },
        true,
      );
      source.style.visibility = hidden;
      const to = scan(
        width,
        height,
        (ctx) => targets.forEach((element) => drawText(ctx, element, toShift)),
        true,
      );
      if (!from.length || !to.length) return null;
      // Paired left to right (as in the opening's hand-off) so the grains sweep across instead of criss-crossing. Large
      // screens keep about 30,000 grains, phones 10,000.
      const a = order(from, randomFrom(11)),
        b = order(to, randomFrom(7));
      const count = Math.min(a.length, width > 900 ? 30000 : 10000),
        random = randomFrom(5);
      const g: Grains = {
        width,
        height,
        count,
        sx: new Float32Array(count),
        sy: new Float32Array(count),
        ex: new Float32Array(count),
        ey: new Float32Array(count),
        source: new Uint32Array(count),
        target: new Uint32Array(count),
        sand: new Uint8Array(count),
        a: new Float32Array(count),
        c: new Float32Array(count),
        d: new Float32Array(count),
      };
      const pack = (r: number, gr: number, bl: number) =>
        ((255 << 24) | (bl << 16) | (gr << 8) | r) >>> 0;
      for (let n = 0; n < count; n++) {
        const s = a[Math.floor((n * a.length) / count)],
          e = b[Math.floor((n * b.length) / count)];
        g.sx[n] = s[0];
        g.sy[n] = s[1];
        g.ex[n] = e[0];
        g.ey[n] = e[1];
        g.source[n] = pack(s[2], s[3], s[4]);
        g.target[n] = pack(e[2], e[3], e[4]);
        g.sand[n] = Math.floor(random() * SAND.length);
        g.a[n] = random();
        g.c[n] = random();
        g.d[n] = random();
      }
      canvas.width = width;
      canvas.height = height;
      frame = context.createImageData(width, height);
      return g;
    };

    const fresh = (width: number, height: number) =>
      grains && grains.width === width && grains.height === height;

    // Ahead of time: once the about page is close to letting go, read in a quiet moment.
    const prepare = () => {
      if (idle || fresh(view.width, view.height)) return;
      const run = () => {
        idle = 0;
        if (!fresh(window.innerWidth, window.innerHeight))
          grains = build(window.innerWidth, window.innerHeight);
      };
      idle =
        typeof window.requestIdleCallback === "function"
          ? window.requestIdleCallback(run, { timeout: 1000 })
          : window.setTimeout(run, 100);
    };

    const read = () => {
      const width = window.innerWidth,
        height = window.innerHeight;
      const place = parseFloat(getComputedStyle(source).top) || 0,
        pinnedBottom = place + source.offsetHeight;
      const coverBottom = cover.getBoundingClientRect().bottom,
        stageTop = intro.getBoundingClientRect().top,
        trackTop = track.getBoundingClientRect().top,
        stageHeight = intro.offsetHeight;
      // px scrolled since the about page let go (negative before), and from then to the words formed.
      const passed = pinnedBottom - coverBottom,
        span = trackTop + gatherEnd * stageHeight + passed;
      view = {
        t: span > 0 ? passed / span : 1,
        width,
        height,
        shift: Math.min(source.getBoundingClientRect().top - place, 0),
        stageTop,
      };
      // Not read ahead (resized, or a jump straight into the middle): read now.
      if (view.t > 0 && view.t < 1 && !fresh(width, height))
        grains = build(width, height);
    };

    const draw = (t: number) => {
      const g = grains;
      if (!g || !frame) return;
      const { width, height } = g,
        { shift, stageTop } = view;
      const buffer = new Uint32Array(frame.data.buffer);
      buffer.fill(0);
      for (let n = 0; n < g.count; n++) {
        const sx = g.sx[n],
          ex = g.ex[n];
        // Scatter: left first, the grain leaves the page (which is still moving up) and blows to the upper right.
        const u = easeSine(
          ramp(t, (sx / width) * 0.18, 0.34 + (sx / width) * 0.18),
        );
        const mx = sx + u * width * (0.25 + 0.45 * g.a[n]);
        const my =
          g.sy[n] +
          shift * (1 - u) -
          u * height * (0.15 + 0.35 * g.c[n]) +
          Math.sin(g.d[n] * 20 + u * 6) * 30 * u;
        // Gather: left letters first, onto the stage wherever it is (it is still coming up for the early ones).
        const v = easeSine(
          ramp(t, 0.42 + (ex / width) * 0.14, 0.78 + (ex / width) * 0.14),
        );
        // Between the two the cloud keeps drifting slowly right and swaying, so it never stands still.
        const hover = u * (1 - v),
          driftX = hover * t * width * 0.06,
          driftY = hover * Math.sin(g.d[n] * 40 + t * 14) * 10;
        const x = mix(mx + driftX, ex, v) | 0,
          y =
            (mix(my + driftY, g.ey[n] + stageTop, v) +
              Math.sin(g.d[n] * 30 + v * 9) * 40 * v * (1 - v)) |
            0;
        if (x < 0 || y < 0 || x >= width - 1 || y >= height - 1) continue;
        // Colour: the page's own → sand while blowing → the words' ink as it lands.
        const toSand = clamp(u * 2.2),
          toInk = ramp(v, 0.55, 1),
          s = SAND[g.sand[n]],
          from = g.source[n],
          to = g.target[n];
        const r = mix(mix(from & 255, s[0], toSand), to & 255, toInk),
          gr = mix(mix((from >> 8) & 255, s[1], toSand), (to >> 8) & 255, toInk),
          bl = mix(mix((from >> 16) & 255, s[2], toSand), (to >> 16) & 255, toInk);
        const color = ((255 << 24) | (bl << 16) | (gr << 8) | r) >>> 0,
          i = y * width + x;
        buffer[i] =
          buffer[i + 1] =
          buffer[i + width] =
          buffer[i + width + 1] =
            color;
      }
      context.putImageData(frame, 0, 0);
    };

    const put = styleWriter();
    const write = () => {
      const { t } = view,
        active = t > 0 && t < 1;
      if (t > -0.25 && t <= 0) prepare();
      put(source, "visibility", active ? "hidden" : "");
      // The real words come in as the last grains land; before the hand-over they stay hidden (they are off screen).
      const words = t >= 1 ? "" : ramp(t, 0.9, 0.97).toFixed(3);
      targets.forEach((element) => put(element, "opacity", words));
      put(canvas, "opacity", active ? (1 - ramp(t, 0.93, 1)).toFixed(3) : "0");
      if (active && grains) {
        if (t !== drawn) {
          draw(t);
          drawn = t;
        }
      } else if (drawn !== -1) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawn = -1;
      }
    };

    const resize = () => {
      grains = null;
    };
    const offScroll = onScrollFrame({ read, write });
    requestScrollFrame();
    window.addEventListener("resize", resize);
    return () => {
      offScroll();
      window.removeEventListener("resize", resize);
      if (idle) {
        if (typeof window.cancelIdleCallback === "function")
          window.cancelIdleCallback(idle);
        window.clearTimeout(idle);
      }
      source.style.visibility = "";
      targets.forEach((element) => (element.style.opacity = ""));
    };
  }, [root, gatherEnd]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.sand}
      aria-hidden="true"
    />
  );
}
