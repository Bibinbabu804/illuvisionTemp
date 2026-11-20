"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { EVENTS, track } from "@/lib/analytics";
import styles from "./CategoryList.module.css";

const getImageSrc = (cat) => {
  if (typeof cat.image === "string") return cat.image;
  if (cat.image?.src) return cat.image.src;
  if (cat.image_url) return cat.image_url;
  return "/images/products/wall-mount.webp";
};

const getImagePos = (cat) => {
  if (cat.image?.pos) return cat.image.pos;
  if (cat.slug === "wall-mount") return "50% 22%";
  if (cat.slug === "a-frame-standee") return "50% 42%";
  if (cat.slug === "half-glass-standee") return "50% 38%";
  if (cat.slug === "full-glass-standee") return "50% 32%";
  return "50% 50%";
};

/**
 * Editorial category index. On desktop a preview image follows the cursor
 * over the list; on touch devices each row shows its own thumbnail.
 */
export default function CategoryList({ index, categories = [] }) {
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
          lead="Choose your format: a wall mount display, or an A-frame, half-glass or full-glass standee."
          aside={
            categories.some((c) => c.sample) && (
              <p className={styles.note}>
                <span className="badge badge--sample">Sample range</span> Final categories pending catalogue approval.
              </p>
            )
          }
        />

        {categories.length === 0 ? (
          <p className={styles.note} style={{ padding: "40px 0" }}>
            No screen categories are available at the moment.
          </p>
        ) : (
          <ul
            ref={listRef}
            className={styles.list}
            onPointerEnter={measure}
            onPointerMove={onMove}
            onPointerLeave={() => setActive(null)}
          >
            {categories.map((c, i) => {
              const src = getImageSrc(c);
              const pos = getImagePos(c);
              const name = c.name || c.category_name;
              const short = c.short || c.short_description || "";

              return (
                <Reveal as="li" key={c.slug || c.id || i} delay={i * 60}>
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
                      <Image src={src} alt="" fill sizes="96px" quality={60} className={styles.img} style={{ objectPosition: pos }} />
                    </span>
                    <span className={styles.name}>{name}</span>
                    <span className={styles.short}>{short}</span>
                    <span className={styles.arrow}>
                      <Icon name="arrowUpRight" size={22} />
                    </span>
                  </Link>
                </Reveal>
              );
            })}

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
                    key={c.slug || c.id || i}
                    src={getImageSrc(c)}
                    alt=""
                    fill
                    sizes="340px"
                    quality={70}
                    className={styles.previewImg}
                    style={{ objectPosition: getImagePos(c) }}
                    data-active={active === i}
                  />
                ))}
              </div>
            </motion.div>
          </ul>
        )}

        <Reveal className={styles.more}>
          <Button href="/screens" variant="ghost" event={EVENTS.SHOP_CTA} eventProps={{ section: "categories" }}>
            Browse all screens
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
