"use client";

import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import ProjectLinks from "@/components/ui/ProjectLinks";
import { mainProjects, sideProjects, type Project, type SideProject } from "@/data/projects";
import { stages } from "@/data/stages";
import styles from "./WorkStory.module.css";

// BUILD.: the section heading and placeholder note on one window page, then one full-screen panel per project, stacked
// (approved mockup artifacts/project-panels-20261013). Each panel is sticky and followed by a spacer: while the panel
// slides in it settles from a zoom and its big title rises letter by letter; while it is pinned (the spacer scrolls
// past) the project's features flow across as a band and the desktop and phone screens come up at the bottom right;
// then the next panel slides over it while it shrinks and dims. After the last one the side projects come up over it as
// a plain dark list (rows open the sites), then a dark screen (the closer) shrinks into the GROW circle underneath
// (GrowStory). Everything is tied to the scroll position. Placeholders stay labelled as examples.
const BUILD_ACCENT = stages.find(stage => stage.id === "build")?.accent ?? "#7f9657";
const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const ramp = (value: number, from: number, to: number) => clamp((value - from) / (to - from));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// One side project row: number, name, then the description and tags; the whole row links to the site when it has one.
function SideRow({ project, index }: { project: SideProject; index: number }) {
  const body = <>
    <span className={styles.sideNumber} aria-hidden="true">({String(index + 1).padStart(2, "0")})</span>
    <span className={styles.sideName}>{project.title}{project.url && <span aria-hidden="true" className={styles.sideArrow}>↗</span>}</span>
    <span className={styles.sideBody}>
      {project.placeholder && <span className={styles.sideBadge}>작성 예시</span>}
      <span className={styles.sideText}>{project.description}</span>
      {project.tags.length > 0 && <span className={styles.sideTags}>{project.tags.map(tag => <span key={tag}>#{tag}</span>)}</span>}
    </span>
  </>;
  return project.url
    ? <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} 사이트 (새 탭)`} className={`${styles.sideRow} ${styles.sideLink}`}>{body}</a>
    : <div className={styles.sideRow}>{body}</div>;
}

function ProjectPanel({ project }: { project: Project }) {
  const lines = project.headline?.length ? project.headline : [project.title.replace(/^PLACEHOLDER\s*—\s*/, "")];
  const band = [project.categoryTags[0], ...project.featureTags].filter(Boolean).join(" · ");
  const titleId = `project-${project.slug}`;
  return (
    <article className={styles.panel} data-panel aria-labelledby={titleId} style={{ "--accent": project.accent ?? BUILD_ACCENT } as CSSProperties}>
      <div className={styles.panelInner}>
        {/* The project's desktop screen fills the panel; placeholders keep the colour field only. */}
        <div className={styles.shot} aria-hidden="true">
          {!project.placeholder && <Image src={project.desktopImage || project.image} alt="" fill sizes="100vw" unoptimized className={styles.shotImage} />}
        </div>
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.ticker} aria-hidden="true">
          <div className={styles.tickerRow}>{[0, 1, 2].map(copy => <span key={copy}>{band} · </span>)}</div>
        </div>
        <div className={styles.meta}>
          {project.placeholder && <span className={styles.badge}>작성 예시</span>}
          <strong lang="en">{project.stack.join(" · ")}</strong>
          {project.categoryTags.length > 0 && <span>{project.categoryTags.join(" · ")}</span>}
        </div>
        <div className={styles.text}>
          <h3 id={titleId} className={styles.title}>
            <Link href={`/work/${project.slug}`}>
              <span className="sr-only">{project.title}</span>
              {lines.map(line => (
                <span key={line} className={styles.line} aria-hidden="true">
                  {[...line].map((char, index) => <span key={index} className={styles.char} data-char>{char === " " ? " " : char}</span>)}
                </span>
              ))}
            </Link>
          </h3>
          <div className={styles.foot}>
            <p className={styles.tagline}>{project.tagline}</p>
            <Link href={`/work/${project.slug}`} className={styles.detail}>상세 보기 <span aria-hidden="true">↗</span></Link>
            <ProjectLinks project={project} />
          </div>
          {project.featureTags.length > 0 && <ul className="sr-only" aria-label="구현 기능">{project.featureTags.map(tag => <li key={tag}>{tag}</li>)}</ul>}
        </div>
        <div className={styles.devices}>
          <span className={styles.desk}>
            <Image src={project.desktopImage || project.image} alt={project.placeholder ? `${project.title} PC 화면 등록 예정 — 자리 표시 이미지` : `${project.title} PC 화면`} fill sizes="(min-width: 701px) 40vw, 64vw" unoptimized className={styles.screen} />
          </span>
          {project.mobileImage && <span className={styles.phone}>
            <Image src={project.mobileImage} alt={project.placeholder ? `${project.title} 모바일 화면 등록 예정 — 자리 표시 이미지` : `${project.title} 모바일 화면`} fill sizes="(min-width: 701px) 11vw, 17vw" unoptimized className={styles.screen} />
          </span>}
        </div>
      </div>
    </article>
  );
}

export default function WorkStory() {
  const build = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = build.current;
    if (!root) return;
    // Reduced motion: the panels stay in their settled state (the CSS defaults); only the header tone follows the scroll.
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-panel]"));
    const spacers = Array.from(root.querySelectorAll<HTMLElement>("[data-spacer]"));
    const chars = panels.map(panel => Array.from(panel.querySelectorAll<HTMLElement>("[data-char]")));
    const side = root.querySelector<HTMLElement>("[data-side]");
    const closer = root.querySelector<HTMLElement>("[data-closer]"), closerSpacer = root.querySelector<HTMLElement>("[data-closer-spacer]");
    if (!panels.length || !closer || !closerSpacer) return;
    // The closer's pinned progress: 0 → 1 while its spacer scrolls past.
    const closing = (height: number) => clamp((height - closerSpacer.getBoundingClientRect().top) / closerSpacer.offsetHeight);

    const paint = () => {
      if (still) return;
      const height = panels[0].offsetHeight, phone = window.innerWidth <= 700;
      const tops = spacers.map(spacer => spacer.getBoundingClientRect().top);
      // A panel's own place in the flow is right above its spacer: arrive 0 → 1 while that place slides up into the
      // screen, dwell 0 → 1 while the spacer scrolls past under the pinned panel.
      const arrive = (index: number) => clamp((2 * height - tops[index]) / height);
      const dwell = (index: number) => clamp((height - tops[index]) / spacers[index].offsetHeight);
      panels.forEach((panel, index) => {
        // The last panel is covered by the side list (or the closer) sliding up over it.
        const a = arrive(index), d = dwell(index);
        const covered = index < panels.length - 1 ? arrive(index + 1) : clamp(1 - (side ?? closer).getBoundingClientRect().top / height);
        const inner = panel.firstElementChild as HTMLElement;
        panel.style.visibility = covered >= 1 ? "hidden" : "";
        inner.style.transform = covered > 0 ? `scale(${(1 - covered * 0.08).toFixed(4)})` : "";
        inner.style.filter = covered > 0 ? `blur(${(covered * 10).toFixed(1)}px) brightness(${(1 - covered * 0.6).toFixed(3)})` : "";
        panel.style.setProperty("--zoom", (1.22 - easeOut(a) * 0.22 + d * 0.05).toFixed(4));
        chars[index].forEach((char, order) => {
          const k = easeOut(ramp(a, 0.35 + order * 0.03, 0.75 + order * 0.03));
          char.style.opacity = k.toFixed(3);
          char.style.filter = k < 1 ? `blur(${((1 - k) * 14).toFixed(1)}px)` : "";
          char.style.transform = k < 1 ? `translateY(${((1 - k) * 30).toFixed(1)}px)` : "";
        });
        panel.style.setProperty("--meta", ramp(a, 0.7, 1).toFixed(3));
        panel.style.setProperty("--band", (ramp(d, 0.05, 0.25) * (1 - ramp(d, 0.85, 1))).toFixed(3));
        panel.style.setProperty("--band-x", `${(-d * (phone ? 900 : 1500)).toFixed(1)}px`);
        panel.style.setProperty("--desk-y", `${((1 - easeOut(ramp(d, 0.2, 0.55))) * 130).toFixed(1)}%`);
        panel.style.setProperty("--phone-y", `${((1 - easeOut(ramp(d, 0.32, 0.65))) * 170).toFixed(1)}%`);
      });
      // The closer shrinks into the GROW circle underneath (same centre and radius as GrowStory), then fades.
      const c = closing(height), close = easeInOut(ramp(c, 0.02, 0.6)), width = window.innerWidth;
      const radius = Math.min(width, height) * (phone ? 0.4 : 0.3), full = Math.hypot(width, height) / 2 + 20;
      closer.style.clipPath = close > 0 ? `circle(${(full + (radius - full) * close).toFixed(1)}px at 50% 50%)` : "";
      closer.style.opacity = c > 0.6 ? (1 - ramp(c, 0.6, 0.7)).toFixed(3) : "";
    };

    // Repaints on scroll (smooth scroll moves the page by scroll events too), once per frame, and only while the panels
    // are within a screen of the viewport.
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const box = root.getBoundingClientRect();
        // The floating header (phones) sits over the dark panels and list until the closer has mostly shrunk.
        document.documentElement.toggleAttribute("data-on-dark", box.top <= 0 && box.bottom > 80 && closing(panels[0].offsetHeight) < 0.4);
        if (box.bottom > -window.innerHeight && box.top < window.innerHeight * 2) paint();
      });
    };
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.documentElement.removeAttribute("data-on-dark");
    };
  }, []);

  if (!mainProjects.length) return null;
  return (
    <section id="project" aria-labelledby="work-story-title" className={styles.section}>
      <div className={styles.intro} data-page>
        <h2 id="work-story-title" className={styles.heading}>대표 프로젝트</h2>
        {mainProjects.some(project => project.placeholder) && <p className={styles.note}>프로젝트 화면과 설명을 정리하고 있습니다. '작성 예시'로 표시된 부분은 실제 작업 내용으로 채울 예정입니다.</p>}
      </div>
      <div ref={build} className={styles.build}>
        {mainProjects.map((project, index) => (
          <Fragment key={project.slug}>
            <ProjectPanel project={project} />
            <div className={styles.spacer} data-spacer aria-hidden="true" />
          </Fragment>
        ))}
        {sideProjects.length > 0 && <div className={styles.side} data-side>
          <h3 className={styles.sideTitle}>사이드 프로젝트</h3>
          <ol className={styles.sideList}>
            {sideProjects.map((project, index) => <li key={project.title}><SideRow project={project} index={index} /></li>)}
          </ol>
        </div>}
        <div className={styles.closer} data-closer aria-hidden="true" />
        <div className={styles.closerSpacer} data-closer-spacer aria-hidden="true" />
      </div>
    </section>
  );
}
