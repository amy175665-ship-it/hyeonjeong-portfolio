import Image from "next/image";
import type { CSSProperties } from "react";
import Reveal from "@/components/ui/Reveal";
import { profile, vlog } from "@/data/profile";
import HobbyFlow from "@/components/sections/HobbyFlow";
import { skills } from "@/data/skills";
import styles from "./AboutStory.module.css";

// Entrance delay (ms) of one piece of the about page; the animations live in the CSS ([data-enter], set by WindowFrame
// each time the window comes up or a menu link enters the about part).
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

// About inside the desert browser window, one window-high page ([data-page]).
// Portrait and name on the left, the statement and plain year / item / note rows (education, certificates)
// on the right, a looping skill icon strip along the bottom. Content comes from data/profile.ts and data/skills.ts.
export default function AboutStory() {
  const certificates = profile.certificates ?? [];
  const educationAt = certificates.length ? 700 : 480;
  return (
    <div className={styles.page}>
      <section id="about" aria-label="소개" className={styles.section} data-page>
        <div className={styles.inner}>
          <div className={styles.profile}>
            <div className={styles.card}>
              <figure className={styles.portrait}>
                {profile.photo
                  ? <Image src={profile.photo} alt={`${profile.name} 프로필 사진`} fill sizes="(min-width: 900px) 300px, 120px" className={styles.photo} unoptimized />
                  : <div className={styles.placeholder} role="img" aria-label="프로필 사진 등록 예정"><span aria-hidden="true">HJ.</span><small>사진 준비 중</small></div>}
              </figure>
              <div className={styles.identity}>
                <p className={`${styles.name} ${styles.rise}`} style={delay(380)}>{profile.name}<span className={styles.nameEn} lang="en"> / Beak hyeon jeong</span></p>
                {/* [수정 예정] temporary example values */}
                <p className={`${styles.role} ${styles.rise}`} style={delay(460)}>2000년생</p>
                <p className={`${styles.role} ${styles.rise}`} style={delay(520)}>T. 010-0000-0000</p>
                <p className={`${styles.role} ${styles.rise}`} style={delay(580)}>E. example@email.com</p>
              </div>
            </div>
            <div className={styles.info}>
              {/* Each line slides up out of its own mask; the highlighter stroke draws in after. */}
              <p className={styles.statement}>
                <span className={styles.line}><span style={delay(160)}>안녕하세요, 새로운 환경에 금방 적응해</span></span>
                <span className={styles.line}><span style={delay(280)}><mark className={styles.mark}>결과로 증명하는</mark> 백현정입니다.</span></span>
              </p>
              {profile.introduction && <p className={`${styles.introduction} ${styles.rise}`} style={delay(420)}>{profile.introduction}</p>}
              {certificates.length > 0 && <div className={styles.group}>
                <h3 className={`${styles.groupTitle} ${styles.rise}`} style={delay(480)}>자격증</h3>
                <ul className={styles.rows} style={delay(520)}>
                  {certificates.map((item, i) => <li key={item.name} className={styles.rise} style={delay(560 + i * 70)}><span className={styles.year}>{item.year}</span><span className={styles.item}>{item.name}</span><span className={styles.note}>{[item.date, item.issuer].filter(Boolean).join(" ")}</span></li>)}
                </ul>
              </div>}
              <div className={styles.group}>
                <h3 className={`${styles.groupTitle} ${styles.rise}`} style={delay(educationAt)}>교육</h3>
                <ul className={styles.rows} style={delay(educationAt + 40)}>
                  {profile.education.map((item, i) => <li key={item.program} className={styles.rise} style={delay(educationAt + 80 + i * 70)}><span className={styles.year}>{item.year}</span><span className={styles.item}>{item.school} {item.program}</span><span className={styles.note}>{[item.status, item.period].filter(Boolean).join(" ")}</span></li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* Skills: icons drift left in an endless loop at the bottom of the about page. The second copy only closes
            the loop, so screen readers get the list once. */}
        <div className={`${styles.marquee} ${styles.rise}`} style={delay(1000)}>
          <div className={styles.track}>
            {[0, 1].map(copy => (
              <ul key={copy} className={styles.skillGroup} aria-label={copy ? undefined : "학습·사용 기술"} aria-hidden={copy ? true : undefined}>
                {skills.map(skill => (
                  <li key={skill.name}>
                    {skill.icon && <img src={skill.icon} alt="" width={28} height={28} className={styles.skillIcon} />}
                    <span lang="en">{skill.name}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>
      {/* Hobbies: one window page each for ABSORB., BUILD. and GROW. (HobbyFlow). */}
      <HobbyFlow />
      {/* Vlog: one 16:9 video sized to fit the window page; hidden until a video file is added (data/profile.ts). */}
      {vlog.video && <section aria-label="브이로그" className={`${styles.section} ${styles.hobbySection}`} data-page>
        <Reveal>
          <div className={styles.vlog}>
            <h3 className={styles.hobbyTitle} lang="en">VLOG</h3>
            <div className={styles.vlogFrame}>
              <video src={vlog.video} poster={vlog.poster} controls playsInline preload="metadata" />
            </div>
          </div>
        </Reveal>
      </section>}
    </div>
  );
}
