"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/** Image that drifts inside its frame as the frame scrolls past. */
export default function ParallaxImage({ src, alt = "", sizes, quality = 70, className, amount = 12 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : [`-${amount}%`, `${amount}%`]);
  return (
    <div ref={ref} className={className} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <motion.div style={{ position: "absolute", inset: `-${amount + 2}% 0`, y }}>
        <Image src={src} alt={alt} fill sizes={sizes} quality={quality} style={{ objectFit: "cover" }} />
      </motion.div>
    </div>
  );
}
