"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  motion,
  type AnimationPlaybackControls,
  type MotionStyle,
} from "framer-motion";
import sandImage from "@/public/images/hero/hero-sand-bg.webp";
import {
  glideTo,
  lockScroll,
  scrollToY,
  unlockScroll,
} from "@/components/layout/scrollLock";
import WindGust from "./WindGust";
import PollenGrow from "./PollenGrow";
import WindowFrame from "./WindowFrame";
import SandHandoff, { HANDOFF } from "./SandHandoff";
import {
  COVER,
  COVER_SCROLL,
  DISSOLVE_SCREENS,
  PLAY_SECONDS,
  SCENES,
  sceneProgress,
  skyAt,
  type SceneName,
  type Wind,
} from "./scenes";
import styles from "./ConceptScenes.module.css";

const CactusScene = dynamic(() => import("./CactusScene"), { ssr: false });

// One pinned scroll track for the hero and the concept story: the sand rises over the hero (children),
// the backdrop swaps to the desert stage while it is covered, the sand sinks to the horizon (all with the scroll),
// then the scenes play on their own while the stage stays pinned a little longer.
// SCENE 2 builds the cactus in the wind, SCENE 3 turns the sky from day to night to dawn, SCENE 4 blooms into "GROW.".
// Seeded so the server and client render the same stars.
const STARS = (() => {
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 70 }, () => ({
    left: random() * 100,
    top: random() * 55,
    size: 1 + random() * 1.8,
    glow: 0.45 + random() * 0.55,
  }));
})();
const HORIZON = 0.62; // dune crest height (fraction of the stage) once the sand has sunk back down
const CREST = 0.35; // the dune crest sits 35% down the sand image (on average)
// Crest height (fraction of the image height) at 11 evenly spaced points across the sand image, left to right.
const CREST_PROFILE = [
  0.369, 0.343, 0.35, 0.358, 0.365, 0.375, 0.36, 0.343, 0.345, 0.322, 0.331,
];
const COVERED = 0.4; // image offset (fraction of its height) above the stage top that hides the hero completely
// The cactus is first seen when the sand starts to sink; its 3D canvas only renders from there on.
const CACTUS_FROM =
  SCENES.cover[0] + (SCENES.cover[1] - SCENES.cover[0]) * COVER.sink;
// Scrolling back up this far above the cover end (a wheel notch or so) rewinds a started story.
const REWIND_FROM = COVER_SCROLL - 0.01;
// Logo click on this page: seconds for the slow glide from the end of the cover back to the top.
const RETURN_SECONDS = 3;
// Hand-off from the story to the browser window (teacher's feedback): the last scene scatters into sand and the sand
// gathers into the window's first page (SandHandoff, phases in HANDOFF on the window's `raise` value 0..1; lowering
// the window plays it backwards).
// The hand-off is laid out over HANDOFF_SECONDS (3.2) and plays faster here (3.2 until 2026-10-16).
const RAISE_SECONDS = 2.2; // with the scroll (window button, one wheel step)
const JUMP_SECONDS = 1.2; // the logo's way home: quicker, the page glides on anyway
const FINISH_SECONDS = 0.35; // a wheel step or touch during the glide: the rest of the hand-off, quickly
const ramp = (value: number, [from, to]: readonly [number, number]) =>
  Math.min(Math.max((value - from) / (to - from), 0), 1);
const smooth = (t: number) => t * t * (3 - 2 * t);
const HIDDEN_CLIP = "inset(0 0 100% 0)";

// `content` (the page sections) appears in a browser window (WindowFrame) that the sand uncovers after the story.
export default function ConceptScenes({
  children,
  content,
}: {
  children: ReactNode;
  content?: ReactNode;
}) {
  // The story part of the track (3.8 screens); the track is DISSOLVE_SCREENS longer, where the window frame dissolves.
  const storyTrack = useRef<HTMLDivElement>(null);
  const scenes = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const sand = useRef<HTMLImageElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const cactusWrap = useRef<HTMLDivElement>(null);
  const pollenLayer = useRef<HTMLDivElement>(null);
  const closing = useRef<HTMLDivElement>(null);
  // What the hand-off scatters (the cactus's 3D canvas, the sand "GROW." canvas, the closing text) and what it forms
  // (the window's first page).
  const handoffSources = () => [
    ...(cactusWrap.current?.querySelectorAll("canvas") ?? []),
    ...(pollenLayer.current?.querySelectorAll("canvas") ?? []),
    ...(closing.current ? [closing.current] : []),
  ];
  const handoffTarget = () =>
    document.querySelector("[data-window-content] > *");
  const wind = useRef<Wind>({ value: 0 });
  const [desktop, setDesktop] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cactusActive, setCactusActive] = useState(false);
  const { scrollYProgress } = useScroll({
    target: storyTrack,
    offset: ["start start", "end end"],
  });
  // The first part of the pinned scroll drives the cover (story 0..end of "cover"); the rest only holds the stage.
  const coverScroll = useTransform(
    scrollYProgress,
    (value) => Math.min(value / COVER_SCROLL, 1) * SCENES.cover[1],
  );
  const holdScroll = useTransform(scrollYProgress, (value) =>
    Math.min(Math.max((value - COVER_SCROLL) / (1 - COVER_SCROLL), 0), 1),
  );
  // The cover trails the scroll on a soft spring, so a quick flick of the wheel still plays it gently.
  const sandProgress = useSpring(coverScroll, {
    stiffness: 55,
    damping: 22,
    mass: 0.8,
    restDelta: 0.0005,
  });
  // -1 until the cover has finished, then 0..1 through build → adapt → grow. It plays over PLAY_SECONDS
  // (with reduced motion it follows the hold scroll instead), so nobody has to keep scrolling to see the cactus grow.
  const playhead = useMotionValue(-1);
  const playback = useRef<AnimationPlaybackControls | null>(null);
  const story = useTransform(
    [sandProgress, playhead],
    ([cover, play]: number[]) =>
      play < 0 ? cover : SCENES.cover[1] + (1 - SCENES.cover[1]) * play,
  );
  // Scrolling back up above the cover end quickly fades the cactus, pollen and text out (1 → 0) before the story
  // resets, instead of leaving them standing until the sand has risen over them.
  const outro = useMotionValue(1);
  // The browser window (0 below the stage .. 1 in place). It does not follow the scroll: one wheel step after the
  // story rises it in a single glide, one step up from the top of its content lowers it again (see setRaised).
  const raise = useMotionValue(0);
  const raised = useRef(false);
  const gliding = useRef(false);
  // Sand hand-off: from its first frame the grains (SandHandoff) stand in for the cactus, the sand "GROW." and the
  // closing text, so those step aside at once; the desert behind them fades to the window's white.
  const textFade = useTransform([outro, raise], ([fade, up]: number[]) =>
    up <= 0 ? fade : 0,
  );
  const cactusFade = textFade;
  const handoffWhite = useTransform(raise, (up) =>
    smooth(ramp(up, HANDOFF.white)),
  );
  // The window's title bar and page fade in as the grains finish forming them.
  const barIn = useTransform(raise, (up) => smooth(ramp(up, HANDOFF.bar)));
  const pageIn = useTransform(raise, (up) => smooth(ramp(up, HANDOFF.settle)));
  const windowClip = useMotionValue(HIDDEN_CLIP);
  const rewinding = useRef(false);
  // Once the story has finished and the page is free again, a small falling-grain cue at the bottom says "keep going";
  // it fades away as soon as the page scrolls on.
  const cueIn = useMotionValue(0);
  const finishPlayback = () => {
    unlockScroll();
    animate(cueIn, 1, { duration: 0.6, delay: 0.3 });
  };
  // SKIP (kept for good, 2026-10-13): while the story plays (and the scroll is held) it jumps to its end.
  const [skippable, setSkippable] = useState(false);
  useMotionValueEvent(playhead, "change", (value) =>
    setSkippable(value >= 0 && value < 1),
  );
  // "프로젝트 바로 보기" on the opening screen fades out as soon as the sand starts to rise (keyboard focus shows it).
  const jumpFade = useTransform(
    coverScroll,
    (value) => 1 - Math.min(value / (SCENES.cover[1] * 0.12), 1),
  );
  const jumpPointer = useTransform(jumpFade, (value) =>
    value < 0.05 ? "none" : "auto",
  );
  const skip = () => {
    playback.current?.stop();
    playback.current = null;
    playhead.set(1);
    finishPlayback();
  };
  // Every phrase moves the same way: rises a little while fading in after `from`, then only fades out
  // before its scene ends (the last one stays).
  const usePhrase = (scene: SceneName, from: number, last = false) => {
    const enter = (value: number) =>
      Math.min(Math.max((sceneProgress(value, scene) - from) / 0.12, 0), 1);
    const opacity = useTransform(
      [story, textFade],
      ([value, fade]: number[]) =>
        fade *
        enter(value) *
        (last ? 1 : Math.min((1 - sceneProgress(value, scene)) / 0.1, 1)),
    );
    const y = useTransform(story, (value) => (1 - enter(value)) * 14);
    return { opacity, y };
  };
  const buildText = usePhrase("build", 0.18); // with the first cactus segment
  const adaptText = usePhrase("adapt", 0.1);
  const finalText = usePhrase("grow", 0.7, true); // after "GROW." has formed
  const sunset = useTransform(story, (value) => skyAt(value).sunset);
  const night = useTransform(story, (value) => skyAt(value).night);
  const dawn = useTransform(story, (value) => skyAt(value).dawn);
  const nightTint = useTransform(night, (value) => value * 0.55);
  const sunsetTint = useTransform(sunset, (value) => value * 0.28);
  // SCENE 3 statement: charcoal first line (lifts to ivory only in the night so it stays readable), ivory second line.
  const statementInk = useTransform(night, [0, 1], ["#202731", "#fff7e2"]);

  useEffect(() => {
    const wide = matchMedia("(min-width: 1024px)");
    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setDesktop(wide.matches);
      setReduced(motionQuery.matches);
    };
    update();
    wide.addEventListener("change", update);
    motionQuery.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (stage.current) observer.observe(stage.current);
    return () => {
      wide.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  // Viewport y of the dune crest at viewport x, following the image's ridge line.
  const crestLine = (sandBox: DOMRect) => (x: number) => {
    const t =
      Math.min(Math.max((x - sandBox.left) / sandBox.width, 0), 1) *
      (CREST_PROFILE.length - 1);
    const i = Math.min(Math.floor(t), CREST_PROFILE.length - 2);
    return (
      sandBox.top +
      sandBox.height *
        (CREST_PROFILE[i] + (CREST_PROFILE[i + 1] - CREST_PROFILE[i]) * (t - i))
    );
  };

  // The fixed header belongs to the scene: the rising dune ridge hides it from the bottom up, it stays hidden
  // while the screen is covered, and the sinking ridge uncovers it again from the top down.
  const coverHeader = (local: number, sandBox: DOMRect) => {
    const header = document.querySelector<HTMLElement>("header");
    if (!header) return;
    const clear = () => {
      header.style.clipPath = "";
      header.style.pointerEvents = "";
    };
    // Only during the cover transition: afterwards the dunes scroll up with the stage and must not clip the header.
    if (local >= 1) {
      clear();
      return;
    }
    if (local >= COVER.risen && local < COVER.sink) {
      header.style.clipPath = "inset(0 0 100% 0)";
      header.style.pointerEvents = "none";
      return;
    }
    const box = header.getBoundingClientRect();
    const crestAt = crestLine(sandBox);
    const margin = 60; // the logo overflows the header box
    const xs = Array.from(
      { length: 25 },
      (_, i) => box.left - margin + ((box.width + margin * 2) * i) / 24,
    );
    const crests = xs.map(crestAt);
    // Untouched while the ridge is below the header, so the open mobile menu panel is never clipped.
    if (Math.min(...crests) >= box.bottom + margin) {
      clear();
      return;
    }
    header.style.pointerEvents = Math.max(...crests) <= box.top ? "none" : "";
    const ridge = xs
      .map(
        (x, i) =>
          `${(x - box.left).toFixed(1)}px ${(crests[i] - box.top).toFixed(1)}px`,
      )
      .reverse();
    header.style.clipPath = `polygon(${-margin}px ${-margin}px, ${box.width + margin}px ${-margin}px, ${ridge.join(", ")})`;
  };
  useEffect(
    () => () => {
      const header = document.querySelector<HTMLElement>("header");
      if (header) {
        header.style.clipPath = "";
        header.style.pointerEvents = "";
      }
    },
    [],
  );

  // Cover transition: start where the hero's own dunes sit (crest at 87% / 80%), rise until the hero is hidden,
  // swap the backdrop, then sink until the crest sits on the horizon line.
  const placeSand = (value: number) => {
    const image = sand.current,
      box = stage.current;
    if (!image || !box) return;
    const height = box.clientHeight,
      imageHeight = image.clientHeight;
    const rest = height * (desktop ? 0.87 : 0.8) - imageHeight * CREST;
    const covered = -imageHeight * COVERED;
    const horizon = height * HORIZON - imageHeight * CREST;
    const local = sceneProgress(value, "cover");
    const ease = smooth;
    const y =
      local < COVER.risen
        ? rest + (covered - rest) * ease(local / COVER.risen)
        : local < COVER.sink
          ? covered
          : covered +
            (horizon - covered) * ease((local - COVER.sink) / (1 - COVER.sink));
    image.style.transform = `translate(-50%, ${y}px)`;
    const sandBox = image.getBoundingClientRect();
    coverHeader(local, sandBox);
    // The window waits behind the stage, hidden until the hand-off has turned the screen white; from then on the stage
    // steps aside (data-handoff) so the window shows under the gathering grains, and once it is fully up it comes in
    // front of the stage (data-up).
    const up = raise.get();
    windowClip.set(up < HANDOFF.shown ? HIDDEN_CLIP : "none");
    box.toggleAttribute("data-handoff", up >= HANDOFF.shown);
    scenes.current?.toggleAttribute("data-up", up >= 1);
    if (hero.current) {
      const hidden = local >= COVER.swap;
      hero.current.style.visibility = hidden ? "hidden" : "visible";
      // Tells the hero's avatar and sand stream to stop rendering while they are covered.
      hero.current.toggleAttribute("data-paused", hidden);
    }
  };
  useMotionValueEvent(sandProgress, "change", placeSand);
  useMotionValueEvent(raise, "change", () => placeSand(sandProgress.get()));
  useMotionValueEvent(story, "change", (value) =>
    setCactusActive(value >= CACTUS_FROM),
  );
  // Starts the story once the sand has settled on the horizon; scrolling back up until the sand rises over the
  // cactus again resets it, so it plays again on the way down. A started playback keeps going even off screen.
  const syncPlayback = () => {
    const cover = sandProgress.get();
    // Resets on the real scroll, not the trailing spring, so a jump into the window (menu, link with a hash) that the
    // spring follows up from the top does not undo the skipped story; nor while the window is up (a menu jump settles
    // the spring before the page has scrolled down).
    if (coverScroll.get() < CACTUS_FROM && !raised.current) {
      playback.current?.stop();
      playback.current = null;
      playhead.set(-1);
      cueIn.set(0);
      unlockScroll();
      return;
    }
    if (cover < SCENES.cover[1] - 0.003 || rewinding.current) return;
    if (reduced) {
      // No timed playback with reduced motion: the finished scene shows at once (the hold scroll raises the window,
      // or straight away if the page has already scrolled past the cover before the spring settled).
      if (playhead.get() < 1) playhead.set(1);
      if (!raised.current && scrollYProgress.get() > COVER_SCROLL + 0.005)
        setRaised(true, false);
    } else if (playhead.get() < 0 && scrollYProgress.get() >= REWIND_FROM) {
      playhead.set(0);
      playback.current = animate(playhead, 1, {
        duration: PLAY_SECONDS,
        ease: "linear",
        onComplete: finishPlayback,
      });
    }
  };
  useMotionValueEvent(sandProgress, "change", syncPlayback);
  // While the story plays the page stays where the cover ended (released when it finishes or a link is clicked).
  // Not with reduced motion, where the hold scroll itself moves the scenes.
  const rewind = () => {
    rewinding.current = true;
    playback.current?.stop();
    playback.current = null;
    unlockScroll();
    animate(outro, 0, {
      duration: 0.35,
      ease: "easeOut",
      onComplete: () => {
        playhead.set(-1);
        outro.set(1);
        cueIn.set(0);
        rewinding.current = false;
      },
    });
  };
  // Page scroll where the cover ends (the story plays here) and where the window has risen and its content starts.
  const storyY = (at: number) => {
    const box = storyTrack.current;
    return box
      ? Math.round(
          box.getBoundingClientRect().top +
            window.scrollY +
            (box.offsetHeight - window.innerHeight) * at,
        )
      : 0;
  };
  const coverEnd = () => storyY(COVER_SCROLL);
  // Where the hand-off leaves the page: the end of the story track, with the stage (one cover height) still pinned.
  const travelStart = () => {
    const box = storyTrack.current;
    return box
      ? Math.round(
          box.getBoundingClientRect().top +
            window.scrollY +
            box.offsetHeight -
            (stage.current?.clientHeight ?? window.innerHeight),
        )
      : 0;
  };
  // Rises or lowers the window in one move (the sand hand-off, see HANDOFF); with `glide` the page scroll moves along
  // to where that state lives.
  const setRaised = (up: boolean, glide: boolean) => {
    raised.current = up;
    // Already past the hand-off (a jump deep into the window): the stage is out of view, so the window is simply up.
    if (up && !glide && window.scrollY > travelStart() + 2) {
      raise.jump(1);
      return;
    }
    const duration = reduced ? 0 : glide ? RAISE_SECONDS : JUMP_SECONDS;
    animate(raise, up ? 1 : 0, { duration, ease: "linear" });
    if (!glide) return;
    gliding.current = true;
    const end = up ? travelStart() : coverEnd();
    glideTo(
      end,
      duration,
      () => {
        gliding.current = false;
      },
      undefined,
      // A wheel step, touch or scroll key on the way does not wait for the glide: the page is put at its end (the
      // window is held at the top all the way, so nothing jumps), the hand-off finishes quickly, and the input scrolls
      // on from there. A new animation on `raise` replaces the running one.
      () => {
        gliding.current = false;
        scrollToY(end);
        animate(raise, up ? 1 : 0, { duration: FINISH_SECONDS, ease: "linear" });
      },
    );
  };
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    // After the story: a small step down from the cover end raises the window, a small step up from its top lowers it.
    // Jumps past either point (menu links, fast flicks) only switch the window without gliding.
    if (!gliding.current && playhead.get() >= 1) {
      if (!raised.current && value > COVER_SCROLL + 0.005)
        setRaised(true, value < 1);
      else if (raised.current && value < 1 - 0.005)
        setRaised(false, value >= COVER_SCROLL);
    }
    if (
      !reduced &&
      value < REWIND_FROM &&
      playhead.get() >= 0 &&
      !rewinding.current
    )
      rewind();
    if (reduced || value < COVER_SCROLL || value >= 1 || playhead.get() >= 1)
      return;
    lockScroll(coverEnd());
  });
  // Ends the story at once, without the scroll lock or cue (used when jumping into the window or back to the top).
  const jumpPastStory = () => {
    playback.current?.stop();
    playback.current = null;
    playhead.set(1);
    cueIn.set(0);
    unlockScroll();
  };
  // Menu links, links with a hash and keyboard focus land inside the window: end the story and put the window up at
  // once (the page jumps straight into it, so there is no hand-off to watch; the scroll progress may also already read
  // "past the story" from the browser's own anchor jump, so the scroll handler would not see a change to react to).
  const enterWindow = () => {
    jumpPastStory();
    raised.current = true;
    // The cover would otherwise replay on its trailing spring behind the window; settle it on the desert at once.
    sandProgress.jump(SCENES.cover[1]);
    raise.jump(1);
  };
  // The toolbar's × / − buttons: from anywhere in the window, back to its top, then the hand-off plays backwards.
  const closeWindow = () => {
    if (!raised.current) return;
    if (window.scrollY > travelStart()) scrollToY(travelStart());
    setRaised(false, true);
  };
  // The logo (a link to "/") on this page: instead of jumping to the top, the window drops away and the page glides up
  // slowly, so the sand rises over the scene, holds, and sinks back to the hero in one smooth move.
  const returnHome = () => {
    // Not into the story yet (the hero, or the sand still rising): nothing to wind back, so the story stays at its
    // start. Ending it here would leave the finished scene over the hero, as no scroll change would reset it.
    if (coverScroll.get() < CACTUS_FROM && !raised.current) {
      playback.current?.stop();
      playback.current = null;
      playhead.set(-1);
      cueIn.set(0);
      unlockScroll();
    } else jumpPastStory(); // a story still playing must not lock the page on the way up
    const end = coverEnd();
    gliding.current = true;
    if (window.scrollY > end) {
      scrollToY(end);
      if (raised.current) setRaised(false, false);
    }
    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    // At the top the story is put back to its start, as scrolling up past it would (also when the glide was too short
    // to move the scroll at all).
    glideTo(
      0,
      RETURN_SECONDS * Math.max(0.3, Math.min(window.scrollY, end) / end),
      () => {
        gliding.current = false;
        syncPlayback();
      },
      easeInOut,
    );
  };
  const returnHomeRef = useRef(returnHome);
  returnHomeRef.current = returnHome;
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      )
        return;
      const link = (event.target as Element).closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (!link) return;
      const url = new URL(link.href);
      if (
        url.origin !== location.origin ||
        url.pathname !== "/" ||
        location.pathname !== "/" ||
        url.hash
      )
        return;
      event.preventDefault();
      returnHomeRef.current();
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, []);
  useEffect(() => {
    syncPlayback();
    return () => {
      playback.current?.stop();
      playback.current = null;
      playhead.set(-1);
      cueIn.set(0);
      unlockScroll();
    };
  }, [reduced]);
  // Hand-off to the next section: the dunes fade into flat sand at the very end of the story, or at the end of the
  // pinned scroll when someone scrolls on before the story has finished.
  const groundFade = useTransform(
    [story, holdScroll, outro],
    ([value, hold, fade]: number[]) =>
      Math.min(
        Math.max(
          Math.max(
            (fade * (sceneProgress(value, "grow") - 0.85)) / 0.15,
            (hold - 0.85) / 0.15,
          ),
          0,
        ),
        1,
      ),
  );
  const cue = useTransform(
    [cueIn, raise, outro],
    ([shown, up, fade]: number[]) => shown * fade * Math.max(0, 1 - up / 0.12),
  );
  useEffect(() => {
    placeSand(sandProgress.get());
    const resize = new ResizeObserver(() => placeSand(sandProgress.get()));
    if (stage.current) resize.observe(stage.current);
    return () => resize.disconnect();
  });

  return (
    <div
      ref={scenes}
      className={styles.scenes}
      style={{ "--dissolve": DISSOLVE_SCREENS } as CSSProperties}
    >
      <div className={styles.track}>
        <div
          ref={storyTrack}
          className={styles.storyTrack}
          aria-hidden="true"
        />
        <div
          ref={stage}
          className={styles.stage}
        >
          <div
            className={styles.sky}
            aria-hidden="true"
          />
          <motion.div
            className={`${styles.skyLayer} ${styles.sunset}`}
            style={{ opacity: sunset }}
            aria-hidden="true"
          />
          <motion.div
            className={`${styles.skyLayer} ${styles.night}`}
            style={{ opacity: night }}
            aria-hidden="true"
          >
            {STARS.map((star, index) => (
              <i
                key={index}
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  width: star.size,
                  height: star.size,
                  opacity: star.glow,
                }}
              />
            ))}
          </motion.div>
          <motion.div
            className={`${styles.skyLayer} ${styles.dawn}`}
            style={{ opacity: dawn }}
            aria-hidden="true"
          />
          <div
            ref={hero}
            className={styles.hero}
            data-pause-scope
          >
            {children}
          </div>
          <Image
            ref={sand}
            src={sandImage}
            alt=""
            aria-hidden="true"
            className={styles.sand}
            unoptimized
            priority
          />
          {/* Dims and warms the dunes with the sky; the cactus sits above it and is lit by its own 3D light. */}
          <motion.div
            className={`${styles.tint} ${styles.tintSunset}`}
            style={{ opacity: sunsetTint }}
            aria-hidden="true"
          />
          <motion.div
            className={`${styles.tint} ${styles.tintNight}`}
            style={{ opacity: nightTint }}
            aria-hidden="true"
          />
          <motion.div
            className={styles.groundFade}
            style={{ opacity: groundFade }}
            aria-hidden="true"
          />
          <motion.div
            ref={cactusWrap}
            className={styles.cactusWrap}
            style={{ opacity: cactusFade }}
            aria-hidden="true"
          >
            <div className={styles.cactus}>
              <CactusScene
                progress={story}
                wind={wind}
                reduced={reduced}
                running={visible && !reduced && cactusActive}
              />
            </div>
          </motion.div>
          <WindGust
            progress={story}
            wind={wind}
            reduced={reduced}
            running={visible}
            desktop={desktop}
          />
          <motion.div
            ref={pollenLayer}
            className={styles.pollenLayer}
            style={{ opacity: textFade }}
            aria-hidden="true"
          >
            <PollenGrow
              progress={story}
              desktop={desktop}
            />
          </motion.div>
          <motion.p
            className={styles.phrase}
            style={buildText}
          >
            직접 만들고
          </motion.p>
          <motion.p
            className={styles.statement}
            style={adaptText}
          >
            <motion.span style={{ color: statementInk }}>
              표면을 설계하고,
            </motion.span>
            <span className={styles.statementLight}>경험을 짓다.</span>
          </motion.p>
          <p className="sr-only">GROW.</p>
          <motion.div
            ref={closing}
            className={styles.closing}
            style={{ ...finalText, x: "-50%" }}
          >
            <p className={styles.closingLead}>웬만해선 시들지 않습니다.</p>
            <p className={styles.closingNote}>
              선인장처럼, 어떤 환경에서도 생각보다 잘 자라는 사람입니다.
            </p>
          </motion.div>
          <motion.div
            className={styles.scrollCue}
            style={{ opacity: cue }}
            aria-hidden="true"
          >
            <i />
          </motion.div>
          {skippable && (
            <button
              type="button"
              className={styles.skip}
              onClick={skip}
              lang="en"
            >
              SKIP
            </button>
          )}
          {/* Shortcut past the opening straight to the project panels (WindowFrame handles the #project link). */}
          <motion.a
            href="/#project"
            className={styles.jump}
            style={
              {
                "--fade": jumpFade,
                pointerEvents: jumpPointer,
              } as unknown as MotionStyle
            }
          >
            프로젝트 바로 보기 <span aria-hidden="true">↓</span>
          </motion.a>
          <motion.div
            className={styles.handoffWhite}
            style={{ opacity: handoffWhite }}
            aria-hidden="true"
          />
        </div>
      </div>
      {content && (
        <WindowFrame
          rise={raise}
          clip={windowClip}
          barIn={barIn}
          pageIn={pageIn}
          upAt={HANDOFF.bar[0]}
          onNavigate={enterWindow}
          onClose={closeWindow}
        >
          {content}
        </WindowFrame>
      )}
      {content && (
        <SandHandoff
          raise={raise}
          playhead={playhead}
          sources={handoffSources}
          target={handoffTarget}
          enabled={!reduced}
        />
      )}
    </div>
  );
}
