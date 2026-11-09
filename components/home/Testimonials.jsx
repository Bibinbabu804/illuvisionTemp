"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { testimonials } from "@/data/site";
import { media } from "@/data/media";
import styles from "./Testimonials.module.css";

// resting tilt of each card once it lands on the pile
const TILT = [-4, 5, -2.5, 3.5, -5, 2];

/**
 * Pinned testimonial pile. Desktop: badge + heading at the top while dark
 * cards fly up from below one by one, rotating as they come, and land
 * tilted on top of each other. Mobile / reduced motion: a
 * simple vertical list.
 */
export default function Testimonials({ items = testimonials }) {
  const ref = useRef(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const set = () => setPinned(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const headOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0.4]);

  const n = items.length;

  return (
    <section
      ref={ref}
      className={styles.section}
      data-pinned={pinned}
      style={pinned ? { height: `${(n + 1) * 80}vh` } : undefined}
      aria-labelledby="testimonials-title"
    >
      <div className={styles.sticky}>
        <motion.header className={styles.head} style={pinned ? { opacity: headOpacity } : undefined}>
          <span className={styles.badge}>
            <span className={styles.dot} aria-hidden="true" />
            Client stories
          </span>
          <h2 id="testimonials-title" className={styles.title}>
            Testimonials
          </h2>
        </motion.header>

        <ul className={styles.pile}>
          {items.map((t, i) => (
            // remount when the mode flips so no in-view start state (opacity 0) lingers
            <Card key={`${pinned ? "pin" : "list"}-${i}`} t={t} i={i} n={n} progress={scrollYProgress} pinned={pinned} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Card({ t, i, n, progress, pinned }) {
  // the first card is already on the pile; each next card flies in
  // during its own slice of the scroll
  const start = (i - 0.15) / n;
  const end = (i + 0.75) / n;
  const tilt = TILT[i % TILT.length];
  const from = i % 2 ? 14 : -14;

  const y = useTransform(progress, [start, end], ["110vh", "0vh"]);
  const rotate = useTransform(progress, [start, end], [from, tilt]);
  const x = useTransform(progress, [start, end], [i % 2 ? "8%" : "-8%", "0%"]);

  const img = media[t.image];
  const body = (
    <>
      <div className={styles.text}>
        <span className={styles.quoteMark} aria-hidden="true">&ldquo;</span>
        <blockquote className={styles.quote}>
          <p>{t.quote}</p>
        </blockquote>
        <footer className={styles.who}>
          <strong>{t.name}</strong>
          <span>{t.org}</span>
        </footer>
      </div>
      <div className={styles.side}>
        <span className={styles.tag}>{t.tag}</span>
        <div className={styles.photo}>
          {img && <Image src={img.src} alt={img.alt} fill sizes="(max-width: 1023px) 90vw, 520px" quality={60} className={styles.img} />}
          {t.sample && <span className={`badge badge--sample ${styles.sample}`}>Sample testimonial</span>}
        </div>
      </div>
    </>
  );

  if (!pinned) {
    return (
      <motion.li
        className={styles.card}
        initial={{ opacity: 0, y: 60, rotate: from / 3 }}
        whileInView={{ opacity: 1, y: 0, rotate: tilt / 2 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {body}
      </motion.li>
    );
  }

  return (
    <motion.li
      className={styles.card}
      style={i === 0 ? { rotate: tilt, zIndex: 1 } : { y, x, rotate, zIndex: i + 1 }}
    >
      {body}
    </motion.li>
  );
}
