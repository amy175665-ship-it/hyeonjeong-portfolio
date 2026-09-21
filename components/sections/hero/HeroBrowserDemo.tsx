"use client";

import { useState } from "react";
import styles from "./Hero.module.css";

const steps = ["HTML", "CSS", "JavaScript", "React"];
const descriptions = ["HTML · 콘텐츠의 구조를 만듭니다.", "CSS · 구조에 색상과 레이아웃을 입힙니다.", "JavaScript · 움직임으로 반응을 더합니다.", "React · 체크할 수 있는 작은 UI를 완성합니다."];

export default function HeroBrowserDemo() {
  const [step, setStep] = useState<number | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [completed, setCompleted] = useState(false);
  return (
    <div className={styles.browserScene}>
      <div className={styles.browser}>
        <div className={styles.windowHeader}>
          <span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span>
          <span className={styles.handwriting}>idea → web</span>
          <button type="button" className={styles.reset} onClick={() => { setStep(null); setCompleted(false); }} aria-label="브라우저 데모 처음으로">↺</button>
        </div>
        <div className={styles.screen} id="hero-browser-preview">
          {step === null ? (
            <div className={styles.startScreen}>
              <span className={styles.codeMark} aria-hidden="true">&lt; / &gt;</span>
              <p lang="en">Let’s build<br />something.</p>
            </div>
          ) : step === 0 ? (
            <div className={styles.wireframe}><span>&lt;article&gt;</span><div>이미지 영역</div><strong>작은 아이디어의 시작</strong><p>구조부터 차근차근 쌓아갑니다.</p><span>&lt;/article&gt;</span></div>
          ) : step === 3 ? (
            <div className={styles.miniApp}>
              <span className={styles.miniEyebrow}>MY LITTLE WEEKEND</span><h3>Make time to make.</h3><p>작은 계획 하나부터.</p>
              <button type="button" aria-pressed={completed} className={styles.checkItem} onClick={() => setCompleted(!completed)}><span aria-hidden="true">{completed ? "✓" : "+"}</span><span style={{ textDecoration: completed ? "line-through" : "none" }}>나만의 웹 페이지 만들기</span></button>
              <span className={styles.progressLabel}>{completed ? "1 / 1 · 오늘의 작은 성취!" : "0 / 1 · 한 걸음씩, 꾸준히"}</span>
            </div>
          ) : (
            <div className={styles.styledCard}>
              <div key={animationKey} className={`${styles.cardArt} ${step === 2 ? styles.movingArt : ""}`} aria-hidden="true"><span>✳</span></div>
              <span className={styles.miniEyebrow}>A LITTLE IDEA</span><h3>Good things<br />take shape.</h3><p>{step === 2 ? "작은 움직임이 만드는 차이." : "색과 여백으로 전하는 분위기."}</p>
            </div>
          )}
        </div>
        <div className={styles.techTabs} aria-label="웹 페이지 제작 단계">
          {steps.map((label, index) => <button key={label} type="button" aria-pressed={step === index} aria-controls="hero-browser-preview" onClick={() => { setStep(index); setAnimationKey((key) => key + 1); }}>{label}</button>)}
        </div>
      </div>
      <p className={styles.demoStatus} role="status">{step !== null && descriptions[step]}</p>
      <div className={styles.stickyNote} aria-hidden="true"><span>↗</span></div>
    </div>
  );
}
