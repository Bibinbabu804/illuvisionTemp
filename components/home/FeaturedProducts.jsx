"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import SectionHeader from "@/components/ui/SectionHeader";
import ProductCard from "@/components/products/ProductCard";
import Button from "@/components/ui/Button";
import { featuredProducts } from "@/data/catalog";
import { EVENTS } from "@/lib/analytics";
import styles from "./FeaturedProducts.module.css";

/**
 * Desktop: the section pins and vertical scroll drives the product row
 * sideways. Tablet/mobile: a native swipeable row (no pinning).
 */
export default function FeaturedProducts({ index }) {
  const items = featuredProducts().slice(0, 6);
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [distance, setDistance] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const measure = () => {
      setPinned(mq.matches);
      const t = trackRef.current;
      if (t) setDistance(Math.max(0, t.scrollWidth - t.parentElement.clientWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const rawX = useTransform(scrollYProgress, [0.05, 0.95], [0, -distance]);
  const x = useSpring(rawX, { stiffness: 120, damping: 30, mass: 0.4 });
  const progress = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

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
            lines={["Popular picks,", "ready to quote."]}
            lead="Open any screen to see its details and request a confirmed quote."
            aside={
              <Button href="/screens" variant="ghost" event={EVENTS.SHOP_CTA} eventProps={{ section: "featured" }}>
                View all screens
              </Button>
            }
          />
        </div>

        <div className={styles.viewport}>
          <motion.ul ref={trackRef} className={styles.track} style={pinned ? { x } : undefined}>
            {items.map((p, i) => (
              <li key={p.slug} className={styles.item} data-cursor="View">
                <span className={styles.index}>{String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
                <ProductCard product={p} section="featured" tall />
              </li>
            ))}
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
