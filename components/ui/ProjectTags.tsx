import type { Project } from "@/data/projects";
import styles from "./ProjectTags.module.css";

type ProjectTagsProps = {
  project: Pick<Project, "categoryTags" | "featureTags">;
  tone?: "default" | "sky";
};

export default function ProjectTags({
  project,
  tone = "default",
}: ProjectTagsProps) {
  return (
    <div className={styles.tags}>
      {project.categoryTags.length > 0 && (
        <ul aria-label="프로젝트 분류" className={styles.categories}>
          {project.categoryTags.map((tag) => (
            <li key={tag} className={styles.category}>
              {tag}
            </li>
          ))}
        </ul>
      )}

      {project.featureTags.length > 0 && (
        <ul
          aria-label="구현 기능"
          className={tone === "sky" ? styles.skyFeatures : styles.features}
        >
          {project.featureTags.map((tag) => (
            <li key={tag}>#{tag}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
