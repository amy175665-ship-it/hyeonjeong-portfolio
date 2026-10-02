"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { animate, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, motion, type AnimationPlaybackControls } from "framer-motion";
import sandImage from "@/public/images/hero/hero-sand-bg.webp";
import WindGust from "./WindGust";
import PollenGrow from "./PollenGrow";
import { COVER, COVER_SCROLL, PLAY_SECONDS, SCENES, sceneProgress, skyAt, type SceneName, type Wind } from "./scenes";
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
  return Array.from({ length: 70 }, () => ({ left: random() * 100, top: random() * 55, size: 1 + random() * 1.8, glow: 0.45 + random() * 0.55 }));
})();
const HORIZON = 0.62; // dune crest height (fraction of the stage) once the sand has sunk back down
const CREST = 0.35; // the dune crest sits 35% down the sand image (on average)
// Crest height (fraction of the image height) at 11 evenly spaced points across the sand image, left to right.
const CREST_PROFILE = [0.369, 0.343, 0.35, 0.358, 0.365, 0.375, 0.36, 0.343, 0.345, 0.322, 0.331];
const COVERED = 0.4; // image offset (fraction of its height) above the stage top that hides the hero completely
// The cactus is first seen when the sand starts to sink; its 3D canvas only renders from there on.
const CACTUS_FROM = SCENES.cover[0] + (SCENES.cover[1] - SCENES.cover[0]) * COVER.sink;

export default function ConceptScenes({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const sand = useRef<HTMLImageElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const wind = useRef<Wind>({ value: 0 });
  const [desktop, setDesktop] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cactusActive, setCactusActive] = useState(false);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  // The first part of the pinned scroll drives the cover (story 0..end of "cover"); the rest only holds the stage.
  const coverScroll = useTransform(scrollYProgress, value => Math.min(value / COVER_SCROLL, 1) * SCENES.cover[1]);
  const holdScroll = useTransform(scrollYProgress, value => Math.min(Math.max((value - COVER_SCROLL) / (1 - COVER_SCROLL), 0), 1));
  // The cover trails the scroll on a soft spring, so a quick flick of the wheel still plays it gently.
  const sandProgress = useSpring(coverScroll, { stiffness: 55, damping: 22, mass: 0.8, restDelta: 0.0005 });
  // -1 until the cover has finished, then 0..1 through build → adapt → grow. It plays over PLAY_SECONDS
  // (with reduced motion it follows the hold scroll instead), so nobody has to keep scrolling to see the cactus grow.
  const playhead = useMotionValue(-1);
  const playback = useRef<AnimationPlaybackControls | null>(null);
  const story = useTransform([sandProgress, playhead], ([cover, play]: number[]) =>
    play < 0 ? cover : SCENES.cover[1] + (1 - SCENES.cover[1]) * play);
  // Every phrase moves the same way: rises a little while fading in after `from`, then only fades out
  // before its scene ends (the last one stays).
  const usePhrase = (scene: SceneName, from: number, last = false) => {
    const enter = (value: number) => Math.min(Math.max((sceneProgress(value, scene) - from) / 0.12, 0), 1);
    const opacity = useTransform(story, value => enter(value) * (last ? 1 : Math.min((1 - sceneProgress(value, scene)) / 0.1, 1)));
    const y = useTransform(story, value => (1 - enter(value)) * 14);
    return { opacity, y };
  };
  const buildText = usePhrase("build", 0.18); // with the first cactus segment
  const adaptText = usePhrase("adapt", 0.1);
  const finalText = usePhrase("grow", 0.7, true); // after "GROW." has formed
  const sunset = useTransform(story, value => skyAt(value).sunset);
  const night = useTransform(story, value => skyAt(value).night);
  const dawn = useTransform(story, value => skyAt(value).dawn);
  const nightTint = useTransform(night, value => value * 0.55);
  const sunsetTint = useTransform(sunset, value => value * 0.28);
  // SCENE 3 statement: charcoal first line (lifts to ivory only in the night so it stays readable), ivory second line.
  const statementInk = useTransform(night, [0, 1], ["#202731", "#fff7e2"]);

  useEffect(() => {
    const wide = matchMedia("(min-width: 1024px)");
    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setDesktop(wide.matches); setReduced(motionQuery.matches); };
    update();
    wide.addEventListener("change", update);
    motionQuery.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (stage.current) observer.observe(stage.current);
    return () => { wide.removeEventListener("change", update); motionQuery.removeEventListener("change", update); observer.disconnect(); };
  }, []);

  // The fixed header belongs to the scene: the rising dune ridge hides it from the bottom up, it stays hidden
  // while the screen is covered, and the sinking ridge uncovers it again from the top down.
  const coverHeader = (local: number, sandBox: DOMRect) => {
    const header = document.querySelector<HTMLElement>("header");
    if (!header) return;
    const clear = () => { header.style.clipPath = ""; header.style.pointerEvents = ""; };
    // Only during the cover transition: afterwards the dunes scroll up with the stage and must not clip the header.
    if (local >= 1) { clear(); return; }
    if (local >= COVER.risen && local < COVER.sink) {
      header.style.clipPath = "inset(0 0 100% 0)";
      header.style.pointerEvents = "none";
      return;
    }
    const box = header.getBoundingClientRect();
    // Viewport y of the dune crest at viewport x, following the image's ridge line.
    const crestAt = (x: number) => {
      const t = Math.min(Math.max((x - sandBox.left) / sandBox.width, 0), 1) * (CREST_PROFILE.length - 1);
      const i = Math.min(Math.floor(t), CREST_PROFILE.length - 2);
      return sandBox.top + sandBox.height * (CREST_PROFILE[i] + (CREST_PROFILE[i + 1] - CREST_PROFILE[i]) * (t - i));
    };
    const margin = 60; // the logo overflows the header box
    const xs = Array.from({ length: 25 }, (_, i) => box.left - margin + ((box.width + margin * 2) * i) / 24);
    const crests = xs.map(crestAt);
    // Untouched while the ridge is below the header, so the open mobile menu panel is never clipped.
    if (Math.min(...crests) >= box.bottom + margin) { clear(); return; }
    header.style.pointerEvents = Math.max(...crests) <= box.top ? "none" : "";
    const ridge = xs.map((x, i) => `${(x - box.left).toFixed(1)}px ${(crests[i] - box.top).toFixed(1)}px`).reverse();
    header.style.clipPath = `polygon(${-margin}px ${-margin}px, ${box.width + margin}px ${-margin}px, ${ridge.join(", ")})`;
  };
  useEffect(() => () => {
    const header = document.querySelector<HTMLElement>("header");
    if (header) { header.style.clipPath = ""; header.style.pointerEvents = ""; }
  }, []);

  // Cover transition: start where the hero's own dunes sit (crest at 87% / 80%), rise until the hero is hidden,
  // swap the backdrop, then sink until the crest sits on the horizon line.
  const placeSand = (value: number) => {
    const image = sand.current, box = stage.current;
    if (!image || !box) return;
    const height = box.clientHeight, imageHeight = image.clientHeight;
    const rest = height * (desktop ? 0.87 : 0.8) - imageHeight * CREST;
    const covered = -imageHeight * COVERED;
    const horizon = height * HORIZON - imageHeight * CREST;
    const local = sceneProgress(value, "cover");
    const ease = (t: number) => t * t * (3 - 2 * t);
    const y = local < COVER.risen ? rest + (covered - rest) * ease(local / COVER.risen)
      : local < COVER.sink ? covered
      : covered + (horizon - covered) * ease((local - COVER.sink) / (1 - COVER.sink));
    image.style.transform = `translate(-50%, ${y}px)`;
    coverHeader(local, image.getBoundingClientRect());
    if (hero.current) {
      const hidden = local >= COVER.swap;
      hero.current.style.visibility = hidden ? "hidden" : "visible";
      // Tells the hero's avatar and sand stream to stop rendering while they are covered.
      hero.current.toggleAttribute("data-paused", hidden);
    }
  };
  useMotionValueEvent(sandProgress, "change", placeSand);
  useMotionValueEvent(story, "change", value => setCactusActive(value >= CACTUS_FROM));
  // Starts the story once the sand has settled on the horizon; scrolling back up until the sand rises over the
  // cactus again resets it, so it plays again on the way down. A started playback keeps going even off screen.
  const syncPlayback = () => {
    const cover = sandProgress.get();
    if (cover < CACTUS_FROM) {
      playback.current?.stop();
      playback.current = null;
      playhead.set(-1);
      return;
    }
    if (cover < SCENES.cover[1] - 0.003) return;
    if (reduced) {
      playback.current?.stop();
      playback.current = null;
      playhead.set(holdScroll.get());
    } else if (playhead.get() < 0) {
      playhead.set(0);
      playback.current = animate(playhead, 1, { duration: PLAY_SECONDS, ease: "linear" });
    }
  };
  useMotionValueEvent(sandProgress, "change", syncPlayback);
  useMotionValueEvent(holdScroll, "change", () => { if (reduced) syncPlayback(); });
  useEffect(() => {
    syncPlayback();
    return () => { playback.current?.stop(); playback.current = null; playhead.set(-1); };
  }, [reduced]);
  // Hand-off to the next section: the dunes fade into flat sand at the very end of the story, or at the end of the
  // pinned scroll when someone scrolls on before the story has finished.
  const groundFade = useTransform([story, holdScroll], ([value, hold]: number[]) =>
    Math.min(Math.max(Math.max((sceneProgress(value, "grow") - 0.85) / 0.15, (hold - 0.85) / 0.15), 0), 1));
  // Once the pinned story starts scrolling away, page content passes under the header, so it gets a backdrop.
  useEffect(() => {
    const update = () => {
      const bottom = track.current?.getBoundingClientRect().bottom ?? Infinity;
      document.documentElement.toggleAttribute("data-header-solid", bottom < window.innerHeight - 40);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.documentElement.removeAttribute("data-header-solid");
    };
  }, []);
  useEffect(() => {
    placeSand(sandProgress.get());
    const resize = new ResizeObserver(() => placeSand(sandProgress.get()));
    if (stage.current) resize.observe(stage.current);
    return () => resize.disconnect();
  });

  return (
    <>
    <section ref={track} className={styles.track} aria-label="ABSORB. BUILD. GROW. 컨셉 소개">
      <div ref={stage} className={styles.stage}>
        <div className={styles.sky} aria-hidden="true" />
        <motion.div className={`${styles.skyLayer} ${styles.sunset}`} style={{ opacity: sunset }} aria-hidden="true" />
        <motion.div className={`${styles.skyLayer} ${styles.night}`} style={{ opacity: night }} aria-hidden="true">
          {STARS.map((star, index) => <i key={index} style={{ left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size, opacity: star.glow }} />)}
        </motion.div>
        <motion.div className={`${styles.skyLayer} ${styles.dawn}`} style={{ opacity: dawn }} aria-hidden="true" />
        <div ref={hero} className={styles.hero} data-pause-scope>{children}</div>
        <Image ref={sand} src={sandImage} alt="" aria-hidden="true" className={styles.sand} unoptimized priority />
        {/* Dims and warms the dunes with the sky; the cactus sits above it and is lit by its own 3D light. */}
        <motion.div className={`${styles.tint} ${styles.tintSunset}`} style={{ opacity: sunsetTint }} aria-hidden="true" />
        <motion.div className={`${styles.tint} ${styles.tintNight}`} style={{ opacity: nightTint }} aria-hidden="true" />
        <motion.div className={styles.groundFade} style={{ opacity: groundFade }} aria-hidden="true" />
        <div className={styles.cactus} aria-hidden="true">
          <CactusScene progress={story} wind={wind} reduced={reduced} running={visible && !reduced && cactusActive} />
        </div>
        <WindGust progress={story} wind={wind} reduced={reduced} running={visible} desktop={desktop} />
        <PollenGrow progress={story} desktop={desktop} />
        <motion.p className={styles.phrase} style={buildText}>직접 만들고</motion.p>
        <motion.p className={styles.statement} style={adaptText}>
          <motion.span style={{ color: statementInk }}>표면을 설계하고,</motion.span>
          <span className={styles.statementLight}>경험을 짓다.</span>
        </motion.p>
        <p className="sr-only">GROW.</p>
        <motion.div className={styles.closing} style={{ ...finalText, x: "-50%" }}>
          <p className={styles.closingLead}>웬만해선 시들지 않습니다.</p>
          <p className={styles.closingNote}>선인장처럼, 어떤 환경에서도 생각보다 잘 자라는 사람입니다.</p>
        </motion.div>
      </div>
    </section>
    <div className={styles.handoff} aria-hidden="true" />
    </>
  );
}

