"use client";

import { useRef, useState } from "react";
import { useInView } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import { media } from "@/data/media";
import { getProduct } from "@/data/catalog";
import styles from "./Showcase.module.css";

const scenes = [
  {
    id: "retail",
    label: "Retail",
    title: "Turn shelves into storefronts.",
    body: "Bring promotions to eye level with standees at the entrance and screens beside the products they sell.",
    image: media.retailScreens,
    product: "sample-digital-standee",
  },
  {
    id: "hospitality",
    label: "Hospitality",
    title: "Menus that update in seconds.",
    body: "Overhead and counter screens keep menus, offers and queues moving without reprinting a thing.",
    image: media.menuBoard,
    product: "sample-menu-board",
  },
  {
    id: "corporate",
    label: "Corporate",
    title: "Meeting rooms that keep up.",
    body: "Wall displays and interactive panels for presentations, collaboration and reception welcome screens.",
    image: media.meetingRoom,
    product: "sample-interactive-panel",
  },
  {
    id: "outdoor",
    label: "Outdoor",
    title: "Be seen from the street.",
    body: "Large-format LED for façades, forecourts and entrances that need to hold attention in the open air.",
    image: media.outdoorLedFacade,
    product: "sample-outdoor-led-screen",
  },
];

export default function Showcase({ index }) {
  const [active, setActive] = useState(0);
  const scene = scenes[active];
  const product = getProduct(scene.product);
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
    <section className={`section ${styles.section}`} aria-labelledby="showcase-title">
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
                <Image
                  src={s.image.src}
                  alt={s.image.alt}
                  fill
                  quality={75}
                  sizes="(max-width: 1023px) 100vw, 1320px"
                  className={styles.img}
                />
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
