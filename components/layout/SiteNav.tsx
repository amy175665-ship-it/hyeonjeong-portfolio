"use client";
import Link from "next/link";
import Image from "next/image";
import logoImage from "@/public/images/logo/logo.png";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { navLinks, navCta, navProfile } from "@/data/navigation";
import styles from "./SiteNav.module.css";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
// Double "ring-ring" bell motion: tilt → tilt → tilt → tilt → settle.
const logoRingKeyframes: Keyframe[] = [
  { transform: "translateX(0) rotate(0deg) scale(1)", easing: "ease-in-out" },
  { transform: "translateX(-1.5px) rotate(-8deg) scale(1.04)", offset: 0.14, easing: "ease-in-out" },
  { transform: "translateX(1.5px) rotate(8deg) scale(1.04)", offset: 0.3, easing: "ease-in-out" },
  { transform: "translateX(-1px) rotate(-7deg) scale(1.03)", offset: 0.48, easing: "ease-in-out" },
  { transform: "translateX(1px) rotate(6deg) scale(1.02)", offset: 0.64, easing: "ease-in-out" },
  { transform: "translateX(0) rotate(-1.5deg) scale(1)", offset: 0.82, easing: "ease-in-out" },
  { transform: "translateX(0) rotate(0deg) scale(1)", easing: "ease-in-out" },
];
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const logoRing = useRef<Animation | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const links = [...navLinks, navCta];
  // Ignore hovers while a ring is still playing so repeated events never stack.
  const ringLogo = () => {
    const logo = logoRef.current;
    if (!logo || prefersReducedMotion || logoRing.current?.playState === "running") return;
    logoRing.current = logo.animate(logoRingKeyframes, { duration: 620 });
  };
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); toggleRef.current?.focus(); }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);
  return (
    <header ref={headerRef} className={styles.header} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMenuOpen(false);
    }}>
      <nav aria-label="주 메뉴" className={styles.nav}>
        <Link href={navProfile.href} aria-label={`${navProfile.name} 홈`} onClick={() => setMenuOpen(false)} onPointerEnter={(event) => { if (event.pointerType !== "touch") ringLogo(); }} className={styles.logo}>
          <Image ref={logoRef} src={logoImage} alt="" className={styles.logoImage} sizes="76px" priority />
        </Link>
        <button ref={toggleRef} type="button" aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen(!menuOpen)} className={styles.toggle}>
          <span aria-hidden="true" className={`${styles.bar} ${menuOpen ? styles.barTopOpen : ""}`} />
          <span aria-hidden="true" className={`${styles.bar} ${menuOpen ? styles.barBottomOpen : ""}`} />
        </button>
        <span className={styles.spacer} aria-hidden="true" />
      </nav>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="site-navigation"
            aria-label="전체 메뉴"
            className={styles.mobile}
            onClick={(event) => { if (event.target === event.currentTarget) setMenuOpen(false); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
          >
            <motion.div
              className={styles.menuList}
              variants={listVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {links.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={styles.menuLink}
                  variants={itemVariants}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: [0.2, 0.65, 0.3, 1] }}
                >
                  {link.label}
                </motion.a>
              ))}
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
