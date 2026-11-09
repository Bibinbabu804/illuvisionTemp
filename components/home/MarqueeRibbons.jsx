import VelocityMarquee from "@/components/motion/VelocityMarquee";
import styles from "./MarqueeRibbons.module.css";

/**
 * Two crossing marquee ribbons on a dark band.
 * - default: sits straight after the (dark) scroll film on the home page,
 *   rounded at the bottom only.
 * - `panel`: a standalone rounded dark panel for light pages (e.g. /screens).
 */
export default function MarqueeRibbons({ items, panel = false }) {
  const mid = Math.ceil(items.length / 2);
  return (
    <div className={`${styles.band} ${panel ? styles.panel : ""}`} aria-hidden="true">
      <div className={styles.ribbons}>
        <VelocityMarquee items={items.slice(0, mid)} dark className={`${styles.ribbon} ${styles.back}`} />
        <VelocityMarquee items={items.slice(mid)} baseVelocity={2.2} green className={`${styles.ribbon} ${styles.front}`} />
      </div>
    </div>
  );
}
