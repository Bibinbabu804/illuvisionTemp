"use client";

import { useRef } from "react";
import ParallaxImage from "@/components/motion/ParallaxImage";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import SectionHeader from "@/components/ui/SectionHeader";
import Icon from "@/components/ui/Icon";
import { media } from "@/data/media";
import styles from "./WhySection.module.css";

/**
 * Describes how buying from Illuvision works rather than making product
 * claims. Add verified warranty / certification / support facts here once
 * approved — do not add unverified statistics.
 */
const pillars = [
  {
    icon: "layers",
    title: "One partner, every format",
    body: "Indoor displays, LED walls, outdoor LED and standees from a single supplier, so your screens work together.",
    image: media.indoorVideoWall,
  },
  {
    icon: "ruler",
    title: "Matched to your space",
    body: "Share the room, viewing distance and content you plan to show, and get recommendations that fit.",
    image: media.receptionScreen,
  },
  {
    icon: "chat",
    title: "Clear, confirmed quotes",
    body: "Every quote confirms model, specification, delivery and support before you commit. No guesswork.",
    image: media.meetingRoom,
  },
  {
    icon: "spark",
    title: "A screen that can earn",
    body: "Ask about Illuvision's associated advertising network and what it could mean for your site.",
    image: media.blueWall,
  },
];

/** Cards pin and stack; earlier cards shrink back as new ones arrive. */
export default function WhySection({ index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section className={`section section--dark ${styles.section}`} aria-labelledby="why-title">
      <div className="container">
        <SectionHeader
          index={index}
          label="Why Illuvision"
          id="why-title"
          lines={["Buying screens,", "made simple."]}
          lead="How buying from Illuvision works, from the first question to a confirmed quote."
        />

        <ol ref={ref} className={styles.stack}>
          {pillars.map((p, i) => (
            <StackCard key={p.title} pillar={p} i={i} total={pillars.length} progress={scrollYProgress} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function StackCard({ pillar, i, total, progress }) {
  const reduce = useReducedMotion();
  const start = i / total;
  const scale = useTransform(progress, [start, 1], [1, reduce ? 1 : 1 - (total - i - 1) * 0.05]);
  const dim = useTransform(progress, [start, 1], [0, reduce ? 0 : (total - i - 1) * 0.18]);

  return (
    <li className={styles.slot} style={{ "--i": i }}>
      <motion.article className={styles.card} style={{ scale }}>
        <div className={styles.copy}>
          <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
          <h3>
            <Icon name={pillar.icon} size={26} className={styles.icon} />
            {pillar.title}
          </h3>
          <p>{pillar.body}</p>
        </div>
        <div className={styles.media}>
          <ParallaxImage src={pillar.image.src} alt={pillar.image.alt} sizes="(max-width: 767px) 90vw, 45vw" />
        </div>
        <motion.span className={styles.dim} style={{ opacity: dim }} aria-hidden="true" />
      </motion.article>
    </li>
  );
}
