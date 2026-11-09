"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { categories } from "@/data/catalog";
import { EVENTS, track } from "@/lib/analytics";
import styles from "./CategoryList.module.css";

/**
 * Editorial category index. On desktop a preview image follows the cursor
 * over the list; on touch devices each row shows its own thumbnail.
 */
export default function CategoryList({ index }) {
  const listRef = useRef(null);
  const [active, setActive] = useState(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 180, damping: 22, mass: 0.6 });

  // List position is measured on enter / scroll / resize only — never on
  // every pointer move (that forced a layout read each frame).
  const rectRef = useRef(null);
  const measure = () => {
    if (listRef.current) rectRef.current = listRef.current.getBoundingClientRect();
  };
  useEffect(() => {
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    if (!rectRef.current) measure();
    const r = rectRef.current;
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  return (
    <section className={`section ${styles.section}`} aria-labelledby="categories-title">
      <div className="container">
        <SectionHeader
          index={index}
          label="Screen categories"
          id="categories-title"
          lines={["A screen for", "every kind of space."]}
          lead="Browse by the type of screen you need, from a single reception display to a building-scale façade."
          aside={
            categories.some((c) => c.sample) && (
              <p className={styles.note}>
                <span className="badge badge--sample">Sample range</span> Final categories pending catalogue approval.
              </p>
            )
          }
        />

        <ul
          ref={listRef}
          className={styles.list}
          onPointerEnter={measure}
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
        >
          {categories.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={i * 60}>
              <Link
                href={`/screens?category=${c.slug}`}
                className={styles.row}
                data-active={active === i}
                data-dim={active !== null && active !== i}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                onClick={() => track(EVENTS.SHOP_CTA, { section: "category-list", category: c.slug })}
              >
                <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.thumb}>
                  <Image src={c.image.src} alt="" fill sizes="96px" quality={60} className={styles.img} />
                </span>
                <span className={styles.name}>{c.name}</span>
                <span className={styles.short}>{c.short}</span>
                <span className={styles.arrow}>
                  <Icon name="arrowUpRight" size={22} />
                </span>
              </Link>
            </Reveal>
          ))}

          {/* All previews are mounted once and cross-fade via CSS, so hovering a
              new row never re-mounts or re-decodes an image. */}
          <motion.div
            className={styles.preview}
            style={{ x: sx, y: sy }}
            data-show={active !== null}
            aria-hidden="true"
          >
            <div className={styles.previewInner}>
              {categories.map((c, i) => (
                <Image
                  key={c.slug}
                  src={c.image.src}
                  alt=""
                  fill
                  sizes="340px"
                  quality={70}
                  className={styles.previewImg}
                  data-active={active === i}
                />
              ))}
            </div>
          </motion.div>
        </ul>

        <Reveal className={styles.more}>
          <Button href="/screens" variant="ghost" event={EVENTS.SHOP_CTA} eventProps={{ section: "categories" }}>
            Browse all screens
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
