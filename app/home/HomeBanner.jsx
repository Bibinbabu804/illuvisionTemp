"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Magnetic from "@/components/motion/Magnetic";
import LazyVideo from "@/components/motion/LazyVideo";
import { videos } from "@/data/media";
import { EVENTS } from "@/lib/analytics";
import { smoothScrollTo } from "@/components/motion/SmoothScroll";
import styles from "./HomeBanner.module.css";

/**
 * Cinematic homepage hero (screen sales first).
 * Entrance is CSS (keyed to the brand intro); scroll effects use Motion:
 * the video frame recedes, the headline lifts away and the scene dims.
 */
export default function HomeBanner() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const frameScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.9]);
  const frameRadius = useTransform(scrollYProgress, [0, 1], [28, 56]);
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -160]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const dim = useTransform(scrollYProgress, [0, 1], [0.35, 0.75]);

  return (
    <section ref={ref} className={styles.hero} aria-labelledby="hero-title">
      <motion.div className={styles.frame} style={{ scale: frameScale, borderRadius: frameRadius }}>
        <motion.div className={styles.media} style={{ y: videoY }}>
          <LazyVideo
            eager
            src={videos.heroCity.src}
            poster={videos.heroCity.poster}
            mobileSrc={videos.heroMobile.src}
            mobilePoster={videos.heroMobile.poster}
            className={styles.video}
          />
        </motion.div>
        <motion.span className={styles.dim} style={{ opacity: dim }} aria-hidden="true" />
        <span className={styles.vignette} aria-hidden="true" />

        <div className={`container ${styles.meta}`} aria-hidden="true">
          <span className={styles.in} style={{ "--s": 0 }}>[ N°01 — Commercial digital screens ]</span>
          <span className={`${styles.in} ${styles.metaMid}`} style={{ "--s": 1 }}>Indoor / LED / Outdoor / Standees</span>
          <span className={styles.in} style={{ "--s": 2 }}>©{new Date().getFullYear()}</span>
        </div>

        <motion.div className={`container ${styles.content}`} style={{ y: textY, opacity: textOpacity }}>
          <h1 id="hero-title" className={styles.title}>
            <span className={styles.line}><span style={{ "--s": 1 }}>Screens built</span></span>
            <span className={styles.line}>
              <span style={{ "--s": 2 }}>to be <em>seen.</em></span>
            </span>
          </h1>

          <div className={styles.bottom}>
            <p className={`${styles.lead} ${styles.in}`} style={{ "--s": 4 }}>
              Indoor displays, LED video walls, outdoor LED and digital standees for
              businesses that want their message to stand out.
            </p>
            <div className={`${styles.ctas} ${styles.in}`} style={{ "--s": 5 }}>
              <Magnetic>
                <Button href="/screens" variant="light" icon="screen" event={EVENTS.SHOP_CTA} eventProps={{ section: "hero" }}>
                  Explore screens
                </Button>
              </Magnetic>
              <Magnetic>
                <Button href="/advertise" variant="outline-inv" event={EVENTS.AD_CTA} eventProps={{ section: "hero" }}>
                  Advertise with us
                </Button>
              </Magnetic>
            </div>
          </div>
        </motion.div>

        <Link
          href="#showreel"
          className={`${styles.reel} ${styles.in}`}
          style={{ "--s": 6 }}
          data-cursor="Watch"
          onClick={(e) => {
            e.preventDefault();
            smoothScrollTo("#showreel", { offset: 0 });
          }}
        >
          <span className={styles.reelThumb}>
            <LazyVideo eager src={videos.reelDream.src} poster={videos.reelDream.poster} className={styles.video} />
            <span className={styles.reelHud} aria-hidden="true">
              <i>REC</i>
              <i>ILLUVISION · REEL 01</i>
            </span>
            <span className={styles.reelPlay} aria-hidden="true"><Icon name="play" size={16} /></span>
          </span>
          <span className={styles.reelFoot}>
            <span className={styles.reelText}>
              <strong>Showreel</strong>
              <span>{`// Screens in action ©${new Date().getFullYear()}`}</span>
            </span>
            <span className={styles.reelArrow} aria-hidden="true"><Icon name="arrow" size={26} strokeWidth={1.4} /></span>
          </span>
        </Link>

        <button
          type="button"
          className={`${styles.scrollCue} ${styles.in}`}
          style={{ "--s": 7 }}
          onClick={() => smoothScrollTo("#statement")}
          aria-label="Scroll to content"
        >
          <span />
        </button>
      </motion.div>
    </section>
  );
}
