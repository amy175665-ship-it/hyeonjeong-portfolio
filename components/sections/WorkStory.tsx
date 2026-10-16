"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import ProjectLinks from "@/components/ui/ProjectLinks";
import { scrollToY } from "@/components/layout/scrollLock";
import { onScrollFrame } from "@/components/motion/scrollFrame";
import useSeam from "@/components/motion/useSeam";
import {
  mainProjects,
  sideProjects,
  type Project,
  type SideProject,
} from "@/data/projects";
import { stages } from "@/data/stages";
import styles from "./WorkStory.module.css";

// BUILD.: the section heading and placeholder note on one window page, then the main projects on one pinned stage
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
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
// Scroll per project, in stage heights, and the share of it spent fading over from the previous project. INTRO: stage
// heights before the first project, where the heading holds the white stage and the first panel fades in over it.
// At the end of the last segment the last panel's words go, then its colour field breaks into sand grains blown off to
// the upper right (as in the opening's hand-off), uncovering the night colour of the side list that follows (2026-10-14,
// user: a plain colour fade between such different colours looked forced). Tied to the scroll, so it plays backwards too.
const SEGMENT = 1.5,
  FADE = 0.3,
  INTRO = 0.4;

// One side project row: number, name, then the description and tags; the whole row links to the site when it has one.
function SideRow({ project, index }: { project: SideProject; index: number }) {
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
        {project.url && (
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
  return project.url ? (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${project.title} 사이트 (새 탭)`}
      className={`${styles.sideRow} ${styles.sideLink}`}
    >
      {body}
    </a>
  ) : (
    <div className={styles.sideRow}>{body}</div>
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
            {[0, 1, 2].map((copy) => (
              <span key={copy}>{band} · </span>
            ))}
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
            <Link href={`/work/${project.slug}`}>
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
            </Link>
          </h3>
          <div className={styles.foot}>
            <p className={styles.tagline}>{project.tagline}</p>
            <Link
              href={`/work/${project.slug}`}
              className={styles.detail}
            >
              상세 보기 <span aria-hidden="true">↗</span>
            </Link>
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
          <span className={styles.desk}>
            <Image
              src={project.desktopImage || project.image}
              alt={
                project.placeholder
                  ? `${project.title} PC 화면 등록 예정 — 자리 표시 이미지`
                  : `${project.title} PC 화면`
              }
              fill
              sizes="(min-width: 701px) 40vw, 64vw"
              unoptimized
              className={styles.screen}
            />
          </span>
          {project.mobileImage && (
            <span className={styles.phone}>
              <Image
                src={project.mobileImage}
                alt={
                  project.placeholder
                    ? `${project.title} 모바일 화면 등록 예정 — 자리 표시 이미지`
                    : `${project.title} 모바일 화면`
                }
                fill
                sizes="(min-width: 701px) 11vw, 17vw"
                unoptimized
                className={styles.screen}
              />
            </span>
          )}
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
    const closer = root.querySelector<HTMLElement>("[data-closer]"),
      closerSpacer = root.querySelector<HTMLElement>("[data-closer-spacer]");
    const intro = root.querySelector<HTMLElement>("[data-intro]"),
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
    // s: 0 → 1 over the scatter; each grain flies for 0.45 of it after its delay, quickly shrinking from a tile of the
    // field to a fine sand grain.
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
          const grain = 2.2 + (size + 1 - 2.2) * Math.pow(1 - t, 4);
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
    };
    const measure = () => {
      const height = panels[0].offsetHeight,
        box = root.getBoundingClientRect();
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
      };
    };
    // Keyboard focus in a panel that is faded out brings its segment on screen.
    const reveal = (index: number) => () => {
      const height = panels[0].offsetHeight,
        top = track.getBoundingClientRect().top + window.scrollY;
      scrollToY(Math.round(top + (INTRO + (index + 0.6) * SEGMENT) * height));
    };
    const focusers = panels.map((panel, index) => {
      const go = reveal(index);
      panel.addEventListener("focusin", go);
      return go;
    });

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
        easeInOut(
          index === 0 ? ramp(p, INTRO * 0.1, INTRO) : ramp(u(index), 0, FADE),
        );
      // The last panel's words go first (u 0.5 → 0.64), then its field scatters over the night (u 0.64 → 1).
      const wordsOut = easeInOut(ramp(u(last), 0.5, 0.64)),
        blown = ramp(u(last), 0.64, 1);
      const lift = easeInOut(ramp(p, INTRO * 0.1, INTRO * 0.8));
      intro.style.setProperty("--lift", lift.toFixed(3));
      if (!grains || grains.w !== view.stageWidth || grains.h !== height) {
        grains = buildGrains(view.stageWidth, height);
        drawnAt = -1;
      }
      dusk.style.opacity = blown > 0 ? "1" : "0";
      drawScatter(blown);
      panels.forEach((panel, index) => {
        const a = fade(index);
        const d = ramp(u(index), index === 0 ? 0 : FADE * 0.5, 1);
        const out = index < last ? fade(index + 1) : wordsOut;
        if (index === 0) {
          // The first panel opens from the middle as a soft-edged circle over the white heading (no grey mid-fade).
          const reach = Math.hypot(width, height) / 2 + 200,
            radius = a * reach;
          const mask =
            a < 1
              ? `radial-gradient(circle at 50% 55%, #000 ${Math.max(radius - 200, 0).toFixed(0)}px, transparent ${radius.toFixed(0)}px)`
              : "";
          panel.style.maskImage = mask;
          panel.style.webkitMaskImage = mask;
        } else
          panel.style.opacity =
            index === last && blown > 0 ? "0" : a.toFixed(3);
        panel.style.pointerEvents = a < 0.5 || out > 0.5 ? "none" : "";
        panel.style.setProperty("--out", out.toFixed(3));
        panel.style.setProperty(
          "--zoom",
          (1.22 - easeOut(a) * 0.22 + d * 0.05).toFixed(4),
        );
        chars[index].forEach((char, order) => {
          const k = easeOut(ramp(a, 0.35 + order * 0.03, 0.75 + order * 0.03));
          char.style.opacity = k.toFixed(3);
          char.style.filter =
            k < 1 ? `blur(${((1 - k) * 14).toFixed(1)}px)` : "";
          char.style.transform =
            k < 1 ? `translateY(${((1 - k) * 30).toFixed(1)}px)` : "";
        });
        panel.style.setProperty("--meta", ramp(a, 0.7, 1).toFixed(3));
        panel.style.setProperty(
          "--band",
          (ramp(d, 0.05, 0.25) * (1 - ramp(d, 0.85, 1))).toFixed(3),
        );
        panel.style.setProperty(
          "--band-x",
          `${(-d * (phone ? 900 : 1500)).toFixed(1)}px`,
        );
        panel.style.setProperty(
          "--desk-y",
          `${((1 - easeOut(ramp(d, 0.2, 0.55))) * 130).toFixed(1)}%`,
        );
        panel.style.setProperty(
          "--phone-y",
          `${((1 - easeOut(ramp(d, 0.32, 0.65))) * 170).toFixed(1)}%`,
        );
      });
      // The closer shrinks into the GROW circle underneath (same centre and radius as GrowStory), then fades.
      const c = view.closing,
        close = easeInOut(ramp(c, 0.02, 0.6));
      const radius = Math.min(width, height) * (phone ? 0.4 : 0.3),
        full = Math.hypot(width, height) / 2 + 20;
      closer.style.clipPath =
        close > 0
          ? `circle(${(full + (radius - full) * close).toFixed(1)}px at 50% 50%)`
          : "";
      closer.style.opacity = c > 0.6 ? (1 - ramp(c, 0.6, 0.7)).toFixed(3) : "";
    };

    // Repaints on scroll and resize, only while the panels are within a screen of the viewport.
    const render = () => {
      // The floating header (phones) sits over the dark panels and list (from the first panel on) until the closer has
      // mostly shrunk.
      document.documentElement.toggleAttribute(
        "data-on-dark",
        -view.top / view.height > INTRO * 0.6 &&
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
      id="project"
      aria-labelledby="work-story-title"
      className={styles.section}
    >
      <div
        ref={build}
        className={styles.build}
      >
        {/* One pinned stage: the heading on white, then the main projects (each SEGMENT stage heights of scroll), then
            the night colour the side list continues on. */}
        <div
          className={styles.track}
          data-track
          style={
            {
              "--count": mainProjects.length,
              "--intro": INTRO,
            } as CSSProperties
          }
        >
          <div className={styles.pin}>
            <div
              className={styles.intro}
              data-intro
            >
              <h2
                id="work-story-title"
                className={styles.heading}
              >
                대표 프로젝트
              </h2>
              {mainProjects.some((project) => project.placeholder) && (
                <p className={styles.note}>
                  프로젝트 화면과 설명을 정리하고 있습니다. '작성 예시'로 표시된
                  부분은 실제 작업 내용으로 채울 예정입니다.
                </p>
              )}
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
    </section>
  );
}
