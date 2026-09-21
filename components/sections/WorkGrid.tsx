import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import ProjectLinks from "@/components/ui/ProjectLinks";
import ProjectTags from "@/components/ui/ProjectTags";
import { mainProjects } from "@/data/projects";

export default function WorkGrid() {
  return (
    <section id="project" aria-labelledby="project-title" className="border-t border-portfolio-line bg-portfolio-cream px-6 py-16 text-portfolio-ink md:px-10 md:py-24">
      <div className="mx-auto max-w-[1120px]">
      <Reveal>
        <h2 id="project-title" className="text-[28px] font-bold leading-tight md:text-4xl"><span className="relative isolate inline-block"><span aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-3 rounded-full bg-portfolio-sky/70" />대표 프로젝트</span></h2>
        <p className="mb-7 mt-4 max-w-2xl break-keep text-base leading-[1.7] text-portfolio-muted md:mb-10">프로젝트 등록 준비 중입니다. 아래 항목은 구성과 설명을 위한 예시이며, 실제 작업물과 화면으로 교체할 예정입니다.</p>
      </Reveal>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {mainProjects.map((p) => (
          <article key={p.slug} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-portfolio-line bg-portfolio-surface transition-[border-color,box-shadow] duration-200 hover:border-portfolio-sky hover:shadow-md focus-within:border-portfolio-sky motion-reduce:transition-none">
            <div className="relative aspect-[16/9] overflow-hidden border-b border-portfolio-line bg-portfolio-sky/20">
              <Image src={p.image} alt={p.title + " 화면 등록 예정 — 실제 스크린샷이 아닌 자리 표시 이미지"} fill sizes="(min-width: 1200px) 548px, (min-width: 768px) calc((100vw - 104px) / 2), calc(100vw - 48px)" className="object-contain" />
            </div>
            <div className="flex flex-1 flex-col gap-5 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
              <span className="rounded-full bg-portfolio-sky/40 px-3 py-1">{p.type}</span>
              {p.placeholder && <span className="text-portfolio-muted">작성 예시</span>}
            </div>
            <div>
              <h3 className="mb-3 break-keep [overflow-wrap:anywhere] text-xl font-semibold leading-snug md:text-2xl">
                <Link href={`/work/${p.slug}`} className="rounded-sm underline decoration-portfolio-line underline-offset-4 hover:decoration-portfolio-ink focus-visible:!outline-portfolio-ink focus-visible:outline-offset-4">{p.title}</Link>
              </h3>
              <p className="break-keep text-base leading-[1.7] text-portfolio-muted">{p.tagline}</p>
              <p className="mt-4 text-sm leading-[1.7] text-portfolio-muted"><strong className="font-semibold text-portfolio-ink">담당 범위</strong> · {p.scope}</p>
              <ProjectTags project={p} tone="sky" />
              <ul aria-label="기술 스택" className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                {p.stack.map((tech) => <li key={tech} className="rounded-md bg-portfolio-sky/30 px-3 py-1.5">{tech}</li>)}
              </ul>
            </div>
            <div className="mt-auto border-t border-portfolio-line pt-4">
              <Link href={`/work/${p.slug}`} aria-label={p.title + " 상세 보기"} className="mb-2 inline-flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-portfolio-sky/40 focus-visible:!outline-portfolio-ink">상세 보기 <span aria-hidden="true">↗</span></Link>
              <ProjectLinks project={p} tone="sky" />
            </div>
            </div>
          </article>
        ))}
      </div>
      </div>
    </section>
  );
}


