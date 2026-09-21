import type { Project } from "@/data/projects";

export default function ProjectTags({ project, tone = "default" }: { project: Pick<Project, "categoryTags" | "featureTags">; tone?: "default" | "sky" }) {
  return (
    <div className="mt-4 space-y-2 text-xs">
      {project.categoryTags.length > 0 && <ul aria-label="프로젝트 분류" className="flex flex-wrap gap-2">
        {project.categoryTags.map((tag) => <li key={tag} className={`rounded-full border px-3 py-1 ${tone === "sky" ? "border-portfolio-line" : "border-line"}`}>{tag}</li>)}
      </ul>}
      {project.featureTags.length > 0 && <ul aria-label="구현 기능" className={`flex flex-wrap gap-x-3 gap-y-2 ${tone === "sky" ? "text-portfolio-muted" : "text-forest"}`}>
        {project.featureTags.map((tag) => <li key={tag}>#{tag}</li>)}
      </ul>}
    </div>
  );
}

