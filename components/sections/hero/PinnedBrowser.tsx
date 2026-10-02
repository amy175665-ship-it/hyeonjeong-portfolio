"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import styles from "./PinnedBrowser.module.css";

export default function PinnedBrowser({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end end"] });
  const paint = (value: number) => {
    const content = root.current?.querySelector<HTMLElement>("[data-browser-content]");
    if (content) content.style.transform = travel ? `translateY(${-value * travel}px)` : "none";
  };
  useMotionValueEvent(scrollYProgress, "change", paint);
  useEffect(() => { paint(scrollYProgress.get()); }, [travel]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const node = root.current;
    const viewport = node?.querySelector<HTMLElement>("[data-browser-viewport]");
    const content = node?.querySelector<HTMLElement>("[data-browser-content]");
    if (!node || !viewport || !content) return;
    const media = window.matchMedia("(min-width: 1001px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)");
    const measure = () => setTravel(media.matches ? Math.max(0, content.scrollHeight - viewport.clientHeight) : 0);
    const observer = new ResizeObserver(measure);
    observer.observe(viewport); observer.observe(content);
    media.addEventListener("change", measure); measure();
    const navigate = (id: string) => {
      if (!media.matches || !["about", "skill"].includes(id)) return false;
      const target = content.querySelector<HTMLElement>(`#${id}`);
      if (!target) return false;
      const offset = target.getBoundingClientRect().top - content.getBoundingClientRect().top;
      const distance = Math.max(0, content.scrollHeight - viewport.clientHeight);
      window.scrollTo({ top: node.getBoundingClientRect().top + window.scrollY + Math.min(offset, distance), behavior: "instant" });
      return true;
    };
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const url = new URL(link.href);
      if (url.origin === location.origin && url.pathname === location.pathname && navigate(url.hash.slice(1))) {
        event.preventDefault(); history.pushState(null, "", url.hash);
      }
    };
    const hash = () => navigate(location.hash.slice(1));
    document.addEventListener("click", click);
    window.addEventListener("hashchange", hash);
    window.addEventListener("popstate", hash);
    const frame = requestAnimationFrame(hash);
    return () => { observer.disconnect(); media.removeEventListener("change", measure); document.removeEventListener("click", click); window.removeEventListener("hashchange", hash); window.removeEventListener("popstate", hash); cancelAnimationFrame(frame); };
  }, []);

  return <div ref={root} className={styles.track} style={travel ? { height: `calc(100svh + ${travel}px)` } : undefined}><div className={styles.sticky}>{children}</div></div>;
}
