"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { flushScrollFrame } from "@/components/motion/scrollFrame";
import { registerLenis } from "./scrollLock";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // People who've asked their OS for less motion get native scroll, full stop.
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    registerLenis(lenis);
    // Scroll-tied parts read and paint right after Lenis has moved the page, in the same frame.
    const offScroll = lenis.on("scroll", flushScrollFrame);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      offScroll();
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
