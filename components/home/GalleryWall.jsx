"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Kicker } from "@/components/ui/SectionHeader";
import { gallery } from "@/data/media";
import styles from "./GalleryWall.module.css";

const tiles = gallery;

// pop-in order: scattered, not left-to-right, so the wall "assembles"
const ORDER = [2, 7, 0, 5, 9, 3, 6, 1, 8, 4];

/**
 * Pinned gallery wall. Desktop: the section sticks while scrolling and the
 * tiles pop in one by one (scale + rise + fade), scrubbed by scroll.
 * Tablet/mobile and reduced motion: a normal grid; tiles pop in on view.
 */
export default function GalleryWall() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const set = () => setPinned(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const headOpacity = useTransform(scrollYProgress, [0, 0.12], [0, 1]);
  const headY = useTransform(scrollYProgress, [0, 0.12], [30, 0]);

  return (
    <section
      ref={ref}
      className={styles.section}
      data-pinned={pinned}
      aria-labelledby="gallery-title"
    >
      <div className={styles.sticky}>
        <div className="container">
          <motion.div className={styles.head} style={pinned ? { opacity: headOpacity, y: headY } : undefined}>
            <Kicker>On screen</Kicker>
            <h2 id="gallery-title" className={styles.title}>
              Screens that hold <span>the room.</span>
            </h2>
          </motion.div>

          <ul className={styles.grid}>
            {tiles.map((img, i) => (
              <Tile
                key={`${pinned ? "pin" : "grid"}-${img.src}`}
                img={img}
                order={ORDER[i]}
                progress={scrollYProgress}
                pinned={pinned}
                reduce={reduce}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Tile({ img, order, progress, pinned, reduce }) {
  // each tile gets its own slice of the scroll; slices overlap for a ripple
  const start = 0.1 + order * 0.055;
  const end = start + 0.2;
  const scale = useTransform(progress, [start, end], [0.55, 1]);
  const opacity = useTransform(progress, [start, start + 0.08], [0, 1]);
  const y = useTransform(progress, [start, end], [80, 0]);
  const imgScale = useTransform(progress, [start, end + 0.15], [1.35, 1]);

  if (reduce) {
    return (
      <li className={styles.tile}>
        <Image src={img.src} alt={img.alt} fill sizes="(max-width: 1023px) 50vw, 20vw" quality={60} className={styles.img} />
      </li>
    );
  }

  if (!pinned) {
    return (
      <motion.li
        className={styles.tile}
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.7, delay: (order % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image src={img.src} alt={img.alt} fill sizes="(max-width: 1023px) 50vw, 20vw" quality={60} className={styles.img} />
      </motion.li>
    );
  }

  return (
    <motion.li className={styles.tile} style={{ scale, opacity, y }}>
      <motion.div className={styles.inner} style={{ scale: imgScale }}>
        <Image src={img.src} alt={img.alt} fill sizes="20vw" quality={60} className={styles.img} />
      </motion.div>
    </motion.li>
  );
}
