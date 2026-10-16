"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import useSeam from "@/components/motion/useSeam";
import { hobbies } from "@/data/profile";
import styles from "./HobbyFlow.module.css";

const GROUPS = {
  absorb: {
    word: ["", "A", "BSORB"],
    color: "#e96b5a",
    tints: ["#f6ddd5", "#efc6ba", "#f3d3ca", "#f8e3dc"],
    lead: "보고 듣고 흡수하는 것",
  },
  build: {
    word: ["B", "U", "ILD"],
    color: "#7f9657",
    tints: ["#d9e0c8"],
    lead: "규칙을 파악하고 전략을 짜는 것",
  },
  grow: {
    word: ["", "G", "ROW"],
    color: "#e9a33a",
    tints: ["#f2dcb3"],
    lead: "꾸준히 끝까지 가는 것",
  },
} as const;
const tintOf = (index: number) => {
  const hobby = hobbies[index],
    group = GROUPS[hobby.group];
  return group.tints[
    hobbies.filter((other) => other.group === hobby.group).indexOf(hobby) %
      group.tints.length
  ];
};
function Word({ group }: { group: keyof typeof GROUPS }) {
  const word = GROUPS[group].word;
  return (
    <span
      className={styles.word}
      lang="en"
    >
      {word[0]}
      <span className={styles.accent}>{word[1]}</span>
      {word[2]}
      <span className={styles.accent}>.</span>
    </span>
  );
}

// Hover, focus and touch change the left preview without moving the page.
export default function HobbyFlow() {
  const wrap = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [photo, setPhoto] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  // Fades and rises in as the about page lifts away, and fades out again under the projects (CSS --seam-in/out).
  useSeam(wrap);
  const hobby = hobbies[active],
    photos = hobby?.photos ?? [];
  useEffect(() => {
    const element = wrap.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || paused || reduced || photos.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden)
        setPhoto((current) => (current + 1) % photos.length);
    }, 1200);
    return () => window.clearInterval(timer);
  }, [active, visible, paused, reduced, photos.length]);
  if (!hobby) return null;
  const group = GROUPS[hobby.group];
  const select = (index: number) => {
    if (index === active) return;
    setActive(index);
    setPhoto(0);
  };
  const selector = (index: number, home = false) => {
    const item = hobbies[index];
    return (
      <button
        type="button"
        className={home ? styles.home : styles.tile}
        style={
          {
            "--accent": GROUPS[item.group].color,
            background: home ? undefined : tintOf(index),
          } as CSSProperties
        }
        aria-pressed={active === index}
        aria-controls="hobby-preview"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") select(index);
        }}
        onFocus={() => select(index)}
        onClick={() => select(index)}
      >
        {!home && (
          <span className={styles.tileWord}>
            <Word group={item.group} />
          </span>
        )}
        <span
          className={styles.title}
          lang="en"
        >
          {item.title}
        </span>
      </button>
    );
  };
  return (
    <section
      ref={wrap}
      aria-labelledby="hobby-title"
      className={styles.hobbies}
      data-page
    >
      <h2
        id="hobby-title"
        className="sr-only"
      >
        취미
      </h2>
      <div
        className={styles.grid}
        data-count={hobbies.length}
      >
        <div className={styles.previewWrap}>
          <div
            id="hobby-preview"
            role="region"
            aria-label={hobby.title}
            className={`${styles.preview} ${photos.length ? styles.withPhotos : ""}`}
            style={
              {
                "--accent": group.color,
                background: photos.length ? "#202731" : tintOf(active),
              } as CSSProperties
            }
          >
            {photos.map((src, index) => (
              <Image
                key={src}
                src={src}
                alt=""
                fill
                sizes="(min-width: 900px) 40vw, 100vw"
                unoptimized
                className={styles.slide}
                style={{
                  objectPosition: hobby.focus?.[src],
                  opacity: index === photo ? 1 : 0,
                }}
              />
            ))}
            {photos.length > 0 && (
              <span
                className={styles.shade}
                aria-hidden="true"
              />
            )}
            <div className={styles.text}>
              <p className={styles.bigWord}>
                <Word group={hobby.group} />
              </p>
              <p
                className={styles.openTitle}
                lang="en"
              >
                {hobby.title}
              </p>
              <p className={styles.lead}>{group.lead}</p>
              {hobby.description && (
                <p className={styles.lead}>{hobby.description}</p>
              )}
            </div>
            {photos.length > 1 && (
              <div className={styles.controls}>
                {photos.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    className={styles.dot}
                    aria-label={`${hobby.title} ${index + 1} / ${photos.length}`}
                    aria-pressed={photo === index}
                    onClick={() => setPhoto(index)}
                  />
                ))}
                <button
                  type="button"
                  className={styles.autoplay}
                  aria-label={paused ? "슬라이드 재생" : "슬라이드 일시 정지"}
                  onClick={() => setPaused((value) => !value)}
                >
                  {paused ? "▶" : "Ⅱ"}
                </button>
              </div>
            )}
          </div>
          {selector(0, true)}
        </div>
        {hobbies.slice(1).map((item, index) => (
          <div
            key={item.title}
            className={styles.item}
            style={{ gridArea: `a${index + 1}` }}
          >
            {selector(index + 1)}
          </div>
        ))}
      </div>
    </section>
  );
}
