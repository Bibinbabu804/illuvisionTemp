"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion } from "motion/react";

/**
 * Scroll-scrubbed image sequence drawn to a <canvas>.
 *
 *   dir       public folder holding frame-000.webp … frame-NNN.webp
 *   total     number of frames in that folder
 *   progress  MotionValue (0 → 1), usually a section's scrollYProgress
 *   end       progress at which the last frame is reached (the rest holds)
 *   eager     load every frame straight away (above-the-fold sequences);
 *             otherwise frames load when the canvas approaches the viewport
 *
 * - Phones load every 2nd frame.
 * - Drawn at a capped backing-store size, only when the frame changes.
 * - Reduced motion: the first frame only, no scrubbing.
 */
const pad = (i) => String(i).padStart(3, "0");

export default function FrameScrub({ dir, total, progress, end = 1, eager = false, className, style }) {
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const currentRef = useRef(-1);
  const rafRef = useRef(0);
  const [loaded, setLoaded] = useState(0);
  const [count, setCount] = useState(total);
  const reduce = useReducedMotion();
  const src = (i) => `${dir}/frame-${pad(i)}.webp`;

  // cover-fit draw, falling back to the nearest loaded frame
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

  const frameFor = (p) => Math.min(count - 1, Math.max(0, Math.round(Math.min(p / end, 1) * (count - 1))));

  // ---- load frames ----
  useEffect(() => {
    const step = window.matchMedia("(max-width: 767px)").matches ? 2 : 1;
    const indices = [];
    for (let i = 0; i < total; i += step) indices.push(i);
    if (indices[indices.length - 1] !== total - 1) indices.push(total - 1);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- frame count depends on viewport (client-only)
    setCount(indices.length);

    let cancelled = false;
    const loadRest = () => {
      indices.forEach((frameNo, k) => {
        if (k === 0) return;
        const img = new Image();
        img.decoding = "async";
        img.src = src(frameNo);
        img.onload = () => {
          if (cancelled) return;
          framesRef.current[k] = img;
          setLoaded((n) => n + 1);
        };
      });
    };

    // first frame right away (poster)
    const first = new Image();
    first.src = src(0);
    first.onload = () => {
      if (cancelled) return;
      framesRef.current[0] = first;
      setLoaded((n) => n + 1);
    };

    if (reduce) return () => { cancelled = true; };

    let io;
    if (eager) {
      loadRest();
    } else {
      io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          loadRest();
          io.disconnect();
        },
        { rootMargin: "1500px 0px" }
      );
      io.observe(canvasRef.current);
    }
    return () => {
      cancelled = true;
      io?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir, total, eager, reduce]);

  // ---- canvas sizing ----
  useEffect(() => {
    // Frames are under 1000px wide, so a backing store beyond ~1280px only
    // costs fill-rate. CSS scales the canvas up; it looks the same.
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

  // one draw per animation frame, however many scroll events arrive
  useMotionValueEvent(progress, "change", (p) => {
    if (reduce) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => draw(frameFor(p)));
  });

  // redraw once more frames arrive (keeps the current position sharp)
  useEffect(() => {
    draw(reduce ? 0 : frameFor(progress.get()), true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, reduce, count]);

  return (
    <motion.canvas
      ref={canvasRef}
      className={className}
      style={{ background: `#0d1014 url("${src(0)}") center / cover no-repeat`, ...style }}
      aria-hidden="true"
    />
  );
}
