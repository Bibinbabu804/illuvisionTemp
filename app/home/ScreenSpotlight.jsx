"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { track, EVENTS } from "@/lib/analytics";
import styles from "./HomeBanner.module.css";

const STEP = 3500; // ms per product

/**
 * Hero side card: a small "display" carousel that cycles through
 * promoted marketplace products (photo cross-fade + segmented progress like a playlist).
 * Pauses on hover / focus; links to the product details page on /screens/[slug].
 */
export default function ScreenSpotlight({ products = [], style, className = "" }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = products.length;

  if (n === 0) {
    return null;
  }

  const safeI = i < n ? i : 0;
  const next = () => setI((v) => (v + 1) % n);
  const p = products[safeI];

  const getProductImage = (prod) => {
    return (
      prod.primary_image ||
      prod.images?.[0]?.src ||
      prod.thumbnail ||
      `/images/products/${prod.slug}.webp`
    );
  };

  const getProductSubtitle = (prod) => {
    if (prod.format) return prod.format;
    if (prod.price) return `From ₹${Number(prod.price).toLocaleString("en-IN")}`;
    return "// Explore this screen";
  };

  return (
    <Link
      href={`/screens/${p.slug}`}
      className={`${styles.reel} ${className}`}
      style={{ ...style, "--step": `${STEP}ms` }}
      data-paused={paused}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onClick={() => track(EVENTS.SHOP_CTA, { section: "hero-spotlight", sku: p.slug || p.sku })}
      aria-label={`${p.name}: view product details`}
    >
      <span className={styles.reelThumb}>
        {products.map((prod, k) => (
          <Image
            key={prod.slug || prod.id}
            src={getProductImage(prod)}
            alt={prod.name || ""}
            fill
            sizes="340px"
            quality={60}
            priority={k === 0}
            className={styles.spotImg}
            style={{ objectPosition: prod.images?.[0]?.pos || "50% 50%" }}
            data-active={k === safeI}
          />
        ))}
        <span className={styles.spotPixels} aria-hidden="true" />
        <span className={styles.reelHud} aria-hidden="true">
          <i className={styles.live}>Now showing</i>
          <i>{String(safeI + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</i>
        </span>
        <span className={styles.spotBars} aria-hidden="true">
          {products.map((prod, k) => (
            <span key={prod.slug || prod.id} data-state={k < safeI ? "done" : k === safeI ? "now" : "next"}>
              {/* key on safeI restarts the fill animation for the active bar */}
              <i key={k === safeI ? `on-${safeI}` : "off"} onAnimationEnd={k === safeI ? next : undefined} />
            </span>
          ))}
        </span>
      </span>
      <span className={styles.reelFoot}>
        <span className={styles.reelText}>
          <strong key={p.slug || p.id} className={styles.spotName}>{p.name}</strong>
          <span>{getProductSubtitle(p)}</span>
        </span>
        <span className={styles.reelArrow} aria-hidden="true">
          <Icon name="arrow" size={26} strokeWidth={1.4} />
        </span>
      </span>
    </Link>
  );
}
