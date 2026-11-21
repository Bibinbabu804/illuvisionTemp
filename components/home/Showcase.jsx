"use client";

import { useRef, useState } from "react";
import { useInView } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import { getProduct, productImages } from "@/data/catalog";
import styles from "./Showcase.module.css";

const scenes = [
  {
    id: "shops",
    label: "Shops",
    title: "Your screen promotes your shop.",
    body: "Put fresh offers where customers look. A wall mount display saves floor space and keeps today's deals in view.",
    image: productImages.wallMount,
    product: "wall-mount-display",
  },
  {
    id: "restaurants",
    label: "Restaurants",
    title: "Today's special, at the door.",
    body: "An A-frame standee brings the menu to the entrance, then folds away when you close.",
    image: productImages.aFrame,
    product: "a-frame-standee",
  },
  {
    id: "clinics",
    label: "Clinics",
    title: "Keep the waiting room informed.",
    body: "A full-glass standee shows your services, timings and health messages with a premium full-height glass front.",
    image: productImages.fullGlass,
    product: "full-glass-standee",
  },
  {
    id: "showrooms",
    label: "Showrooms",
    title: "Put the launch on the floor.",
    body: "A sleek half-glass standee, with a solid lower panel, holds its own beside the products it promotes.",
    image: productImages.halfGlass,
    product: "half-glass-standee",
  },
];

export default function Showcase({ index, products = [] }) {
  const [active, setActive] = useState(0);
  const scene = scenes[active];
  // Prefer live Marketplace Product from backend; fall back to static reference only if unavailable
  const liveProduct = Array.isArray(products)
    ? products.find((p) => p.slug === scene.product) || null
    : null;
  const product = liveProduct || getProduct(scene.product);
  // Auto-advance: each active tab's progress bar runs for 6s, then moves on.
  // Paused while off-screen, hovered or focused, and stops after a manual pick.
  const stageRef = useRef(null);
  const inView = useInView(stageRef, { amount: 0.4 });
  const [hold, setHold] = useState(false);
  const [manual, setManual] = useState(false);
  const paused = !inView || hold || manual;
  const next = () => setActive((a) => (a + 1) % scenes.length);

  const onKeyDown = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : -1) + scenes.length) % scenes.length;
    setActive(next);
    setManual(true);
    document.getElementById(`scene-tab-${scenes[next].id}`)?.focus();
  };

  return (
    <section className="section" aria-labelledby="showcase-title">
      <div className="container">
        <SectionHeader
          index={index}
          label="In the space"
          id="showcase-title"
          lines={["Made for the places", "people actually look."]}
          lead="See how each type of screen works in retail, hospitality, offices and outdoors."
        />

        <Reveal className={styles.stage} variant="scale">
          <div
            ref={stageRef}
            className={styles.stageInner}
            data-paused={paused}
            onPointerEnter={() => setHold(true)}
            onPointerLeave={() => setHold(false)}
            onFocus={() => setHold(true)}
            onBlur={() => setHold(false)}
          >
          <div className={styles.frames}>
            {scenes.map((s, i) => (
              <div
                key={s.id}
                className={styles.frame}
                data-active={i === active}
                aria-hidden={i !== active}
              >
                {/* soft backdrop from the same photo, then the portrait photo itself */}
                <Image src={s.image.src} alt="" fill quality={40} sizes="320px" className={styles.backdrop} />
                <div className={styles.photo}>
                  <Image
                    src={s.image.src}
                    alt={s.image.alt}
                    fill
                    quality={75}
                    sizes="(max-width: 767px) 100vw, 480px"
                    className={styles.img}
                    style={{ objectPosition: s.image.pos }}
                  />
                </div>
              </div>
            ))}
            <span className={styles.shade} aria-hidden="true" />
          </div>

          <div className={styles.tabs} role="tablist" aria-label="Spaces" onKeyDown={onKeyDown}>
            {scenes.map((s, i) => (
              <button
                key={s.id}
                id={`scene-tab-${s.id}`}
                role="tab"
                type="button"
                aria-selected={i === active}
                aria-controls="scene-panel"
                tabIndex={i === active ? 0 : -1}
                className={styles.tab}
                onClick={() => {
                  setActive(i);
                  setManual(true);
                }}
              >
                <span className={styles.tabNum}>{String(i + 1).padStart(2, "0")}</span>
                {s.label}
                {i === active && !manual && (
                  <span key={active} className={styles.tabProgress} onAnimationEnd={next} aria-hidden="true" />
                )}
              </button>
            ))}
          </div>

          <div
            id="scene-panel"
            role="tabpanel"
            aria-labelledby={`scene-tab-${scene.id}`}
            className={styles.panel}
            key={scene.id}
          >
            <h3>{scene.title}</h3>
            <p>{scene.body}</p>
            {product && (
              <Link href={`/screens/${product.slug}`} className={styles.productLink}>
                <span>
                  <small>Suggested screen</small>
                  {product.name}
                </span>
                <Icon name="arrow" size={18} />
              </Link>
            )}
          </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
