"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "motion/react";
import styles from "./ScrollSequence.module.css";

/**
 * Scroll-scrubbed image sequence (frames extracted from
 * assets/videos/scroll.json into public/videos/sequence). A city goes from
 * day to night as its screens light up; at the end the scene dims and the
 * ILLUVISION wordmark lands.
 *
 * - Frames load only when the section approaches the viewport.
 * - Phones load every 2nd frame (75 instead of 150).
 * - Drawn to a <canvas> at device pixel ratio, only when the frame changes.
 */
const TOTAL = 150;
const src = (i) => `/videos/sequence/frame-${String(i).padStart(3, "0")}.webp`;

const captions = [
  { from: 0.02, to: 0.26, kicker: "17:30", text: "Daylight. The square is busy, the screens are waiting." },
  { from: 0.32, to: 0.56, kicker: "19:00", text: "As the sun goes down, the city starts to glow." },
  { from: 0.62, to: 0.8, kicker: "21:00", text: "Now every screen has the crowd's attention." },
];

export default function ScrollSequence() {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const currentRef = useRef(-1);
  const [loaded, setLoaded] = useState(0);
  const [count, setCount] = useState(TOTAL);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // ---- load frames when near ----
  useEffect(() => {
    const step = window.matchMedia("(max-width: 767px)").matches ? 2 : 1;
    const indices = [];
    for (let i = 0; i < TOTAL; i += step) indices.push(i);
    if (indices[indices.length - 1] !== TOTAL - 1) indices.push(TOTAL - 1);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- frame count depends on viewport (client-only)
    setCount(indices.length);

    // first frame right away (poster)
    const first = new Image();
    first.src = src(0);
    first.onload = () => {
      framesRef.current[0] = first;
      draw(0, true);
    };

    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started) return;
        started = true;
        indices.forEach((frameNo, k) => {
          const img = new Image();
          img.decoding = "async";
          img.src = src(frameNo);
          img.onload = () => {
            framesRef.current[k] = img;
            setLoaded((n) => n + 1);
          };
        });
        io.disconnect();
      },
      { rootMargin: "1500px 0px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  // ---- canvas sizing ----
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      draw(currentRef.current < 0 ? 0 : currentRef.current, true);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // cover-fit draw, nearest loaded frame
  function draw(index, force = false) {
    const c = canvasRef.current;
    if (!c) return;
    if (!force && index === currentRef.current) return;
    let img = framesRef.current[index];
    if (!img) {
      for (let d = 1; d < framesRef.current.length && !img; d++) {
        img = framesRef.current[index - d] || framesRef.current[index + d];
      }
    }
    if (!img) return;
    currentRef.current = index;
    const ctx = c.getContext("2d");
    const s = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
  }

  const frameFor = (p) => Math.min(count - 1, Math.max(0, Math.round(Math.min(p / 0.84, 1) * (count - 1))));

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduce) return;
    requestAnimationFrame(() => draw(frameFor(p)));
  });

  // redraw once more frames arrive (keeps the current position sharp)
  useEffect(() => {
    if (reduce) {
      draw(count - 1, true);
      return;
    }
    draw(frameFor(scrollYProgress.get()), true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, reduce]);

  // ---- overlays ----
  const zoom = useTransform(scrollYProgress, [0, 0.84], [1.12, 1]);
  const dim = useTransform(scrollYProgress, [0.8, 0.92], [0.15, 0.72]);
  const wordScale = useTransform(scrollYProgress, [0.84, 1], [1.6, 1]);
  const wordOpacity = useTransform(scrollYProgress, [0.84, 0.93], [0, 1]);
  const wordSpacing = useTransform(scrollYProgress, [0.84, 1], ["0.6em", "0.02em"]);
  const tagOpacity = useTransform(scrollYProgress, [0.93, 1], [0, 1]);
  const tagY = useTransform(scrollYProgress, [0.93, 1], [20, 0]);
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} className={styles.section} style={{ height: reduce ? "100vh" : "420vh" }} aria-label="Illuvision: from day to night">
      <div className={styles.sticky}>
        <motion.canvas ref={canvasRef} className={styles.canvas} style={{ scale: reduce ? 1 : zoom }} aria-hidden="true" />
        <motion.span className={styles.dim} style={{ opacity: reduce ? 0.6 : dim }} aria-hidden="true" />
        <span className={styles.vignette} aria-hidden="true" />

        {!reduce &&
          captions.map((c) => (
            <Caption key={c.kicker} progress={scrollYProgress} {...c} />
          ))}

        <div className={styles.wordWrap}>
          <motion.p
            className={styles.word}
            style={reduce ? undefined : { scale: wordScale, opacity: wordOpacity, letterSpacing: wordSpacing }}
          >
            ILLU<span>V</span>ISION
          </motion.p>
          <motion.p className={styles.tag} style={reduce ? undefined : { opacity: tagOpacity, y: tagY }}>
            Project your vision
          </motion.p>
        </div>

        {!reduce && (
          <div className={`container ${styles.hud}`} aria-hidden="true">
            <span>Day</span>
            <span className={styles.track}>
              <motion.i style={{ scaleX: bar }} />
            </span>
            <span>Night</span>
            {loaded < count && <span className={styles.loading}>{Math.round((loaded / count) * 100)}%</span>}
          </div>
        )}
      </div>
    </section>
  );
}

function Caption({ progress, from, to, kicker, text }) {
  const mid = (from + to) / 2;
  const opacity = useTransform(progress, [from, from + 0.05, to - 0.05, to], [0, 1, 1, 0]);
  const y = useTransform(progress, [from, mid, to], [40, 0, -40]);
  const blur = useTransform(progress, [from, from + 0.05, to - 0.05, to], ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]);
  return (
    <motion.div className={`container on-dark ${styles.caption}`} style={{ opacity, y, filter: blur }}>
      <p className={styles.time}>{kicker}</p>
      <p className={styles.capText}>{text}</p>
    </motion.div>
  );
}
