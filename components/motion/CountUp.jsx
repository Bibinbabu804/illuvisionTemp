"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/** Counts from 0 to `value` once, when scrolled into view. */
export default function CountUp({ value, duration = 1.8, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!inView || reduce) {
      el.textContent = reduce ? value.toLocaleString("en") : "0";
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = Math.round(v).toLocaleString("en");
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("en")}
    </span>
  );
}
