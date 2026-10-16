import type { ProjectLinksData } from "@/data/projects";
import styles from "./ProjectLinks.module.css";

type ProjectLinksProps = {
  project: {
    title: string;
    links: ProjectLinksData;
  };
  tone?: "default" | "sky";
};

export function hasProjectLinks(links: ProjectLinksData) {
  return Object.values(links).some((url) => Boolean(url?.trim()));
}

export default function ProjectLinks({
  project,
  tone = "default",
}: ProjectLinksProps) {
  const links = [
    { label: "Website", url: project.links.website },
    { label: "GitHub", url: project.links.github },
    { label: "Figma", url: project.links.figma },
  ].filter(({ url }) => url?.trim());

  if (!links.length) {
    return null;
  }

  return (
    <div className={styles.links}>
      {links.map(({ label, url }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={project.title + " " + label + " (새 탭)"}
          className={tone === "sky" ? styles.skyLink : styles.link}
        >
          {label} <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}
