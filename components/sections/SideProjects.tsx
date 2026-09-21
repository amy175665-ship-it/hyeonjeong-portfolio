import ProjectLinks from "@/components/ui/ProjectLinks";
import { sideProjects } from "@/data/projects";

export default function SideProjects() {
  if (!sideProjects.length) return null;
  return (
    <section aria-labelledby="side-heading" className="max-w-content mx-auto px-6 py-16 border-t border-line">
      <h2 id="side-heading" className="font-sans font-bold text-3xl md:text-4xl mb-8">보조 프로젝트</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {sideProjects.map((project) => (
          <article key={project.slug} className="min-w-0 border border-line p-6 space-y-4">
            <h3 className="text-xl font-medium">{project.title}</h3>
            {project.placeholder && <p className="text-xs text-forest">작성 예시 · 실제 작업으로 교체 예정</p>}
            <p className="text-ink/70">{project.tagline}</p>
            {project.categoryTags.length > 0 && <ul aria-label="프로젝트 분류" className="flex flex-wrap gap-2 text-xs">
              {project.categoryTags.map((tag) => <li key={tag} className="rounded-full border border-line px-3 py-1">{tag}</li>)}
            </ul>}
            <ProjectLinks project={project} />
          </article>
        ))}
      </div>
    </section>
  );
}

