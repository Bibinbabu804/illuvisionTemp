"use client";

import { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { EVENTS, track } from "@/lib/analytics";
import styles from "./SizeVisualizer.module.css";

/**
 * Pick a format and a size to see it next to a person, with screen
 * dimensions and a general viewing-distance guide.
 *
 * Formats and sizes follow the customer brochure. Screen dimensions are
 * 16:9 geometry from the diagonal; the stands, panels and bases are drawn
 * to an approximate scale for illustration only, not product drawings.
 *
 * Everything is sized in real centimetres via container-query units
 * (1cm = 100cqh / 300, so the scene always shows 3 m of height). The person
 * stands at the left; each unit keeps its left edge fixed and grows to the
 * right as the size goes up.
 */
// The scene shows 3 m of height: keep in sync with --cm in the CSS module.
const PERSON_CM = 172;
const WALL_CENTER_CM = 150; // wall-mounted screens are centred at 1.5 m

/** On-screen artwork cropped from the customer brochure photos. */
const screenArt = (name) => `/images/products/screen-${name}.webp`;

const formats = [
  {
    id: "wall-mount",
    label: "Wall mount",
    sizes: [32, 43, 55],
    note: "Saves floor space.",
    product: "wall-mount-display",
    content: screenArt("wall-mount"),
  },
  {
    id: "a-frame",
    label: "A-frame standee",
    sizes: [32, 43],
    note: "Folds away, perfect for entrances.",
    product: "a-frame-standee",
    content: screenArt("a-frame"),
  },
  {
    id: "half-glass",
    label: "Half-glass standee",
    sizes: [32, 43, 50, 55],
    note: "Sleek, with a solid lower panel.",
    product: "half-glass-standee",
    content: screenArt("half-glass"),
  },
  {
    id: "full-glass",
    label: "Full-glass standee",
    sizes: [32, 43, 50, 55],
    note: "Premium full-height glass front.",
    product: "full-glass-standee",
    content: screenArt("full-glass"),
  },
];

const cm = (n) => `calc(var(--cm) * ${n.toFixed(2)})`;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export default function SizeVisualizer({ index }) {
  const [formatId, setFormatId] = useState("wall-mount");
  const [inches, setInches] = useState(43);
  const [portrait, setPortrait] = useState(false);

  const format = formats.find((f) => f.id === formatId);
  const isWall = format.id === "wall-mount";
  const upright = portrait;
  const [minIn, maxIn] = [format.sizes[0], format.sizes[format.sizes.length - 1]];

  // 16:9 screen geometry from the diagonal
  const diagCm = inches * 2.54;
  const longCm = diagCm * (16 / Math.hypot(16, 9));
  const shortCm = diagCm * (9 / Math.hypot(16, 9));
  const wCm = upright ? shortCm : longCm;
  const hCm = upright ? longCm : shortCm;

  // Enclosures use typical proportions for these product types (not product
  // drawings): floor standees put the bottom of the screen about 78 cm off
  // the floor, so a 43" kiosk stands ~1.8 m and a 55" ~2 m tall; an A-frame
  // lifts the screen about 32 cm.
  const bezel = isWall ? 1.5 : 3;
  const unitW = wCm + bezel * 2;
  const screenBoxH = hCm + bezel * 2;
  const parts = {
    "wall-mount": { below: 0, base: 0 },
    "a-frame": { below: 32, base: 0 },
    "half-glass": { below: 72, base: 6 },
    "full-glass": { below: 73, base: 5 },
  }[format.id];
  const unitH = screenBoxH + parts.below + parts.base;
  const bottomCm = isWall ? Math.max(20, WALL_CENTER_CM - screenBoxH / 2) : 0;

  // general guide for 4K content: ~1–1.5× the diagonal
  const near = diagCm / 100;
  const far = (diagCm * 1.5) / 100;

  const chooseFormat = (id) => {
    const f = formats.find((x) => x.id === id);
    setFormatId(id);
    const [lo, hi] = [f.sizes[0], f.sizes[f.sizes.length - 1]];
    setInches((cur) => clamp(cur, lo, hi));
    // wall mount usually hangs landscape, standees stand portrait
    setPortrait(id !== "wall-mount");
    track(EVENTS.PLANNER_CHANGE, { section: "size-visualiser", format: id });
  };

  const pct = ((inches - minIn) / (maxIn - minIn)) * 100;
  const offered = format.sizes.includes(inches);

  return (
    <section className={`section ${styles.section}`} aria-labelledby="size-title">
      <div className="container">
        <SectionHeader
          index={index}
          label="Size visualiser"
          id="size-title"
          lines={["See the size", "before you buy."]}
          lead="Choose a format and a size to compare it against a person, and get a general guide to comfortable viewing distance."
        />

        <div className={styles.card}>
          <div className={styles.scene} aria-hidden="true">
            {isWall && <span className={styles.wallLine} style={{ bottom: cm(WALL_CENTER_CM) }} />}

            <svg className={styles.person} style={{ height: cm(PERSON_CM) }} viewBox="0 0 60 172">
              <circle cx="30" cy="13" r="11" />
              <path d="M18 30h24a8 8 0 0 1 8 8v52h-9v78h-10V112h-2v56H19V90h-9V38a8 8 0 0 1 8-8Z" />
            </svg>
            <span className={styles.personLabel} style={{ bottom: cm(PERSON_CM + 6) }}>1.72 m</span>

            <div
              className={styles.unit}
              data-format={format.id}
              style={{ width: cm(unitW), height: cm(unitH), bottom: cm(bottomCm), "--bezel": cm(bezel) }}
            >
              {format.id === "a-frame" && (
                <span className={styles.legs} style={{ height: cm(parts.below + screenBoxH * 0.6) }} />
              )}
              <div className={styles.screenBox} style={{ height: cm(screenBoxH) }}>
                <span
                  className={styles.content}
                  style={{ backgroundImage: `url(${format.content})` }}
                />
                <span className={styles.screenLabel}>{inches}&Prime;</span>
              </div>
              {format.id === "half-glass" && <span className={styles.panel} style={{ height: cm(parts.below) }} />}
              {format.id === "full-glass" && <span className={styles.glass} style={{ height: cm(parts.below) }} />}
              {parts.base > 0 && <span className={styles.base} style={{ height: cm(parts.base) }} />}
            </div>

            <span className={styles.floor} />
          </div>

          <div className={styles.controls}>
            <div className={styles.readout}>
              <div>
                <span className={styles.big}>{inches}&Prime;</span>
                <span className={styles.small}>{format.label} · diagonal</span>
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

            <span className={styles.sliderLabel}>Format</span>
            <div className="chip-group" role="group" aria-label="Format">
              {formats.map((f) => (
                <button key={f.id} type="button" className="chip" aria-pressed={formatId === f.id} onClick={() => chooseFormat(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
            <p className={styles.formatNote}>
              {`${format.sizes.join(" / ")} inch. ${format.note}`}
            </p>

            <label className={styles.sliderLabel} htmlFor="size-range">Screen size</label>
            <input
              id="size-range"
              type="range"
              min={minIn}
              max={maxIn}
              step="1"
              value={inches}
              onChange={(e) => setInches(Number(e.target.value))}
              onPointerUp={() => track(EVENTS.PLANNER_CHANGE, { section: "size-visualiser", format: format.id, inches })}
              aria-valuetext={`${inches} inch`}
              className={styles.range}
              style={{ "--p": `${pct}%` }}
            />
            <div className="chip-group" role="group" aria-label="Screen size">
              {format.sizes.map((s) => (
                <button key={s} type="button" className="chip" aria-pressed={inches === s} onClick={() => setInches(s)}>
                  {s}&Prime;
                </button>
              ))}
            </div>

            {!offered && (
              <p className={styles.formatNote}>
                {inches}&Prime; is shown for comparison. The {format.label.toLowerCase()} comes in {format.sizes.join(", ")} inch.
              </p>
            )}

            <span className={styles.sliderLabel}>Orientation</span>
            <div className="chip-group" role="group" aria-label="Orientation">
              <button type="button" className="chip" aria-pressed={!portrait} onClick={() => setPortrait(false)}>Landscape</button>
              <button type="button" className="chip" aria-pressed={portrait} onClick={() => setPortrait(true)}>Portrait</button>
            </div>

            <Button
              href={`/screens/${format.product}#prices`}
              variant="accent"
              icon="screen"
              event={EVENTS.SHOP_CTA}
              eventProps={{ section: "size-visualiser", format: format.id, inches }}
            >
              {`See ${format.label.toLowerCase()} prices`}
            </Button>
            <p className={styles.note}>
              *General rule of thumb (about 1–1.5× the diagonal for 4K). The person and screens are to scale;
              stands and panels use typical proportions, and exact dimensions are confirmed in your quote.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
