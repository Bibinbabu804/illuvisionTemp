"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import LazyVideo from "@/components/motion/LazyVideo";
import { videos } from "@/data/media";
import styles from "./Showreel.module.css";

/**
 * Pinned showreel: a small video card grows to fill the viewport while the
 * words "Project" and "your vision" slide apart around it.
 */
export default function Showreel() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const scale = useTransform(scrollYProgress, [0, 0.65], reduce ? [1, 1] : [0.34, 1]);
  const radius = useTransform(scrollYProgress, [0, 0.65], [40, 0]);
  const leftX = useTransform(scrollYProgress, [0, 0.6], ["0%", "-60%"]);
  const rightX = useTransform(scrollYProgress, [0, 0.6], ["0%", "60%"]);
  const wordsOpacity = useTransform(scrollYProgress, [0.35, 0.6], [1, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
  const captionY = useTransform(scrollYProgress, [0.6, 0.8], [40, 0]);

  return (
    <section ref={ref} className={styles.section} id="showreel" aria-label="Showreel">
      <div className={styles.sticky}>
        <motion.div className={styles.card} style={{ scale, borderRadius: radius }}>
          <LazyVideo
            src={videos.reelRetro.src}
            poster={videos.reelRetro.poster}
            mobileSrc={videos.heroMobile.src}
            mobilePoster={videos.heroMobile.poster}
            className={styles.video}
            label="Showreel: neon digital screen content"
          />
          <span className={styles.shade} aria-hidden="true" />
        </motion.div>

        <motion.div className={styles.words} style={{ opacity: wordsOpacity }} aria-hidden="true">
          <motion.span style={{ x: leftX }}>Project</motion.span>
          <motion.span style={{ x: rightX }}>your vision</motion.span>
        </motion.div>

        <motion.div className={`container ${styles.caption}`} style={{ opacity: captionOpacity, y: captionY }}>
          <p className={styles.kicker}>[ Showreel ©{new Date().getFullYear()} ]</p>
          <p className={styles.big}>Content that glows. Screens that deliver it.</p>
        </motion.div>
      </div>
    </section>
  );
}
