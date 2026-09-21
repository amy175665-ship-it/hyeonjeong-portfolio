import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/ui/Reveal";
import SiteFooter from "@/components/layout/SiteFooter";
import ProjectLinks, { hasProjectLinks } from "@/components/ui/ProjectLinks";
import ProjectTags from "@/components/ui/ProjectTags";
import { mainProjects } from "@/data/projects";

export function generateStaticParams() {
  return mainProjects.map(({ slug }) => ({ slug }));
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const index = mainProjects.findIndex((project) => project.slug === params.slug);
  if (index === -1) notFound();
  const project = mainProjects[index];
  const next = mainProjects[(index + 1) % mainProjects.length];
  const sections = [
    { heading: "기간과 담당 범위", content: <dl className="grid gap-x-8 gap-y-3 rounded-2xl border border-portfolio-line bg-portfolio-surface p-5 md:grid-cols-[120px_minmax(0,1fr)] md:p-8"><dt className="font-medium">제작 기간</dt><dd>{project.duration}</dd><dt className="font-medium">담당 범위</dt><dd>{project.scope}</dd></dl> },
    { heading: "데스크톱 · 모바일 화면", content: (
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 md:gap-6 items-start">
        <figure className="min-w-0">
          <Image src={project.desktopImage} alt={project.title + " 데스크톱 화면 등록 예정"} width={1200} height={750} sizes="(min-width: 768px) 60vw, 90vw" className="w-full h-auto rounded-xl border border-portfolio-line bg-portfolio-surface p-3" />
          <figcaption className="text-sm mt-3">데스크톱 · 실제 화면 준비 중</figcaption>
        </figure>
        <figure className="min-w-0 w-full max-w-[240px] mx-auto md:max-w-[280px]">
          <Image src={project.mobileImage} alt={project.title + " 모바일 화면 등록 예정"} width={390} height={780} sizes="(min-width: 768px) 320px, 85vw" className="w-full h-auto rounded-xl border border-portfolio-line bg-portfolio-surface p-3" />
          <figcaption className="text-sm mt-3">모바일 · 실제 화면 준비 중</figcaption>
        </figure>
      </div>
    ) },
    { heading: "레이아웃과 반응형 접근", content: <p>{project.responsive}</p> },
    { heading: "개별 기능 구현", content: <div><p className="mb-4 text-sm">{project.placeholder ? "아래는 작성 예시입니다. 실제 구현한 기능만 남겨 주세요." : "직접 구현한 기능"}</p><ul className="list-disc pl-5 space-y-3">{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></div> },
    { heading: "문제와 해결 과정", content: <div className="space-y-8">{project.challenges.map((challenge, i) => <div key={i} className="space-y-3 rounded-2xl border border-portfolio-line bg-portfolio-surface p-5 md:p-8"><h3 className="font-medium text-portfolio-ink">겪은 어려움 {i + 1}</h3><p>{challenge.problem}</p><h4 className="font-medium text-portfolio-ink">해결 방법</h4><p>{challenge.solution}</p></div>)}</div> },
    ...(hasProjectLinks(project.links) ? [{ heading: "사이트 · 코드 · 디자인", content: <ProjectLinks project={project} tone="sky" /> }] : []),
  ];
  return (
    <>
      <main className="bg-portfolio-cream px-6 text-portfolio-ink md:px-10">
        <header className="mx-auto max-w-[1120px] pb-16 pt-32 md:pb-24 md:pt-40">
          <Link href="/#project" className="mb-6 inline-flex min-h-11 items-center rounded-full border border-portfolio-line px-4 text-sm hover:bg-portfolio-sky/40 focus-visible:!outline-portfolio-ink">← 프로젝트 목록</Link>
          <Reveal>
            <p className="mb-4 inline-flex rounded-full bg-portfolio-sky/40 px-3 py-1.5 text-xs font-medium">{project.type} · {project.placeholder ? "구현 보고서 작성 예시" : "구현 보고서"}</p>
            <h1 className="mb-6 break-keep [overflow-wrap:anywhere] text-3xl font-bold leading-tight tracking-tight md:text-5xl">{project.title}</h1>
            {project.placeholder && <p className="text-portfolio-muted leading-[1.7] mb-6">실제 완료한 프로젝트가 아닙니다. 화면, 기간, 구현 내용과 문제 해결 사례를 본인의 작업으로 교체할 예정입니다.</p>}
            <p className="text-sm">{project.stack.join(" / ")}</p><ProjectTags project={project} tone="sky" />
          </Reveal>
        </header>
        <div className="mx-auto max-w-[1120px]">
          {sections.map((section, i) => (
            <Reveal key={section.heading}>
              <section className="grid grid-cols-1 md:grid-cols-[80px_minmax(0,1fr)] gap-4 py-16 md:gap-6 md:py-24 border-t border-portfolio-line">
                <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-portfolio-sky/40 text-sm font-semibold text-portfolio-ink">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <h2 className="mb-7 break-keep text-[28px] font-bold leading-tight md:mb-10 md:text-4xl">{section.heading}</h2>
                  <div className="break-keep [overflow-wrap:anywhere] text-base leading-[1.7] text-portfolio-muted">{section.content}</div>
                </div>
              </section>
            </Reveal>
          ))}
        </div>
        <div className="mx-auto max-w-[1120px] py-16 md:py-24 border-t border-portfolio-line">
          <p className="text-sm text-portfolio-muted mb-3">Read next · 다음 작업</p>
          <Link href={`/work/${next.slug}`} className="inline-block min-h-11 rounded-lg py-2 break-keep [overflow-wrap:anywhere] text-xl font-semibold leading-snug underline decoration-portfolio-sky underline-offset-4 hover:decoration-portfolio-ink focus-visible:!outline-portfolio-ink md:text-3xl">{next.title} <span aria-hidden="true">→</span></Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}


