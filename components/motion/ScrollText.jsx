"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import LazyVideo from "./LazyVideo";
import styles from "./ScrollText.module.css";

/**
 * Paragraph whose words "light up" one by one as it scrolls through the
 * viewport. Tokens can be strings or inline media chips:
 *   { image: {src, alt} } | { video: {src, poster} }
 */
export default function ScrollText({ tokens, className = "", as: Tag = "p" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });

  // Flatten strings into words, keep media tokens as single units.
  const units = [];
  tokens.forEach((t) => {
    if (typeof t === "string") t.split(/\s+/).filter(Boolean).forEach((w) => units.push(w));
    else units.push(t);
  });
  const n = units.length;

  return (
    <Tag ref={ref} className={`${styles.text} ${className}`}>
      {units.map((u, i) =>
        typeof u === "string" ? (
          <Word key={i} progress={scrollYProgress} range={[i / n, (i + 1) / n]}>
            {u}
          </Word>
        ) : (
          <Chip key={i} progress={scrollYProgress} range={[i / n, (i + 1) / n]} token={u} />
        )
      )}
    </Tag>
  );
}

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <span className={styles.word}>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </span>
  );
}

function Chip({ token, progress, range }) {
  const scale = useTransform(progress, [range[0] - 0.04, range[1]], [0.4, 1]);
  const opacity = useTransform(progress, [range[0] - 0.04, range[1]], [0, 1]);
  return (
    <>
      <motion.span className={styles.chip} style={{ scale, opacity }} aria-hidden="true">
        {token.video ? (
          <LazyVideo src={token.video.src} poster={token.video.poster} className={styles.chipMedia} />
        ) : (
          <Image src={token.image.src} alt="" fill sizes="160px" quality={60} className={styles.chipMedia} />
        )}
      </motion.span>{" "}
    </>
  );
}
