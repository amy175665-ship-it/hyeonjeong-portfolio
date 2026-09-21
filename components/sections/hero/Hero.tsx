import Image from "next/image";
import HeroBrowserDemo from "./HeroBrowserDemo";
import skyPhoto from "@/public/images/sky-photo.webp";
import VoiceIntro from "./VoiceIntro";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.cloudOne} aria-hidden="true" />
      <div className={styles.cloudTwo} aria-hidden="true" />
      <svg className={styles.scribble} viewBox="0 0 1400 800" fill="none" aria-hidden="true">
        <path d="M-30 390C150 280 295 360 280 510S330 735 470 700M1130 200C1220 40 1410 70 1450 160" />
        <path strokeDasharray="6 10" d="M790 820C820 620 1140 745 1090 500" />
        <path d="m755 173 9-19m9 33 22-9m-17 26 21 1M1270 650v35m-17-18h35m-30-13 25 25m-25 0 25-25" />
      </svg>
      <div className={styles.composition}>
        <figure className={styles.photo}>
          <span className={styles.tape} aria-hidden="true" />
          <Image src={skyPhoto} alt="파란 하늘에 피어난 흰 구름" sizes="(min-width: 1100px) 22vw, (min-width: 700px) 200px, 140px" priority />
          <figcaption>Good interface.<br />Brighter tomorrow.<span aria-hidden="true">☺</span></figcaption>
        </figure>
        <div className={styles.intro}>
          <p className={styles.eyebrow}><span aria-hidden="true" /> HELLO, I’M HYUNJUNG.</p>
          <h1 id="hero-title" className={styles.title} lang="en"><span>Turning</span><span>Design</span><span><em>into</em> Web.</span></h1>
          <p className={styles.disciplines} lang="en">WEB PUBLISHING · UI FRONTEND · CREATIVE INTERACTION</p>
          <a href="/#project" className={styles.workLink}>VIEW MY WORK <span aria-hidden="true">↗</span></a>
        </div>
        <HeroBrowserDemo />
      </div>
      <div className={styles.heroBottom}>
        <p className={styles.cornerNote}>DESIGN INTO CODE.<br />ONE DETAIL AT A TIME.</p>
        <a href="/#about" className={styles.scrollLink}><span aria-hidden="true">⌄</span> SCROLL TO EXPLORE</a>
        <p className={styles.cornerNote}>SMALL DETAILS<br />MAKE A BIG DIFFERENCE.</p>
      </div>
      <div className={styles.voice}><VoiceIntro /></div>
    </section>
  );
}
