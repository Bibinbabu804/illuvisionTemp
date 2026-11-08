"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import styles from "./ScrubText.module.css";

/**
 * Oversized headline band scrubbed sideways by scroll. Words alternate
 * between solid and outline; `dark` flips the palette.
 */
export default function ScrubText({ words, dark = false, from = "10%", to = "-45%" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : [from, to]);
  const x2 = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : [to, from]);

  return (
    <div ref={ref} className={`${styles.band} ${dark ? styles.dark : ""}`} aria-hidden="true">
      <motion.div className={styles.line} style={{ x }}>
        {words.map((w, i) => (
          <span key={i} className={i % 2 ? styles.outline : undefined}>
            {w}
            <i />
          </span>
        ))}
      </motion.div>
      <motion.div className={`${styles.line} ${styles.small}`} style={{ x: x2 }}>
        {[...words].reverse().map((w, i) => (
          <span key={i} className={i % 2 ? undefined : styles.outline}>
            {w}
            <i />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
