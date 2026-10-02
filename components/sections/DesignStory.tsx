import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import type { DesignItem } from "@/data/design";
import styles from "./DesignStory.module.css";

// Design work after the projects, one window-high page ([data-page]) inside the desert browser window. Same data and wording
// as DesignGallery; until there are items it shows the quiet "준비 중입니다" note.
export default function DesignStory({ designItems = [] }: { designItems?: DesignItem[] }) {
  return (
    <section id="design" aria-labelledby="design-story-title" className={styles.section} data-page>
      <div className={styles.inner}>
        <Reveal>
          <p className={styles.kicker} lang="en"><span className={styles.dot} aria-hidden="true" />BUILD.</p>
          <h2 id="design-story-title" className={styles.title}>디자인</h2>
        </Reveal>
        {designItems.length === 0 ? (
          <Reveal><p className={styles.empty}>준비 중입니다</p></Reveal>
        ) : (
          <ul className={styles.grid}>
            {designItems.map((item, index) => (
              <li key={`${item.image}-${index}`}>
                <Reveal delay={(index % 3) * 0.06}>
                  <figure className={styles.item}>
                    <div className={styles.media}>
                      <Image src={item.image} alt={item.title || `디자인 작업 ${index + 1}`} fill sizes="(min-width: 900px) 340px, (min-width: 600px) 45vw, 90vw" className={styles.image} />
                    </div>
                    {item.title && <figcaption className={styles.caption}>{item.title}</figcaption>}
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
