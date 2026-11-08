"use client";

import { useState } from "react";
import { motion } from "motion/react";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { media } from "@/data/media";
import { EVENTS, track } from "@/lib/analytics";
import styles from "./SizeVisualizer.module.css";

/**
 * Drag a slider to see a screen size next to a person, with dimensions and
 * a general viewing-distance guide. All numbers are geometry/rules of thumb,
 * not product specifications.
 */
const SCENE_CM = 300; // the scene shows 3 m of wall height
const PERSON_CM = 172;
const MOUNT_CENTER_CM = 150;

export default function SizeVisualizer({ index }) {
  const [inches, setInches] = useState(65);
  const [portrait, setPortrait] = useState(false);

  // 16:9 geometry from the diagonal
  const diagCm = inches * 2.54;
  const longCm = diagCm * (16 / Math.hypot(16, 9));
  const shortCm = diagCm * (9 / Math.hypot(16, 9));
  const wCm = portrait ? shortCm : longCm;
  const hCm = portrait ? longCm : shortCm;

  // general guide for 4K content: ~1–1.5× the diagonal
  const near = (diagCm * 1.0) / 100;
  const far = (diagCm * 1.5) / 100;

  const pct = (cm) => `${(cm / SCENE_CM) * 100}%`;
  const spring = { type: "spring", stiffness: 140, damping: 22 };
  const bottomCm = Math.max(10, MOUNT_CENTER_CM - hCm / 2);

  return (
    <section className={`section ${styles.section}`} aria-labelledby="size-title">
      <div className="container">
        <SectionHeader
          index={index}
          label="Size visualiser"
          id="size-title"
          lines={["See the size", "before you buy."]}
          lead="Drag to compare screen sizes against a person, and get a general guide to comfortable viewing distance."
        />

        <div className={styles.card}>
          <div className={styles.scene} aria-hidden="true">
            <span className={styles.wallLine} style={{ bottom: pct(MOUNT_CENTER_CM) }} />
            <motion.div
              className={styles.screen}
              style={{ aspectRatio: `${wCm} / ${hCm}` }}
              animate={{ height: pct(hCm), bottom: pct(bottomCm) }}
              transition={spring}
            >
              <span className={styles.content} style={{ backgroundImage: `url(${media.heroCurvedWall.src}?w=900&q=60&auto=format)` }} />
              <span className={styles.screenLabel}>{inches}&Prime;</span>
            </motion.div>

            <svg className={styles.person} style={{ height: pct(PERSON_CM) }} viewBox="0 0 60 172">
              <circle cx="30" cy="13" r="11" />
              <path d="M18 30h24a8 8 0 0 1 8 8v52h-9v78h-10V112h-2v56H19V90h-9V38a8 8 0 0 1 8-8Z" />
            </svg>
            <span className={styles.personLabel}>1.72 m</span>
            <span className={styles.floor} />
          </div>

          <div className={styles.controls}>
            <div className={styles.readout}>
              <div>
                <span className={styles.big}>{inches}&Prime;</span>
                <span className={styles.small}>diagonal</span>
              </div>
              <div>
                <span className={styles.mid}>{Math.round(wCm)} × {Math.round(hCm)} cm</span>
                <span className={styles.small}>approx. screen area (16:9)</span>
              </div>
              <div>
                <span className={styles.mid}>{near.toFixed(1)}–{far.toFixed(1)} m</span>
                <span className={styles.small}>comfortable viewing for 4K content*</span>
              </div>
            </div>

            <label className={styles.sliderLabel} htmlFor="size-range">Screen size</label>
            <input
              id="size-range"
              type="range"
              min="32"
              max="110"
              step="1"
              value={inches}
              onChange={(e) => setInches(Number(e.target.value))}
              onPointerUp={() => track(EVENTS.PLANNER_CHANGE, { section: "size-visualiser", inches })}
              className={styles.range}
              style={{ "--p": `${((inches - 32) / (110 - 32)) * 100}%` }}
            />
            <div className="chip-group">
              {[43, 55, 65, 75, 86, 98].map((s) => (
                <button key={s} type="button" className="chip" aria-pressed={inches === s} onClick={() => setInches(s)}>
                  {s}&Prime;
                </button>
              ))}
            </div>

            <div className="chip-group" role="group" aria-label="Orientation">
              <button type="button" className="chip" aria-pressed={!portrait} onClick={() => setPortrait(false)}>Landscape</button>
              <button type="button" className="chip" aria-pressed={portrait} onClick={() => setPortrait(true)}>Portrait</button>
            </div>

            <Button href="/screens" icon="screen" event={EVENTS.SHOP_CTA} eventProps={{ section: "size-visualiser", inches }}>
              Find screens this size
            </Button>
            <p className={styles.note}>
              *General rule of thumb (about 1–1.5× the diagonal for 4K). Exact sizes and recommendations are confirmed per model in your quote.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
