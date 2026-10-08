"use client";

import { useEffect, useRef, useState } from "react";
import SplitText from "./SplitText";
import styles from "./RollingWord.module.css";

// A word that rolls into the next one letter by letter when `word` changes: the old letters slide up out of a mask
// while the new ones come up from below, each a little after the one before. With reduced motion it just swaps.
export default function RollingWord({ word, className }: { word: string; className?: string }) {
  const [shown, setShown] = useState(word);
  const [leaving, setLeaving] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (word === shown) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(word); return; }
    setLeaving(shown);
    setShown(word);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLeaving(null), 700);
  }, [word, shown]);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <span className={`${styles.roll} ${className ?? ""}`}>
      {leaving && <SplitText key={`out-${leaving}`} text={leaving} className={`${styles.word} ${styles.out}`} partClassName={styles.char} />}
      <SplitText key={`in-${shown}`} text={shown} className={`${styles.word} ${leaving ? styles.in : ""}`} partClassName={styles.char} />
    </span>
  );
}
