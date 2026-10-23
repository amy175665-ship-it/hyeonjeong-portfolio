"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { order, randomFrom, type Pixel } from "./SandHandoff";
import styles from "./ConceptScenes.module.css";

// The opening cover (2026-10-22, approved mockup: artifacts/mockup-opening-sand-20261022): the hero's words and dunes
// break into grains that blow away to the right, the grains settle back down as the desert dunes on the horizon, and a
// last handful gathers on the spot where the cactus then sprouts. The dune image itself does not move.
// Every grain's position is a function of the cover progress only, so scrolling back up plays it backwards.
export const COVER_SECONDS = 3.2; // the cover is laid out in seconds; the scroll moves through it
// Phases in seconds of the cover.
const T = {
  spread: 0.6, // the gust crosses the screen from left to right in this time
  gather: 1.0,
  gatherSpread: 0.6, // the grains land left first, with the wind
  gatherTime: 1.0,
  sprout: 2.1, // the handful for the cactus spot
  sproutSpread: 0.3,
  sproutTime: 0.6,
  sproutOut: [2.9, 3.05],
  heroOut: [0.1, 1.4],
  settle: [2.7, 3.05],
} as const;
const part = ([from, to]: readonly [number, number]) =>
  [from / COVER_SECONDS, to / COVER_SECONDS] as const;
// The same phases on the cover progress (0..1): the hero (face, sky, sand stream) fades out, the real dune image takes
// over from the grains, and the cactus starts growing as the handful sinks into its spot.
export const COVER_SAND = {
  heroOut: part(T.heroOut),
  settle: part(T.settle),
  play: T.sproutOut[0] / COVER_SECONDS,
};

// One grain per 3×3 px (the dunes cover almost half the screen), drawn as a 3×3 block wherever it is. (Drawing them on
// a third-size canvas instead snapped the flying grains to a visible grid, and saved little.)
const STEP = 3;
const LARGE_SCREEN = 2560 * 1440; // above this many px the step widens to 4 to keep the grain count down
const SPROUT_GRAINS = 1400;
const SPROUT_COLOR = [120, 104, 58];
const SAND = [
  [168, 118, 63],
  [184, 134, 76],
  [148, 98, 51],
  [196, 149, 90],
  [227, 191, 145],
];

// The desert side laid out ahead for one stage size: for every grain, where it lands and how it drifts. The grains
// are kept as one list of numbers per property (not one object per grain): the drawing loop goes through some 55,000
// of them every frame, and reading each property in order from one list is several times quicker.
// The first `dunes` grains land on the dunes, the rest on the cactus spot.
type Plan = {
  width: number;
  height: number;
  count: number;
  dunes: number;
  tx: Float32Array; // where it lands, in stage px
  ty: Float32Array;
  tr: Uint8Array; // the colour there
  tg: Uint8Array;
  tb: Uint8Array;
  tone: Uint8Array; // which sand colour it turns while flying (SAND)
  lag: Float32Array; // a little random part of its start
  vx: Float32Array; // drift: speed, push to the right, sway
  vy: Float32Array;
  ax: Float32Array;
  wobble: Float32Array;
  phase: Float32Array;
  rate: Float32Array;
  gather: Float32Array; // when it heads for its place (s)
};
// The hero side, picked when the cover starts: the pixel every grain starts from.
type Starts = {
  sx: Float32Array;
  sy: Float32Array;
  sr: Uint8Array;
  sg: Uint8Array;
  sb: Uint8Array;
  sa: Uint8Array;
};
// Where things are, in stage coordinates (the canvas covers the stage).
export type CoverScene = {
  stage: HTMLElement;
  dunes: HTMLImageElement;
  left: number; // the dune image box
  width: number;
  height: number;
  rest: number; // the dune image top on the hero and on the desert horizon
  horizon: number;
  words: Element[]; // the hero words (drawn as their text, also while hidden)
  sprout: [x: number, y: number] | null; // where the cactus stands
};

type Props = {
  progress: MotionValue<number>; // the cover, 0 (hero) .. 1 (desert)
  scene: () => CoverScene | null;
  enabled: boolean; // off with reduced motion (the dunes simply cross-fade)
};

export default function CoverSand({ progress, scene, enabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plan = useRef<Plan | null>(null);
  const starts = useRef<Starts | null>(null); // set while the cover is between its ends
  const image = useRef<ImageData | null>(null);
  // The rows the grains covered last frame: only these are cleared and sent to the canvas again (early and late in the
  // cover the grains lie in the lower half).
  const band = useRef({ top: 0, bottom: 0 });

  const clear = () => {
    starts.current = null;
    const canvas = canvasRef.current;
    if (canvas)
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  };

  // The desert side: the dune image where it lies on the horizon.
  const prepare = (place: CoverScene) => {
    const width = place.stage.clientWidth,
      height = place.stage.clientHeight;
    const to = sample(width, height, (ctx) =>
      ctx.drawImage(
        place.dunes,
        place.left,
        place.horizon,
        place.width,
        place.height,
      ),
    );
    return layOut(to, place.sprout, width, height);
  };

  const build = () => {
    const canvas = canvasRef.current,
      place = scene();
    if (!canvas || !place || !place.dunes.complete) return;
    const width = place.stage.clientWidth,
      height = place.stage.clientHeight;
    canvas.width = width;
    canvas.height = height;
    let ready = plan.current;
    if (!ready || ready.width !== width || ready.height !== height)
      ready = plan.current = prepare(place);
    // The hero side is read when the cover starts, as the words drift up and down.
    const origin = place.stage.getBoundingClientRect();
    const from = sample(width, height, (ctx) => {
      ctx.drawImage(
        place.dunes,
        place.left,
        place.rest,
        place.width,
        place.height,
      );
      place.words.forEach((element) => drawWords(ctx, element, origin));
    });
    starts.current = aim(ready, from);
    image.current =
      canvas.getContext("2d")?.createImageData(width, height) ?? null;
    band.current = { top: 0, bottom: 0 };
  };

  // The desert side is laid out ahead in a quiet moment (and again after a resize), so the cover only reads the hero
  // side when it starts.
  useEffect(() => {
    if (!enabled) return;
    let timer = 0,
      idle = 0;
    const cancel = () => {
      window.clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
      timer = 0;
      idle = 0;
    };
    const later = () => {
      cancel();
      const run = () => {
        const place = scene();
        if (!place || starts.current) return;
        if (!place.dunes.complete) {
          place.dunes.addEventListener("load", later, { once: true });
          return;
        }
        const done = plan.current;
        if (
          done &&
          done.width === place.stage.clientWidth &&
          done.height === place.stage.clientHeight
        )
          return;
        plan.current = prepare(place);
      };
      if (typeof window.requestIdleCallback === "function")
        idle = window.requestIdleCallback(run, { timeout: 3000 });
      else timer = window.setTimeout(run, 300);
    };
    const resize = () => {
      cancel();
      timer = window.setTimeout(later, 300);
    };
    later();
    window.addEventListener("resize", resize);
    return () => {
      cancel();
      window.removeEventListener("resize", resize);
    };
  }, [enabled]);

  const draw = (time: number) => {
    const canvas = canvasRef.current,
      p = plan.current,
      s = starts.current,
      frame = image.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !p || !s || !frame || !context) return;
    const width = frame.width,
      height = frame.height,
      step = gridStep(width, height),
      buffer = new Uint32Array(frame.data.buffer),
      last = band.current;
    buffer.fill(0, last.top * width, last.bottom * width);
    let top = height,
      bottom = 0;
    const settle = 1 - smooth(ramp(time, T.settle));
    const sproutOut = 1 - smooth(ramp(time, T.sproutOut));
    for (let n = 0; n < p.count; n++) {
      const dune = n < p.dunes;
      // Where it is on its way to its place (0 not yet .. 1 landed).
      const k = easeInOut(
        Math.min(
          Math.max(
            (time - p.gather[n]) / (dune ? T.gatherTime : T.sproutTime),
            0,
          ),
          1,
        ),
      );
      let x = s.sx[n],
        y = s.sy[n],
        r = s.sr[n],
        g = s.sg[n],
        b = s.sb[n],
        a = s.sa[n];
      // Scatter: a gust from the left (the left side goes first), drifting right and up with a little sway, the colour
      // turning to sand. Skipped before the gust reaches it and once it has landed.
      const ts = time - (x / p.width) * T.spread - p.lag[n];
      if (ts > 0 && k < 1) {
        x += p.vx[n] * ts + 0.5 * p.ax[n] * ts * ts;
        y +=
          p.vy[n] * ts +
          Math.sin(p.phase[n] + ts * p.rate[n]) * p.wobble[n] * Math.min(ts, 1);
        const dust = Math.min(ts / 0.45, 1),
          sand = SAND[p.tone[n]];
        r = mix(r, sand[0], dust);
        g = mix(g, sand[1], dust);
        b = mix(b, sand[2], dust);
        a = mix(a, 235, dust);
      }
      // Gather: eases into its place on the dunes, taking on their colour as it lands.
      if (k > 0) {
        const c = k * k;
        x = mix(x, p.tx[n], k);
        y = mix(y, p.ty[n], k);
        r = mix(r, p.tr[n], c);
        g = mix(g, p.tg[n], c);
        b = mix(b, p.tb[n], c);
        a = mix(a, 255, c);
      }
      // The dune grains hand over to the dune image; the handful sinks into the cactus as it sprouts.
      a *= dune ? settle : sproutOut;
      if (a < 4) continue;
      const px = x | 0,
        py = y | 0;
      if (px < 0 || py < 0 || px > width - step || py > height - step)
        continue;
      if (py < top) top = py;
      if (py + step > bottom) bottom = py + step;
      const color = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
      // One block of step × step pixels, written directly (a call per row cost more than the writes).
      for (let line = 0, i = py * width + px; line < step; line++, i += width) {
        buffer[i] = color;
        buffer[i + 1] = color;
        buffer[i + 2] = color;
        if (step > 3) buffer[i + 3] = color;
      }
    }
    // Sends this frame's rows and last frame's (now cleared) ones.
    const from = Math.min(top, last.top),
      to = Math.max(bottom, last.bottom);
    if (to > from) context.putImageData(frame, 0, 0, 0, from, width, to - from);
    band.current = top < bottom ? { top, bottom } : { top: 0, bottom: 0 };
  };

  useMotionValueEvent(progress, "change", (value) => {
    if (!enabled || value <= 0 || value >= T.settle[1] / COVER_SECONDS) {
      if (starts.current) clear();
      return;
    }
    if (!starts.current) build();
    draw(value * COVER_SECONDS);
  });
  useEffect(() => clear, []);
  return (
    <canvas
      ref={canvasRef}
      className={styles.coverSand}
      aria-hidden="true"
    />
  );
}

const ramp = (value: number, [from, to]: readonly [number, number]) =>
  Math.min(Math.max((value - from) / (to - from), 0), 1);
const smooth = (t: number) => t * t * (3 - 2 * t);
// Cubic ease in and out, multiplied out (Math.pow is slow in the drawing loop).
const easeInOut = (t: number) => {
  if (t < 0.5) return 4 * t * t * t;
  const u = 2 - 2 * t;
  return 1 - (u * u * u) / 2;
};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const gridStep = (width: number, height: number) =>
  width * height > LARGE_SCREEN ? STEP + 1 : STEP;

// Draws onto a scratch canvas a step-th of the stage size (`paint` works in stage px) and returns its visible pixels,
// one per grid cell, at the cell's stage position. Scaling down blends each cell into one colour, with soft edges.
function sample(
  width: number,
  height: number,
  paint: (ctx: CanvasRenderingContext2D) => void,
): Pixel[] {
  const step = gridStep(width, height),
    columns = Math.ceil(width / step),
    rows = Math.ceil(height / step);
  const scratch = document.createElement("canvas");
  scratch.width = columns;
  scratch.height = rows;
  const ctx = scratch.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.imageSmoothingQuality = "high";
  ctx.scale(1 / step, 1 / step);
  try {
    paint(ctx);
  } catch {
    return [];
  }
  const data = ctx.getImageData(0, 0, columns, rows).data;
  const out: Pixel[] = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const i = (row * columns + column) * 4;
      if (data[i + 3] < 40) continue;
      out.push([
        column * step,
        row * step,
        data[i],
        data[i + 1],
        data[i + 2],
        data[i + 3],
      ]);
    }
  }
  return out;
}

// The desert side, laid out ahead: one grain per dune pixel, landing left first, then the handful for the cactus spot,
// which lands last. The hero side is picked by `aim` when the cover starts.
function layOut(
  to: Pixel[],
  sprout: CoverScene["sprout"],
  width: number,
  height: number,
): Plan {
  const random = randomFrom(7);
  const dunes = to.length,
    count = dunes + (dunes && sprout ? SPROUT_GRAINS : 0);
  const p: Plan = {
    width,
    height,
    count,
    dunes,
    tx: new Float32Array(count),
    ty: new Float32Array(count),
    tr: new Uint8Array(count),
    tg: new Uint8Array(count),
    tb: new Uint8Array(count),
    tone: new Uint8Array(count),
    lag: new Float32Array(count),
    vx: new Float32Array(count),
    vy: new Float32Array(count),
    ax: new Float32Array(count),
    wobble: new Float32Array(count),
    phase: new Float32Array(count),
    rate: new Float32Array(count),
    gather: new Float32Array(count),
  };
  const place = (n: number, target: Pixel, gather: number) => {
    p.tx[n] = target[0];
    p.ty[n] = target[1];
    p.tr[n] = target[2];
    p.tg[n] = target[3];
    p.tb[n] = target[4];
    p.tone[n] = Math.floor(random() * SAND.length);
    p.lag[n] = random() * 0.2;
    p.vx[n] = 90 + random() * 220;
    p.vy[n] = -30 - random() * 130;
    p.ax[n] = 60 + random() * 160;
    p.wobble[n] = 6 + random() * 22;
    p.phase[n] = random() * 6.28;
    p.rate[n] = 2 + random() * 3;
    p.gather[n] = gather;
  };
  order(to, random).forEach((target, n) =>
    place(
      n,
      target,
      T.gather + (target[0] / width) * T.gatherSpread + random() * 0.25,
    ),
  );
  for (let n = dunes; n < count && sprout; n++) {
    const angle = random() * 6.28,
      radius = Math.sqrt(random()) * 14;
    place(
      n,
      [
        sprout[0] + Math.cos(angle) * radius * 1.6,
        sprout[1] + Math.sin(angle) * radius * 0.5,
        SPROUT_COLOR[0],
        SPROUT_COLOR[1],
        SPROUT_COLOR[2],
        255,
      ],
      T.sprout + random() * T.sproutSpread,
    );
  }
  return p;
}

// The hero side, when the cover starts: its pixels spread over the dune grains in the same left to right order (the
// handful for the cactus spot starts anywhere). Nothing to read (an empty hero) leaves every grain transparent.
function aim(p: Plan, from: Pixel[]): Starts {
  const s: Starts = {
    sx: new Float32Array(p.count),
    sy: new Float32Array(p.count),
    sr: new Uint8Array(p.count),
    sg: new Uint8Array(p.count),
    sb: new Uint8Array(p.count),
    sa: new Uint8Array(p.count),
  };
  if (!from.length) return s;
  const random = randomFrom(11);
  const a = order(from, random);
  for (let n = 0; n < p.count; n++) {
    const pixel =
      n < p.dunes
        ? a[Math.floor((n * a.length) / p.dunes)]
        : a[Math.floor(random() * a.length)];
    s.sx[n] = pixel[0];
    s.sy[n] = pixel[1];
    s.sr[n] = pixel[2];
    s.sg[n] = pixel[3];
    s.sb[n] = pixel[4];
    s.sa[n] = pixel[5];
  }
  return s;
}

// The hero words, character by character where the browser has laid them out, in each character's font and colour,
// turned like the word (ABSORB. and BUILD. are tilted). Hidden words are drawn too: the cover reads them again when it
// is entered from below.
function drawWords(
  ctx: CanvasRenderingContext2D,
  element: Element,
  origin: DOMRect,
) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  ctx.textBaseline = "alphabetic";
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? "",
      parent = node.parentElement;
    if (!parent || !text.trim()) continue;
    const style = getComputedStyle(parent);
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.fillStyle = style.color;
    const spacing = parseFloat(style.letterSpacing) || 0;
    const angle = turn(parent, element);
    for (let i = 0; i < text.length; i++) {
      if (!text[i].trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const box = range.getBoundingClientRect();
      if (!box.width) continue;
      // The range box holds the turned character; drawn turned around its centre, from its baseline.
      const metrics = ctx.measureText(text[i]);
      ctx.save();
      ctx.translate(
        box.left + box.width / 2 - origin.left,
        box.top + box.height / 2 - origin.top,
      );
      ctx.rotate(angle);
      ctx.fillText(
        text[i],
        -(metrics.width + spacing) / 2,
        (metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2,
      );
      ctx.restore();
    }
  }
}

// How far an element is turned on screen: its own rotation and its ancestors' up to `root`.
function turn(element: Element, root: Element) {
  let angle = 0;
  for (
    let current: Element | null = element;
    current;
    current = current.parentElement
  ) {
    const style = getComputedStyle(current);
    if (style.transform && style.transform !== "none") {
      const matrix = new DOMMatrix(style.transform);
      angle += Math.atan2(matrix.b, matrix.a);
    }
    if (style.rotate && style.rotate !== "none")
      angle += (parseFloat(style.rotate) * Math.PI) / 180;
    if (current === root) break;
  }
  return angle;
}
