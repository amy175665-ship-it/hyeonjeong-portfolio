"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  lockScroll,
  scrollToY,
  unlockScroll,
} from "@/components/layout/scrollLock";
import type { DesignItem } from "@/data/design";
import styles from "./DesignStory.module.css";

// Design (GROW part): the works on the GROW circle's sand rings (user, 2026-10-14). GrowStory spreads its rings into
// ellipses that hold on screen and lays this layer over its pinned stage; the works go round three of the rings like
// small planets (seven works: 2 · 2 · 3, approved mockup A, artifacts/design-orbit-20261014). Hovering, keyboard focus or
// a tap brings a work to the centre: its grains flow in from the planet and settle into it, the title steps aside;
// letting go brings the title back. A click (or a second tap) opens the large view. Reduced motion: still orbits, no
// grains.
const SAND = ["#b8864c", "#8a6238", "#d9b07e"];
const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const number = (index: number) => String(index + 1).padStart(2, "0");

// What GrowStory tells this layer, every frame while it runs: the three orbits (centre and ellipse radii, stage
// pixels), how far the works are in (presence 0 → 1) and whether the part is near the screen at all.
export type Orbit = {
  cx: number;
  cy: number;
  rx: number[];
  ry: number[];
  presence: number;
  active: boolean;
  wake: () => void;
};
export const createOrbit = (): Orbit => ({
  cx: 0,
  cy: 0,
  rx: [0, 0, 0],
  ry: [0, 0, 0],
  presence: 0,
  active: false,
  wake: () => {},
});

// Spreads the works over the three orbits, the outer ones taking the extra ones (7 → 2 · 2 · 3).
function slotsOf(count: number) {
  const base = Math.floor(count / 3),
    extra = count % 3;
  const sizes = [
    base,
    base + (extra >= 2 ? 1 : 0),
    base + (extra >= 1 ? 1 : 0),
  ];
  const slots: { ring: number; start: number }[] = [];
  sizes.forEach((size, ring) => {
    for (let k = 0; k < size; k++)
      slots.push({ ring, start: (k / size) * Math.PI * 2 + ring * 0.9 + 0.4 });
  });
  return slots;
}

// The work itself, or the colour field and number of a placeholder.
function Art({
  item,
  index,
  sizes,
  alt = "",
}: {
  item: DesignItem;
  index: number;
  sizes: string;
  alt?: string;
}) {
  if (item.image)
    return (
      <Image
        src={item.image}
        alt={alt}
        fill
        sizes={sizes}
        unoptimized
        className={styles.image}
      />
    );
  return (
    <span
      className={styles.field}
      style={{ "--fill": item.color ?? "#d9b07e" } as CSSProperties}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
    >
      <b aria-hidden="true">{number(index)}</b>
    </span>
  );
}

type Flow = {
  grains: {
    sx: number;
    sy: number;
    tx: number;
    ty: number;
    bend: number;
    delay: number;
    c: string;
    r: number;
  }[];
  start: number;
  revealed: boolean;
  done: () => void;
};

export default function DesignStory({
  designItems = [],
  orbit,
}: {
  designItems?: DesignItem[];
  orbit: Orbit;
}) {
  const layer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const planets = useRef<(HTMLButtonElement | null)[]>([]);
  const [box, setBox] = useState({ w: 1440, h: 800, chrome: 96 });
  const [picked, setPicked] = useState(-1);
  const [shown, setShown] = useState(false);
  const [large, setLarge] = useState(false);
  const [seq, setSeq] = useState(0);
  // Shared with the animation loop.
  const live = useRef({
    still: false,
    hovering: 0,
    focusing: false,
    open: false,
    tapped: false,
    picked: -1,
    timer: 0,
    from: null as { x: number; y: number } | null,
    positions: [] as { x: number; y: number }[],
    flow: null as Flow | null,
    wake: () => {},
  });
  const slots = slotsOf(designItems.length);
  const phone = box.w <= 700;

  // A work into the centre (from its planet's place) / back to the title once nothing is hovered or focused.
  const pick = (index: number) => {
    const state = live.current;
    window.clearTimeout(state.timer);
    if (state.picked === index) return;
    state.picked = index;
    state.from = state.positions[index] ?? null;
    setPicked(index);
    setShown(false);
    setSeq((value) => value + 1);
  };
  const clear = () => {
    const state = live.current;
    state.picked = -1;
    state.tapped = false;
    setPicked(-1);
    setShown(false);
  };
  const release = () => {
    const state = live.current;
    window.clearTimeout(state.timer);
    state.timer = window.setTimeout(() => {
      if (!state.hovering && !state.focusing && !state.open) clear();
    }, 700);
  };
  const openLarge = () => {
    if (live.current.picked < 0 || !dialog.current) return;
    live.current.open = true;
    setLarge(true);
    dialog.current.showModal();
    lockScroll(window.scrollY);
  };
  // Keyboard focus on a work before the rings hold: scroll to where they do (the menu target, #design).
  const bringIn = () => {
    const target = document.getElementById("design");
    if (!target || orbit.presence >= 1) return;
    const chrome =
      parseFloat(getComputedStyle(target).getPropertyValue("--chrome")) || 0;
    scrollToY(
      Math.round(target.getBoundingClientRect().top + window.scrollY - chrome),
    );
  };

  // The grains of a newly picked work flow in from its planet, then the work shows under them.
  useEffect(() => {
    const state = live.current,
      root = layer.current,
      target = frame.current;
    if (picked < 0 || !root || !target) return;
    const from = state.from;
    state.from = null;
    const reveal = () => setShown(true);
    if (!from || state.still) {
      reveal();
      return;
    }
    const f = target.getBoundingClientRect(),
      s = root.getBoundingClientRect();
    const grains: Flow["grains"] = [];
    for (let i = 0, n = s.width <= 700 ? 220 : 420; i < n; i++)
      grains.push({
        sx: from.x + (Math.random() - 0.5) * 50,
        sy: from.y + (Math.random() - 0.5) * 50,
        tx: f.left - s.left + Math.random() * f.width,
        ty: f.top - s.top + Math.random() * f.height,
        bend: (Math.random() - 0.5) * 160,
        delay: Math.random() * 0.25,
        c: SAND[i % 3],
        r: 1 + Math.random() * 1.6,
      });
    state.flow = {
      grains,
      start: performance.now(),
      revealed: false,
      done: reveal,
    };
    state.wake();
  }, [picked, seq]);

  useEffect(() => {
    const root = layer.current,
      paper = canvas.current,
      g = paper?.getContext("2d");
    if (!root || !paper || !g) return;
    const state = live.current;
    state.still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const angles = slots.map((slot) => slot.start);
    let W = 0,
      H = 0,
      raf = 0,
      last = 0,
      speed = 1,
      presence = -1,
      drawn = false;

    const resize = () => {
      W = root.clientWidth;
      H = root.clientHeight;
      const chrome =
        parseFloat(getComputedStyle(root).getPropertyValue("--chrome")) || 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      paper.width = Math.round(W * dpr);
      paper.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      setBox((current) =>
        current.w === W && current.h === H && current.chrome === chrome
          ? current
          : { w: W, h: H, chrome },
      );
    };

    // Planets on GrowStory's orbits; the lower half passes in front of the rings' middle, the upper half behind it.
    // They come out one after another as the rings settle (presence).
    const place = () => {
      const size = W <= 700 ? 50 : 68;
      if (orbit.presence !== presence) {
        presence = orbit.presence;
        root.style.setProperty("--presence", presence.toFixed(3));
        root.toggleAttribute("data-out", presence < 0.5);
        // Scrolled away from the held rings: a picked work lets go.
        if (presence < 0.5 && state.picked >= 0 && !state.open) clear();
      }
      slots.forEach((slot, i) => {
        const el = planets.current[i];
        if (!el) return;
        const depth = Math.sin(angles[i]);
        const x = orbit.cx + Math.cos(angles[i]) * orbit.rx[slot.ring],
          y = orbit.cy + depth * orbit.ry[slot.ring];
        const show = clamp(presence * 1.6 - i * 0.09),
          scale = (0.78 + (0.3 * (depth + 1)) / 2) * (0.6 + 0.4 * show);
        state.positions[i] = { x, y };
        el.style.transform = `translate(${(x - size / 2).toFixed(1)}px, ${(y - size / 2).toFixed(1)}px) scale(${scale.toFixed(3)})`;
        el.style.opacity = show.toFixed(3);
        if (el.hasAttribute("data-front") !== depth > 0)
          el.toggleAttribute("data-front", depth > 0);
      });
    };

    const drawGrains = (time: number) => {
      const flow = state.flow;
      if (!flow) {
        if (drawn) {
          g.clearRect(0, 0, W, H);
          drawn = false;
        }
        return;
      }
      const t = (time - flow.start) / 1000;
      if (t > 0.5 && !flow.revealed) {
        flow.revealed = true;
        flow.done();
      }
      g.clearRect(0, 0, W, H);
      if (t > 1.05) {
        state.flow = null;
        drawn = false;
        return;
      }
      drawn = true;
      g.globalAlpha = 1 - clamp((t - 0.7) / 0.35);
      for (const q of flow.grains) {
        const e = easeInOut(clamp((t - q.delay) / 0.55));
        const x = q.sx + (q.tx - q.sx) * e + Math.sin(e * Math.PI) * q.bend,
          y = q.sy + (q.ty - q.sy) * e;
        g.fillStyle = q.c;
        g.fillRect(x - q.r, y - q.r, q.r * 2, q.r * 2);
      }
      g.globalAlpha = 1;
    };

    // Runs while GrowStory says the part is near (it wakes this each frame); turns only once the works are out, and
    // holds still while a work is hovered, focused, tapped or open.
    const loop = (time: number) => {
      raf = 0;
      // Gone from the screen: one last placing (a picked work lets go), then rest until GrowStory wakes it again.
      if (!orbit.active && !state.flow) {
        place();
        last = 0;
        return;
      }
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;
      last = time;
      if (!state.still && orbit.presence > 0) {
        speed +=
          ((state.hovering || state.focusing || state.open || state.tapped
            ? 0
            : 1) -
            speed) *
          Math.min(dt * 5, 1);
        slots.forEach((slot, i) => {
          angles[i] +=
            dt * speed * (slot.ring % 2 ? -1 : 1) * (0.16 - slot.ring * 0.035);
        });
      }
      place();
      drawGrains(time);
      if ((!state.still && orbit.presence > 0) || state.flow)
        raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    state.wake = wake;
    orbit.wake = wake;

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      wake();
    });
    observer.observe(root);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.clearTimeout(state.timer);
      state.wake = () => {};
      orbit.wake = () => {};
    };
    // The orbit slots only depend on the number of works.
  }, [slots.length, orbit]);

  // The large view closes with Esc, its button or a click outside the work.
  useEffect(() => {
    const view = dialog.current;
    if (!view) return;
    const closed = () => {
      live.current.open = false;
      setLarge(false);
      unlockScroll();
      release();
    };
    const outside = (event: MouseEvent) => {
      if (event.target === view) view.close();
    };
    view.addEventListener("close", closed);
    view.addEventListener("click", outside);
    return () => {
      view.removeEventListener("close", closed);
      view.removeEventListener("click", outside);
      if (live.current.open) unlockScroll();
    };
  }, []);

  const item = picked >= 0 ? designItems[picked] : null;
  // The centre frame keeps the work's own ratio well inside the inner orbit (under the title bar), with air around it.
  const below = box.h - box.chrome;
  const maxW = Math.min(box.w * (phone ? 0.46 : 0.24), 340),
    maxH = Math.min(below * (phone ? 0.3 : 0.36), 320);
  const frameW = item ? Math.min(maxW, maxH * item.ratio) : 0,
    frameH = item ? frameW / item.ratio : 0;

  return (
    // Touch: a tap on an empty spot lets the tapped work go again (the title comes back, the orbits move on).
    <div
      ref={layer}
      className={styles.layer}
      data-picked={picked >= 0 || undefined}
      data-out
      onClick={(event) => {
        if (live.current.tapped && !(event.target as Element).closest("button"))
          clear();
      }}
    >
      <h2
        id="design-story-title"
        className={styles.title}
      >
        디자인
      </h2>
      {designItems.length === 0 && (
        <p className={styles.empty}>준비 중입니다</p>
      )}

      {designItems.length > 0 && (
        <ul
          className={styles.orbit}
          aria-label="디자인 작업"
        >
          {designItems.map((work, index) => (
            <li key={`${work.title}-${index}`}>
              <button
                ref={(element) => {
                  planets.current[index] = element;
                }}
                type="button"
                className={styles.planet}
                aria-pressed={picked === index}
                aria-label={`${work.title}${work.placeholder ? " (작성 예시)" : ""} 가운데에 보기`}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") {
                    live.current.hovering++;
                    pick(index);
                  }
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse") {
                    live.current.hovering = Math.max(
                      0,
                      live.current.hovering - 1,
                    );
                    release();
                  }
                }}
                // Keyboard focus only: a mouse click focuses the button too, which must not hold the orbits still.
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible")) {
                    live.current.focusing = true;
                    bringIn();
                    pick(index);
                  }
                }}
                onBlur={() => {
                  if (live.current.focusing) {
                    live.current.focusing = false;
                    release();
                  }
                }}
                // Mouse and keyboard open the picked work; on touch the first tap brings it to the centre (and holds the
                // orbits still, so the second tap finds it).
                onClick={() => {
                  const state = live.current;
                  if (state.picked === index) {
                    openLarge();
                    return;
                  }
                  if (!state.hovering && !state.focusing) state.tapped = true;
                  pick(index);
                }}
              >
                <Art
                  item={work}
                  index={index}
                  sizes="68px"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        className={styles.center}
        data-shown={(item && shown) || undefined}
        aria-live="polite"
      >
        {item && (
          <>
            <button
              ref={frame}
              type="button"
              className={styles.frame}
              style={{ width: frameW, height: frameH }}
              aria-label={`${item.title} 크게 보기`}
              onClick={openLarge}
            >
              <Art
                item={item}
                index={picked}
                sizes="340px"
              />
            </button>
            <div className={styles.caption}>
              {item.placeholder && (
                <span className={styles.badge}>작성 예시</span>
              )}
              <strong>{item.title}</strong>
              {(item.tools?.length || item.description) && (
                <span className={styles.meta}>
                  {[item.tools?.join(" · "), item.description]
                    .filter(Boolean)
                    .join(" — ")}
                </span>
              )}
            </div>
          </>
        )}
      </div>
      <canvas
        ref={canvas}
        className={styles.grains}
        aria-hidden="true"
      />

      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label={item ? `${item.title} 크게 보기` : "작품 크게 보기"}
      >
        <button
          type="button"
          className={styles.close}
          aria-label="닫기"
          onClick={() => dialog.current?.close()}
        >
          ×
        </button>
        {large && item && (
          <div
            className={styles.big}
            style={{ "--ratio": item.ratio } as CSSProperties}
          >
            <Art
              item={item}
              index={picked}
              sizes="90vw"
              alt={item.title}
            />
          </div>
        )}
      </dialog>
    </div>
  );
}
