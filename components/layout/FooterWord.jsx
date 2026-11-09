"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import styles from "./Footer.module.css";

const LETTERS = ["I", "L", "L", "U", "V", "I", "S", "I", "O", "N"];

/**
 * Giant ILLUVISION wordmark. Letters rise and settle as the footer scrolls
 * in; the outline fills with green under a spotlight that follows the
 * cursor (CSS mask driven by --mx/--my — no React re-renders).
 */
export default function FooterWord() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--my", `${e.clientY - r.top}px`);
    ref.current.style.setProperty("--spot", "1");
  };
  const onLeave = () => ref.current.style.setProperty("--spot", "0");

  const row = () =>
    LETTERS.map((ch, i) => <Letter key={i} ch={ch} i={i} v={i === 4} progress={scrollYProgress} reduce={reduce} />);

  return (
    <div ref={ref} className={styles.word} onPointerMove={onMove} onPointerLeave={onLeave} aria-hidden="true">
      <div className={styles.wordOutline}>{row()}</div>
      <div className={styles.wordFill}>{row()}</div>
    </div>
  );
}

function Letter({ ch, i, v, progress, reduce }) {
  const start = (i / LETTERS.length) * 0.45;
  const y = useTransform(progress, [start, start + 0.5], reduce ? ["0%", "0%"] : ["70%", "0%"]);
  const rotate = useTransform(progress, [start, start + 0.5], reduce ? [0, 0] : [10, 0]);
  return (
    <motion.span className={v ? styles.wV : undefined} style={{ y, rotate, display: "inline-block", transformOrigin: "0 100%" }}>
      {ch}
    </motion.span>
  );
}
