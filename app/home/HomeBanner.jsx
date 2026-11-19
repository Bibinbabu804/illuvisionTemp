"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/motion/Magnetic";
import FrameScrub from "@/components/motion/FrameScrub";
import { videos } from "@/data/media";
import { EVENTS } from "@/lib/analytics";
import { smoothScrollTo } from "@/components/motion/SmoothScroll";
import ScreenSpotlight from "./ScreenSpotlight";
import styles from "./HomeBanner.module.css";

/**
 * Cinematic homepage hero (screen sales first).
 *
 * On load the banner video plays (muted, looping) behind the headline, lead
 * and CTAs (entrance is CSS, keyed to the brand intro). As soon as the page
 * is scrolled the video cross-fades to the scroll-scrubbed city film: the
 * hero pins, the copy lifts away, the city goes from day to night as its
 * screens light up, and the ILLUVISION wordmark lands. Scrolling back to the
 * top brings the playing video back.
 */
const FRAMES = 150;
// Scroll budget: frames play over 0 → END, the wordmark lands by ~0.86,
// then it holds on screen until the hero un-pins at 1.
const END = 0.72;
// The banner video hands over to the scrubbed film within this much scroll.
const HANDOVER = 0.035;

export default function HomeBanner() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  // Hero progress 0 → 1 across its pinned scroll track, measured here from
  // the page scroll position. (Motion's target-based progress drifted by a
  // few percent after scrolling back up, so the copy and banner video never
  // fully returned at the top.)
  const { scrollY } = useScroll();
  const scrollYProgress = useMotionValue(0);
  const geo = useRef({ top: 0, span: 1 });
  const updateProgress = (y) => {
    const { top, span } = geo.current;
    scrollYProgress.set(Math.min(1, Math.max(0, (y - top) / span)));
  };
  useMotionValueEvent(scrollY, "change", updateProgress);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      geo.current = {
        top: el.getBoundingClientRect().top + window.scrollY,
        span: Math.max(1, el.offsetHeight - window.innerHeight),
      };
      updateProgress(window.scrollY);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // banner video: plays at rest, fades out (and pauses) once scrolling starts
  const videoRef = useRef(null);
  const videoOpacity = useTransform(scrollYProgress, [0, HANDOVER], [1, 0]);
  const syncVideo = (p) => {
    const v = videoRef.current;
    if (!v) return;
    if (p < HANDOVER) {
      if (v.paused) v.play()?.catch(() => {});
    } else if (!v.paused) {
      v.pause();
    }
  };
  useMotionValueEvent(scrollYProgress, "change", syncVideo);
  useEffect(() => {
    // covers a reload that restores a scrolled position
    if (!reduce) syncVideo(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  // copy: fully visible at rest, gone within the first stretch of scroll
  const textY = useTransform(scrollYProgress, [0, 0.12], [0, -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const textVisibility = useTransform(scrollYProgress, (p) => (p > 0.11 ? "hidden" : "visible"));

  // film: transform/opacity only, so scrubbing stays cheap
  const zoom = useTransform(scrollYProgress, [0, END], [1.12, 1]);
  const dim = useTransform(scrollYProgress, [0, 0.12, 0.66, 0.78], [0.35, 0.1, 0.1, 1]);
  const wordScale = useTransform(scrollYProgress, [0.7, 0.84], [1.35, 1]);
  const wordOpacity = useTransform(scrollYProgress, [0.7, 0.8], [0, 1]);
  const tagOpacity = useTransform(scrollYProgress, [0.8, 0.87], [0, 1]);
  const tagY = useTransform(scrollYProgress, [0.8, 0.87], [20, 0]);

  return (
    <section ref={ref} className={styles.hero} data-static={reduce ? "true" : undefined} aria-labelledby="hero-title">
      <div className={styles.sticky}>
        <div className={styles.frame}>
          <div className={styles.media}>
            <FrameScrub
              eager
              dir="/videos/sequence"
              total={FRAMES}
              progress={scrollYProgress}
              end={END}
              className={styles.canvas}
              style={{ scale: reduce ? 1 : zoom }}
            />
            {/* reduced motion: no autoplay, the film's first frame stays */}
            {!reduce && (
              <motion.video
                ref={videoRef}
                className={styles.video}
                style={{ opacity: videoOpacity, scale: zoom }}
                src={videos.banner.src}
                poster={videos.banner.poster}
                muted
                loop
                playsInline
                autoPlay
                preload="auto"
                disablePictureInPicture
                aria-hidden="true"
              />
            )}
          </div>
          <motion.span className={styles.dim} style={{ opacity: reduce ? 0.35 : dim }} aria-hidden="true" />
          <span className={styles.vignette} aria-hidden="true" />

          <motion.div
            className={styles.overlay}
            style={reduce ? undefined : { y: textY, opacity: textOpacity, visibility: textVisibility }}
          >
            <div className={`container ${styles.content}`}>
              <h1 id="hero-title" className={styles.title}>
                <span className={styles.line}><span style={{ "--s": 1 }}>Screens built</span></span>
                <span className={styles.line}>
                  <span style={{ "--s": 2 }}>to be <em>seen.</em></span>
                </span>
              </h1>

              <div className={styles.bottom}>
                <p className={`${styles.lead} ${styles.in}`} style={{ "--s": 4 }}>
                  Digital displays for shops, restaurants, clinics and showrooms across
                  Kerala. Your screen promotes your shop, and can earn from ads.
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
            </div>

            <ScreenSpotlight className={styles.in} style={{ "--s": 6 }} />

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

          {!reduce && (
            <div className={styles.wordWrap} aria-hidden="true">
              <motion.p className={styles.word} style={{ scale: wordScale, opacity: wordOpacity }}>
                ILLU<span>V</span>ISION
              </motion.p>
              <motion.p className={styles.tag} style={{ opacity: tagOpacity, y: tagY }}>
                Project your vision
              </motion.p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
