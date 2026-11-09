"use client";

import { useRef, useState } from "react";
import { useScroll, useMotionValueEvent, motion } from "motion/react";
import { Kicker } from "@/components/ui/SectionHeader";
import { smoothScrollTo } from "@/components/motion/SmoothScroll";
import styles from "./ScrollStory.module.css";

/**
 * Shared shell for pinned, scroll-told stories (/advertise, /screens).
 * The section pins; scroll progress picks the active chapter. Copy, the
 * chapter rail and the progress line live here; each story draws its own
 * visual via `renderStage(active)` and switches layers in CSS by
 * `data-step` (transform/opacity only, so scrubbing stays cheap).
 *
 *   steps: [{ title, body, extra?: ReactNode }]
 */
export default function ScrollStory({ id, kicker, heading, headingId, steps, footnote, renderStage }) {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const n = steps.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
    if (i !== active) setActive(i);
  });

  const goTo = (i) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    smoothScrollTo(top + (span * (i + 0.5)) / n, { offset: 0 });
  };

  return (
    <section ref={ref} id={id} className={styles.section} style={{ height: `${n * 90 + 10}vh` }} aria-labelledby={headingId}>
      <div className={styles.sticky}>
        <div className={`container on-dark ${styles.grid}`}>
          <div className={styles.copy}>
            <Kicker>{kicker}</Kicker>
            <h2 id={headingId} className={styles.heading}>{heading}</h2>

            <div className={styles.chapters}>
              {steps.map((s, i) => (
                <div key={s.title} className={styles.chapter} data-on={i === active} aria-hidden={i !== active} inert={i !== active}>
                  <span className={styles.num}>
                    {String(i + 1).padStart(2, "0")}
                    <i>/ {String(n).padStart(2, "0")}</i>
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  {s.extra && <div className={styles.extra}>{s.extra}</div>}
                </div>
              ))}
            </div>

            <ol className={styles.rail} aria-label="Story chapters">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <button type="button" data-on={i === active} data-done={i < active} onClick={() => goTo(i)} aria-label={`Chapter ${i + 1}: ${s.title}`}>
                    <span />
                  </button>
                </li>
              ))}
            </ol>
            {footnote && <p className={styles.footnote}>{footnote}</p>}
          </div>

          <div className={styles.stageWrap} aria-hidden="true">
            {renderStage(active)}
          </div>
        </div>

        <motion.span className={styles.progress} style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      </div>
    </section>
  );
}
