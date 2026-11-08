import CountUp from "@/components/motion/CountUp";
import Reveal from "@/components/ui/Reveal";
import { screens, areas, screenTypes, isSample } from "@/data/network";
import { howItWorks } from "@/data/planner";
import styles from "./NetworkStats.module.css";

/**
 * Figures are computed from the network data, never typed in by hand.
 * While the data is sample data, the row says so. Replace or extend with
 * approved business statistics only.
 */
export default function NetworkStats() {
  const stats = [
    { value: screens.length, label: isSample ? "Sample screens on the map" : "Screens on the network" },
    { value: areas.length, label: isSample ? "Sample cities" : "Cities covered" },
    { value: screenTypes.length, label: "Screen formats" },
    { value: howItWorks.length, label: "Steps from brief to live" },
  ];
  return (
    <div className={styles.wrap}>
      <ul className={styles.row}>
        {stats.map((s, i) => (
          <Reveal as="li" key={s.label} delay={i * 90} className={styles.item}>
            <span className={styles.value}>
              <CountUp value={s.value} />
              <i>+</i>
            </span>
            <span className={styles.label}>{s.label}</span>
          </Reveal>
        ))}
      </ul>
      {isSample && <p className={styles.note}>Figures reflect the sample data shown above, not live Illuvision inventory.</p>}
    </div>
  );
}
