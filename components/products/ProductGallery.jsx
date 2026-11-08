"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import styles from "./ProductGallery.module.css";

/**
 * Native scroll-snap carousel (smooth touch swiping, no JS physics),
 * hover-zoom on desktop and a full-screen zoom viewer.
 */
export default function ProductGallery({ images, name, sample }) {
  const trackRef = useRef(null);
  const dialogRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  // Track the visible slide with an observer instead of scroll maths.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setIndex(Number(e.target.dataset.index));
        }
      },
      { root: track, threshold: 0.6 }
    );
    track.querySelectorAll("[data-index]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const goTo = (i) => {
    const track = trackRef.current;
    const n = (i + images.length) % images.length;
    track?.scrollTo({ left: n * track.clientWidth, behavior: "smooth" });
    setIndex(n);
  };

  // Hover zoom: write the pointer position to CSS vars (no React re-render).
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--zx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--zy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const openViewer = () => {
    setZoomed(false);
    dialogRef.current?.showModal();
  };

  const current = images[index];

  return (
    <div className={styles.gallery}>
      <div className={styles.stage}>
        <div
          ref={trackRef}
          className={styles.track}
          tabIndex={0}
          aria-roledescription="carousel"
          aria-label={`${name} images`}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
            if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
          }}
        >
          {images.map((img, i) => (
            <div
              key={img.src}
              className={styles.slide}
              data-index={i}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${images.length}`}
              onPointerMove={onMove}
            >
              <Image
                src={img.src}
                alt={i === 0 ? `${name} — illustrative image` : img.alt}
                fill
                quality={75}
                sizes="(max-width: 1023px) 100vw, 58vw"
                preload={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                className={styles.img}
              />
            </div>
          ))}
        </div>

        {sample && <span className={`badge badge--sample ${styles.sample}`}>Stock image · not the actual model</span>}

        <button type="button" className={styles.zoomBtn} onClick={openViewer} aria-label="View image full screen">
          <Icon name="zoom" size={20} />
        </button>

        {images.length > 1 && (
          <div className={styles.arrows}>
            <button type="button" onClick={() => goTo(index - 1)} aria-label="Previous image">
              <Icon name="chevronLeft" size={20} />
            </button>
            <button type="button" onClick={() => goTo(index + 1)} aria-label="Next image">
              <Icon name="chevronRight" size={20} />
            </button>
          </div>
        )}

        <div className={styles.dots} aria-hidden="true">
          {images.map((img, i) => (
            <span key={img.src} data-active={i === index} />
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className={styles.thumbs} role="group" aria-label="Choose image">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              className={styles.thumb}
              aria-pressed={i === index}
              aria-label={`Show image ${i + 1}`}
              onClick={() => goTo(i)}
            >
              <Image src={img.src} alt="" fill sizes="120px" quality={60} className={styles.img} />
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={dialogRef}
        className={styles.viewer}
        data-lenis-prevent
        aria-label={`${name} image viewer`}
        onClick={(e) => e.target === e.currentTarget && dialogRef.current.close()}
      >
        <button type="button" className={styles.viewerClose} onClick={() => dialogRef.current.close()} aria-label="Close viewer">
          <Icon name="close" size={22} />
        </button>
        <div
          className={styles.viewerStage}
          data-zoomed={zoomed}
          onClick={(e) => {
            onMove(e);
            setZoomed((z) => !z);
          }}
          onPointerMove={zoomed ? onMove : undefined}
        >
          {current && (
            <Image src={current.src} alt={current.alt} fill quality={75} sizes="100vw" className={styles.viewerImg} />
          )}
        </div>
        <p className={styles.viewerHint}>{zoomed ? "Tap to zoom out" : "Tap image to zoom"}</p>
      </dialog>
    </div>
  );
}
