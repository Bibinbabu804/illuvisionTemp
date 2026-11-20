"use client";

import { useMemo } from "react";
import CountUp from "@/components/motion/CountUp";
import Reveal from "@/components/ui/Reveal";
import { screenTypes } from "@/data/network";
import { howItWorks } from "@/data/planner";
import { extractDynamicAreas } from "@/lib/networkScreens";
import styles from "./NetworkStats.module.css";

/**
 * Network summary figures computed dynamically from live Advertising Screen
 * assets returned by GET /api/v1/public/marketplace/screens/map.
 */
export default function NetworkStats({ screens = [], isLoading = false }) {
  const stats = useMemo(() => {
    const cityCount = extractDynamicAreas(screens).length;
    const activeTypes = new Set(screens.map((s) => s.type).filter(Boolean)).size;
    return [
      { value: screens.length, label: "Screens on the network" },
      { value: cityCount, label: "Cities covered" },
      { value: activeTypes || screenTypes.length, label: "Screen formats" },
      { value: howItWorks.length, label: "Steps from brief to live" },
    ];
  }, [screens]);

  if (isLoading && screens.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <ul className={styles.row}>
        {stats.map((s, i) => (
          <Reveal as="li" key={s.label} delay={i * 90} className={styles.item}>
            <span className={styles.value}>
              <CountUp value={s.value} />
              {s.value > 0 && <i>+</i>}
            </span>
            <span className={styles.label}>{s.label}</span>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
