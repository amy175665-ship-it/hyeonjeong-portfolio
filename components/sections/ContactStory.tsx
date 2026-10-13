"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMotionValue } from "framer-motion";
import { iconPaths } from "@/components/layout/SiteFooter";
import { contact } from "@/data/contact";
import { navProfile } from "@/data/navigation";
import logoImage from "@/public/images/logo/logo.webp";
import type { Wind } from "@/components/sections/concept/scenes";
import styles from "./ContactStory.module.css";

const CactusScene = dynamic(() => import("@/components/sections/concept/CactusScene"), { ssr: false });
const AvatarCanvas = dynamic(() => import("@/components/sections/hero/AvatarCanvas"), { ssr: false });

// BLOOM. — the last part inside the window (approved redesign mockup): night falls from the centre, the 3D cactus from
// the story blooms (its story progress driven from the night-lit, closed state to the open flower), the 3D face from
// the hero comes back, and the contact channels appear. At the end the window bar comes down and the sand rises over
// everything, as at the opening. All tied to the scroll; reduced motion shows the bloomed night scene only.
// Story progress for CactusScene: built and night-lit, then the flower opens in the morning light.
const CLOSED = 0.67, OPEN = 0.83;
const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const ramp = (value: number, from: number, to: number) => clamp((value - from) / (to - from));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Seeded so the server and the client place the same stars.
const STARS = (() => {
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 80 }, () => ({ left: random() * 100, top: random() * 70, opacity: 0.35 + random() * 0.65, delay: random() * 3 }));
})();

export default function ContactStory() {
  const channels = [
    { key: "phone" as const, label: "전화", value: contact.phone, href: "tel:" + contact.phone },
    { key: "email" as const, label: "이메일", value: contact.email, href: "mailto:" + contact.email },
    { key: "github" as const, label: "GitHub", value: contact.github, href: contact.github },
    { key: "resume" as const, label: "이력서", value: contact.resume, href: contact.resume },
  ].filter(item => item.value?.trim());
  const email = channels.find(item => item.key === "email");
  const others = channels.filter(item => item.key !== "email");

  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);
  const mail = useRef<HTMLAnchorElement>(null);
  const story = useMotionValue(OPEN);
  const wind = useRef<Wind>({ value: 0 });
  const [near, setNear] = useState(false);

  useEffect(() => {
    const root = section.current, box = stage.current;
    if (!root || !box) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let shown = false, running = false;

    const paint = () => {
      const rect = root.getBoundingClientRect(), H = box.offsetHeight, W = box.offsetWidth;
      // The 3D views mount once the part comes near; the face renders only while the part is on screen.
      const close = rect.top < H * 1.5 && rect.bottom > -H * 0.5;
      if (close && !shown) { shown = true; setNear(true); }
      if (close !== running) { running = close; face.current?.toggleAttribute("data-paused", !close); }
      if (still) return;
      // enter: the night circle opens while the part scrolls in; b: the pinned part (0 → 1).
      const enter = clamp(1 - rect.top / H), b = clamp(-rect.top / Math.max(root.offsetHeight - H, 1));
      const open = easeOut(ramp(b, 0.02, 0.3)), sand = easeInOut(ramp(b, 0.8, 1));
      story.set(CLOSED + (OPEN - CLOSED) * open);
      root.style.setProperty("--night", `${(easeInOut(enter) * (Math.hypot(W, H) / 2 + 20)).toFixed(1)}px`);
      root.style.setProperty("--open", open.toFixed(3));
      root.style.setProperty("--face", ramp(b, 0.08, 0.24).toFixed(3));
      root.style.setProperty("--text", ramp(b, 0.14, 0.3).toFixed(3));
      root.style.setProperty("--bar", easeInOut(ramp(b, 0.7, 0.82)).toFixed(3));
      root.style.setProperty("--sand", sand.toFixed(4));
      // The floating header (phones) turns light over the night.
      document.documentElement.toggleAttribute("data-bloom-dark", rect.top <= 60 && rect.bottom > 80 && sand < 0.5);
    };

    let frame = 0;
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; paint(); }); };
    // The email leans toward a nearby mouse pointer.
    const move = (event: PointerEvent) => {
      const link = mail.current;
      if (still || !link || event.pointerType !== "mouse") return;
      const box = link.getBoundingClientRect(), dx = event.clientX - (box.left + box.width / 2), dy = event.clientY - (box.top + box.height / 2);
      const pull = Math.hypot(dx, dy) < Math.max(box.width * 0.65, 140);
      link.style.setProperty("--mx", `${pull ? (dx * 0.14).toFixed(1) : 0}px`);
      link.style.setProperty("--my", `${pull ? (dy * 0.24).toFixed(1) : 0}px`);
    };
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeAttribute("data-bloom-dark");
    };
  }, [story]);

  return (
    <footer ref={section} aria-labelledby="contact-story-title" className={styles.section}>
      {/* Menu target (#contact): where the cactus has bloomed and the channels are in. */}
      <span id="contact" className={styles.anchor} aria-hidden="true" />
      <div ref={stage} className={styles.stage}>
        <div className={styles.night} aria-hidden="true">
          {STARS.map((star, index) => <i key={index} style={{ left: `${star.left}%`, top: `${star.top}%`, opacity: star.opacity, animationDelay: `${star.delay.toFixed(2)}s` }} />)}
          <span className={styles.glow} />
        </div>
        <div className={styles.cactus} aria-hidden="true">
          {/* No wind here: drawn on demand, only when the bloom progress changes (reduced = built, still). */}
          {near && <CactusScene progress={story} wind={wind} reduced running={false} />}
        </div>
        <div ref={face} className={styles.face} data-pause-scope role="img" aria-label="백현정의 3D 얼굴">
          {near && <AvatarCanvas />}
        </div>
        <div className={styles.text}>
          <h2 id="contact-story-title" className={styles.word}>
            <span className="sr-only">연락처 · 이력서</span>
            <span aria-hidden="true" lang="en">BLOOM<b>.</b></span>
          </h2>
          {email && <a ref={mail} href={email.href} className={styles.email} aria-label={`${email.label}: ${email.value}`}>
            {/* Wraps only after the @ on narrow screens, never inside the name or the domain. */}
            <span className={styles.emailText}>{email.value?.split("@").map((part, index) => index ? <span key={index}>@<wbr />{part}</span> : part)}</span>
            <span aria-hidden="true" className={styles.arrow}>↗</span>
          </a>}
          {others.length > 0 && <ul aria-label="연락 채널" className={styles.channels}>
            {others.map(item => <li key={item.key}>
              <a href={item.href} aria-label={item.label + (item.key === "phone" ? ": " + item.value : "")} className={styles.channel}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[item.key]} /></svg>
                {item.label}
                <span aria-hidden="true">↗</span>
              </a>
            </li>)}
          </ul>}
        </div>
        <p className={styles.copyright}>© {new Date().getFullYear()} {contact.name}</p>
        {/* Closing: the window bar comes down, then the sand rises over everything (the header logo leads home). */}
        <div className={styles.closeBar} aria-hidden="true"><span className={styles.dots}><i /><i /><i /></span><Image src={logoImage} alt="" sizes="34px" className={styles.barLogo} /></div>
        <div className={styles.sandEnd} aria-hidden="true">
          <svg viewBox="0 0 1000 1600" preserveAspectRatio="none"><path d="M0 80 C90 40 170 30 260 62 S420 120 520 70 S700 10 800 48 S930 90 1000 60 V1600 H0Z" fill="#e3bf91" /></svg>
          <a href={navProfile.href} tabIndex={-1} className={styles.home}><Image src={logoImage} alt="" sizes="76px" /></a>
        </div>
      </div>
    </footer>
  );
}
