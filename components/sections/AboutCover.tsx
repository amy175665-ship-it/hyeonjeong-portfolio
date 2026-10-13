"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { profile } from "@/data/profile";
import styles from "./AboutCover.module.css";

// ABSORB. cover that becomes the about page (user's order, 2026-10-13). The about page (children) is pinned while the
// cover track scrolls past; tied to the scroll (c, 0 → 1):
// - start: the profile photo as sand grains on the right with a big "ABSORB." along the bottom (this is what the
//   cactus grains gather into when the window comes up, SandHandoff reads the canvas); the mouse pushes grains aside;
// - the about sentence set large at the top left (a decorative copy, aria-hidden) soaks word by word from sand to ink
//   and gets its highlighter stroke;
// - the grains gather into the page's photo frame and turn into the real photo, the large sentence flies and shrinks
//   onto the page's own sentence and hands over to it, ABSORB. sinks away, and the rest of the page (name, lists,
//   skills) comes in: the about page as it was.
// Pieces are found by data attributes: data-cover-photo (frame), data-cover-statement, data-cover-rest. Hidden pieces get visibility: hidden so the sand hand-off does not read them. Reduced motion: no
// cover, just the about page.
const SAND = ["#eadbc2", "#d9b07e", "#b8864c", "#8a6238"];
const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const ramp = (value: number, from: number, to: number) => clamp((value - from) / (to - from));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
// The large sentence keeps the statement's own two lines. Words keep one running index for the soak order and are
// flagged when they belong to the highlighted phrase.
const markWords = new Set((profile.statement.mark ?? "").split(/\s+/).filter(Boolean));
let wordIndex = 0;
const lines = profile.statement.lines.map(line => line.trim().split(/\s+/).map(text => ({ text, mark: markWords.has(text), i: wordIndex++ })));
const wordCount = wordIndex;

type Props = { className: string; labelledBy: string; children: ReactNode };

export default function AboutCover({ className, labelledBy, children }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const large = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = track.current, box = stage.current, paper = canvas.current, big = word.current, copy = large.current;
    const g = paper?.getContext("2d");
    if (!root || !box || !paper || !big || !copy || !g || !profile.photo) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const frame = box.querySelector<HTMLElement>("[data-cover-photo]");
    const statement = box.querySelector<HTMLElement>("[data-cover-statement]");
    const rest = Array.from(box.querySelectorAll<HTMLElement>("[data-cover-rest]"));
    let lum: Uint8ClampedArray | null = null, lumW = 0, lumH = 0, ratio = 0.73;
    let W = 0, H = 0, sp = 10, phone = false, sw = 0, sh = 0, x0 = 0, y0 = 0;
    let gx = new Float32Array(0), gy = gx, size = gx, u = gx, v = gx, ox = gx, oy = gx, band = new Uint8Array(0);
    // Mouse position on the stage; `calm`: every grain is back in place (the settled image can be pasted).
    const pointer = { x: -9999, y: -9999 };
    let calm = true;
    // Where the photo frame and the sentence sit in the finished page (stage coordinates, transforms cleared).
    let photo = { x: 0, y: 0, w: 0, h: 0 }, landing = { dx: 0, dy: 0, s: 1 };
    let raf = 0, alive = true, lastC = -1;
    const settled = document.createElement("canvas");

    const lightAt = (a: number, b: number) => {
      if (!lum || a < 0 || a > 1 || b < 0 || b > 1) return 0.97;
      const x = Math.min(lumW - 1, (a * lumW) | 0), y = Math.min(lumH - 1, (b * lumH) | 0), i = (y * lumW + x) * 4;
      return (lum[i] * 0.3 + lum[i + 1] * 0.59 + lum[i + 2] * 0.11) / 255;
    };
    const within = (element: Element) => {
      const r = element.getBoundingClientRect(), s = box.getBoundingClientRect();
      return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
    };

    // The grain grid (only grains of the portrait or every third faint one) and the finished page's geometry.
    const setup = () => {
      W = box.clientWidth; H = box.clientHeight; phone = W <= 700;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      paper.width = Math.round(W * dpr); paper.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      sp = phone ? 8 : W > 900 ? 10 : 8;
      // Desktop: the portrait fills the height on the right (room for the sentence and the word on the left).
      // Phones: a smaller portrait along the bottom, under the sentence.
      sh = phone ? H * 0.62 : H; sw = sh * ratio;
      x0 = phone ? (W - sw) / 2 : Math.max(W * 0.5, (W - sw) * 0.9); y0 = H - sh;
      const cols = Math.ceil(W / sp) + 1, rows = Math.ceil(H / sp) + 1;
      const xs: number[] = [], ys: number[] = [], rs: number[] = [], us: number[] = [], vs: number[] = [], bs: number[] = [];
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const x = i * sp + (j % 2 ? sp / 2 : 0), y = j * sp, a = (x - x0) / sw, b = (y - y0) / sh;
        const dark = Math.pow(1 - lightAt(a, b), 1.15);
        if (dark < 0.14 && (j * cols + i) % 3) continue;
        xs.push(x); ys.push(y); rs.push(0.45 + dark * sp * 0.52); us.push(a); vs.push(b);
        bs.push(dark > 0.62 ? 3 : dark > 0.36 ? 2 : dark > 0.14 ? 1 : 0);
      }
      gx = Float32Array.from(xs); gy = Float32Array.from(ys); size = Float32Array.from(rs);
      u = Float32Array.from(us); v = Float32Array.from(vs); band = Uint8Array.from(bs);
      ox = new Float32Array(gx.length); oy = new Float32Array(gx.length); calm = true;
      settled.width = paper.width; settled.height = paper.height;
      const sg = settled.getContext("2d");
      if (sg) { sg.setTransform(dpr, 0, 0, dpr, 0, 0); fill(sg, 0); }
      if (frame) photo = within(frame);
      // Where the large sentence lands: the top left of its first line on the page sentence's first line, scaled by
      // the ratio of their type sizes (the lines break differently; the hand-over covers that). Measured from the
      // boxes, which the about page's entrance (its lines slide in) does not move; the half-leading puts the letters
      // of both on the same spot.
      if (statement) {
        copy.style.transform = "none";
        const type = (element: Element) => {
          const style = getComputedStyle(element), size = parseFloat(style.fontSize) || 1;
          const line = parseFloat(style.lineHeight) || size * 1.2;
          return { size, half: (line - size) / 2, box: element.getBoundingClientRect() };
        };
        const from = type(copy), to = type(statement), scale = to.size / from.size;
        landing = { dx: to.box.left - from.box.left, dy: to.box.top + to.half - from.box.top - from.half * scale, s: scale };
      }
      lastC = -1;
    };

    // Draws the grains; `k` (0 → 1) carries them from the portrait into the page's photo frame. With `push`, grains
    // near the mouse are pushed aside and ease back; returns whether any is still moving.
    const fill = (target: CanvasRenderingContext2D, k: number, push = false) => {
      let stirring = false;
      const reach = phone ? 70 : 110, force = phone ? 22 : 34;
      const paths = SAND.map(() => new Path2D());
      // The frame shows the photo with object-fit: cover and object-position 50% 30%.
      const dw = Math.max(photo.w, photo.h * ratio), dh = dw / ratio;
      const fx = photo.x + (photo.w - dw) * 0.5, fy = photo.y + (photo.h - dh) * 0.3, shrink = dw / sw;
      for (let n = 0; n < gx.length; n++) {
        let x = gx[n], y = gy[n], r = size[n];
        if (k > 0) {
          const tx = fx + u[n] * dw, ty = fy + v[n] * dh;
          const inside = tx >= photo.x && tx <= photo.x + photo.w && ty >= photo.y && ty <= photo.y + photo.h;
          x = lerp(x, tx, k); y = lerp(y, ty, k); r = lerp(r, inside ? r * shrink : 0, k);
        }
        if (push) {
          let tx = 0, ty = 0;
          const dx = x - pointer.x, dy = y - pointer.y, d = Math.hypot(dx, dy);
          if (d < reach && d > 0.01) { const f = Math.pow(1 - d / reach, 2) * force; tx = (dx / d) * f; ty = (dy / d) * f; }
          ox[n] += (tx - ox[n]) * 0.16; oy[n] += (ty - oy[n]) * 0.16;
          if (Math.abs(tx - ox[n]) + Math.abs(ty - oy[n]) > 0.1) stirring = true;
          x += ox[n]; y += oy[n];
        }
        if (r < 0.15 || x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
        if (r < 1.6) paths[band[n]].rect(x - r, y - r, r * 2, r * 2);
        else { paths[band[n]].moveTo(x + r, y); paths[band[n]].arc(x, y, r, 0, Math.PI * 2); }
      }
      target.clearRect(0, 0, W, H);
      paths.forEach((path, i) => { target.fillStyle = SAND[i]; target.fill(path); });
      return stirring;
    };

    const show = (element: HTMLElement, amount: number, rise = 0) => {
      element.style.visibility = amount <= 0 ? "hidden" : "";
      element.style.opacity = amount >= 1 ? "" : amount.toFixed(3);
      element.style.transform = rise && amount < 1 ? `translateY(${((1 - amount) * rise).toFixed(1)}px)` : "";
    };

    // Returns whether grains are still moving (another frame is needed).
    const paint = (c: number) => {
      // Grains: the settled portrait until they gather into the frame (0.5 → 0.8), then the canvas fades (0.8 → 0.88).
      // With the mouse about (or grains still easing back) they are drawn one by one; otherwise the settled image.
      const gather = easeInOut(ramp(c, 0.5, 0.8));
      const near = c < 0.88 && pointer.x > -150 && pointer.x < W + 150 && pointer.y > -150 && pointer.y < H + 150;
      let stirring = false;
      if (gather <= 0 && calm && !near) { g.clearRect(0, 0, W, H); g.drawImage(settled, 0, 0, W, H); }
      else { stirring = fill(g, gather, true); calm = !stirring && !near; }
      paper.style.opacity = (1 - ramp(c, 0.8, 0.88)).toFixed(3);
      // ABSORB. is up from the start and sinks away while the page forms.
      const sink = easeInOut(ramp(c, 0.5, 0.7));
      big.style.transform = sink > 0 ? `translateY(${(sink * 110).toFixed(1)}%)` : "";
      big.style.opacity = (1 - sink).toFixed(3);
      big.style.visibility = sink >= 1 ? "hidden" : "";
      // The large sentence: soaks in word by word (and the highlighter strokes in), then flies onto the page's
      // sentence and hands over to it.
      const soak = ramp(c, 0.04, 0.34), fly = easeInOut(ramp(c, 0.5, 0.8)), hand = ramp(c, 0.76, 0.8);
      copy.style.setProperty("--p", soak.toFixed(4));
      copy.style.visibility = soak <= 0 || hand >= 1 ? "hidden" : "";
      copy.style.opacity = hand > 0 ? (1 - hand).toFixed(3) : "";
      copy.style.transform = fly > 0 ? `translate(${(landing.dx * fly).toFixed(1)}px, ${(landing.dy * fly).toFixed(1)}px) scale(${lerp(1, landing.s, fly).toFixed(4)})` : "";
      if (statement) show(statement, hand);
      // The real photo takes over from the grains, then the rest of the page comes in.
      if (frame) show(frame, ramp(c, 0.74, 0.84));
      rest.forEach((element, i) => show(element, ramp(c, 0.78 + i * 0.02, 0.9 + i * 0.02), 16));
      return stirring;
    };

    const loop = () => {
      raf = 0;
      const rect = root.getBoundingClientRect(), top = parseFloat(getComputedStyle(box).top) || 0;
      if (rect.bottom < -window.innerHeight || rect.top > window.innerHeight * 2) return;
      const c = clamp((top - rect.top) / Math.max(root.offsetHeight - box.offsetHeight, 1));
      if (c !== lastC || moving) {
        moving = paint(c);
        lastC = c;
        if (moving) raf = requestAnimationFrame(loop);
      }
    };
    const wake = () => { if (!raf && alive) raf = requestAnimationFrame(loop); };
    let moving = false;
    // Mouse only (touch has no hover): grains near it move aside.
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = paper.getBoundingClientRect();
      pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top;
      moving = true;
      wake();
    };
    const leave = () => { pointer.x = -9999; pointer.y = -9999; moving = true; wake(); };

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
      wake();
    };
    image.src = profile.photo;
    const resize = () => { if (lum) { setup(); wake(); } };
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={track} className={styles.cover}>
      {/* Menu target (#about): the finished about page near the end of the cover. */}
      <span id="about" className={styles.anchor} aria-hidden="true" />
      <section ref={stage} aria-labelledby={labelledBy} className={`${className} ${styles.stage}`} data-page>
        <canvas ref={canvas} className={styles.grains} aria-hidden="true" />
        <p ref={word} className={styles.word} aria-hidden="true" lang="en">ABSORB<span>.</span></p>
        {/* The sentence set large (decorative copy of the page's own sentence). Inside the marked phrase the space goes
            into the word (a no-break space), so the highlighter runs on. */}
        <p ref={large} className={styles.large} aria-hidden="true" style={{ "--n": wordCount } as CSSProperties}>
          {lines.map((line, l) => (
            <span key={l} className={styles.bigLine}>
              {line.map((item, i) => {
                const joined = item.mark && line[i + 1]?.mark;
                return <span key={item.i}>{i > 0 && !(item.mark && line[i - 1].mark) && " "}<span className={item.mark ? `${styles.w} ${styles.mark}` : styles.w} style={{ "--i": item.i } as CSSProperties}>{item.text}{joined && "\u00a0"}</span></span>;
              })}
            </span>
          ))}
        </p>
        {children}
      </section>
    </div>
  );
}
