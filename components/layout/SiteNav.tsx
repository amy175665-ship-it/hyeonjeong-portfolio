"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { useEffect, useRef, useState } from "react";
import { navLinks, navCta, navProfile } from "@/data/navigation";

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => { if (desktop.matches) setMenuOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [menuOpen]);

  const linkStyle = "flex min-h-11 items-center justify-center rounded-full px-4 text-[13px] font-medium text-portfolio-ink transition-colors hover:bg-portfolio-sky/40 focus-visible:!outline-portfolio-ink motion-reduce:transition-none";
  const desktopLinkStyle = "relative flex min-h-11 items-center justify-center rounded-full px-4 text-[13px] font-medium text-portfolio-ink focus-visible:!outline-portfolio-ink";

  return (
    <header ref={headerRef} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMenuOpen(false);
    }} className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-[720px] -translate-x-1/2 sm:top-6">
      <nav aria-label="주 메뉴" className="flex min-h-14 items-center justify-between gap-1 rounded-full border border-white/50 bg-white/65 px-2 py-1.5 backdrop-blur-md">
        <Link href={navProfile.href} aria-label={`${navProfile.name} 홈`} onClick={() => setMenuOpen(false)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:!outline-portfolio-ink motion-reduce:transition-none">
          <Image src={navProfile.image} alt="" width={44} height={44} className="h-full w-full rounded-full object-cover" priority />
        </Link>
        <div className="hidden flex-1 items-center justify-evenly gap-1 lg:flex" onMouseLeave={() => setHoveredLink(null)}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={desktopLinkStyle} onMouseEnter={() => setHoveredLink(link.href)} onFocus={() => setHoveredLink(link.href)} onBlur={() => setHoveredLink(null)}>
              {hoveredLink === link.href && (
                <motion.span
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 rounded-full bg-portfolio-sky/40"
                  transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button ref={toggleRef} type="button" aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)} className="flex h-11 w-11 items-center justify-center rounded-full text-portfolio-ink transition-colors hover:bg-portfolio-sky/40 focus-visible:!outline-portfolio-ink motion-reduce:transition-none lg:hidden">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-5 w-5">
              <path d={menuOpen ? "M6 6l12 12M6 18L18 6" : "M4 8h16M4 16h16"} />
            </svg>
          </button>
          <a href={navCta.href} onClick={() => setMenuOpen(false)} className="flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-paper px-4 text-sm font-medium text-ink shadow-sm shadow-ink/10 transition-shadow hover:shadow-md sm:px-5">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></svg>
            {navCta.label}
          </a>
        </div>
      </nav>
      <nav id="mobile-navigation" aria-label="모바일 주 메뉴" hidden={!menuOpen} className="mt-2 rounded-3xl border border-white/60 bg-white/90 p-2 shadow-sm backdrop-blur-md lg:hidden">
        {navLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={linkStyle}>{link.label}</a>)}
      </nav>
    </header>
  );
}

