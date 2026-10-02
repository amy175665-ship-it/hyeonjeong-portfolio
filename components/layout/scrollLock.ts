import type Lenis from "lenis";

// Holds the page at one scroll position (used while the cactus story plays). Wheel, touch and scroll keys are
// ignored and any other scroll (scrollbar drag) is put back. Clicking a link releases the lock so the menu still works.
let lenis: Lenis | null = null;
let lockedY: number | null = null;

const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "ArrowUp", "ArrowDown", "Home", "End"]);
const block = (event: Event) => event.preventDefault();
const blockKeys = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null;
  if (SCROLL_KEYS.has(event.key) && !target?.closest("input, textarea, select, button, a, [contenteditable]")) event.preventDefault();
};
const hold = () => {
  if (lockedY !== null && Math.abs(window.scrollY - lockedY) > 1) window.scrollTo(0, lockedY);
};
const releaseOnLink = (event: MouseEvent) => {
  if ((event.target as HTMLElement | null)?.closest("a[href]")) unlockScroll();
};

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
  if (lockedY !== null) instance?.stop();
}

// Jumps straight to a scroll position (through Lenis when it runs, so it does not drift back).
export function scrollToY(y: number) {
  // Lenis measures the page height with a delay; re-measure so a just-grown page is not clamped short.
  lenis?.resize();
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}

// Glides to a scroll position over `duration` seconds, ignoring wheel, touch and scroll keys on the way.
export function glideTo(y: number, duration: number, onDone: () => void, easing = (t: number) => 1 - Math.pow(1 - t, 3)) {
  if (!lenis || duration <= 0) {
    window.scrollTo(0, y);
    onDone();
    return;
  }
  window.addEventListener("wheel", block, { passive: false });
  window.addEventListener("touchmove", block, { passive: false });
  window.addEventListener("keydown", blockKeys);
  lenis.resize();
  lenis.scrollTo(y, {
    duration, force: true, lock: true, easing,
    onComplete: () => {
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", blockKeys);
      onDone();
    },
  });
}

export function lockScroll(y: number) {
  if (lockedY !== null) return;
  lockedY = y;
  lenis?.scrollTo(y, { immediate: true, force: true });
  lenis?.stop();
  window.scrollTo(0, y);
  window.addEventListener("wheel", block, { passive: false });
  window.addEventListener("touchmove", block, { passive: false });
  window.addEventListener("keydown", blockKeys);
  window.addEventListener("scroll", hold);
  document.addEventListener("click", releaseOnLink, true);
}

export function unlockScroll() {
  if (lockedY === null) return;
  lockedY = null;
  window.removeEventListener("wheel", block);
  window.removeEventListener("touchmove", block);
  window.removeEventListener("keydown", blockKeys);
  window.removeEventListener("scroll", hold);
  document.removeEventListener("click", releaseOnLink, true);
  lenis?.start();
}
