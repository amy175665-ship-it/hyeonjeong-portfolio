"use client";

import { useEffect, useState } from "react";

// "down" or "up" from the page scroll, changing only after `threshold` px of travel the other way, so small jitters
// (and Lenis' easing tail) do not flip it back and forth.
export default function useScrollDirection(threshold = 8) {
  const [direction, setDirection] = useState<"up" | "down">("down");
  useEffect(() => {
    let anchor = window.scrollY, current: "up" | "down" = "down";
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - anchor) < threshold) return;
      const next = y > anchor ? "down" : "up";
      anchor = y;
      if (next !== current) { current = next; setDirection(next); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return direction;
}
