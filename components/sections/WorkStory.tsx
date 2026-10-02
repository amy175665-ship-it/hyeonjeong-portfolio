import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import ProjectLinks from "@/components/ui/ProjectLinks";
import { mainProjects, sideProjects, type Project } from "@/data/projects";
import styles from "./WorkStory.module.css";

// Projects inside the desert browser window, one window-high page ([data-page]) per project: the section heading
// shares the first page with the first project, the others get a page each (image + text, alternating sides).
// Earlier work, when there is any, gets its own page as a plain numbered list. Placeholders stay labelled as examples.
function ProjectRow({ project, index }: { project: Project; index: number }) {
  return (
    <div className={`${styles.item} ${index % 2 ? styles.flip : ""}`}>
      <Reveal>
        <Link href={`/work/${project.slug}`} className={styles.media} aria-label={`${project.title} 상세 보기`}>
          <Image src={project.image} alt={project.placeholder ? `${project.title} 화면 등록 예정 — 실제 스크린샷이 아닌 자리 표시 이미지` : `${project.title} 화면`} fill sizes="(min-width: 900px) 620px, 92vw" className={styles.image} />
          {project.placeholder && <span className={styles.badge}>작성 예시</span>}
        </Link>
      </Reveal>
      <Reveal delay={0.08}>
        <div className={styles.text}>
          <p className={styles.meta}><span className={styles.count} lang="en">{String(index + 1).padStart(2, "0")} / {String(mainProjects.length).padStart(2, "0")}</span>{project.type}{project.placeholder && " · 작성 예시"}</p>
          <h3 className={styles.name}><Link href={`/work/${project.slug}`}>{project.title}</Link></h3>
          <p className={styles.tagline}>{project.tagline}</p>
          <p className={styles.stack} aria-label="기술 스택" lang="en">{project.stack.join(" · ")}</p>
          {(project.categoryTags.length > 0 || project.featureTags.length > 0) && <ul className={styles.tags} aria-label="분류와 구현 기능">
            {project.categoryTags.map(tag => <li key={tag}>{tag}</li>)}
            {project.featureTags.map(tag => <li key={tag} className={styles.feature}>#{tag}</li>)}
          </ul>}
          <div className={styles.actions}>
            <Link href={`/work/${project.slug}`} className={styles.detail}>상세 보기 <span aria-hidden="true">↗</span></Link>
            <ProjectLinks project={project} />
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export default function WorkStory() {
  if (!mainProjects.length) return null;
  const [first, ...rest] = mainProjects;
  return (
    <section id="project" aria-labelledby="work-story-title" className={styles.section}>
      <div className={styles.page} data-page>
        <div className={styles.inner}>
          <Reveal>
            <p className={styles.kicker} lang="en"><span className={styles.dot} aria-hidden="true" />BUILD.</p>
            <h2 id="work-story-title" className={styles.title}>대표 프로젝트</h2>
            {mainProjects.some(project => project.placeholder) && <p className={styles.note}>프로젝트 등록 준비 중입니다. 아래 항목은 구성과 설명을 위한 예시이며, 실제 작업물과 화면으로 교체할 예정입니다.</p>}
          </Reveal>
          <ol className={styles.list}>
            <li><ProjectRow project={first} index={0} /></li>
          </ol>
        </div>
      </div>
      {rest.length > 0 && <ol className={styles.list} start={2}>
        {rest.map((project, index) => (
          <li key={project.slug} className={styles.page} data-page>
            <div className={styles.inner}><ProjectRow project={project} index={index + 1} /></div>
          </li>
        ))}
      </ol>}
      {sideProjects.length > 0 && <div className={styles.page} data-page>
        <div className={styles.inner}>
          <h3 className={styles.subtitle}>이전 작업</h3>
          <ol className={styles.earlierList}>
            {sideProjects.map((project, index) => (
              <li key={project.slug}>
                <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className={styles.earlierName}>{project.title}{project.placeholder && <span> · 작성 예시</span>}</p>
                  <p className={styles.earlierLine}>{project.tagline}</p>
                </div>
                <p className={styles.earlierStack} lang="en">{project.stack.join(" · ")}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>}
    </section>
  );
}
