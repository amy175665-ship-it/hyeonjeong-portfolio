import Image from "next/image";
import sandImage from "@/public/images/hero/hero-sand-bg.webp";
import HeroBrowserDemo from "./HeroBrowserDemo";
import SandStream from "./SandStream";
import VoiceIntro from "./VoiceIntro";
import HeroAvatar from "./HeroAvatar";
import GrowthScene from "./GrowthScene";
import styles from "./Hero.module.css";

function Letters({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((char, index) => (
        <span key={index} className={styles.letter}>{char === " " ? "\u00a0" : char}</span>
      ))}
    </>
  );
}

export default function Hero({ showExtras = true, showTitle = true, desert = false }: { showExtras?: boolean; showTitle?: boolean; desert?: boolean }) {
  return (
    <>
    <section className={`${styles.hero} ${!showTitle ? styles.editorial : ""} ${desert ? styles.desert : ""}`} aria-labelledby="hero-title">
      <div className={styles.composition}>
        <div className={styles.atmosphere} aria-hidden="true" />
        <HeroAvatar />
        <div className={styles.intro}>
          <h1 id="hero-title" className={`${styles.title} ${showTitle ? "" : styles.titleHidden}`} lang="en" aria-label="ABSORB. BUILD. GROW.">
            <span aria-hidden="true"><Letters text="ABSORB." /></span>
            <span aria-hidden="true"><Letters text="BUILD." /></span>
            <span aria-hidden="true"><em><Letters text="GROW." /></em></span>
          </h1>
          <p className={styles.coverSubtitle}>배운 것을 흡수하고, 직접 구현하며 성장하는<br className={styles.subtitleBreak} /> 웹퍼블리셔 백현정입니다.</p>
        </div>
        {!showTitle && <GrowthScene />}
        <SandStream />
        <Image src={sandImage} alt="" aria-hidden="true" className={styles.sand} priority unoptimized />
      </div>
      {showExtras && <div className={styles.extras}>
        <div className={styles.extrasIntro}>
          <p className={styles.eyebrow}><span aria-hidden="true" /> HELLO, I’M HYUNJUNG.</p>
          <p className={styles.disciplines} lang="en">WEB PUBLISHING / FRONTEND / INTERACTION</p>
          <div className={styles.voice}><VoiceIntro /></div>
          <a href="/#about" className={styles.scrollLink}><span aria-hidden="true">⌄</span> SCROLL TO EXPLORE</a>
        </div>
        <HeroBrowserDemo />
      </div>}
    </section>
    </>
  );
}
