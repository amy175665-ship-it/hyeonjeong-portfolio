"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import styles from "./ConceptScenes.module.css";

// Hand-off from the cactus story to the browser window (teacher's idea): the last scene (the cactus, the sand "GROW.",
// "웬만해선 시들지 않습니다.") breaks into grains of sand that blow away to the right, the desert fades to the window's
// white, and the grains pour back in to form the window's first page (photo, text), top first, before the real page
// takes over. Approved mockup: artifacts/mockup-sand-scatter-20261012.
// Both ends are read from the screen (canvas pixels and DOM text and images), so the grains match whatever size the
// screen is. The page side is read and laid out ahead, in a quiet moment once the story has finished (see prepare), so
// a hand-off only reads the scattering side when it starts. Every grain's position is a pure function of the hand-off
// time, so lowering the window plays it backwards.
export const HANDOFF_SECONDS = 3.2;
// Phases in seconds of the hand-off.
const T = {
  spread: 0.5,
  gather: 0.85,
  gatherSpread: 0.6,
  gatherTime: 1.1,
  white: [0.15, 1.2],
  bar: [1.5, 2.2],
  settle: [2.6, 3.1],
} as const;
const part = ([from, to]: readonly [number, number]) =>
  [from / HANDOFF_SECONDS, to / HANDOFF_SECONDS] as const;
// The same phases on ConceptScenes' `raise` value (0..1): the desert fades to white, the window shows behind the
// grains once the screen is white, its title bar fades in, and the real page replaces the grains.
export const HANDOFF = {
  white: part(T.white),
  shown: T.white[1] / HANDOFF_SECONDS,
  bar: part(T.bar),
  settle: part(T.settle),
};

const STEP = 2; // one grain per 2×2 px, so the grains fill the shapes completely
const LARGE_SCREEN = 2560 * 1440; // above this many px the step widens to 3 to keep the grain count down
const WHITE = [252, 252, 251]; // window background (#FCFCFB)
const SAND = [
  [168, 118, 63],
  [184, 134, 76],
  [148, 98, 51],
  [196, 149, 90],
  [227, 191, 145],
];

type Grain = {
  sx: number;
  sy: number;
  sr: number;
  sg: number;
  sb: number;
  sa: number;
  tx: number;
  ty: number;
  tr: number;
  tg: number;
  tb: number;
  sand: number[];
  delay: number;
  lag: number; // a little random part of the delay
  vx: number;
  vy: number;
  ax: number;
  wobble: number;
  phase: number;
  rate: number;
  gather: number;
};
export type Pixel = [
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
  a: number,
];
// The page side laid out ahead for one screen size: its pixels and the grains landing on them.
type Plan = {
  width: number;
  height: number;
  to: Pixel[];
  grains: Grain[];
};

type Props = {
  raise: MotionValue<number>; // 0 (story) .. 1 (window up)
  playhead: MotionValue<number>; // the story: 1 once it has finished (the page side is then prepared ahead)
  sources: () => Element[]; // what scatters: canvases are copied, other elements drawn as their text
  target: () => Element | null; // what the grains form: its images and text
  enabled: boolean; // off with reduced motion (the window simply switches)
};

export default function SandHandoff({
  raise,
  playhead,
  sources,
  target,
  enabled,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grains = useRef<Grain[] | null>(null);
  const image = useRef<ImageData | null>(null);
  const plan = useRef<Plan | null>(null);

  const clear = () => {
    grains.current = null;
    const canvas = canvasRef.current;
    if (canvas)
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  };

  // The page side: its canvases (the about cover's sand portrait), images and text, as they are on screen.
  const readPage = (width: number, height: number) => {
    const root = target();
    return scan(
      width,
      height,
      (ctx) => {
        if (root) {
          root
            .querySelectorAll("canvas")
            .forEach((element) => drawCanvas(ctx, element));
          drawImages(ctx, root, width, height);
          drawText(ctx, root);
        }
      },
      true,
    );
  };

  const build = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = window.innerWidth,
      height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    const from = scan(
      width,
      height,
      (ctx) =>
        sources().forEach((element) =>
          element instanceof HTMLCanvasElement
            ? drawCanvas(ctx, element)
            : drawText(ctx, element),
        ),
      false,
    );
    // Not prepared for this screen (resized, or the window was entered straight from a menu): read the page now.
    let ready = plan.current;
    if (!ready || ready.width !== width || ready.height !== height)
      ready = layOut(readPage(width, height), width, height, from.length);
    else if (ready.grains.length < from.length)
      ready = layOut(ready.to, width, height, from.length);
    if (ready.to.length) plan.current = ready;
    grains.current =
      from.length && ready.grains.length ? aim(ready.grains, from, width) : [];
    image.current =
      canvas.getContext("2d")?.createImageData(width, height) ?? null;
  };

  // The page side is prepared ahead: once the story has finished (the next scroll step starts the hand-off) and again
  // after a resize, in quiet moments (requestIdleCallback), reading and laying out in two steps so neither holds up the
  // page for long.
  useEffect(() => {
    if (!enabled) return;
    let timer = 0,
      idle = 0;
    const later = (task: () => void) => {
      if (typeof window.requestIdleCallback === "function")
        idle = window.requestIdleCallback(task, { timeout: 2000 });
      else timer = window.setTimeout(task, 200);
    };
    const cancel = () => {
      window.clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
      timer = 0;
      idle = 0;
    };
    const prepare = () => {
      cancel();
      const width = window.innerWidth,
        height = window.innerHeight,
        done = plan.current;
      if (playhead.get() < 1 || raise.get() !== 0) return;
      if (done && done.width === width && done.height === height) return;
      later(() => {
        if (raise.get() !== 0) return;
        const to = readPage(width, height);
        if (!to.length) return;
        later(() => {
          if (window.innerWidth !== width || window.innerHeight !== height)
            return;
          plan.current = layOut(to, width, height, 0);
        });
      });
    };
    const resize = () => {
      plan.current = null;
      cancel();
      timer = window.setTimeout(prepare, 300);
    };
    const offPlayhead = playhead.on("change", (value) => {
      if (value >= 1) prepare();
    });
    prepare();
    window.addEventListener("resize", resize);
    return () => {
      cancel();
      offPlayhead();
      window.removeEventListener("resize", resize);
    };
  }, [enabled]);

  const draw = (time: number) => {
    const canvas = canvasRef.current,
      list = grains.current,
      frame = image.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !list || !frame || !context) return;
    const width = frame.width,
      height = frame.height,
      buffer = new Uint32Array(frame.data.buffer);
    buffer.fill(0);
    const settle = smooth(ramp(time, T.settle));
    for (const p of list) {
      // Scatter: a gust from the left, drifting right and up with a little sway, the colour turning to sand.
      const ts = Math.max(0, time - p.delay);
      let x = p.sx + p.vx * ts + 0.5 * p.ax * ts * ts;
      let y =
        p.sy +
        p.vy * ts +
        Math.sin(p.phase + ts * p.rate) * p.wobble * Math.min(ts, 1);
      const dust = Math.min(ts / 0.45, 1);
      let r = mix(p.sr, p.sand[0], dust),
        g = mix(p.sg, p.sand[1], dust),
        b = mix(p.sb, p.sand[2], dust),
        a = mix(p.sa, 235, dust);
      // Gather: eases into its place on the page, taking on the page's colour as it lands.
      const k = easeInOut(
          Math.min(Math.max((time - p.gather) / T.gatherTime, 0), 1),
        ),
        c = k * k;
      x = mix(x, p.tx, k);
      y = mix(y, p.ty, k);
      r = mix(r, p.tr, c);
      g = mix(g, p.tg, c);
      b = mix(b, p.tb, c);
      a = mix(a, 255, c) * (1 - settle);
      if (a < 4) continue;
      const px = x | 0,
        py = y | 0;
      if (px < 0 || py < 0 || px >= width - 1 || py >= height - 1) continue;
      const color = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0,
        i = py * width + px;
      buffer[i] =
        buffer[i + 1] =
        buffer[i + width] =
        buffer[i + width + 1] =
          color;
    }
    context.putImageData(frame, 0, 0);
  };

  useMotionValueEvent(raise, "change", (value) => {
    if (!enabled || value <= 0 || value >= 1) {
      if (grains.current) clear();
      return;
    }
    if (!grains.current) build();
    draw(value * HANDOFF_SECONDS);
  });
  useEffect(() => clear, []);
  return (
    <canvas
      ref={canvasRef}
      className={styles.sandHandoff}
      aria-hidden="true"
    />
  );
}

const ramp = (value: number, [from, to]: readonly [number, number]) =>
  Math.min(Math.max((value - from) / (to - from), 0), 1);
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// Draws onto a scratch canvas the size of the screen and returns its visible pixels on the grain grid. `page`: skip
// pixels close to the window's white (they would only speckle the empty page). Also used by WorkSand.
export function scan(
  width: number,
  height: number,
  paint: (ctx: CanvasRenderingContext2D) => void,
  page: boolean,
): Pixel[] {
  const scratch = document.createElement("canvas");
  scratch.width = width;
  scratch.height = height;
  const ctx = scratch.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  try {
    paint(ctx);
  } catch {
    return [];
  }
  const data = ctx.getImageData(0, 0, width, height).data;
  const step = width * height > LARGE_SCREEN ? STEP + 1 : STEP;
  const out: Pixel[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 40) continue;
      if (
        page &&
        Math.abs(data[i] - WHITE[0]) +
          Math.abs(data[i + 1] - WHITE[1]) +
          Math.abs(data[i + 2] - WHITE[2]) <
          15
      )
        continue;
      out.push([x, y, data[i], data[i + 1], data[i + 2], data[i + 3]]);
    }
  }
  return out;
}

// Grains are paired from both sides roughly left to right, so they travel in one sweeping flow instead of
// criss-crossing. The longer side sets the grain count; grains sharing a start or an end simply overlap there.
export const randomFrom = (start: number) => {
  let seed = start;
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
};

// Orders pixels left to right with a slight slant and some jitter. A bucket sort on whole-pixel keys: the lists run to
// tens of thousands of pixels, where sorting with Array.sort held up the start of a hand-off.
export function order(list: Pixel[], random: () => number): Pixel[] {
  const keys = new Int32Array(list.length);
  let top = 0;
  list.forEach((p, i) => {
    keys[i] = Math.floor(p[0] + p[1] * 0.35 + random() * 260);
    top = Math.max(top, keys[i]);
  });
  const starts = new Int32Array(top + 2);
  keys.forEach((key) => starts[key + 1]++);
  for (let k = 1; k < starts.length; k++) starts[k] += starts[k - 1];
  const out: Pixel[] = new Array(list.length);
  list.forEach((p, i) => {
    out[starts[keys[i]]++] = p;
  });
  return out;
}

// The page side, laid out ahead: one grain per page pixel (at least `count`), with where it lands and how it drifts.
// The scattering side is filled in by `aim` when a hand-off starts.
function layOut(to: Pixel[], width: number, height: number, count: number): Plan {
  const random = randomFrom(7);
  const b = order(to, random),
    total = b.length ? Math.max(b.length, count) : 0,
    grains: Grain[] = [];
  for (let n = 0; n < total; n++) {
    const t = b[Math.floor((n * b.length) / total)],
      lag = random() * 0.18;
    // `delay` starts as a fraction like it ends up (set by `aim`): turning a whole-number field into a fraction later
    // makes the browser reshape every grain at once, which held up the first hand-off.
    grains.push({
      sx: 0,
      sy: 0,
      sr: 0,
      sg: 0,
      sb: 0,
      sa: 0,
      tx: t[0],
      ty: t[1],
      tr: t[2],
      tg: t[3],
      tb: t[4],
      sand: SAND[Math.floor(random() * SAND.length)],
      delay: lag,
      lag,
      vx: 90 + random() * 220,
      vy: -30 - random() * 120,
      ax: 60 + random() * 160,
      wobble: 6 + random() * 22,
      phase: random() * 6.28,
      rate: 2 + random() * 3,
      // The top of the page settles first.
      gather: T.gather + (t[1] / height) * T.gatherSpread + random() * 0.22,
    });
  }
  return { width, height, to, grains };
}

// The scattering side, when a hand-off starts: its pixels spread over the laid-out grains in the same left to right
// order. The left side goes first.
function aim(grains: Grain[], from: Pixel[], width: number): Grain[] {
  const a = order(from, randomFrom(11));
  grains.forEach((grain, n) => {
    const s = a[Math.floor((n * a.length) / grains.length)];
    grain.sx = s[0];
    grain.sy = s[1];
    grain.sr = s[2];
    grain.sg = s[3];
    grain.sb = s[4];
    grain.sa = s[5];
    grain.delay = (s[0] / width) * T.spread + grain.lag;
  });
  return grains;
}

function drawCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const box = canvas.getBoundingClientRect();
  if (box.width && box.height && canvas.width && canvas.height)
    ctx.drawImage(canvas, box.left, box.top, box.width, box.height);
}

// Images inside `root` that are on screen, cropped the way their object-fit / object-position show them. `dy` moves
// everything down by that many px first (WorkSand reads parts that are not yet where they will be on screen).
export function drawImages(
  ctx: CanvasRenderingContext2D,
  root: Element,
  width: number,
  height: number,
  dy = 0,
) {
  root.querySelectorAll("img").forEach((img) => {
    const rect = img.getBoundingClientRect();
    const box = {
      left: rect.left,
      right: rect.right,
      top: rect.top + dy,
      bottom: rect.bottom + dy,
      width: rect.width,
      height: rect.height,
    };
    if (
      !img.complete ||
      !img.naturalWidth ||
      box.bottom < 0 ||
      box.top > height ||
      box.right < 0 ||
      box.left > width
    )
      return;
    const style = getComputedStyle(img);
    if (style.visibility === "hidden" || style.opacity === "0") return;
    const fit = style.objectFit;
    if (fit !== "cover" && fit !== "contain") {
      ctx.drawImage(img, box.left, box.top, box.width, box.height);
      return;
    }
    const scale = (fit === "cover" ? Math.max : Math.min)(
      box.width / img.naturalWidth,
      box.height / img.naturalHeight,
    );
    const w = img.naturalWidth * scale,
      h = img.naturalHeight * scale;
    const [px, py] = style.objectPosition.split(" ");
    const offset = (value: string | undefined, room: number) =>
      !value
        ? room / 2
        : value.endsWith("%")
          ? (room * parseFloat(value)) / 100
          : parseFloat(value) || 0;
    ctx.save();
    ctx.beginPath();
    ctx.rect(box.left, box.top, box.width, box.height);
    ctx.clip();
    ctx.drawImage(
      img,
      box.left + offset(px, box.width - w),
      box.top + offset(py, box.height - h),
      w,
      h,
    );
    ctx.restore();
  });
}

// The text inside `element`, character by character where the browser has laid it out (so wrapping, letter spacing
// and mixed fonts match), in each character's computed font and colour. `dy` as in drawImages.
export function drawText(
  ctx: CanvasRenderingContext2D,
  element: Element,
  dy = 0,
) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  ctx.textBaseline = "alphabetic";
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? "",
      parent = node.parentElement;
    // Skip text that is only there for screen readers (visually hidden).
    if (!parent || !text.trim() || parent.closest(".sr-only")) continue;
    const style = getComputedStyle(parent);
    if (style.display === "none" || style.visibility === "hidden") continue;
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.fillStyle = style.color;
    const upper = style.textTransform === "uppercase";
    for (let i = 0; i < text.length; i++) {
      if (!text[i].trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const box = range.getBoundingClientRect(),
        top = box.top + dy;
      if (!box.width || top + box.height < 0 || top > window.innerHeight)
        continue;
      const char = upper ? text[i].toUpperCase() : text[i];
      // The range box is the font's content area, so the baseline sits one font ascent below its top.
      ctx.fillText(
        char,
        box.left,
        top + ctx.measureText(char).fontBoundingBoxAscent,
      );
    }
  }
}
