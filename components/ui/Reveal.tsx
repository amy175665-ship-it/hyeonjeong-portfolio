"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export default function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    // The server renders the hidden start state, so reduced motion must still animate to visible
    // (instantly, without movement) instead of skipping the animation and staying transparent. The start state is the
    // same either way so the server and client markup match; the 0s transition removes the movement.
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
