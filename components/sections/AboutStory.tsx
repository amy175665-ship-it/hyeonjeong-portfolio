import Image from "next/image";
import type { CSSProperties } from "react";
import Reveal from "@/components/ui/Reveal";
import { profile, vlog } from "@/data/profile";
import HobbyFlow from "@/components/sections/HobbyFlow";
import AboutCover from "@/components/sections/AboutCover";
import { skills } from "@/data/skills";
import styles from "./AboutStory.module.css";

// Entrance delay (ms) of one piece of the about page; the animations live in the CSS ([data-enter], set by WindowFrame
// each time the window comes up or a menu link enters the about part).
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
// The skill strip loops two identical copies, so one copy must be wider than the screen: it repeats the list this often
// (6 skills ≈ 1250px, three times ≈ 3700px). Only the first list is read out.
const SKILL_REPEAT = 3;

// About inside the desert browser window, one window-high page ([data-page]).
// Portrait and name on the left, the statement and plain year / item / note rows (certificates and education side by
// side) on the right, centred in the window; a looping skill icon strip along the bottom. Content comes from data/profile.ts and data/skills.ts.
export default function AboutStory() {
  const certificates = profile.certificates ?? [];
  const educationAt = certificates.length ? 700 : 480;
  return (
    <div className={styles.page}>
      {/* ABSORB. cover → the about page (AboutCover pins it and builds it up from the sand portrait). */}
      <AboutCover
        className={styles.section}
        labelledBy="about-title"
      >
        <h2
          id="about-title"
          className="sr-only"
        >
          소개
        </h2>
        <div className={styles.inner}>
          <div className={styles.profile}>
            <div className={styles.card}>
              <figure
                className={styles.portrait}
                data-cover-photo
              >
                {profile.photo ? (
                  <Image
                    src={profile.photo}
                    alt={`${profile.name} 프로필 사진`}
                    fill
                    sizes="(min-width: 900px) 300px, 120px"
                    className={styles.photo}
                    unoptimized
                  />
                ) : (
                  <div
                    className={styles.placeholder}
                    role="img"
                    aria-label="프로필 사진 등록 예정"
                  >
                    <span aria-hidden="true">HJ.</span>
                    <small>사진 준비 중</small>
                  </div>
                )}
              </figure>
              <div
                className={styles.identity}
                data-cover-rest
              >
                <p
                  className={`${styles.name} ${styles.rise}`}
                  style={delay(380)}
                >
                  {profile.name}
                  <span
                    className={styles.nameEn}
                    lang="en"
                  >
                    {" "}
                    / Beak hyeon jeong
                  </span>
                </p>
                {/* [수정 예정] temporary example values */}
                <p
                  className={`${styles.role} ${styles.rise}`}
                  style={delay(460)}
                >
                  2000년생
                </p>
                <p
                  className={`${styles.role} ${styles.rise}`}
                  style={delay(520)}
                >
                  T. 010-0000-0000
                </p>
                <p
                  className={`${styles.role} ${styles.rise}`}
                  style={delay(580)}
                >
                  E. example@email.com
                </p>
              </div>
            </div>
            <div className={styles.info}>
              {/* Each line slides up out of its own mask; the highlighter stroke draws in after. */}
              <p
                className={styles.statement}
                data-cover-statement
              >
                {profile.statement.lines.map((line, i) => {
                  const [before, after] =
                    profile.statement.mark &&
                    line.includes(profile.statement.mark)
                      ? line.split(profile.statement.mark)
                      : [line];
                  return (
                    <span
                      key={line}
                      className={styles.line}
                    >
                      <span style={delay(160 + i * 120)}>
                        {before}
                        {after !== undefined && (
                          <>
                            <mark className={styles.mark}>
                              {profile.statement.mark}
                            </mark>
                            {after}
                          </>
                        )}
                      </span>
                    </span>
                  );
                })}
              </p>
              {profile.introduction && (
                <p
                  className={`${styles.introduction} ${styles.rise}`}
                  style={delay(420)}
                  data-cover-rest
                >
                  {profile.introduction}
                </p>
              )}
              {/* Certificates and education side by side (stacked on narrower screens). */}
              <div
                className={styles.lists}
                data-cover-rest
              >
                {certificates.length > 0 && (
                  <div className={styles.group}>
                    <h3
                      className={`${styles.groupTitle} ${styles.rise}`}
                      style={delay(480)}
                    >
                      자격증
                    </h3>
                    <ul
                      className={styles.rows}
                      style={delay(520)}
                    >
                      {certificates.map((item, i) => (
                        <li
                          key={item.name}
                          className={styles.rise}
                          style={delay(560 + i * 70)}
                        >
                          <span className={styles.year}>{item.year}</span>
                          <span className={styles.item}>{item.name}</span>
                          <span className={styles.note}>
                            {[item.date, item.issuer].filter(Boolean).join(" ")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className={styles.group}>
                  <h3
                    className={`${styles.groupTitle} ${styles.rise}`}
                    style={delay(educationAt)}
                  >
                    교육
                  </h3>
                  <ul
                    className={styles.rows}
                    style={delay(educationAt + 40)}
                  >
                    {profile.education.map((item, i) => (
                      <li
                        key={item.program}
                        className={styles.rise}
                        style={delay(educationAt + 80 + i * 70)}
                      >
                        <span className={styles.year}>{item.year}</span>
                        <span className={styles.item}>
                          {item.school} {item.program}
                        </span>
                        <span className={styles.note}>
                          {[item.status, item.period].filter(Boolean).join(" ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Skills: icons drift left in an endless loop at the bottom of the about page. The second copy only closes
            the loop, so screen readers get the list once. */}
        <div
          className={`${styles.marquee} ${styles.rise}`}
          style={delay(1000)}
          data-cover-rest
        >
          <div className={styles.track}>
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                className={styles.skillGroup}
                aria-label={copy ? undefined : "학습·사용 기술"}
                aria-hidden={copy ? true : undefined}
              >
                {Array.from({ length: SKILL_REPEAT }, () => skills)
                  .flat()
                  .map((skill, i) => (
                    <li
                      key={i}
                      aria-hidden={
                        !copy && i >= skills.length ? true : undefined
                      }
                    >
                      {skill.icon && (
                        <img
                          src={skill.icon}
                          alt=""
                          width={28}
                          height={28}
                          className={styles.skillIcon}
                        />
                      )}
                      <span lang="en">{skill.name}</span>
                    </li>
                  ))}
              </ul>
            ))}
          </div>
        </div>
      </AboutCover>
      {/* Hobbies: hover/focus/touch selects content in the left preview (HobbyFlow). */}
      <HobbyFlow />
      {/* Vlog: one 16:9 video sized to fit the window page; hidden until a video file is added (data/profile.ts). */}
      {vlog.video && (
        <section
          aria-label="브이로그"
          className={`${styles.section} ${styles.hobbySection}`}
          data-page
        >
          <Reveal>
            <div className={styles.vlog}>
              <h3
                className={styles.hobbyTitle}
                lang="en"
              >
                VLOG
              </h3>
              <div className={styles.vlogFrame}>
                <video
                  src={vlog.video}
                  poster={vlog.poster}
                  controls
                  playsInline
                  preload="metadata"
                />
              </div>
            </div>
          </Reveal>
        </section>
      )}
    </div>
  );
}
