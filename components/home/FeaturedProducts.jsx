"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import SectionHeader from "@/components/ui/SectionHeader";
import ProductCard from "@/components/products/ProductCard";
import Button from "@/components/ui/Button";
import { featuredProducts as staticFeaturedProducts } from "@/data/catalog";
import { useFeaturedProducts } from "@/services/api/products/product.queries";
import { EVENTS } from "@/lib/analytics";
import styles from "./FeaturedProducts.module.css";

/**
 * Desktop: the section pins and vertical scroll drives the product row
 * sideways. Tablet/mobile: a native swipeable row (no pinning).
 */
export default function FeaturedProducts({ index }) {
  const { data: serverProducts, isLoading, isError } = useFeaturedProducts(6);

  // Dynamic products from API with graceful fallback to static catalog data on error
  const items = useMemo(() => {
    if (serverProducts && serverProducts.length > 0) {
      return serverProducts;
    }
    if (!isLoading && (isError || !serverProducts || serverProducts.length === 0)) {
      return staticFeaturedProducts().slice(0, 6);
    }
    return serverProducts || [];
  }, [serverProducts, isLoading, isError]);

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [distance, setDistance] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const measure = () => {
      setPinned(mq.matches);
      const t = trackRef.current;
      if (!t) return;
      // The viewport has side padding (the gutter): the track must travel
      // until its right edge meets the viewport's *inner* right edge, so
      // measure against the content box, not clientWidth (which includes
      // padding). Otherwise the last card stops short of the screen.
      const vp = t.parentElement;
      const cs = getComputedStyle(vp);
      const inner = vp.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      setDistance(Math.max(0, Math.ceil(t.scrollWidth - inner)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) {
      ro.observe(trackRef.current);
      if (trackRef.current.parentElement) {
        ro.observe(trackRef.current.parentElement);
      }
    }
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, [items.length, isLoading]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const rawX = useTransform(scrollYProgress, [0.04, 0.9], [0, -distance]);
  const x = useSpring(rawX, { stiffness: 120, damping: 30, mass: 0.4 });
  const progress = useTransform(scrollYProgress, [0.04, 0.9], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="featured-title"
      style={pinned ? { height: `calc(100vh + ${distance}px)` } : undefined}
      data-pinned={pinned}
    >
      <div className={styles.sticky}>
        <div className="container">
          <SectionHeader
            className={styles.head}
            index={index}
            label="Featured screens"
            id="featured-title"
            lines={["Four formats,", "ready to quote."]}
            lead="Open any screen to see its sizes, display options and Founding Partner prices."
            aside={
              <Button href="/screens" variant="ghost" event={EVENTS.SHOP_CTA} eventProps={{ section: "featured" }}>
                View all screens
              </Button>
            }
          />
        </div>

        <div className={styles.viewport}>
          <motion.ul ref={trackRef} className={styles.track} style={pinned ? { x } : undefined}>
            {isLoading && items.length === 0 ? (
              // Sleek skeleton cards while initial fetch is in flight
              Array.from({ length: 4 }).map((_, i) => (
                <li key={`skeleton-${i}`} className={styles.item} aria-hidden="true">
                  <span className={styles.index}>0{i + 1} / 04</span>
                  <div
                    style={{
                      height: 480,
                      borderRadius: 16,
                      background: "rgba(0, 0, 0, 0.04)",
                      animation: "pulse 1.8s ease-in-out infinite",
                    }}
                  />
                </li>
              ))
            ) : items.length > 0 ? (
              items.map((p, i) => (
                <li key={p.slug || p.id} className={styles.item} data-cursor="View">
                  <span className={styles.index}>
                    {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </span>
                  <ProductCard product={p} section="featured" tall priority={i < 2} />
                </li>
              ))
            ) : (
              <li className={styles.item}>
                <p style={{ color: "var(--text-3)", padding: "40px 0" }}>No featured screens currently available.</p>
              </li>
            )}
          </motion.ul>
        </div>

        {pinned && (
          <div className="container">
            <div className={styles.bar}>
              <motion.span style={{ scaleX: progress }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
