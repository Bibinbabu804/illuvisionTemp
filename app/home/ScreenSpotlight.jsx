"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { categories } from "@/data/catalog";
import { track, EVENTS } from "@/lib/analytics";
import styles from "./HomeBanner.module.css";

const STEP = 3500; // ms per category

/**
 * Hero side card: a small "display" that cycles through the screen
 * categories (photo cross-fade + segmented progress like a playlist).
 * Pauses on hover / focus; links to the category on /screens.
 */
export default function ScreenSpotlight({ style, className = "" }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = categories.length;

  // Advance when the active progress bar finishes filling. Hover pauses the
  // CSS animation, so timing and bar always stay in sync. Reduced motion:
  // no animation runs, so the card simply stays on the first category.
  const next = () => setI((v) => (v + 1) % n);

  const c = categories[i];

  return (
    <Link
      href={`/screens?category=${c.slug}`}
      className={`${styles.reel} ${className}`}
      style={{ ...style, "--step": `${STEP}ms` }}
      data-paused={paused}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onClick={() => track(EVENTS.SHOP_CTA, { section: "hero-spotlight", category: c.slug })}
      aria-label={`${c.name}: browse this screen range`}
    >
      <span className={styles.reelThumb}>
        {categories.map((cat, k) => (
          <Image
            key={cat.slug}
            src={cat.image.src}
            alt=""
            fill
            sizes="340px"
            quality={60}
            priority={k === 0}
            className={styles.spotImg}
            data-active={k === i}
          />
        ))}
        <span className={styles.spotPixels} aria-hidden="true" />
        <span className={styles.reelHud} aria-hidden="true">
          <i className={styles.live}>Now showing</i>
          <i>{String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</i>
        </span>
        <span className={styles.spotBars} aria-hidden="true">
          {categories.map((cat, k) => (
            <span key={cat.slug} data-state={k < i ? "done" : k === i ? "now" : "next"}>
              {/* key on i restarts the fill animation for the active bar */}
              <i key={k === i ? `on-${i}` : "off"} onAnimationEnd={k === i ? next : undefined} />
            </span>
          ))}
        </span>
      </span>
      <span className={styles.reelFoot}>
        <span className={styles.reelText}>
          <strong key={c.slug} className={styles.spotName}>{c.name}</strong>
          <span>{"// Explore this range"}</span>
        </span>
        <span className={styles.reelArrow} aria-hidden="true">
          <Icon name="arrow" size={26} strokeWidth={1.4} />
        </span>
      </span>
    </Link>
  );
}
