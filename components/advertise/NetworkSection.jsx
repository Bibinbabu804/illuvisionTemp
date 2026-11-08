"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import SectionHeader from "@/components/ui/SectionHeader";
import NetworkStats from "./NetworkStats";
import styles from "./NetworkSection.module.css";

const Skeleton = () => <div className={styles.skeleton} aria-label="Loading map" role="status" />;

// The map is only downloaded when the section approaches the viewport.
const NetworkMap = dynamic(() => import("./NetworkMap"), { ssr: false, loading: Skeleton });

export default function NetworkSection({ enquiryHref = "/advertise#enquiry", index }) {
  const ref = useRef(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className={`section ${styles.section}`} id="network" aria-labelledby="network-title" ref={ref}>
      <div className="container">
        <SectionHeader
          index={index}
          label="Screen network"
          id="network-title"
          lines={["Browse screens", "by location."]}
          lead="Filter by screen type and area, then pick a screen to add it to your enquiry. Availability is always confirmed by the Illuvision team."
        />
        {load ? <NetworkMap enquiryHref={enquiryHref} /> : <Skeleton />}
        <NetworkStats />
      </div>
    </section>
  );
}
