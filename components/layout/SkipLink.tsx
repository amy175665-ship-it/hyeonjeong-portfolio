"use client";

import { usePathname } from "next/navigation";

// Skip link (keyboard): the first thing Tab reaches on the home page, before the header; hidden until focused
// (.skip-link in globals.css). It goes straight into the window's about part (WindowFrame handles #about).
export default function SkipLink() {
  if (usePathname() !== "/") return null;
  return (
    <a
      href="#about"
      className="skip-link"
    >
      본문 바로가기
    </a>
  );
}
