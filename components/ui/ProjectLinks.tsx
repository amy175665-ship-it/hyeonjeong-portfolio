import type { ProjectLinksData } from "@/data/projects";

export function hasProjectLinks(links: ProjectLinksData) {
  return Object.values(links).some((url) => Boolean(url?.trim()));
}

export default function ProjectLinks({ project, tone = "default" }: { project: { title: string; links: ProjectLinksData }; tone?: "default" | "sky" }) {
  const links = [
    { label: "Website", url: project.links.website },
    { label: "GitHub", url: project.links.github },
    { label: "Figma", url: project.links.figma },
  ].filter(({ url }) => url?.trim());
  if (!links.length) return null;
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
      {links.map(({ label, url }) => (
        <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={project.title + " " + label + " (새 탭)"} className={tone === "sky" ? "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 underline underline-offset-4 hover:bg-portfolio-sky/40 focus-visible:!outline-portfolio-ink" : "underline underline-offset-4 hover:text-forest"}>
          {label} <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}

