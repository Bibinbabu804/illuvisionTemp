"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Muted looping background video.
 * - Source is attached once the video first comes near the viewport
 *   (immediately when `eager`).
 * - Plays while visible and pauses off-screen to save CPU/battery.
 *   Playback is (re)started in an effect *after* the source is attached,
 *   so lazy videos never get stuck on their poster.
 * - Reduced-motion users see the poster only.
 * - `mobileSrc` swaps in a portrait cut below 768px.
 */
export default function LazyVideo({ src, mobileSrc, poster, mobilePoster, className, eager = false, label }) {
  const ref = useRef(null);
  const [armed, setArmed] = useState(eager);
  const [inView, setInView] = useState(eager);
  const [source, setSource] = useState(null);
  const [posterSrc, setPosterSrc] = useState(poster);

  // Pick the right file for the viewport / motion preference.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pick = () => {
      const mobile = mq.matches && mobileSrc;
      setPosterSrc(mobile && mobilePoster ? mobilePoster : poster);
      setSource(reduce ? null : mobile ? mobileSrc : src);
    };
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, [src, mobileSrc, poster, mobilePoster]);

  // Track visibility.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) setArmed(true);
      },
      { rootMargin: "250px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Play / pause once the source is attached.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (armed && source && inView) {
      const p = el.play();
      if (p?.catch) p.catch(() => {});
    } else {
      el.pause();
    }
  }, [armed, source, inView]);

  return (
    <video
      ref={ref}
      className={className}
      src={armed && source ? source : undefined}
      poster={posterSrc}
      muted
      loop
      playsInline
      autoPlay={armed}
      preload={eager ? "auto" : "metadata"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      disablePictureInPicture
    />
  );
}
