"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import styles from "./Footer.module.css";

/** "Project your vision": letters rise and settle as the footer scrolls in. */
export default function FooterWord({ text = "Project your vision" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const words = text.split(" ");
  let n = 0;
  const total = text.replace(/ /g, "").length;

  return (
    <div ref={ref} className={styles.bigword} aria-hidden="true">
      {words.map((w, wi) => (
        <span key={wi} className={styles.bigwordWord}>
          {w.split("").map((ch) => {
            const i = n++;
            return <Letter key={i} ch={ch} i={i} total={total} progress={scrollYProgress} reduce={reduce} />;
          })}
        </span>
      ))}
    </div>
  );
}

function Letter({ ch, i, total, progress, reduce }) {
  const start = (i / total) * 0.5;
  const y = useTransform(progress, [start, start + 0.5], reduce ? ["0%", "0%"] : ["90%", "0%"]);
  const rotate = useTransform(progress, [start, start + 0.5], reduce ? [0, 0] : [12, 0]);
  const opacity = useTransform(progress, [start, start + 0.35], [reduce ? 1 : 0, 1]);
  return (
    <motion.span style={{ y, rotate, opacity, display: "inline-block", transformOrigin: "0 100%" }}>{ch}</motion.span>
  );
}
