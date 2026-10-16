"use client";

import { useEffect, type RefObject } from "react";
import { onScrollFrame } from "./scrollFrame";

// Soft seams between parts (user, 2026-10-14: no hard cuts between sections). Sets two values on the element, tied to
// its place on screen:
// --seam-in  0 → 1 while its top comes up from the bottom of the screen to 40% of it (the part fades and rises in),
// --seam-out 0 → 1 while its bottom goes from 75% of the screen to 20% (the part fades and lifts away under the next).
// The part's CSS decides what follows them; their settled values are 1 and 0 (no script, reduced motion).
const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

export default function useSeam(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let top = 0,
      bottom = 0,
      height = 0,
      painted = "";
    const off = onScrollFrame({
      read: () => {
        const box = element.getBoundingClientRect();
        top = box.top;
        bottom = box.bottom;
        height = window.innerHeight;
      },
      write: () => {
        const enter = clamp((height - top) / (height * 0.6)),
          leave = clamp((height * 0.75 - bottom) / (height * 0.55));
        const next = `${enter.toFixed(3)}|${leave.toFixed(3)}`;
        if (next === painted) return;
        painted = next;
        element.style.setProperty("--seam-in", enter.toFixed(3));
        element.style.setProperty("--seam-out", leave.toFixed(3));
      },
    });
    return () => {
      off();
      element.style.removeProperty("--seam-in");
      element.style.removeProperty("--seam-out");
    };
  }, [ref]);
}
