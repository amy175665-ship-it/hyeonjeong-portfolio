import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { profile } from "@/components/sections/About";
import { skills } from "@/components/sections/Skills";
import styles from "./AboutStory.module.css";

// About + Skills inside the desert browser window, one window-high page each ([data-page]).
// About: portrait and name on the left, the statement and plain year / item / note rows (education, certificates)
// on the right. Content comes from About's profile and Skills' skills; empty fields stay hidden.
export default function AboutStory() {
  const certificates = profile.certificates ?? [];
  return (
    <div className={styles.page}>
      <section id="about" aria-labelledby="about-story-title" className={styles.section} data-page>
        <div className={styles.inner}>
          <Reveal>
            <p className={styles.kicker} lang="en"><span className={styles.dot} aria-hidden="true" />ABSORB.</p>
            <h2 id="about-story-title" className={styles.title}>소개</h2>
          </Reveal>
          <div className={styles.profile}>
            <Reveal>
              <div className={styles.card}>
                <figure className={styles.portrait}>
                  {profile.photo
                    ? <Image src={profile.photo} alt={`${profile.name} 프로필 사진`} fill sizes="(min-width: 900px) 300px, 120px" className={styles.photo} unoptimized />
                    : <div className={styles.placeholder} role="img" aria-label="프로필 사진 등록 예정"><span aria-hidden="true">HJ.</span><small>사진 준비 중</small></div>}
                </figure>
                <div className={styles.identity}>
                  <p className={styles.name}>{profile.name}</p>
                  <p className={styles.role}>웹 퍼블리셔</p>
                  {profile.birth && <p className={styles.role}>생년월일 · {profile.birth}</p>}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className={styles.info}>
                <p className={styles.statement}>화면을 만들고,<br />클릭했을 때 동작하게 만드는 과정이 재밌습니다.</p>
                {profile.introduction && <p className={styles.introduction}>{profile.introduction}</p>}
                {certificates.length > 0 && <div className={styles.group}>
                  <h3 className={styles.groupTitle}>자격증</h3>
                  <ul className={styles.rows}>
                    {certificates.map(item => <li key={item.name}><span className={styles.year}>{item.year}</span><span className={styles.item}>{item.name}</span><span className={styles.note}>{[item.date, item.issuer].filter(Boolean).join(" ")}</span></li>)}
                  </ul>
                </div>}
                <div className={styles.group}>
                  <h3 className={styles.groupTitle}>교육</h3>
                  <ul className={styles.rows}>
                    {profile.education.map(item => <li key={item.program}><span className={styles.year}>{item.year}</span><span className={styles.item}>{item.school} {item.program}</span><span className={styles.note}>{[item.status, item.period].filter(Boolean).join(" ")}</span></li>)}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      <section id="skill" aria-labelledby="skill-story-title" className={styles.section} data-page>
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
