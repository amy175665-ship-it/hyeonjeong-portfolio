import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/ui/Reveal";
import SiteFooter from "@/components/layout/SiteFooter";
import ProjectLinks, { hasProjectLinks } from "@/components/ui/ProjectLinks";
import ProjectTags from "@/components/ui/ProjectTags";
import { mainProjects } from "@/data/projects";
import styles from "./page.module.css";

type CaseStudyPageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return mainProjects.map(({ slug }) => ({ slug }));
}

export default function CaseStudyPage({ params }: CaseStudyPageProps) {
  const index = mainProjects.findIndex((project) => project.slug === params.slug);

  if (index === -1) {
    notFound();
  }

  const project = mainProjects[index];
  const next = mainProjects[(index + 1) % mainProjects.length];
  const sections = [
    {
      heading: "기간과 담당 범위",
      content: (
        <dl className={styles.overview}>
          <dt className={styles.term}>제작 기간</dt>
          <dd>{project.duration}</dd>
          <dt className={styles.term}>담당 범위</dt>
          <dd>{project.scope}</dd>
        </dl>
      ),
    },
    {
      heading: "데스크톱 · 모바일 화면",
      content: (
        <div className={styles.screens}>
          <figure className={styles.desktopFigure}>
            <Image
              src={project.desktopImage}
              alt={project.title + " 데스크톱 화면 등록 예정"}
              width={1200}
              height={750}
              sizes="(min-width: 768px) 60vw, 90vw"
              className={styles.screenImage}
            />
            <figcaption className={styles.caption}>
              데스크톱 · 실제 화면 준비 중
            </figcaption>
          </figure>
          <figure className={styles.mobileFigure}>
            <Image
              src={project.mobileImage}
              alt={project.title + " 모바일 화면 등록 예정"}
              width={390}
              height={780}
              sizes="(min-width: 768px) 320px, 85vw"
              className={styles.screenImage}
            />
            <figcaption className={styles.caption}>
              모바일 · 실제 화면 준비 중
            </figcaption>
          </figure>
        </div>
      ),
    },
    {
      heading: "레이아웃과 반응형 접근",
      content: <p>{project.responsive}</p>,
    },
    {
      heading: "개별 기능 구현",
      content: (
        <div>
          <p className={styles.featureNotice}>
            {project.placeholder
              ? "아래는 작성 예시입니다. 실제 구현한 기능만 남겨 주세요."
              : "직접 구현한 기능"}
          </p>
          <ul className={styles.featureList}>
            {project.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      heading: "문제와 해결 과정",
      content: (
        <div className={styles.challenges}>
          {project.challenges.map((challenge, i) => (
            <div key={i} className={styles.challenge}>
              <h3 className={styles.challengeHeading}>겪은 어려움 {i + 1}</h3>
              <p>{challenge.problem}</p>
              <h4 className={styles.challengeHeading}>해결 방법</h4>
              <p>{challenge.solution}</p>
            </div>
          ))}
        </div>
      ),
    },
  ];

  if (hasProjectLinks(project.links)) {
    sections.push({
      heading: "사이트 · 코드 · 디자인",
      content: <ProjectLinks project={project} tone="sky" />,
    });
  }

  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <Link href="/#project" className={styles.backLink}>
            ← 프로젝트 목록
          </Link>
          <Reveal>
            <p className={styles.badge}>
              {project.type} · {project.placeholder ? "구현 보고서 작성 예시" : "구현 보고서"}
            </p>
            <h1 className={styles.title}>{project.title}</h1>
            {project.placeholder && (
              <p className={styles.placeholderNotice}>
                화면, 기간, 구현 내용과 문제 해결 사례는 정리 중이며 실제 작업 내용으로 채울 예정입니다.
              </p>
            )}
            <p className={styles.stack}>{project.stack.join(" / ")}</p>
            <ProjectTags project={project} tone="sky" />
          </Reveal>
        </header>

        <div className={styles.sections}>
          {sections.map((section, i) => (
            <Reveal key={section.heading}>
              <section className={styles.section}>
                <span aria-hidden="true" className={styles.sectionNumber}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={styles.sectionBody}>
                  <h2 className={styles.sectionTitle}>{section.heading}</h2>
                  <div className={styles.sectionContent}>{section.content}</div>
                </div>
              </section>
            </Reveal>
          ))}
        </div>

        <div className={styles.nextProject}>
          <p className={styles.nextLabel}>Read next · 다음 작업</p>
          <Link href={`/work/${next.slug}`} className={styles.nextLink}>
            {next.title} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
