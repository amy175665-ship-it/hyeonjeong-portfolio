"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import ProjectLinks from "@/components/ui/ProjectLinks";
import { scrollToY } from "@/components/layout/scrollLock";
import { onScrollFrame } from "@/components/motion/scrollFrame";
import { styleWriter } from "@/components/motion/styleWriter";
import useSeam from "@/components/motion/useSeam";
import WorkSand from "@/components/sections/WorkSand";
import {
  mainProjects,
  sideProjects,
  type Project,
  type SideProject,
} from "@/data/projects";
import { stages } from "@/data/stages";
import styles from "./WorkStory.module.css";

// BUILD.: the section heading and the list of main projects on the white stage, then the main projects on one pinned stage
// (2026-10-13, user: no paper-like covering). The stage stays on screen while the track scrolls past; each project
// has one segment of it. Moving to the next project, its panel fades in over the current one, so the background colour
// turns smoothly from one project's accent to the next while the old project's words and screens fade out; within its
// segment the big title rises letter by letter, the features band flows across and the desktop and phone screens come
// up. The first panel settles from a zoom as the stage comes in. After the stage the side projects follow as a plain
// dark list (rows open the sites), then a dark screen (the closer) shrinks into the GROW circle underneath (GrowStory).
// Everything is tied to the scroll position. Placeholders stay labelled as examples.
const BUILD_ACCENT =
  stages.find((stage) => stage.id === "build")?.accent ?? "#7f9657";
const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const ramp = (value: number, from: number, to: number) =>
  clamp((value - from) / (to - from));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
// Gentle in and out (sine) for the colour change from one project to the next (2026-10-23, user: it flashed past).
const easeSine = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
// Scroll per project, in stage heights, and the share of it spent fading over from the previous project. INTRO: stage
// heights before the first project, where the lead-in list holds the white stage and the first panel fades in over it.
// The list is built on the stage first (2026-10-23, user: it just scrolled up and popped in): the about page above blows
// away as sand and the grains form the heading and the names (WorkSand) by SAND_END, then from REST_FROM to BUILT the
// dots pop and the taglines come; it holds until OPEN, then the first panel opens until INTRO.
// At the end of the last segment the last panel's words go, then its colour field breaks into sand grains blown off to
// the upper right (as in the opening's hand-off), uncovering the night colour of the side list that follows (2026-10-14,
// user: a plain colour fade between such different colours looked forced). Tied to the scroll, so it plays backwards too.
// TAIL: extra stage heights after the last segment, so the last panel holds, its words go (over 0.2) and its field
// scatters over 0.95 stage heights (2026-10-23, user: the sand scatter flashed past in about half a screen).
const SEGMENT = 1.5,
  FADE = 0.6,
  TAIL = 0.9,
  SAND_END = 1.1,
  REST_FROM = 1.02,
  BUILT = 1.45,
  OPEN = 1.75,
  INTRO = 2.65;
const easeOutBack = (t: number) =>
  1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);

// Scrolls to a main project's segment, where its panel has settled (reduced motion: to the panel itself, the panels
// then lie one after another).
function scrollToProject(root: HTMLElement, index: number) {
  const track = root.querySelector<HTMLElement>("[data-track]"),
    panel = root.querySelectorAll<HTMLElement>("[data-panel]")[index];
  if (!track || !panel) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const chrome =
      parseFloat(getComputedStyle(root).getPropertyValue("--chrome")) || 0;
    scrollToY(
      Math.round(panel.getBoundingClientRect().top + window.scrollY - chrome),
    );
    return;
  }
  const height = panel.offsetHeight,
    top = track.getBoundingClientRect().top + window.scrollY;
  scrollToY(Math.round(top + (INTRO + (index + 0.6) * SEGMENT) * height));
}

// One row of the lead-in list: the project name in big type with its accent dot, then the tagline and stack. The row
// scrolls to that project's panel.
function IntroRow({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.introButton}
      style={
        { "--accent": project.accent ?? BUILD_ACCENT } as CSSProperties
      }
      onClick={onSelect}
    >
      <span className={styles.introName}>
        {/* The name the sand grains form (WorkSand). */}
        <span data-sand-target>{project.title}</span>
        <span
          className={styles.introDot}
          data-intro-dot
          aria-hidden="true"
        />
      </span>
      <span
        className={styles.introInfo}
        data-intro-info
      >
        {project.tagline}
        {project.stack.length > 0 && (
          <span className={styles.introStack}>
            {project.stack.join(" · ")}
          </span>
        )}
      </span>
    </button>
  );
}

// One side project row: number, name, then the description and tags; the whole row links to the site when it has one.
function SideRow({ project, index }: { project: SideProject; index: number }) {
  // The Notion write-up first, then the site.
  const href = project.notion?.trim() || project.url?.trim();
  const body = (
    <>
      <span
        className={styles.sideNumber}
        aria-hidden="true"
      >
        ({String(index + 1).padStart(2, "0")})
      </span>
      <span className={styles.sideName}>
        {project.title}
        {href && (
          <span
            aria-hidden="true"
            className={styles.sideArrow}
          >
            ↗
          </span>
        )}
      </span>
      <span className={styles.sideBody}>
        {project.placeholder && (
          <span className={styles.sideBadge}>작성 예시</span>
        )}
        <span className={styles.sideText}>{project.description}</span>
        {project.tags.length > 0 && (
          <span className={styles.sideTags}>
            {project.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </span>
        )}
      </span>
    </>
  );
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${project.title} ${project.notion?.trim() ? "노션" : "사이트"} (새 탭)`}
      className={`${styles.sideRow} ${styles.sideLink}`}
    >
      {body}
    </a>
  ) : (
    <div className={styles.sideRow}>{body}</div>
  );
}

// The screen images can be in place before the write-up is (placeholder still true), so the alt text follows the
// image itself: the shared placeholder SVGs are /images/project-*-placeholder.svg.
const isPlaceholderImage = (src: string) => src.endsWith("-placeholder.svg");

// The project's write-up: its published Notion page in a new tab when it has one, otherwise the site's detail page.
function DetailLink({
  project,
  label,
  className,
  children,
}: {
  project: Project;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const notion = project.notion?.trim();
  if (notion) {
    return (
      <a
        href={notion}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} (노션, 새 탭)`}
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={`/work/${project.slug}`}
      className={className}
    >
      {children}
    </Link>
  );
}

function ProjectPanel({ project }: { project: Project }) {
  const lines = project.headline?.length
    ? project.headline
    : [project.title.replace(/^PLACEHOLDER\s*—\s*/, "")];
  const band = [project.categoryTags[0], ...project.featureTags]
    .filter(Boolean)
    .join(" · ");
  const titleId = `project-${project.slug}`;
  return (
    <article
      className={styles.panel}
      data-panel
      aria-labelledby={titleId}
      style={{ "--accent": project.accent ?? BUILD_ACCENT } as CSSProperties}
    >
      <div className={styles.panelInner}>
        {/* The project's desktop screen fills the panel; placeholders keep the colour field only. */}
        <div
          className={styles.shot}
          aria-hidden="true"
        >
          {!project.placeholder && (
            <Image
              src={project.desktopImage || project.image}
              alt=""
              fill
              sizes="100vw"
              unoptimized
              className={styles.shotImage}
            />
          )}
        </div>
        <div
          className={styles.shade}
          aria-hidden="true"
        />
        <div
          className={styles.ticker}
          aria-hidden="true"
        >
          <div className={styles.tickerRow}>
            {/* Two identical halves flow left forever (-50%); the time follows the text length so every band moves at
                about the same speed. */}
            <div
              className={styles.tickerTrack}
              data-ticker
              style={
                {
                  "--ticker-time": `${(band.length * 0.7).toFixed(1)}s`,
                } as CSSProperties
              }
            >
              {[0, 1].map((half) => (
                <div
                  key={half}
                  className={styles.tickerHalf}
                >
                  {[0, 1].map((copy) => (
                    <span key={copy}>{band} · </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.meta}>
          {project.placeholder && (
            <span className={styles.badge}>작성 예시</span>
          )}
          <strong lang="en">{project.stack.join(" · ")}</strong>
          {project.categoryTags.length > 0 && (
            <span>{project.categoryTags.join(" · ")}</span>
          )}
        </div>
        <div className={styles.text}>
          <h3
            id={titleId}
            className={styles.title}
          >
            <DetailLink
              project={project}
              label={project.title}
            >
              <span className="sr-only">{project.title}</span>
              {lines.map((line) => (
                <span
                  key={line}
                  className={styles.line}
                  aria-hidden="true"
                >
                  {[...line].map((char, index) => (
                    <span
                      key={index}
                      className={styles.char}
                      data-char
                    >
                      {char === " " ? " " : char}
                    </span>
                  ))}
                </span>
              ))}
            </DetailLink>
          </h3>
          <div className={styles.foot}>
            <p className={styles.tagline}>{project.tagline}</p>
            <DetailLink
              project={project}
              label={`${project.title} 상세 보기`}
              className={styles.detail}
            >
              상세 보기 <span aria-hidden="true">↗</span>
            </DetailLink>
            <ProjectLinks project={project} />
          </div>
          {project.featureTags.length > 0 && (
            <ul
              className="sr-only"
              aria-label="구현 기능"
            >
              {project.featureTags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.devices}>
          {project.desktopDevice === "monitor" ? (
            <span className={styles.monitor}>
              <span className={styles.monitorScreen}>
                <Image
                  src={project.desktopImage || project.image}
                  alt={
                    isPlaceholderImage(project.desktopImage || project.image)
                      ? `${project.title} PC 화면 등록 예정 — 자리 표시 이미지`
                      : `${project.title} PC 화면`
                  }
                  fill
                  sizes="(min-width: 701px) 31vw, 49vw"
                  unoptimized
                  className={styles.screen}
                />
              </span>
              <Image
                src="/images/devices/desktop-monitor.png"
                alt=""
                aria-hidden="true"
                fill
                sizes="(min-width: 701px) 40vw, 64vw"
                unoptimized
                className={styles.monitorShell}
              />
            </span>
          ) : (
            <span className={styles.desk}>
              <Image
                src={project.desktopImage || project.image}
                alt={
                  isPlaceholderImage(project.desktopImage || project.image)
                    ? `${project.title} PC 화면 등록 예정 — 자리 표시 이미지`
                    : `${project.title} PC 화면`
                }
                fill
                sizes="(min-width: 701px) 40vw, 64vw"
                unoptimized
                className={styles.screen}
              />
            </span>
          )}
          {project.mobileImage &&
            (project.mobileDevice === "gold-phone" ? (
              <span className={styles.goldPhone}>
                <span className={styles.goldPhoneScreen}>
                  <Image
                    src={project.mobileImage}
                    alt={
                      isPlaceholderImage(project.mobileImage)
                        ? `${project.title} 모바일 화면 등록 예정 — 자리 표시 이미지`
                        : `${project.title} 모바일 화면`
                    }
                    fill
                    sizes="(min-width: 701px) 20vw, 32vw"
                    unoptimized
                    className={styles.screen}
                  />
                </span>
                <Image
                  src="/images/devices/gold-smartphone.png"
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(min-width: 701px) 31vw, 50vw"
                  unoptimized
                  className={styles.goldPhoneShell}
                />
              </span>
            ) : (
              <span className={styles.phone}>
                <Image
                  src={project.mobileImage}
                  alt={
                    isPlaceholderImage(project.mobileImage)
                      ? `${project.title} 모바일 화면 등록 예정 — 자리 표시 이미지`
                      : `${project.title} 모바일 화면`
                  }
                  fill
                  sizes="(min-width: 701px) 11vw, 17vw"
                  unoptimized
                  className={styles.screen}
                />
              </span>
            ))}
        </div>
      </div>
    </article>
  );
}

export default function WorkStory() {
  const build = useRef<HTMLDivElement>(null);
  const side = useRef<HTMLDivElement>(null);
  // The side list's rows rise in on the night colour the stage has darkened to (CSS --seam-in).
  useSeam(side);

  useEffect(() => {
    const root = build.current;
    if (!root) return;
    // Reduced motion: the panels stay in their settled state (the CSS defaults); only the header tone follows the scroll.
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const panels = Array.from(
      root.querySelectorAll<HTMLElement>("[data-panel]"),
    );
    const track = root.querySelector<HTMLElement>("[data-track]");
    const chars = panels.map((panel) =>
      Array.from(panel.querySelectorAll<HTMLElement>("[data-char]")),
    );
    const tickers = panels.map((panel) =>
      panel.querySelector<HTMLElement>("[data-ticker]"),
    );
    const closer = root.querySelector<HTMLElement>("[data-closer]"),
      closerSpacer = root.querySelector<HTMLElement>("[data-closer-spacer]");
    const intro = root.querySelector<HTMLElement>("[data-intro]"),
      introRows = Array.from(
        root.querySelectorAll<HTMLElement>("[data-intro-row]"),
      ).map((row) => ({
        row,
        dot: row.querySelector<HTMLElement>("[data-intro-dot]"),
        info: row.querySelector<HTMLElement>("[data-intro-info]"),
      })),
      // The first project's accent dot: the first panel grows out of it.
      introOrigin = root.querySelector<HTMLElement>("[data-intro-dot]"),
      dusk = root.querySelector<HTMLElement>("[data-dusk]");
    const scatter = root.querySelector<HTMLCanvasElement>("[data-scatter]"),
      sand = scatter?.getContext("2d");
    if (
      !panels.length ||
      !track ||
      !closer ||
      !closerSpacer ||
      !intro ||
      !dusk ||
      !scatter ||
      !sand
    )
      return;

    // The last panel's colour field as a grid of sand grains for the current stage size: each grain has its colour (the
    // panel's 115° accent gradient under its top and bottom shade), a start delay (left first), wind and lift.
    type Grains = {
      w: number;
      h: number;
      size: number;
      x: Float32Array;
      y: Float32Array;
      delay: Float32Array;
      wind: Float32Array;
      lift: Float32Array;
      phase: Float32Array;
      groups: { color: string; members: number[] }[];
    };
    let grains: Grains | null = null,
      drawnAt = -1;
    const rgb = (color: string) => {
      sand.fillStyle = "#000";
      sand.fillStyle = color;
      const hex = String(sand.fillStyle).replace("#", "");
      return hex.length === 6
        ? [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16))
        : [127, 150, 87];
    };
    const buildGrains = (w: number, h: number): Grains => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      scatter.width = Math.round(w * dpr);
      scatter.height = Math.round(h * dpr);
      sand.setTransform(dpr, 0, 0, dpr, 0, 0);
      const accent = rgb(
        panels[panels.length - 1].style.getPropertyValue("--accent").trim() ||
          BUILD_ACCENT,
      );
      const dark = accent.map((c) => c * 0.62),
        light = accent.map((c) => c * 0.55 + 255 * 0.45);
      const size = w <= 700 ? 6 : 8,
        cols = Math.ceil(w / size),
        rows = Math.ceil(h / size),
        n = cols * rows,
        reach = Math.max(w / 1440, 0.4);
      const dx = Math.sin((115 * Math.PI) / 180),
        dy = -Math.cos((115 * Math.PI) / 180),
        span = Math.abs(w * dx) + Math.abs(h * dy);
      const g: Grains = {
        w,
        h,
        size,
        x: new Float32Array(n),
        y: new Float32Array(n),
        delay: new Float32Array(n),
        wind: new Float32Array(n),
        lift: new Float32Array(n),
        phase: new Float32Array(n),
        groups: [],
      };
      const byColor = new Map<string, number[]>();
      let seed = 7;
      const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let j = 0, i = 0; j < rows; j++)
        for (let k = 0; k < cols; k++, i++) {
          const x = k * size,
            y = j * size,
            t = ((x - w / 2) * dx + (y - h / 2) * dy) / span + 0.5;
          const base =
            t < 0.55
              ? dark.map((c, m) => c + (accent[m] - c) * (t / 0.55))
              : accent.map((c, m) => c + (light[m] - c) * ((t - 0.55) / 0.45));
          const yn = y / h,
            shade = yn < 0.3 ? 0.25 * (1 - yn / 0.3) : (0.6 * (yn - 0.3)) / 0.7;
          const color = `rgb(${base.map((c, m) => Math.round((c * (1 - shade) + [10, 12, 20][m] * shade) / 6) * 6).join(",")})`;
          if (!byColor.has(color)) byColor.set(color, []);
          byColor.get(color)!.push(i);
          g.x[i] = x;
          g.y[i] = y;
          g.delay[i] = (x / w) * 0.45 + random() * 0.1;
          // Wind and lift follow the stage size, so on a phone the grains do not leave the narrow screen at once.
          g.wind[i] = (260 + random() * 520) * reach;
          g.lift[i] = (80 + random() * 260) * (h / 900);
          g.phase[i] = random() * Math.PI * 2;
        }
      byColor.forEach((members, color) => g.groups.push({ color, members }));
      return g;
    };
    // s: 0 → 1 over the scatter; each grain flies for 0.45 of it after its delay, shrinking from a tile of the field to
    // a fine sand grain.
    const drawScatter = (s: number) => {
      if (!grains || s === drawnAt) return;
      drawnAt = s;
      sand.clearRect(0, 0, grains.w, grains.h);
      scatter.style.visibility = s > 0 && s < 1 ? "visible" : "hidden";
      if (s <= 0 || s >= 1) return;
      const { size, x, y, delay, wind, lift, phase } = grains;
      for (const group of grains.groups) {
        sand.fillStyle = group.color;
        for (const i of group.members) {
          const t = clamp((s - delay[i]) / 0.45);
          if (t >= 1) continue;
          // Shrinks gently (sine) so the field thins out over the flight instead of vanishing as it starts.
          const grain = size + 1 + (2.2 - size - 1) * easeSine(t);
          sand.fillRect(
            x[i] + t * t * wind[i],
            y[i] - t * lift[i] + Math.sin(phase[i] + t * 5) * 8 * t,
            grain,
            grain,
          );
        }
      }
    };
    // Layout read once per frame before anything is written (see scrollFrame). closing: the closer's pinned progress,
    // 0 → 1 while its spacer scrolls past.
    let view = {
      height: 0,
      width: 0,
      stageWidth: 0,
      top: 0,
      boxTop: 0,
      boxBottom: 0,
      closing: 0,
      originX: 0,
      originY: 0,
      originR: 0,
    };
    const measure = () => {
      const height = panels[0].offsetHeight,
        box = root.getBoundingClientRect();
      // The first panel grows out of the first project's dot in the lead-in list (2026-10-23, user).
      const stage = panels[0].getBoundingClientRect(),
        dot = introOrigin?.getBoundingClientRect();
      const closing = clamp(
        (height - closerSpacer.getBoundingClientRect().top) /
          closerSpacer.offsetHeight,
      );
      view = {
        height,
        width: window.innerWidth,
        stageWidth: panels[0].offsetWidth,
        top: track.getBoundingClientRect().top,
        boxTop: box.top,
        boxBottom: box.bottom,
        closing,
        originX: dot ? dot.left + dot.width / 2 - stage.left : stage.width / 2,
        originY: dot ? dot.top + dot.height / 2 - stage.top : stage.height * 0.55,
        originR: dot ? dot.width / 2 : 0,
      };
    };
    // Keyboard focus in a panel that is faded out brings its segment on screen.
    const reveal = (index: number) => () => scrollToProject(root, index);
    const focusers = panels.map((panel, index) => {
      const go = reveal(index);
      panel.addEventListener("focusin", go);
      return go;
    });

    const put = styleWriter(); // writes only changed values (see styleWriter)
    const paint = () => {
      if (still) return;
      const { height, width, top } = view,
        phone = width <= 700;
      // p: stage heights scrolled into the pin; u: progress through each project's segment; fade: how far its panel has
      // faded in over the previous one (the first over the heading).
      const p = -top / height,
        last = panels.length - 1;
      const u = (index: number) => (p - INTRO) / SEGMENT - index;
      const fade = (index: number) =>
        index === 0
          ? easeInOut(ramp(p, OPEN, INTRO))
          : easeSine(ramp(u(index), 0, FADE));
      // The last panel's words go first, then its field scatters over the night until the stage lets go (TAIL).
      const tail = u(last) * SEGMENT;
      const wordsOut = easeInOut(ramp(tail, 1.25, 1.45)),
        blown = ramp(tail, 1.45, SEGMENT + TAIL);
      // Lead-in list: the heading and the names are formed by the sand (WorkSand, by SAND_END); the rest is built from
      // REST_FROM to BUILT (q 0 → 1): per row (each a little later) the dot pops and the tagline comes up.
      const q = (p - REST_FROM) / (BUILT - REST_FROM);
      introRows.forEach(({ dot, info }, index) => {
        const start = index * 0.2;
        const pop = ramp(q, start, start + 0.15);
        if (dot) put(dot, "scale", pop < 1 ? easeOutBack(pop).toFixed(3) : "");
        if (info) {
          put(info, "--in", easeOut(ramp(q, start + 0.05, start + 0.35)).toFixed(3));
        }
      });
      // Once it has held, the heading and the other rows fade first (--fade), then the first name (--lift) as the circle
      // opens from it.
      const opening = INTRO - OPEN;
      const introFade = easeInOut(ramp(p, OPEN - 0.02, OPEN + opening * 0.45));
      const lift = easeInOut(
        ramp(p, OPEN + opening * 0.25, OPEN + opening * 0.9),
      );
      put(intro, "--fade", introFade.toFixed(3));
      put(intro, "--lift", lift.toFixed(3));
      if (!grains || grains.w !== view.stageWidth || grains.h !== height) {
        grains = buildGrains(view.stageWidth, height);
        drawnAt = -1;
      }
      put(dusk, "opacity", blown > 0 ? "1" : "0");
      drawScatter(blown);
      panels.forEach((panel, index) => {
        const a = fade(index);
        const d = ramp(u(index), index === 0 ? 0 : FADE * 0.5, 1);
        const out = index < last ? fade(index + 1) : wordsOut;
        if (index === 0) {
          // The first panel grows out of the first project's dot as a circle over the white lead-in (no grey mid-fade):
          // it starts at the dot's size with a crisp edge, so the dot itself seems to grow, and the edge softens only
          // as the circle nears the farthest corner of the stage.
          const { originX: x, originY: y, originR } = view;
          // Its size follows the scroll on a gentle curve (slow at first, faster only once it covers most of the screen)
          // over 0.9 stage heights (2026-10-23, user: it grew too fast, the scroll felt touchy).
          const grow = Math.pow(ramp(p, OPEN, INTRO), 1.6);
          const soft = 1.5 + 160 * ramp(grow, 0.6, 1);
          const reach =
              Math.hypot(
                Math.max(x, view.stageWidth - x),
                Math.max(y, height - y),
              ) + 160,
            radius = grow > 0 ? originR + grow * (reach - originR) : 0;
          const mask =
            grow < 1
              ? `radial-gradient(circle at ${x.toFixed(1)}px ${y.toFixed(1)}px, #000 ${Math.max(radius - soft, 0).toFixed(1)}px, transparent ${radius.toFixed(1)}px)`
              : "";
          put(panel, "mask-image", mask);
          put(panel, "-webkit-mask-image", mask);
        } else
          put(
            panel,
            "opacity",
            index === last && blown > 0 ? "0" : a.toFixed(3),
          );
        put(panel, "pointer-events", a < 0.5 || out > 0.5 ? "none" : "");
        put(panel, "--out", out.toFixed(3));
        put(panel, "--zoom", (1.22 - easeOut(a) * 0.22 + d * 0.05).toFixed(4));
        // The title letters: only those still moving are rewritten (put skips unchanged values).
        chars[index].forEach((char, order) => {
          const k = easeOut(ramp(a, 0.35 + order * 0.03, 0.75 + order * 0.03));
          put(char, "opacity", k.toFixed(3));
          put(char, "filter", k < 1 ? `blur(${((1 - k) * 14).toFixed(1)}px)` : "");
          put(
            char,
            "transform",
            k < 1 ? `translateY(${((1 - k) * 30).toFixed(1)}px)` : "",
          );
        });
        put(panel, "--meta", ramp(a, 0.7, 1).toFixed(3));
        const band = ramp(d, 0.05, 0.25) * (1 - ramp(d, 0.85, 1));
        put(panel, "--band", band.toFixed(3));
        // The band's endless flow runs only while it shows.
        const ticker = tickers[index];
        if (ticker) {
          put(
            ticker,
            "animation-play-state",
            band > 0 && out < 1 ? "running" : "paused",
          );
        }
        put(panel, "--band-x", `${(-d * (phone ? 900 : 1500)).toFixed(1)}px`);
        put(
          panel,
          "--desk-y",
          `${((1 - easeOut(ramp(d, 0.2, 0.55))) * 130).toFixed(1)}%`,
        );
        put(
          panel,
          "--phone-y",
          `${((1 - easeOut(ramp(d, 0.32, 0.65))) * 170).toFixed(1)}%`,
        );
      });
      // The closer shrinks into the GROW circle underneath (same centre and radius as GrowStory), then fades.
      const c = view.closing,
        close = easeInOut(ramp(c, 0.02, 0.6));
      const radius = Math.min(width, height) * (phone ? 0.4 : 0.3),
        full = Math.hypot(width, height) / 2 + 20;
      put(
        closer,
        "clip-path",
        close > 0
          ? `circle(${(full + (radius - full) * close).toFixed(1)}px at 50% 50%)`
          : "",
      );
      put(closer, "opacity", c > 0.6 ? (1 - ramp(c, 0.6, 0.7)).toFixed(3) : "");
    };

    // Repaints on scroll and resize, only while the panels are within a screen of the viewport.
    const render = () => {
      // The floating header (phones) sits over the dark panels and list (from the first panel on) until the closer has
      // mostly shrunk.
      document.documentElement.toggleAttribute(
        "data-on-dark",
        -view.top / view.height > OPEN + (INTRO - OPEN) * 0.55 &&
          view.boxBottom > 80 &&
          view.closing < 0.4,
      );
      if (
        view.boxBottom > -window.innerHeight &&
        view.boxTop < window.innerHeight * 2
      )
        paint();
    };
    measure();
    paint();
    const offScroll = onScrollFrame({ read: measure, write: render });
    return () => {
      offScroll();
      panels.forEach((panel, index) =>
        panel.removeEventListener("focusin", focusers[index]),
      );
      document.documentElement.removeAttribute("data-on-dark");
    };
  }, []);

  if (!mainProjects.length) return null;
  return (
    <section
      aria-labelledby="work-story-title"
      className={styles.section}
    >
      {/* Menu target (#project): where the stage is pinned with the lead-in list built (BUILT). */}
      <span
        id="project"
        className={styles.anchor}
        style={{ "--built": BUILT } as CSSProperties}
        aria-hidden="true"
      />
      <div
        ref={build}
        className={styles.build}
      >
        {/* One pinned stage: the heading on white, then the main projects (each SEGMENT stage heights of scroll), then
            the night colour the side list continues on. */}
        <div
          className={styles.track}
          data-track
          data-scroll-panels
          data-scroll-intro={INTRO}
          data-scroll-segment={SEGMENT}
          style={
            {
              "--count": mainProjects.length,
              "--tail": TAIL,
              "--intro": INTRO,
            } as CSSProperties
          }
        >
          <div className={styles.pin}>
            <div
              className={styles.intro}
              data-intro
            >
              <div className={styles.introTop}>
                <h2
                  id="work-story-title"
                  className={styles.heading}
                  data-sand-target
                >
                  대표 프로젝트
                </h2>
              </div>
              <ul className={styles.introList}>
                {mainProjects.map((project, index) => (
                  <li
                    key={project.slug}
                    className={styles.introRow}
                    data-intro-row
                  >
                    <IntroRow
                      project={project}
                      onSelect={() => {
                        if (build.current) {
                          scrollToProject(build.current, index);
                        }
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
            {mainProjects.map((project) => (
              <ProjectPanel
                key={project.slug}
                project={project}
              />
            ))}
            <div
              className={styles.dusk}
              data-dusk
              aria-hidden="true"
            />
            <canvas
              className={styles.scatter}
              data-scatter
              aria-hidden="true"
            />
          </div>
        </div>
        {sideProjects.length > 0 && (
          <div
            ref={side}
            className={styles.side}
            data-side
          >
            <h3 className={styles.sideTitle}>사이드 프로젝트</h3>
            <ol className={styles.sideList}>
              {sideProjects.map((project, index) => (
                <li key={project.title}>
                  <SideRow
                    project={project}
                    index={index}
                  />
                </li>
              ))}
            </ol>
          </div>
        )}
        <div
          className={styles.closer}
          data-closer
          aria-hidden="true"
        />
        <div
          className={styles.closerSpacer}
          data-closer-spacer
          aria-hidden="true"
        />
      </div>
      {/* The about page above blows away as sand into the heading and the names (screen-fixed canvas). */}
      <WorkSand
        root={build}
        gatherEnd={SAND_END}
      />
    </section>
  );
}
