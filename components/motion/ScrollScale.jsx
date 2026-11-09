"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * Wraps a (dark) section so it grows from a rounded inset panel to full
 * width as it scrolls into view — a smooth "curtain" between sections.
 */
export default function ScrollScale({ children, from = 0.92 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.15"] });
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : from, 1]);
  return (
    <motion.div
      ref={ref}
      style={{ scale, borderRadius: "var(--r-xl) var(--r-xl) 0 0", overflow: "clip", transformOrigin: "50% 0%" }}
    >
      {children}
    </motion.div>
  );
}
