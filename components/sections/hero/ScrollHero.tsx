"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { profile } from "@/components/sections/About";
import { skills } from "@/components/sections/Skills";
import HeroBrowserDemo from "./HeroBrowserDemo";
import PinnedBrowser from "./PinnedBrowser";
import styles from "./ScrollHero.module.css";

// intro=false skips the pinned hero and flying demo, leaving only the about/skills browser (used after ConceptScenes).
export default function ScrollHero({ children, intro = true }: { children?: ReactNode; intro?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: intro ? root : undefined, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 0.12, 0.5, 0.9, 1], ["110%", "110%", "24%", "0%", "0%"]);
  const y = useTransform(scrollYProgress, [0, 0.12, 0.5, 0.9, 1], ["32%", "32%", "12%", "0%", "0%"]);
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.9, 1], [0.48, 0.52, 1, 1]);
  const rotate = useTransform(scrollYProgress, [0, 0.4, 0.9, 1], [10, 7, 0, 0]);
  const radius = useTransform(scrollYProgress, [0, 0.9], [32, 0]);

  return (
    <div className={styles.journey}>
      {intro && <div ref={root} className={styles.scrollStage}>
        <div className={styles.stickyStage}>
          <div className={styles.heroBackdrop}>{children}</div>
          <motion.section
            className={styles.flyingBrowser}
            aria-label="인터랙티브 웹 제작 데모"
            style={reduced ? undefined : { x, y, scale, rotate, borderRadius: radius }}
            onFocusCapture={() => {
              if (!reduced && scrollYProgress.get() < 0.9 && root.current) {
                window.scrollTo({ top: root.current.offsetTop + root.current.offsetHeight - window.innerHeight, behavior: "instant" });
              }
            }}
          >
            <div className={styles.demo}><HeroBrowserDemo presentation="editor" /></div>
          </motion.section>
        </div>
      </div>}
      <PinnedBrowser>
      <div className={styles.contentFrame}>
        <div className={styles.contentChrome}>
          <span className={styles.chromeDots} aria-hidden="true"><i /><i /><i /></span>
          <span className={styles.chromeFilename}>&lt;/&gt; index.html</span>
          <nav aria-label="소개 창 내부 이동" className={styles.contentNav}><a href="#about">소개</a><a href="#skill">학습 기술</a></nav>
        </div>
        <div className={styles.contentCanvas} data-browser-viewport>
        <div data-browser-content>
        <section id="about" className={styles.about} aria-labelledby="scroll-about-title">
          <div className={styles.sectionLabel}><span>02 / about.html</span><span aria-hidden="true">&lt;section id="about"&gt;</span></div>
          <div className={styles.profileGrid}>
            <motion.div className={styles.portrait} initial="code" whileInView="photo" viewport={{ amount: 0.5, once: true }}>
              <div className={styles.photoCode} aria-hidden="true"><span>01</span> &lt;figure&gt;<br /><span>02</span>　&lt;img<br /><span>03</span>　　src="profile.webp"<br /><span>04</span>　　alt="백현정" /&gt;<br /><span>05</span> &lt;/figure&gt;</div>
              <motion.div className={styles.photoResult} variants={{ code: { clipPath: "inset(0% 0% 100% 0%)" }, photo: { clipPath: "inset(0% 0% 0% 0%)" } }} transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}>
                {profile.photo ? <Image src={profile.photo} alt={`${profile.name} 프로필 사진`} fill sizes="(max-width: 699px) 80vw, 360px" className={styles.photo} /> : <div className={styles.placeholder} role="img" aria-label="프로필 사진 등록 예정"><span className={styles.monogram} aria-hidden="true">HJ.</span><span>사진 준비 중</span></div>}
              </motion.div>
              <span className={styles.photoFilename}>profile.webp <span>이미지 영역</span></span>
            </motion.div>
            <div className={styles.bio}>
              <p className={styles.fileLabel}>안녕하세요.</p>
              <h2 id="scroll-about-title">{profile.name}입니다.</h2>
              <p className={styles.role}> 웹 퍼블리셔</p>
              <p className={styles.introduction}>화면을 만들고,<br />클릭했을 때 동작하게 만드는 과정이 재밌습니다.</p>
              {profile.introduction && <p>{profile.introduction}</p>}
              <div className={styles.education}><h3>교육</h3>{profile.education.map(item => <p key={item.program}>{item.program}<br /><span>{item.school} · {item.year}</span></p>)}</div>
            </div>
          </div>
          <p className={styles.closingCode} aria-hidden="true">&lt;/section&gt;</p>
        </section>
        <section id="skill" className={styles.skills} aria-labelledby="scroll-skills-title">
          <div className={styles.sectionLabel}><span>03 / skills.css</span><span aria-hidden="true">&lt;section id="skill"&gt;</span></div>
          <div className={styles.skillsHeading}><h2 id="scroll-skills-title">학습·사용 기술</h2><span aria-hidden="true">TOOLS I USE</span></div>
          <ul className={styles.skillList}>{skills.map((skill, index) => <motion.li key={skill.name} initial={false} whileInView={reduced ? undefined : { y: [12, 0] }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.4, delay: index % 3 * 0.06 }}><span className={styles.skillNumber} aria-hidden="true">0{index + 1}</span><h3>{skill.name}</h3><span className={styles.skillMark} aria-hidden="true">{["</>", "{ }", "( )", "↻", "↗", "#"][index]}</span>{skill.description && <p>{skill.description}</p>}</motion.li>)}</ul>
          <p className={styles.closingCode} aria-hidden="true">&lt;/section&gt;</p>
        </section>
        </div>
        </div>
        <div className={styles.endbar}><span>백현정 · PORTFOLIO</span><a href="#">맨 위로 ↑</a></div>
      </div>
      </PinnedBrowser>
    </div>
  );
}
