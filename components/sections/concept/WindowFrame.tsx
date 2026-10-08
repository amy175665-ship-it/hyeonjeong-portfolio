"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { scrollToY } from "@/components/layout/scrollLock";
import { setWindowState } from "@/components/stage/windowState";
import { navCta, navLinks } from "@/data/navigation";
import { stageOfPart } from "@/data/stages";
import { DISSOLVE_SCREENS } from "./scenes";
import styles from "./WindowFrame.module.css";

// The page content after the cactus story, in a near-white browser window. It is ordinary document content that comes
// right after the story's pinned track (and overlaps its last screen), so the page simply scrolls through it.
// - Before its top is reached it is held at the top of the screen (a transform), hidden and behind the stage, so the
//   sand hand-off can uncover it; ConceptScenes puts it in front once the hand-off is over.
// - From the hand-off's end it stays held for DISSOLVE_SCREENS more screens of scroll while the window frame (title bar,
//   and on phones the card margins) dissolves into the full-screen layout: --frame goes 1 → 0. Then it scrolls on.
// - Menu links to its sections (#about, #project, #design, #contact) jump there and skip the story.
const TARGETS = ["about", "project", "design", "contact"];
const HIDDEN = "inset(0 0 100% 0)";
const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Props = {
  rise: MotionValue<number>; // the sand hand-off, 0 (story) .. 1 (window up)
  clip: MotionValue<string>; // hides the window until the hand-off uncovers it
  enterAt: number; // rise value from which the first part plays its entrance animation
  upAt: number; // rise value from which the window shows (the header hides its menu button behind the tabs)
  onNavigate: () => void; // a jump into the window skips the cactus story and puts the window up at once
  onClose: () => void; // the toolbar's × / − buttons: lower the window back into the dunes
  children: ReactNode;
};

export default function WindowFrame({ rise, clip, enterAt, upAt, onNavigate, onClose, children }: Props) {
  const anchor = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [part, setPart] = useState(TARGETS[0]);
  const currentPart = useRef(part);
  currentPart.current = part;
  const entered = useRef(false);
  const goNext = useRef(() => {});
  const sections = [...navLinks, navCta];

  // Page scroll at which the window is released into the normal flow (the end of the frame dissolve).
  const releaseY = () => (anchor.current ? anchor.current.getBoundingClientRect().top + window.scrollY : 0);
  // One stage height (CSS max(600px, 100svh)), measured so script and layout agree.
  const screen = () => ruler.current?.offsetHeight ?? window.innerHeight;
  // Page scroll of an element inside the window, whatever transform the window has right now.
  const yOf = (element: Element) => releaseY() + element.getBoundingClientRect().top - (win.current?.getBoundingClientRect().top ?? 0);
  // Height the title bar (and later the floating header) covers at the top of the screen (CSS --chrome).
  const chrome = () => parseFloat(getComputedStyle(content.current ?? document.documentElement).getPropertyValue("--chrome")) || 0;

  // Entrance of the first part (the about page CSS replays it on data-enter="play"): held hidden while the window is
  // down, played when it comes up or a menu link enters it.
  const enterFirst = (play: boolean) => {
    const first = content.current?.firstElementChild as HTMLElement | null;
    if (!first) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { first.removeAttribute("data-enter"); return; }
    if (!play) { first.dataset.enter = "wait"; return; }
    first.removeAttribute("data-enter");
    void first.offsetWidth; // restart the CSS animations
    first.dataset.enter = "play";
  };

  const paint = () => {
    const box = win.current;
    if (!box) return;
    const y = window.scrollY, release = releaseY(), dissolve = screen() * DISSOLVE_SCREENS;
    box.style.transform = y < release ? `translateY(${(y - release).toFixed(1)}px)` : "";
    const up = rise.get();
    const frame = up >= 1 ? 1 - easeInOut(clamp((y - (release - dissolve)) / dissolve)) : 1;
    box.style.setProperty("--frame", frame.toFixed(4));
    const handoff = clip.get();
    box.style.clipPath = handoff !== "none" ? handoff : frameClip(frame);
    box.toggleAttribute("data-hidden", handoff === HIDDEN);
    const floating = up >= 1 && frame < 0.5;
    document.documentElement.toggleAttribute("data-window-up", up > upAt && !floating);
    setWindowState({ floating });
  };
  useMotionValueEvent(rise, "change", value => {
    if (value > enterAt && !entered.current) { entered.current = true; enterFirst(true); }
    else if (value < 0.02 && entered.current) { entered.current = false; enterFirst(false); }
    paint();
  });
  useMotionValueEvent(clip, "change", paint);

  useEffect(() => {
    const inner = content.current;
    if (!inner) return;
    entered.current = rise.get() > enterAt;
    enterFirst(entered.current);
    paint();
    const parts = Array.from(inner.children) as HTMLElement[];
    const partIds = parts.map(element => TARGETS.find(id => element.matches(`#${id}`) || element.querySelector(`#${id}`)) ?? TARGETS[0]);

    // The part crossing the middle of the screen is the current one (tab, header stage word).
    const watcher = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = partIds[parts.indexOf(entry.target as HTMLElement)];
        setPart(id);
        setWindowState({ stage: stageOfPart(id).id });
      });
    }, { rootMargin: "-50% 0px -50% 0px" });
    parts.forEach(element => watcher.observe(element));

    const navigate = (id: string) => {
      const target = TARGETS.includes(id) ? inner.querySelector(`#${id}`) : null;
      if (!target) return false;
      onNavigate();
      scrollToY(Math.round(yOf(target) - chrome()));
      if (id === TARGETS[0]) enterFirst(true);
      return true;
    };
    // Green window button: the next part in order (about → projects → design → contact), back to about after the last.
    goNext.current = () => {
      const index = partIds.indexOf(currentPart.current);
      const id = partIds[(index + 1) % parts.length];
      if (navigate(id)) history.pushState(null, "", `#${id}`);
    };
    const click = (event: MouseEvent) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !navigate(url.hash.slice(1))) return;
      event.preventDefault();
      history.pushState(null, "", url.hash);
    };
    // Tabbing into the window before the story is over puts the window up and brings the focused element in.
    const focus = (event: FocusEvent) => {
      if (rise.get() >= 1) return;
      onNavigate();
      scrollToY(Math.round(yOf(event.target as Element) - window.innerHeight / 3));
    };
    const hash = () => navigate(location.hash.slice(1));
    const frame = requestAnimationFrame(() => requestAnimationFrame(hash));

    document.addEventListener("click", click, true);
    inner.addEventListener("focusin", focus);
    window.addEventListener("popstate", hash);
    window.addEventListener("scroll", paint, { passive: true });
    window.addEventListener("resize", paint);
    return () => {
      watcher.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("click", click, true);
      inner.removeEventListener("focusin", focus);
      window.removeEventListener("popstate", hash);
      window.removeEventListener("scroll", paint);
      window.removeEventListener("resize", paint);
      document.documentElement.removeAttribute("data-window-up");
      setWindowState({ floating: false });
    };
    // Set up once; the callbacks read refs and the latest scroll values.
  }, []);
  return (
    <>
      <div ref={anchor} className={styles.anchor} aria-hidden="true"><div ref={ruler} className={styles.ruler} /></div>
      <div ref={win} className={styles.window} data-desert-window>
        <div className={styles.bar}>
          {/* Window buttons like a Mac's: hovering the group shows ×, − and ›. Coral and yellow lower the window,
              green goes on to the next part. */}
          <span className={styles.dots}>
            <button type="button" className={styles.dotClose} aria-label="창 닫기" onClick={onClose} />
            <button type="button" className={styles.dotMin} aria-label="창 내리기" onClick={onClose} />
            <button type="button" className={styles.dotNext} aria-label="다음 섹션" onClick={() => goNext.current()} />
          </span>
          {/* Tabs: the site's main menu as the window's browser tabs; the current part's tab joins the page. */}
          <nav aria-label="창 안 이동" className={styles.tabs}>
            <ol>
              {sections.map(link => {
                const id = link.href.split("#")[1] ?? "";
                const current = id === part;
                return (
                  <li key={link.href}>
                    <a href={link.href} aria-current={current ? "location" : undefined} className={current ? `${styles.tab} ${styles.tabCurrent}` : styles.tab} lang="en">{link.label}</a>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
        <div ref={content} className={styles.content}>{children}</div>
      </div>
    </>
  );
}

// Phones: the framed window is a card under the header (84px down, 8px from the sides, rounded top corners); the
// margins close up as the frame dissolves. Desktop: the window already fills the screen, so nothing is clipped.
function frameClip(frame: number) {
  if (frame <= 0 || !matchMedia("(max-width: 1023px)").matches) return "none";
  const top = 84 * frame, side = 8 * frame, round = 12 * frame;
  return `inset(${top.toFixed(1)}px ${side.toFixed(1)}px 0 ${side.toFixed(1)}px round ${round.toFixed(1)}px ${round.toFixed(1)}px 0 0)`;
}
