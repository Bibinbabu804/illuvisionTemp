"use client";

import { useMemo, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { EVENTS, track } from "@/lib/analytics";
import { normalizeVisualizerConfig } from "@/lib/visualizerConfig";
import styles from "./SizeVisualizer.module.css";

/**
 * Pick a format and a size to see it next to a person, with screen
 * dimensions and a general viewing-distance guide.
 *
 * Formats and commercially available sizes come dynamically from the
 * Marketplace backend API via Next.js ISR (normalized through a safe adapter
 * with versioned fallback on upstream failure). Screen dimensions are 16:9
 * geometry from the diagonal; the stands, panels and bases are drawn to an
 * approximate scale for illustration only, not product drawings.
 *
 * Everything is sized in real centimetres via container-query units
 * (1cm = 100cqh / 300, so the scene always shows 3 m of height). The person
 * stands at the left; each unit keeps its left edge fixed and grows to the
 * right as the size goes up.
 */
// The scene shows 3 m of height: keep in sync with --cm in the CSS module.
const PERSON_CM = 172;
const WALL_CENTER_CM = 150; // wall-mounted screens are centred at 1.5 m

const ENCLOSURE_PARTS = {
  "wall-mount": { below: 0, base: 0 },
  "a-frame": { below: 32, base: 0 },
  "half-glass": { below: 72, base: 6 },
  "full-glass": { below: 73, base: 5 },
};

const cm = (n) => `calc(var(--cm) * ${n.toFixed(2)})`;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export default function SizeVisualizer({ index, config }) {
  const normalized = useMemo(() => normalizeVisualizerConfig(config), [config]);
  const formats = normalized.formats;

  const initialFormat = formats.find((f) => f.id === normalized.defaultFormatId) || formats[0] || null;

  const [formatId, setFormatId] = useState(initialFormat?.id ?? "");
  const [inches, setInches] = useState(normalized.defaultSizeInches ?? initialFormat?.sizes?.[0] ?? 43);
  const [portrait, setPortrait] = useState(
    initialFormat ? initialFormat.defaultOrientation === "portrait" : false
  );

  // Explicit empty configuration from backend -> hide cleanly without showing stale fallback
  if (formats.length === 0) {
    return null;
  }

  const format = formats.find((f) => f.id === formatId) || formats[0];
  const enclosure = format.enclosureType;
  const isWall = enclosure === "wall-mount";
  const upright = portrait;
  const minIn = format.sizes[0];
  const maxIn = format.sizes[format.sizes.length - 1];
  const safeInches = clamp(inches, minIn, maxIn);

  // 16:9 screen geometry from the diagonal
  const diagCm = safeInches * 2.54;
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
  const parts = ENCLOSURE_PARTS[enclosure] || ENCLOSURE_PARTS["wall-mount"];
  const unitH = screenBoxH + parts.below + parts.base;
  const bottomCm = isWall ? Math.max(20, WALL_CENTER_CM - screenBoxH / 2) : 0;

  // general guide for 4K content: ~1–1.5× the diagonal
  const near = diagCm / 100;
  const far = (diagCm * 1.5) / 100;

  const chooseFormat = (id) => {
    const f = formats.find((x) => x.id === id);
    if (!f) return;
    setFormatId(id);
    const [lo, hi] = [f.sizes[0], f.sizes[f.sizes.length - 1]];
    setInches((cur) => clamp(cur, lo, hi));
    setPortrait(f.defaultOrientation === "portrait");
    track(EVENTS.PLANNER_CHANGE, { section: "size-visualiser", format: id });
  };

  // Guard against division by zero when a format has only a single commercial size
  const hasRange = maxIn > minIn;
  const pct = hasRange ? ((safeInches - minIn) / (maxIn - minIn)) * 100 : 100;
  const offered = format.sizes.includes(safeInches);

  return (
    <section
      className={`section ${styles.section}`}
      aria-labelledby="size-title"
      data-visualizer-source={normalized.source}
      data-visualizer-revision={normalized.revision}
    >
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
              data-format={enclosure}
              style={{ width: cm(unitW), height: cm(unitH), bottom: cm(bottomCm), "--bezel": cm(bezel) }}
            >
              {enclosure === "a-frame" && (
                <span className={styles.legs} style={{ height: cm(parts.below + screenBoxH * 0.6) }} />
              )}
              <div className={styles.screenBox} style={{ height: cm(screenBoxH) }}>
                <span
                  className={styles.content}
                  style={{ backgroundImage: `url(${format.content})` }}
                />
                <span className={styles.screenLabel}>{safeInches}&Prime;</span>
              </div>
              {enclosure === "half-glass" && <span className={styles.panel} style={{ height: cm(parts.below) }} />}
              {enclosure === "full-glass" && <span className={styles.glass} style={{ height: cm(parts.below) }} />}
              {parts.base > 0 && <span className={styles.base} style={{ height: cm(parts.base) }} />}
            </div>

            <span className={styles.floor} />
          </div>

          <div className={styles.controls}>
            <div className={styles.readout}>
              <div>
                <span className={styles.big}>{safeInches}&Prime;</span>
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
                <button key={f.id} type="button" className="chip" aria-pressed={format.id === f.id} onClick={() => chooseFormat(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
            <p className={styles.formatNote}>
              {`${format.sizes.join(" / ")} inch.${format.note ? ` ${format.note}` : ""}`}
            </p>

            <label className={styles.sliderLabel} htmlFor="size-range">Screen size</label>
            {hasRange && (
              <input
                id="size-range"
                type="range"
                min={minIn}
                max={maxIn}
                step="1"
                value={safeInches}
                onChange={(e) => setInches(Number(e.target.value))}
                onPointerUp={() => track(EVENTS.PLANNER_CHANGE, { section: "size-visualiser", format: format.id, inches: safeInches })}
                aria-valuetext={`${safeInches} inch`}
                className={styles.range}
                style={{ "--p": `${pct}%` }}
              />
            )}
            <div className="chip-group" role="group" aria-label="Screen size">
              {format.sizes.map((s) => (
                <button key={s} type="button" className="chip" aria-pressed={safeInches === s} onClick={() => setInches(s)}>
                  {s}&Prime;
                </button>
              ))}
            </div>

            {!offered && (
              <p className={styles.formatNote}>
                {safeInches}&Prime; is shown for comparison. The {format.label.toLowerCase()} comes in {format.sizes.join(", ")} inch.
              </p>
            )}

            <span className={styles.sliderLabel}>Orientation</span>
            <div className="chip-group" role="group" aria-label="Orientation">
              <button type="button" className="chip" aria-pressed={!portrait} onClick={() => setPortrait(false)}>Landscape</button>
              <button type="button" className="chip" aria-pressed={portrait} onClick={() => setPortrait(true)}>Portrait</button>
            </div>

            <Button
              href={format.productUrl}
              variant="accent"
              icon="screen"
              event={EVENTS.SHOP_CTA}
              eventProps={{ section: "size-visualiser", format: format.id, inches: safeInches }}
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
