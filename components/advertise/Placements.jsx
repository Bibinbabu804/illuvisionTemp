import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import { media } from "@/data/media";
import styles from "./Placements.module.css";

const RIBS = 16;

const placements = [
  { title: "Retail & malls", meta: ["Indoor", "High dwell time"], image: media.retailScreens, href: "#network" },
  { title: "Transit & airports", meta: ["Indoor", "Daily commuters"], image: media.airportAd, href: "#network" },
  { title: "Roadside & outdoor", meta: ["Outdoor", "Large format"], image: media.cityBillboards, href: "#network" },
  { title: "Food & hospitality", meta: ["Indoor", "At the counter"], image: media.menuBoard, href: "#network" },
];

const bg = (src) => {
  const u = new URL(src);
  // exact 2:3 crop, so every rib can map its slice precisely
  u.searchParams.set("w", "720");
  u.searchParams.set("h", "1080");
  u.searchParams.set("fit", "crop");
  u.searchParams.set("crop", "entropy");
  u.searchParams.set("q", "60");
  u.searchParams.set("auto", "format");
  return `url("${u}")`;
};

/**
 * "Where your ad runs" — four portrait panels behind reeded (fluted) glass.
 * Each rib paints a magnified slice of the photo (background-size/position
 * driven by one animatable --k) with its own shading; on hover / focus the
 * ribs relax and the glass clears. Pure CSS, no large GPU layers.
 */
export default function Placements({ index }) {
  return (
    <section className={`section section--dark ${styles.section}`} aria-labelledby="placements-title">
      <div className="container">
        <SectionHeader
          index={index}
          label="Where ads run"
          id="placements-title"
          lines={["Your brand,", <span key="m" className={styles.muted}>seen clearly.</span>]}
          lead="Hover a panel to clear the glass. Every campaign starts the same way: your budget, the areas you want, and screens confirmed in writing."
        />

        <ul className={styles.grid}>
          {placements.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 80}>
              <Link href={p.href} className={styles.panel} style={{ "--n": RIBS, "--img": bg(p.image.src) }}>
                <span className={styles.glass} aria-hidden="true">
                  {Array.from({ length: RIBS }, (_, r) => (
                    <span key={r} className={styles.rib} style={{ "--i": r }} />
                  ))}
                </span>
                <span className={styles.shade} aria-hidden="true" />
                <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.body}>
                  <span className={styles.title}>{p.title}</span>
                  <span className={styles.meta}>
                    {p.meta[0]}
                    <i aria-hidden="true" />
                    {p.meta[1]}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
