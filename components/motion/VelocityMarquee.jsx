"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
  useInView,
} from "motion/react";
import styles from "./VelocityMarquee.module.css";

const wrap = (min, max, v) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/**
 * Giant text row that drifts sideways and speeds up / reverses with
 * scroll velocity. Only animates while on screen.
 */
export default function VelocityMarquee({ items, baseVelocity = -2.2, outline = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "100px 0px" });
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (!inView || reduce) return;
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * f;
    baseX.set(baseX.get() + move);
  });

  const row = (
    <>
      {items.map((t, i) => (
        <span key={i} className={styles.item}>
          {t}
          <i className={styles.star} />
        </span>
      ))}
    </>
  );

  return (
    <div ref={ref} className={`${styles.wrap} ${outline ? styles.outline : ""}`} aria-hidden="true">
      <motion.div className={styles.track} style={{ x }}>
        {row}
        {row}
        {row}
        {row}
      </motion.div>
    </div>
  );
}
