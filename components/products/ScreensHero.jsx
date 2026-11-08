"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Kicker } from "@/components/ui/SectionHeader";
import LazyVideo from "@/components/motion/LazyVideo";
import { categories, products } from "@/data/catalog";
import { videos } from "@/data/media";
import { smoothScrollTo } from "@/components/motion/SmoothScroll";
import styles from "./ScreensHero.module.css";

/**
 * /screens hero: a tilted "wall" of glowing screens drifting in rows.
 * On scroll the wall flattens toward the viewer and the title lifts away.
 */
export default function ScreensHero({ hasSamples }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [24, 0]);
  const rotateZ = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-8, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.25]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  // Build the wall from product + category imagery, plus two live videos.
  const tiles = [
    ...products.map((p) => ({ type: "img", img: p.images[0], label: p.name })),
    ...categories.map((c) => ({ type: "img", img: c.image, label: c.name })),
  ];
  const rows = [
    [{ type: "video", v: videos.reelRetro, label: "Neon content" }, ...tiles.slice(0, 5)],
    [...tiles.slice(5, 9), { type: "video", v: videos.streetKiosk, label: "Street kiosk" }, ...tiles.slice(9, 11)],
    [...tiles.slice(2, 7), { type: "video", v: videos.reelDream, label: "Dream" }],
  ];

  return (
    <section ref={ref} className={styles.hero}>
      <div className={styles.sticky}>
        <motion.div className={styles.wall} style={{ rotateX, rotateZ, scale }} aria-hidden="true">
          {rows.map((row, r) => (
            <div key={r} className={styles.row} data-dir={r % 2 ? "rev" : "fwd"}>
              <div className={styles.track}>
                {[...row, ...row].map((t, i) => (
                  <div key={i} className={styles.tile}>
                    {t.type === "video" ? (
                      <LazyVideo src={t.v.src} poster={t.v.poster} className={styles.media} />
                    ) : (
                      <Image src={t.img.src} alt="" fill sizes="340px" quality={60} className={styles.media} />
                    )}
                    <span className={styles.tileLabel}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
        <span className={styles.vignette} aria-hidden="true" />

        <motion.div className={`container on-dark ${styles.content}`} style={{ y: textY, opacity: textOpacity }}>
          <Breadcrumbs visible={false} items={[{ label: "Home", href: "/" }, { label: "Screens", href: "/screens" }]} />
          <div className={styles.kicker}>
            <Kicker>{products.length} screens · {categories.length} categories</Kicker>
          </div>
          <h1 className={styles.title}>
            <span className={styles.line}><span style={{ "--s": 0 }}>Find the screen</span></span>
            <span className={styles.line}><span style={{ "--s": 1 }}>that fits your <em>space.</em></span></span>
          </h1>
          <p className={styles.lead}>
            Browse by category, open any screen for details and request a quote with confirmed
            specifications, pricing and delivery.
          </p>
          {hasSamples && (
            <p className={styles.note}>
              <span className="badge badge--sample">Sample listings</span> Placeholder catalogue, to be replaced by approved products.
            </p>
          )}
          <button type="button" className={styles.cue} onClick={() => smoothScrollTo("#browse")}>
            Browse screens <span aria-hidden="true">↓</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
