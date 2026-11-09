"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "motion/react";
import styles from "./ScrollSequence.module.css";

/**
 * Scroll-scrubbed image sequence (frames extracted from
 * assets/videos/scroll.json into public/videos/sequence). A city goes from
 * day to night as its screens light up; at the end the scene dims and the
 * ILLUVISION wordmark lands. No captions or HUD — just the film and the mark.
 *
 * - Frames load only when the section approaches the viewport.
 * - Phones load every 2nd frame (75 instead of 150).
 * - Drawn to a <canvas> at device pixel ratio, only when the frame changes.
 */
const TOTAL = 150;
const src = (i) => `/videos/sequence/frame-${String(i).padStart(3, "0")}.webp`;

// Scroll budget: frames play over 0 → END, the wordmark lands by ~0.84,
// then it holds on screen until the section un-pins at 1.
const END = 0.7;


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
    // Frames are 720px wide, so a backing store beyond ~1280px only costs
    // fill-rate (a 2880px canvas was redrawn every scroll step on retina).
    // CSS scales the canvas up; it looks the same.
    const MAX_W = 1280;
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = Math.min(dpr, MAX_W / Math.max(1, c.clientWidth));
      const w = Math.round(c.clientWidth * scale);
      const h = Math.round(c.clientHeight * scale);
      // mobile URL-bar show/hide fires resize: skip if nothing changed
      if (w === c.width && h === c.height) return;
      c.width = w;
      c.height = h;
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
    const ctx = c.getContext("2d", { alpha: false });
    const s = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
  }

  const frameFor = (p) => Math.min(count - 1, Math.max(0, Math.round(Math.min(p / END, 1) * (count - 1))));

  // one draw per animation frame, however many scroll events arrive
  const rafRef = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduce || (p > END + 0.02 && currentRef.current === count - 1)) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => draw(frameFor(p)));
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
  // transform/opacity only (no letter-spacing) so the big glowing wordmark
  // doesn't re-layout on every scroll frame
  const zoom = useTransform(scrollYProgress, [0, END], [1.12, 1]);
  const dim = useTransform(scrollYProgress, [0.64, 0.76], [0.15, 1]);
  const wordScale = useTransform(scrollYProgress, [0.68, 0.82], [1.35, 1]);
  const wordOpacity = useTransform(scrollYProgress, [0.68, 0.78], [0, 1]);
  const tagOpacity = useTransform(scrollYProgress, [0.78, 0.85], [0, 1]);
  const tagY = useTransform(scrollYProgress, [0.78, 0.85], [20, 0]);

  return (
    <section ref={ref} className={styles.section} style={{ height: reduce ? "100vh" : "520vh" }} aria-label="Illuvision: from day to night">
      <div className={styles.sticky}>
        <motion.canvas ref={canvasRef} className={styles.canvas} style={{ scale: reduce ? 1 : zoom }} aria-hidden="true" />
        <motion.span className={styles.dim} style={{ opacity: reduce ? 1 : dim }} aria-hidden="true" />
        <span className={styles.vignette} aria-hidden="true" />


        <div className={styles.wordWrap}>
          <motion.p
            className={styles.word}
            style={reduce ? undefined : { scale: wordScale, opacity: wordOpacity }}
          >
            ILLU<span>V</span>ISION
          </motion.p>
          <motion.p className={styles.tag} style={reduce ? undefined : { opacity: tagOpacity, y: tagY }}>
            Project your vision
          </motion.p>
        </div>

      </div>
    </section>
  );
}
