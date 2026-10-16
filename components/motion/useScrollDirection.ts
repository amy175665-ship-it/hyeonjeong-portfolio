"use client";

import { useEffect, useState } from "react";
import { onScrollFrame } from "./scrollFrame";

// "down" or "up" from the page scroll, changing only after `threshold` px of travel the other way, so small jitters
// (and Lenis' easing tail) do not flip it back and forth.
export default function useScrollDirection(threshold = 8) {
  const [direction, setDirection] = useState<"up" | "down">("down");
  useEffect(() => {
    let anchor = window.scrollY,
      y = anchor,
      current: "up" | "down" = "down";
    return onScrollFrame({
      read: () => {
        y = window.scrollY;
      },
      write: () => {
        if (Math.abs(y - anchor) < threshold) return;
        const next = y > anchor ? "down" : "up";
        anchor = y;
        if (next !== current) {
          current = next;
          setDirection(next);
        }
      },
    });
  }, [threshold]);
  return direction;
}
