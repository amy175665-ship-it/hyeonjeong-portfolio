"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { mainProjects } from "@/data/projects";
import ProjectLinks from "@/components/ui/ProjectLinks";
import ProjectTags from "@/components/ui/ProjectTags";
import styles from "./ProjectCarousel.module.css";

export default function ProjectCarousel() {
  const [active, setActive] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const reduced = useReducedMotion();
  const count = mainProjects.length;
  if (!count) return null;
  const project = mainProjects[active];
  const move = (direction: number) => setActive(index => (index + direction + count) % count);

  return (
    <section id="project" aria-labelledby="project-title" className={styles.section}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>SELECTED WORK</p>
        <h2 id="project-title">대표 프로젝트</h2>
        <p>프로젝트 등록 준비 중입니다. 아래 항목은 구성과 설명을 위한 예시이며,<br className={styles.desktopBreak} /> 실제 작업물과 화면으로 교체할 예정입니다.</p>
      </div>
      <div className={styles.carousel} role="region" aria-roledescription="캐러셀" aria-label="대표 프로젝트 탐색" tabIndex={0}
        onKeyDown={event => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}>
        <div className={styles.stage}
          onPointerDown={event => { suppressClick.current = false; if (event.pointerType !== "mouse") start.current = { x: event.clientX, y: event.clientY }; }}
          onPointerUp={event => {
            if (!start.current) return;
            const dx = event.clientX - start.current.x;
            const dy = event.clientY - start.current.y;
            start.current = null;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) { suppressClick.current = true; move(dx < 0 ? 1 : -1); }
          }}
          onPointerCancel={() => { start.current = null; }}
          onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}>
          {mainProjects.map((item, index) => {
            let offset = (index - active + count) % count;
            if (offset > count / 2) offset -= count;
            const selected = offset === 0;
            const distance = Math.abs(offset);
            return (
              <motion.div key={item.slug} className={styles.card}
                initial={false}
                animate={{ x: `${offset * 53}%`, scale: selected ? 1 : Math.max(0.55, 0.82 - (distance - 1) * 0.12), rotateY: offset === 0 ? 0 : offset > 0 ? -24 : 24, opacity: selected ? 1 : distance > 2 ? 0 : 0.48 }}
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 30 }}
                style={{ zIndex: count - distance, pointerEvents: distance > 2 ? "none" : "auto" }}>
                {selected ? <Link href={`/work/${item.slug}`} className={styles.imageLink} aria-label={`${item.title} 상세 보기`}>
                  <Image src={item.image} alt={`${item.title} 화면 등록 예정 — 실제 스크린샷이 아닌 자리 표시 이미지`} fill sizes="(max-width: 699px) 76vw, (max-width: 1200px) 58vw, 640px" className={styles.image} draggable={false} />
                  <span className={styles.imageBadge}>{item.placeholder ? "작성 예시" : item.type}</span><span className={styles.openIcon} aria-hidden="true">↗</span>
                </Link> : <button type="button" tabIndex={-1} className={styles.imageLink} aria-label={`${item.title} 선택`} onClick={() => setActive(index)}>
                  <Image src={item.image} alt="" fill sizes="(max-width: 699px) 76vw, 640px" className={styles.image} draggable={false} />
                </button>}
              </motion.div>
            );
          })}
        </div>
        {count > 1 && <div className={styles.controls}>
          <button type="button" aria-label="이전 프로젝트" onClick={() => move(-1)}>←</button>
          <span className={styles.mobileCount} aria-hidden="true">{String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
          <button type="button" aria-label="다음 프로젝트" onClick={() => move(1)}>→</button>
        </div>}
      </div>
      <div className={styles.details}>
        <p className={styles.meta} aria-live="polite" aria-atomic="true"><span>{String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span> {project.type} {project.placeholder && "· 작성 예시"}</p>
        <h3><Link href={`/work/${project.slug}`}>{project.title}</Link></h3>
        <p className={styles.tagline}>{project.tagline}</p>
        <ul className={styles.stack} aria-label="기술 스택">{project.stack.map(tech => <li key={tech}>{tech}</li>)}</ul>
        <Link href={`/work/${project.slug}`} className={styles.detailLink}>상세 보기 <span aria-hidden="true">↗</span></Link>
        <div className={styles.additional}>
          <p><strong>담당 범위</strong> · {project.scope}</p>
          <ProjectTags project={project} tone="sky" />
          <ProjectLinks project={project} tone="sky" />
        </div>
      </div>
    </section>
  );
}
