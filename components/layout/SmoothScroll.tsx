"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { flushScrollFrame } from "@/components/motion/scrollFrame";
import { registerLenis } from "./scrollLock";

// Stops (2026-10-23, user: scenes flashed past): a gesture that ends just short of the next stop in its direction (within
// SNAP_REACH of a screen) settles onto it at about the pace of a normal scroll (SNAP_PACE seconds per screen), so the
// glide never fast-forwards a scene and never pulls the page back against the gesture. Keys scroll natively.
const GESTURE_GAP = 320;
const SNAP_MARGIN = 24;
const SNAP_REACH = 0.25;
const SNAP_PACE = 1.4;

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // People who've asked their OS for less motion get native scroll, full stop.
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t: number) => Math.min(1, 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.65,
    });
    registerLenis(lenis);
    // Scroll-tied parts read and paint right after Lenis has moved the page, in that same frame.
    const offScroll = lenis.on("scroll", flushScrollFrame);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Meaningful story stops make long sections easier to browse. Small gestures remain free to scroll;
    // once a gesture crosses enough of the distance to the next stop, it settles there like a magnet.
    let gestureDirection = 0,
      lastGestureInput = 0,
      gesturePending = false,
      settleTimer = 0,
      settleFrame = 0,
      touchY: number | null = null;

    const documentY = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const windowFrame = element.closest<HTMLElement>("[data-desert-window]");
      if (!windowFrame) return rect.top + window.scrollY;

      // WindowFrame holds the browser at the viewport until release. Measure its eventual document position so snap
      // targets inside it do not drift while the window is pinned.
      const marker = windowFrame.previousElementSibling;
      if (
        !(marker instanceof HTMLElement) ||
        !marker.hasAttribute("data-window-anchor")
      ) {
        return rect.top + window.scrollY;
      }
      const release = marker.getBoundingClientRect().top + window.scrollY;
      return release + rect.top - windowFrame.getBoundingClientRect().top;
    };

    const chromeOffset = (element: HTMLElement) =>
      parseFloat(getComputedStyle(element).getPropertyValue("--chrome")) || 0;

    const snapPoints = () => {
      const points = [0, lenis.limit];
      const add = (y: number) => {
        if (Number.isFinite(y) && y >= 0 && y <= lenis.limit)
          points.push(Math.round(y));
      };

      // Give the opening story a few stops so its scroll-driven scenes still unfold in order.
      const story = document.querySelector<HTMLElement>("[data-scroll-story]");
      if (story) {
        const screens = Number(story.dataset.scrollStoryScreens) || 3.8;
        const stage = story.offsetHeight / screens;
        const top = documentY(story);
        [1, 2, 2.4, screens - 1].forEach((screen) => add(top + stage * screen));
      }

      // The main section destinations already define where each part is composed to be read.
      document
        .querySelectorAll<HTMLElement>("#about, #project, #design, #contact")
        .forEach((element) => {
          add(documentY(element) - chromeOffset(element));
        });

      // Settle on each featured project after its reveal, using the same timing as the project row click target.
      document
        .querySelectorAll<HTMLElement>("[data-scroll-panels]")
        .forEach((track) => {
          const intro = Number(track.dataset.scrollIntro) || 0;
          const segment = Number(track.dataset.scrollSegment) || 1.5;
          const top = documentY(track);
          track
            .querySelectorAll<HTMLElement>("[data-panel]")
            .forEach((panel, index) => {
              add(
                top + (intro + (index + 0.6) * segment) * panel.offsetHeight,
              );
            });
        });

      // Include the side-project list and the intermediate GROW stages so scrolling does not jump over their motion.
      document
        .querySelectorAll<HTMLElement>("[data-side]")
        .forEach((element) => {
          add(documentY(element) - chromeOffset(element));
        });
      document
        .querySelectorAll<HTMLElement>("[data-scroll-grow]")
        .forEach((section) => {
          const stage = section.querySelector<HTMLElement>(
            "[data-scroll-grow-stage]",
          );
          if (!stage) return;
          const top = documentY(section);
          const height = stage.offsetHeight;
          [1, 2, 3].forEach((screen) => {
            add(top + height * screen - chromeOffset(section));
          });
        });

      return [...new Set(points)].sort((a, b) => a - b);
    };

    // The next stop in the gesture's direction when it is close; otherwise the page stays where the gesture left it.
    const nearestPoint = () => {
      const points = snapPoints();
      const position = lenis.scroll;
      const ahead =
        gestureDirection > 0
          ? points.find((point) => point > position)
          : [...points].reverse().find((point) => point < position);
      if (
        ahead === undefined ||
        Math.abs(ahead - position) > window.innerHeight * SNAP_REACH
      )
        return position;
      return ahead;
    };

    const settle = () => {
      settleTimer = 0;
      if (!gesturePending) return;
      const remaining = GESTURE_GAP - (performance.now() - lastGestureInput);
      if (remaining > 0) {
        settleTimer = window.setTimeout(settle, remaining);
        return;
      }
      if (lenis.isStopped || lenis.isLocked) {
        gesturePending = false;
        return;
      }
      if (lenis.isScrolling) {
        settleFrame = requestAnimationFrame(settle);
        return;
      }

      const target = nearestPoint();
      gesturePending = false;
      const distance = Math.abs(target - lenis.scroll);
      if (distance < SNAP_MARGIN) return;
      lenis.scrollTo(target, {
        duration: Math.max(0.3, (distance / window.innerHeight) * SNAP_PACE),
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        force: true,
      });
    };

    const markGesture = (direction: number) => {
      if (!direction || lenis.isStopped || lenis.isLocked) return;
      if (!gesturePending) {
        gesturePending = true;
      }
      gestureDirection = Math.sign(direction);
      lastGestureInput = performance.now();
      window.clearTimeout(settleTimer);
      cancelAnimationFrame(settleFrame);
      settleTimer = window.setTimeout(settle, GESTURE_GAP);
    };

    const onWheel = (event: WheelEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("dialog[open]")
      ) {
        return;
      }
      markGesture(event.deltaY);
    };
    const onTouchStart = (event: TouchEvent) => {
      if (lenis.isStopped || lenis.isLocked || !event.touches.length) return;
      touchY = event.touches[0].clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (touchY === null || !event.touches.length) return;
      const nextY = event.touches[0].clientY;
      markGesture(touchY - nextY);
      touchY = nextY;
    };
    const onTouchEnd = () => {
      touchY = null;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(settleFrame);
      window.clearTimeout(settleTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      offScroll();
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}