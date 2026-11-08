"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import { howItWorks } from "@/data/planner";
import styles from "./HowItWorks.module.css";

export default function HowItWorks({ index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  const draw = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <section className="section" id="how-it-works" aria-labelledby="how-title">
      <div className="container">
        <SectionHeader
          index={index}
          label="How advertising works"
          id="how-title"
          lines={["From brief to", "big screen."]}
          lead="Five steps, and nothing is booked until you have approved the screens, schedule, creative requirements and terms."
        />

        <ol ref={ref} className={styles.steps}>
          <motion.li className={styles.progress} style={{ "--p": draw }} aria-hidden="true" role="presentation" />
          {howItWorks.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 90} className={styles.step}>
              <span className={styles.num}>{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </Reveal>
          ))}
        </ol>
        <Reveal as="p" className={styles.footnote}>
          All campaigns are subject to confirmation of availability and commercial terms by Illuvision.
        </Reveal>
      </div>
    </section>
  );
}
