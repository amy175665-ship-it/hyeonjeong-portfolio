"use client";

import Image from "next/image";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { hobbies } from "@/data/profile";
import { scrollToY } from "@/components/layout/scrollLock";
import HobbyCactus from "@/components/sections/HobbyCactus";
import styles from "./HobbyFlow.module.css";

// Hobbies told as the portfolio's own flow: ABSORB. → BUILD. → GROW. side by side on a horizontal track. While the
// section passes, a window-high stage stays put and the page scroll steps through every hobby in order: within a
// group the next hobby is picked and its photo fades in (EXHIBITION & CAFE → MUSIC → TRAVEL), and after
// a group's last hobby the track slides left so the next group comes in from the right. The scroll only decides
// which step is current; every change then plays through on its own, so the track never rests between two panels. Each panel: the word (same
// accent letter and period as the hero: A coral, U green, G yellow), its meaning, the hobbies, and a large photo.
// Hovering (or focusing, or tapping) a hobby also shows its photo until the scroll moves on to another step.
// A hobby with several photos plays them as a slideshow: SLIDE_EVERY seconds each, cross-fading into the next.
const SLIDE_EVERY = 3.5;
// tints: placeholder backgrounds, one per hobby in order (three steps of the accent), so switching hobbies still
// shows a new panel sliding in while photos are missing.
const GROUPS = [
  { key: "absorb", word: ["", "A", "BSORB"], color: "#e96b5a", tints: ["#f6ddd5", "#efc6ba", "#f3d3ca", "#f8e3dc"], lead: "보고 듣고 흡수하는 것" },
  { key: "build", word: ["B", "U", "ILD"], color: "#7f9657", tints: ["#d9e0c8"], lead: "규칙을 파악하고 전략을 짜는 것" },
  { key: "grow", word: ["", "G", "ROW"], color: "#e9a33a", tints: ["#f2dcb3"], lead: "꾸준히 끝까지 가는 것" },
] as const;
// Same units on both ends: mixed ones ("0" vs "0%") made the last frame of the opening snap back to fully closed.
const OPEN = "inset(0% 0% 0% 0%)";
const CLOSED = "inset(0% 0% 0% 100%)"; // clipped away to the right edge, so opening reveals it from the right
const noop = () => {};
// The scroll timeline: one step per hobby, each UNIT window pages of scroll. The section is one page (the stage) plus
// the whole timeline tall. Moving to a step in another group slides the track over SLIDE_SECONDS.
const COUNTS = GROUPS.map(group => hobbies.filter(hobby => hobby.group === group.key).length);
const SEGMENTS = GROUPS.flatMap((_, g) => Array.from({ length: COUNTS[g] }, (_, item) => ({ group: g, item })));
const UNIT = 0.75;
const SLIDE_SECONDS = 0.9;
// Scroll progress (0..1) → the panel to show (0 = ABSORB … 2 = GROW) and the hobby showing in each panel (panels
// already passed keep their last hobby, panels still to come their first).
const stepAt = (progress: number) => {
  const index = Math.min(Math.floor(Math.min(Math.max(progress, 0), 1) * SEGMENTS.length), SEGMENTS.length - 1);
  const { group, item } = SEGMENTS[index];
  return { panel: group, items: COUNTS.map((count, g) => (g < group ? count - 1 : g > group ? 0 : item)) };
};

// Screen line the stage is held at: the height the window's title bar or the floating header covers (CSS --chrome).
const heldAt = (element: Element) => parseFloat(getComputedStyle(element).getPropertyValue("--chrome")) || 0;

export default function HobbyFlow() {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [steps, setSteps] = useState(() => COUNTS.map(() => 0));
  const x = useMotionValue(0);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  // A hobby picked by hover, focus or tap: move the page scroll (invisibly, the stage is pinned) to the middle of that
  // hobby's step, so scrolling on continues from it (MUSIC → BUILD) instead of from where the scroll last was.
  const pick = (group: number, item: number) => {
    const box = wrap.current, held = stage.current;
    if (!box || !held) return;
    const room = box.offsetHeight - held.offsetHeight;
    const passed = heldAt(box) - box.getBoundingClientRect().top;
    if (room <= 0 || passed <= 0 || passed >= room) return; // only while the stage is held in the window
    const index = SEGMENTS.findIndex(segment => segment.group === group && segment.item === item);
    const target = ((index + 0.5) / SEGMENTS.length) * room;
    if (stepAt(passed / room).items[group] === item && Math.floor((passed / room) * SEGMENTS.length) === index) return;
    scrollToY(Math.round(window.scrollY + target - passed));
  };

  // The stage is held by CSS sticky just under the window's title bar / header (--chrome); how far the section's top has
  // passed that line, as a share of the section's extra height, runs the timeline (stepAt).
  useEffect(() => {
    const box = wrap.current, held = stage.current, row = track.current;
    if (!box || !held || !row) return;
    let frame = 0, shown = 0, width = held.clientWidth;
    const place = () => {
      frame = 0;
      const room = box.offsetHeight - held.offsetHeight;
      const passed = Math.min(Math.max(heldAt(box) - box.getBoundingClientRect().top, 0), room);
      const { panel, items } = stepAt(room > 0 ? passed / room : 0);
      if (panel !== shown || held.clientWidth !== width) {
        // A new panel slides in all the way; a resize just puts the current one back in place.
        const resized = panel === shown;
        shown = panel;
        width = held.clientWidth;
        if (resized || reducedRef.current) x.jump(-panel * width);
        else animate(x, -panel * width, { duration: SLIDE_SECONDS, ease: [0.65, 0, 0.35, 1] });
      }
      setSteps(current => (current.join() === items.join() ? current : items));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(place); };
    place();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(box);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={wrap} aria-label="취미" className={styles.hobbies} style={{ height: `calc(${1 + SEGMENTS.length * UNIT} * var(--page-h, 600px))` }}>
      <div ref={stage} className={styles.stage}>
        <motion.div ref={track} className={styles.track} style={{ x }}>
          {GROUPS.map((group, g) => <HobbyPanel key={group.key} group={group} step={steps[g]} onPick={item => pick(g, item)} />)}
        </motion.div>
      </div>
    </section>
  );
}

function HobbyPanel({ group, step, onPick }: { group: (typeof GROUPS)[number]; step: number; onPick: (item: number) => void }) {
  const reduced = useReducedMotion();
  const items = hobbies.filter(hobby => hobby.group === group.key);
  // The scroll picks the hobby; a hover, focus or tap picks one at once and moves the scroll to its step (onPick).
  const [picked, setPicked] = useState<(typeof items)[number] | null>(null);
  useEffect(() => setPicked(null), [step]);
  const setActive = (hobby: (typeof items)[number]) => { setPicked(hobby); onPick(items.indexOf(hobby)); };
  const active = picked ?? items[step] ?? items[0];
  // Slideshow: restarts at the first photo whenever the hobby changes; advances only while the panel is on screen, the
  // pointer is not resting on the photo, and motion is allowed.
  const media = useRef<HTMLElement>(null);
  // Watched on the panel, not the photo: the photo's own opening clip-path kept the observer from reporting it until
  // the opening had finished, which held back the first slide by about a second.
  const panel = useRef<HTMLDivElement>(null);
  const onScreen = useInView(panel, { amount: 0.6 });
  const [slide, setSlide] = useState(0);
  const [resting, setResting] = useState(false);
  // While the pointer rests on a slideshow photo (mouse only), a small card of the next photo rides along beside the
  // cursor. It is drawn into <body> so the photo box does not clip it.
  const [peek, setPeek] = useState(false);
  const springy = reduced ? { duration: 0 } : { stiffness: 380, damping: 32, mass: 0.5 };
  const peekX = useSpring(0, springy), peekY = useSpring(0, springy);
  const pointer = useRef({ x: 0, y: 0 });
  const follow = (event: PointerEvent, jump = false) => {
    pointer.current = { x: event.clientX, y: event.clientY };
    const x = event.clientX + 18, y = event.clientY + 18;
    if (jump) { peekX.jump(x); peekY.jump(y); } else { peekX.set(x); peekY.set(y); }
  };
  // The photo can leave a still pointer without a pointerleave (window content moved by scroll, part switched to
  // display none, tab or menu jump), so while the card is shown, drop it once the photo is no longer under the pointer.
  useEffect(() => {
    if (!peek) return;
    let frame = 0;
    const check = () => {
      const box = media.current?.getBoundingClientRect();
      const { x, y } = pointer.current;
      if (!box || !box.width || x < box.left || x > box.right || y < box.top || y > box.bottom) {
        setPeek(false);
        setResting(false);
        return;
      }
      frame = requestAnimationFrame(check);
    };
    frame = requestAnimationFrame(check);
    return () => cancelAnimationFrame(frame);
  }, [peek]);
  const photos = active?.photos ?? [];
  useEffect(() => setSlide(0), [active]);
  // Fetch the rest of the photos up front so each one is ready before it opens.
  useEffect(() => { photos.slice(1).forEach(src => { const img = new window.Image(); img.src = src; }); }, [active]);
  useEffect(() => {
    if (photos.length < 2 || reduced || !onScreen || resting) return;
    const timer = window.setInterval(() => setSlide(current => (current + 1) % photos.length), SLIDE_EVERY * 1000);
    return () => window.clearInterval(timer);
  }, [photos.length, reduced, onScreen, resting, active]);
  const ease = [0.22, 1, 0.36, 1] as const;
  const at = (delay: number, duration = 0.7) => (reduced ? { duration: 0 } : { duration, delay, ease });
  const rise: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 28 },
    shown: (i: number) => ({ opacity: 1, y: 0, transition: at(0.08 * i) }),
  };
  const open: Variants = {
    hidden: reduced ? { opacity: 0 } : { clipPath: CLOSED },
    shown: reduced ? { opacity: 1, transition: { duration: 0 } } : { clipPath: OPEN, transition: at(0.15, 0.9) },
  };
  if (!active) return null;

  return (
    <div ref={panel} className={styles.panel} style={{ "--accent": group.color } as CSSProperties}>
      <motion.div className={styles.inner} initial="hidden" whileInView="shown" viewport={{ once: false, amount: 0.25 }}>
        <div className={styles.text}>
          <div className={styles.textBlock}>
          <motion.h3 className={styles.word} custom={0} variants={rise} lang="en">
            {group.word[0]}<span className={styles.accent}>{group.word[1]}</span>{group.word[2]}<span className={styles.accent}>.</span>
          </motion.h3>
          <motion.p className={styles.lead} custom={1} variants={rise}>{group.lead}</motion.p>
          <div className={styles.cactusSlot} style={GROUPS.indexOf(group) === 0 ? { flexBasis: 170 } : undefined}>
            <HobbyCactus stage={GROUPS.indexOf(group)} count={items.length} ripe={items.indexOf(active)} color={group.color} />
          </div>
          <ul className={styles.items}>
            {items.map((hobby, i) => (
              <motion.li key={hobby.title} custom={2 + i} variants={rise}>
                <button
                  type="button"
                  className={styles.item}
                  aria-pressed={hobby === active}
                  onFocus={() => setActive(hobby)}
                  onClick={() => setActive(hobby)}
                >
                  {/* Only the name itself reacts to the mouse, not the space around it. */}
                  <span className={styles.itemTitle} lang="en" onPointerEnter={event => { if (event.pointerType === "mouse") setActive(hobby); }}>{hobby.title}</span>
                  {hobby.description && <span className={styles.itemText}>{hobby.description}</span>}
                </button>
              </motion.li>
            ))}
          </ul>
          </div>
        </div>
        {/* onUpdate (a no-op) keeps framer from handing the clip-path to WAAPI, whose hand-back at the end flashed the
            photo fully closed for one frame. */}
        <motion.figure ref={media} className={styles.media} variants={open} aria-hidden="true" onUpdate={noop} onPointerEnter={event => { setResting(true); if (event.pointerType === "mouse") { follow(event, true); setPeek(true); } }} onPointerMove={event => { if (event.pointerType === "mouse") follow(event); }} onPointerLeave={() => { setResting(false); setPeek(false); }}>
          <AnimatePresence initial={false}>
            <motion.div
              key={`${active.title}-${slide}`}
              className={styles.slide}
              style={{ background: group.tints[Math.max(items.indexOf(active), 0) % group.tints.length] }}
              // The new photo fades in on top while the old one stays fully shown underneath (no muddy double image),
              // and the old one is dropped once the new one is opaque.
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1, transition: { duration: 0, delay: reduced ? 0 : 0.9 } }}
              transition={reduced ? { duration: 0 } : { duration: 0.9, ease: "easeInOut" }}
            >
              {photos.length
                ? <Image src={photos[slide % photos.length]} alt="" style={{ objectPosition: active.focus?.[photos[slide % photos.length]] }} fill sizes="(min-width: 900px) 60vw, 100vw" className={styles.image} unoptimized />
                : <span className={styles.placeholder}><small>사진 준비 중</small></span>}
            </motion.div>
          </AnimatePresence>
        </motion.figure>
        {photos.length > 1 && typeof document !== "undefined" && createPortal(
          <AnimatePresence>
            {peek && (
              <motion.div
                className={styles.peek}
                style={{ x: peekX, y: peekY }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: reduced ? 0 : 0.2, ease: "easeOut" }}
                aria-hidden="true"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[(slide + 1) % photos.length]} alt="" style={{ objectPosition: active.focus?.[photos[(slide + 1) % photos.length]] }} />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
      </motion.div>
    </div>
  );
}
