"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import styles from "./HobbyFlow.module.css";

// A thin line-drawn cactus in the open middle of each hobby panel, one growth stage per group, echoing the cactus
// story above: ABSORB a sprout under drops of water, BUILD a body with both arms up, GROW the same in flower. Each
// hobby of the group has a "fruit" (a drop, a bud, the flower) that fills with the accent once its hobby has come up,
// so the plant ripens as the scroll steps through. Decorative only; the hobbies are listed as text beside it.
const BODY = {
  sprout: "M53 150 V129 A7 7 0 0 1 67 129 V150",
  tall: "M50 150 V58 A10 10 0 0 1 70 58 V150",
};
const ARMS = [
  "M50 118 H39 A8 8 0 0 1 31 110 V88 A6 6 0 0 1 43 88 V106 H50",
  "M70 106 H81 A8 8 0 0 0 89 98 V78 A6 6 0 0 0 77 78 V94 H70",
];
const RIB = "M60 70 V146";
const DROP = (x: number, y: number) => `M${x} ${y} C${x - 3} ${y + 4} ${x - 4.5} ${y + 6.5} ${x - 4.5} ${y + 8.5} A4.5 4.5 0 0 0 ${x + 4.5} ${y + 8.5} C${x + 4.5} ${y + 6.5} ${x + 3} ${y + 4} ${x} ${y}Z`;
const PETALS = [0, 72, 144, 216, 288];
// Each stage is cropped to its drawing so the ground line starts at the text column's left edge. Both crops are drawn
// at about 2.1 px per unit (140 px and 280 px tall), so stroke widths in units come out near 2.2 px on screen.
const VIEWBOX = ["28 86 64 66", "28 22 64 130", "28 22 64 130"];

export default function HobbyCactus({ stage, count, ripe, color }: { stage: number; count: number; ripe: number; color: string }) {
  const reduced = useReducedMotion();
  const draw: Variants = {
    hidden: { pathLength: reduced ? 1 : 0, opacity: 0 },
    shown: { pathLength: 1, opacity: 1, transition: reduced ? { duration: 0 } : { duration: 1.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] } },
  };
  // Fruit i is filled once the scroll (or a hover) has reached hobby i of this group.
  const fill = (i: number) => ({ fill: i <= ripe ? color : "#fcfcfb", scale: i === ripe && !reduced ? [1, 1.25, 1] : 1 });
  const pop = { duration: reduced ? 0 : 0.45, ease: "easeOut" } as const;

  return (
    <svg className={styles.cactus} viewBox={VIEWBOX[stage]} data-stage={stage} aria-hidden="true">
      <g fill="none" stroke="#202731" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M28 150 H92" variants={draw} />
        {stage === 0
          ? <motion.path d={BODY.sprout} variants={draw} />
          : <>
              <motion.path d={BODY.tall} variants={draw} />
              {ARMS.map(arm => <motion.path key={arm} d={arm} variants={draw} />)}
              <motion.path d={RIB} variants={draw} strokeOpacity={0.35} />
            </>}
      </g>
      {/* Fruits: ABSORB's drops above the sprout, BUILD's bud and GROW's flower on top of the body. */}
      {stage === 0 && Array.from({ length: count }, (_, i) => {
        const x = 60 + (i - (count - 1) / 2) * 18, y = i % 2 ? 92 : 100;
        return <motion.path key={i} d={DROP(x, y)} stroke="#202731" strokeWidth="0.95" initial={false} animate={fill(i)} transition={pop} style={{ transformOrigin: `${x}px ${y + 6}px` }} />;
      })}
      {stage === 1 && Array.from({ length: count }, (_, i) => (
        <motion.circle key={i} cx={60 + (i - (count - 1) / 2) * 12} cy={44} r={5} stroke="#202731" strokeWidth="0.95" initial={false} animate={fill(i)} transition={pop} />
      ))}
      {stage === 2 && (
        <motion.g initial={false} animate={{ scale: ripe >= 0 && !reduced ? [1, 1.15, 1] : 1 }} transition={pop} style={{ transformOrigin: "60px 40px" }}>
          {PETALS.map(angle => (
            <ellipse key={angle} cx={60} cy={33} rx={4.5} ry={8} transform={`rotate(${angle} 60 42)`} fill={ripe >= 0 ? color : "#fcfcfb"} stroke="#202731" strokeWidth="0.95" />
          ))}
          <circle cx={60} cy={42} r={3.5} fill="#fcfcfb" stroke="#202731" strokeWidth="0.95" />
        </motion.g>
      )}
    </svg>
  );
}
