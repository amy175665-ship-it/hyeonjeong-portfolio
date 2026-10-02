import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { profile } from "@/components/sections/About";
import { skills } from "@/components/sections/Skills";
import styles from "./AboutStory.module.css";

// About + Skills after the concept story: sand-cream page, serif statement, plain lists instead of cards or
// browser frames. Content comes from About's profile and Skills' skills; empty fields stay hidden.
export default function AboutStory() {
  const certificates = profile.certificates ?? [];
  return (
    <div className={styles.page}>
      <section id="about" aria-labelledby="about-story-title" className={styles.section}>
        <div className={styles.inner}>
          <Reveal>
            <p className={styles.kicker} lang="en"><span className={styles.dot} aria-hidden="true" />ABSORB.</p>
            <h2 id="about-story-title" className={styles.title}>소개</h2>
            <p className={styles.statement}>화면을 만들고,<br />클릭했을 때 동작하게 만드는 과정이 재밌습니다.</p>
          </Reveal>
          <div className={styles.profile}>
            <Reveal>
              <figure className={styles.portrait}>
                {profile.photo
                  ? <Image src={profile.photo} alt={`${profile.name} 프로필 사진`} fill sizes="(min-width: 900px) 320px, 70vw" className={styles.photo} />
                  : <div className={styles.placeholder} role="img" aria-label="프로필 사진 등록 예정"><span aria-hidden="true">HJ.</span><small>사진 준비 중</small></div>}
              </figure>
            </Reveal>
            <Reveal delay={0.1}>
              <div className={styles.bio}>
                <p className={styles.name}>{profile.name}</p>
                <p className={styles.role}>웹 퍼블리셔</p>
                {profile.introduction && <p className={styles.introduction}>{profile.introduction}</p>}
                <dl className={styles.facts}>
                  <div>
                    <dt>교육</dt>
                    {profile.education.map(item => <dd key={item.program}>{item.program}<span>{item.school} · {item.year}</span></dd>)}
                  </div>
                  {certificates.length > 0 && <div>
                    <dt>자격증</dt>
                    {certificates.map(item => <dd key={item.name}>{item.name}<span>{item.issuer} · {item.year}</span></dd>)}
                  </div>}
                </dl>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      <section id="skill" aria-labelledby="skill-story-title" className={`${styles.section} ${styles.skills}`}>
        <div className={styles.inner}>
          <Reveal>
            <h2 id="skill-story-title" className={styles.title}>학습·사용 기술</h2>
          </Reveal>
          <ul className={styles.skillList}>
            {skills.map((skill, index) => (
              <li key={skill.name}>
                <Reveal delay={(index % 3) * 0.06}>
                  <h3 lang="en">{skill.name}</h3>
                  {skill.description && <p>{skill.description}</p>}
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
