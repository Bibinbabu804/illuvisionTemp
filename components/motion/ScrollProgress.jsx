"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin brand-green reading progress line at the top of the viewport. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 120,
        background: "var(--green)",
        transformOrigin: "0 50%",
        scaleX,
        pointerEvents: "none",
      }}
    />
  );
}
