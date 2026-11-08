"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import Reveal, { SplitHeading } from "@/components/ui/Reveal";
import { Kicker } from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/motion/Magnetic";
import LazyVideo from "@/components/motion/LazyVideo";
import { videos } from "@/data/media";
import { EVENTS } from "@/lib/analytics";
import styles from "./AdIntro.module.css";

/** Secondary proposition: the video card opens up to full width on scroll. */
export default function AdIntro({ headingLevel = "h2", index }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const inset = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [9, 0]);
  const clip = useTransform(inset, (v) => `inset(${v}% ${v}% 0% ${v}% round ${28 + v * 2}px)`);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);

  return (
    <section ref={ref} className={styles.section} aria-labelledby="ad-intro-title" id="advertise">
      <motion.div className={styles.stage} style={{ clipPath: clip }}>
        <motion.div className={styles.media} style={{ scale: videoScale }}>
          <LazyVideo src={videos.streetKiosk.src} poster={videos.streetKiosk.poster} className={styles.video} />
        </motion.div>
        <span className={styles.shade} aria-hidden="true" />

        <div className={`container on-dark ${styles.inner}`}>
          <Reveal>
            <Kicker index={index}>Advertise on our network</Kicker>
          </Reveal>
          <SplitHeading
            id="ad-intro-title"
            as={headingLevel}
            lines={["Put your brand", "on the big screen."]}
            className={styles.title}
          />
          <div className={styles.row}>
            <Reveal as="p" className={styles.lead} delay={120}>
              Beyond selling screens, Illuvision helps businesses advertise across its
              associated screen network. Tell us your budget and goals, and we will match
              you with suitable screens.
            </Reveal>
            <Reveal className={styles.ctas} delay={200}>
              <Magnetic>
                <Button href="/advertise#network" variant="light" event={EVENTS.AD_CTA} eventProps={{ section: "ad-intro", cta: "explore" }}>
                  Explore advertising
                </Button>
              </Magnetic>
              <Magnetic>
                <Button href="/advertise#planner" variant="outline-inv" event={EVENTS.AD_CTA} eventProps={{ section: "ad-intro", cta: "plan" }}>
                  Plan my campaign
                </Button>
              </Magnetic>
            </Reveal>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
