// One pass per frame for everything tied to the page scroll: every job reads the layout first, then every job writes.
// A part that writes styles and then another that reads the layout in the same frame forces the browser to lay the
// whole page out again on the spot; with each part on its own scroll handler that happened several times per step.
// With smooth scroll the pass runs right after Lenis has moved the page, in that same frame (SmoothScroll calls
// flushScrollFrame on Lenis' scroll); native scrolling (touch, scrollbar, reduced motion) and resizes request a frame.
export type ScrollJob = { read?: () => void; write?: () => void };

const jobs = new Set<ScrollJob>();
let frame = 0;
let flushedY = Number.NaN;

export function flushScrollFrame() {
  if (frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  flushedY = window.scrollY;
  jobs.forEach((job) => job.read?.());
  jobs.forEach((job) => job.write?.());
}

export function requestScrollFrame() {
  if (!frame && jobs.size)
    frame = requestAnimationFrame(() => {
      frame = 0;
      flushScrollFrame();
    });
}

// A scroll the pass has already handled (Lenis flushed it) needs no second one.
const onScroll = () => {
  if (window.scrollY !== flushedY) requestScrollFrame();
};

// Registers a job (runs on every scroll and resize from now on) and returns its removal.
export function onScrollFrame(job: ScrollJob) {
  if (!jobs.size) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", requestScrollFrame);
  }
  jobs.add(job);
  return () => {
    jobs.delete(job);
    if (jobs.size) return;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", requestScrollFrame);
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}
