"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { scrollToY } from "@/components/layout/scrollLock";
import styles from "./DesertWindow.module.css";

// After the cactus story, a cream browser window rises out of the dunes and stays in the desert stage; the page
// sections inside it (about, skills, projects) move up with the normal page scroll, so there is no inner scrollbar.
// The address bar follows the section in view. Menu links and keyboard focus are taken to the right scroll position.
const TARGETS = ["about", "skill", "project", "design", "contact"];
// Address bar per section, in page order; a section takes over once its top passes 40% of the window.
const ADDRESSES: [string, string][] = [["about", "/about"], ["project", "/projects"], ["design", "/design"], ["contact", "/contact"]];
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type Props = {
  rise: MotionValue<number>; // 0 (below the stage) .. 1 (in place)
  travelStart: () => number; // page scroll at which the window is in place and its content starts moving
  onTravel: (px: number) => void; // how far the content moves, so the pinned track can grow by that much
  onNavigate: () => void; // a jump into the window skips the cactus story
  children: ReactNode;
};

export default function DesertWindow({ rise, travelStart, onTravel, onNavigate, children }: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const travel = useRef(0);
  const [address, setAddress] = useState("/about");
  const { scrollY } = useScroll();
  const y = useTransform(rise, value => `${(1 - easeOut(Math.min(Math.max(value, 0), 1))) * 105}%`);

  // Content offset (px from its top) of an element inside the window, whatever the current transform is.
  const offsetOf = (element: Element) => element.getBoundingClientRect().top - (content.current?.getBoundingClientRect().top ?? 0);
  const paint = (page: number) => {
    const shift = Math.min(Math.max(page - travelStart(), 0), travel.current);
    if (content.current) content.current.style.transform = `translateY(${-shift}px)`;
    const view = viewport.current?.clientHeight ?? 0;
    let current = ADDRESSES[0][1];
    for (const [id, path] of ADDRESSES) {
      const section = content.current?.querySelector(`#${id}`);
      // At the very end the last section counts as reached even when it is too short to pass the 40% line.
      if (section && (shift + view * 0.4 >= offsetOf(section) || (travel.current > 0 && shift >= travel.current - 1))) current = path;
    }
    setAddress(current);
  };
  useMotionValueEvent(scrollY, "change", paint);

  useEffect(() => {
    const box = viewport.current, inner = content.current;
    if (!box || !inner) return;
    const measure = () => {
      inner.style.setProperty("--page-h", `${box.clientHeight}px`);
      travel.current = Math.max(0, inner.scrollHeight - box.clientHeight);
      onTravel(travel.current);
      paint(scrollY.get());
    };
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(inner);
    measure();
    // Scrolls the page so that `offset` (px inside the content) sits at the top of the window.
    const reveal = (offset: number) => {
      onNavigate();
      scrollToY(Math.round(travelStart() + Math.min(Math.max(offset, 0), travel.current)));
    };
    const navigate = (id: string) => {
      const target = TARGETS.includes(id) ? inner.querySelector(`#${id}`) : null;
      if (!target) return false;
      reveal(offsetOf(target));
      return true;
    };
    const click = (event: MouseEvent) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !navigate(url.hash.slice(1))) return;
      event.preventDefault();
      history.pushState(null, "", url.hash);
    };
    // Tabbing onto a link that is out of the window's view brings it in (about a third down the window).
    const focus = (event: FocusEvent) => {
      const element = event.target as Element;
      if (!inner.contains(element)) return;
      const rect = element.getBoundingClientRect(), view = box.getBoundingClientRect();
      if (rect.top >= view.top && rect.bottom <= view.bottom) return;
      box.scrollTop = 0; // the browser may try to scroll the clipped viewport itself
      reveal(offsetOf(element) - box.clientHeight / 3);
    };
    const hash = () => navigate(location.hash.slice(1));

    document.addEventListener("click", click, true);
    inner.addEventListener("focusin", focus);
    window.addEventListener("popstate", hash);
    const frame = requestAnimationFrame(() => requestAnimationFrame(hash));
    return () => {
      observer.disconnect();
      document.removeEventListener("click", click, true);
      inner.removeEventListener("focusin", focus);
      window.removeEventListener("popstate", hash);
      cancelAnimationFrame(frame);
    };
    // Set up once; the callbacks only read refs and the latest scroll values.
  }, []);

  return (
    <motion.div className={styles.window} style={{ x: "-50%", y }}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.dots}><i /><i /><i /></span>
        <span className={styles.address} lang="en">{address}</span>
      </div>
      <div ref={viewport} className={styles.viewport}>
        <div ref={content} className={styles.content}>{children}</div>
      </div>
    </motion.div>
  );
}
