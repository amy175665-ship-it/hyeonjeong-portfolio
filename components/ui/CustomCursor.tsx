"use client";

import { useEffect, useRef } from "react";
import cursorDefault from "@/public/images/cursor/cursor-default.webp";
import cursorHover from "@/public/images/cursor/cursor-hover.webp";
import cursorParticles from "@/public/images/cursor/cursor-click-particles.webp";
import styles from "./CustomCursor.module.css";

// Site-wide custom cursor for mouse/trackpad users: a small drop that follows the pointer, swells into a
// clear sphere over interactive elements and leaves a brief burst of droplets on click.
// Touch devices and small screens keep the native cursor.
const ENABLE_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 768px)";
const INTERACTIVE = 'a[href], button, summary, label, select, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="option"], [data-cursor="hover"]';
const FOLLOW = 0.38; // share of the remaining distance covered per 60fps frame: close to the pointer, softly behind
const STRETCH = { max: 0.08, squeeze: 0.06, speed: 2600 }; // fast moves stretch along the motion, very slightly
const BURST_MS = 420;

export default function CustomCursor() {
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const burstLayer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = matchMedia(ENABLE_QUERY);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const cursor = root.current, shape = body.current, layer = burstLayer.current;
    if (!cursor || !shape || !layer) return;
    const target = { x: 0, y: 0 }, position = { x: 0, y: 0 }, stretch = { x: 1, y: 1 };
    let frame = 0, last = 0, seen = false;

    const render = (now: number) => {
      const dt = Math.min((now - (last || now)) / 1000, 0.05) || 1 / 60;
      last = now;
      const follow = motion.matches ? 1 : 1 - Math.pow(1 - FOLLOW, dt * 60);
      const dx = (target.x - position.x) * follow, dy = (target.y - position.y) * follow;
      position.x += dx;
      position.y += dy;
      // Speed-based stretch: horizontal motion widens it, vertical motion lengthens it, settling back to 1.
      const ax = motion.matches ? 0 : Math.min(Math.abs(dx / dt) / STRETCH.speed, 1);
      const ay = motion.matches ? 0 : Math.min(Math.abs(dy / dt) / STRETCH.speed, 1);
      const ease = 1 - Math.pow(0.8, dt * 60);
      stretch.x += (1 + STRETCH.max * ax - STRETCH.squeeze * ay - stretch.x) * ease;
      stretch.y += (1 + STRETCH.max * ay - STRETCH.squeeze * ax - stretch.y) * ease;
      cursor.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
      shape.style.transform = `scale(${stretch.x.toFixed(3)}, ${stretch.y.toFixed(3)})`;
      const settled = Math.abs(target.x - position.x) < 0.1 && Math.abs(target.y - position.y) < 0.1
        && Math.abs(stretch.x - 1) < 0.002 && Math.abs(stretch.y - 1) < 0.002;
      frame = settled ? 0 : requestAnimationFrame(render);
    };
    const wake = () => { if (!frame) { last = 0; frame = requestAnimationFrame(render); } };

    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      target.x = event.clientX;
      target.y = event.clientY;
      if (!seen) { position.x = target.x; position.y = target.y; seen = true; }
      cursor.dataset.visible = "true";
      wake();
    };
    const over = (event: PointerEvent) => {
      const interactive = (event.target as Element | null)?.closest?.(INTERACTIVE);
      cursor.dataset.hover = interactive && !interactive.matches(":disabled") ? "true" : "false";
    };
    const leave = (event: MouseEvent) => { if (!event.relatedTarget) cursor.dataset.visible = "false"; };
    const down = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.button !== 0) return;
      const burst = document.createElement("img");
      burst.src = cursorParticles.src;
      burst.alt = "";
      burst.className = styles.burst;
      burst.style.left = `${event.clientX}px`;
      burst.style.top = `${event.clientY}px`;
      layer.appendChild(burst);
      const frames = motion.matches
        ? [{ opacity: 0.8 }, { opacity: 0 }]
        : [{ opacity: 1, transform: "translate(-50%, -50%) scale(.6)" }, { opacity: 0, transform: "translate(-50%, -50%) scale(1)" }];
      burst.animate(frames, { duration: BURST_MS, easing: "cubic-bezier(.2, .7, .3, 1)", fill: "forwards" }).finished
        .finally(() => burst.remove());
    };

    const enable = () => {
      document.documentElement.classList.add("has-custom-cursor");
      window.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerover", over, { passive: true });
      document.addEventListener("mouseout", leave);
      window.addEventListener("pointerdown", down, { passive: true });
    };
    const disable = () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("mouseout", leave);
      window.removeEventListener("pointerdown", down);
      cancelAnimationFrame(frame);
      frame = 0;
      seen = false;
      cursor.dataset.visible = "false";
    };
    const update = () => (media.matches ? enable() : disable());
    update();
    media.addEventListener("change", update);
    return () => { media.removeEventListener("change", update); disable(); };
  }, []);
  return (
    <>
      <div ref={root} className={styles.cursor} data-visible="false" data-hover="false" aria-hidden="true">
        <div ref={body} className={styles.body}>
          <img src={cursorDefault.src} alt="" className={styles.drop} draggable={false} />
          <img src={cursorHover.src} alt="" className={styles.sphere} draggable={false} />
        </div>
      </div>
      <div ref={burstLayer} className={styles.layer} aria-hidden="true" />
    </>
  );
}
