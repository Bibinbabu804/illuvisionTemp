"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * The footer rises from "behind" the page: as its wrapper scrolls into
 * view the content starts lower and slightly scaled down, then settles.
 * `data-inview` switches on the CSS entrance (headline lines, rule).
 */
export default function FooterReveal({ children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-22%", "0%"]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.94, 1]);

  return (
    <div ref={ref} data-inview={inView} style={{ position: "relative", zIndex: 1, overflow: "clip", marginTop: "clamp(24px, 4vw, 56px)" }}>
      <motion.div style={{ y, scale, transformOrigin: "50% 100%" }}>{children}</motion.div>
    </div>
  );
}
