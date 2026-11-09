"use client";

import Image from "next/image";
import ScrollStory from "@/components/motion/ScrollStory";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import LazyVideo from "@/components/motion/LazyVideo";
import { storyMedia, videos } from "@/data/media";
import { EVENTS } from "@/lib/analytics";
import styles from "./AdStory.module.css";

const steps = [
  {
    title: "Start with a brief",
    body: "Tell us your budget, the areas you want to reach and when you want to run. That's all we need to start.",
  },
  {
    title: "Pick where it plays",
    body: "Retail floors, transit hubs, roadside and food counters. Choose the kinds of places your audience passes every day.",
  },
  {
    title: "Set when it runs",
    body: "Choose your dates and the parts of the day that matter: the morning commute, the lunch rush or evening footfall.",
  },
  {
    title: "Approve, then go live",
    body: "We confirm the screens, schedule, creative specs and terms in writing. Nothing runs until you approve it.",
  },
  {
    title: "Seen across the city",
    body: "One campaign, many screens. Your message plays wherever you chose, and the next campaign starts from the same simple brief.",
    extra: (
      <Button href="#planner" variant="light" event={EVENTS.AD_CTA} eventProps={{ section: "ad-story" }}>
        Plan my campaign
      </Button>
    ),
  },
];

const places = [
  { label: "Retail", icon: "screen" },
  { label: "Transit", icon: "map" },
  { label: "Roadside", icon: "bolt" },
  { label: "Food", icon: "grid" },
];

const slots = ["06", "09", "12", "15", "18", "21", "24"];

/**
 * /advertise scroll story: one billboard screen follows a campaign from
 * brief → places → schedule → on air → a wall of screens.
 */
export default function AdStory() {
  return (
    <ScrollStory
      id="how-it-works"
      headingId="adstory-title"
      kicker="How advertising works"
      heading={<>From brief to <em>big screen.</em></>}
      steps={steps}
      footnote="All campaigns are subject to confirmation of availability and commercial terms by Illuvision."
      renderStage={(active) => (
      <div className={styles.stage} data-step={active}>
        {/* wall of screens (step 5) */}
        <div className={styles.wall}>
          {storyMedia.adWall.map((img, i) => (
            <span key={img.src} className={styles.mini} style={{ "--i": i }}>
              <Image src={img.src} alt="" fill sizes="220px" quality={55} className={styles.cover} />
            </span>
          ))}
        </div>

        <div className={styles.screen}>
          <span className={styles.pixels} />

          {/* 1 brief */}
          <div className={`${styles.layer} ${styles.brand}`}>
            <span>YOUR BRAND</span>
            <i className={styles.caret} />
          </div>

          {/* 2 places: map grid with pins */}
          <div className={`${styles.layer} ${styles.map}`}>
            {[[22, 30], [64, 24], [40, 62], [78, 66], [14, 74], [55, 44]].map(([x, y], k) => (
              <span key={k} className={styles.pin} style={{ left: `${x}%`, top: `${y}%`, "--k": k }} />
            ))}
          </div>

          {/* 3 schedule */}
          <div className={`${styles.layer} ${styles.clock}`}>
            <span className={styles.clockLabel}>Schedule</span>
            <span className={styles.clockBig}>Mon – Sun</span>
          </div>

          {/* 4 live */}
          <div className={`${styles.layer} ${styles.live}`}>
            <LazyVideo src={videos.reelRetro.src} poster={videos.reelRetro.poster} className={styles.cover} />
            <span className={styles.onAir}>On air</span>
          </div>
        </div>

        {/* brief card (step 1) */}
        <div className={styles.brief}>
          {["Budget", "Areas", "Dates"].map((t, k) => (
            <span key={t} style={{ "--k": k }}>
              <Icon name="check" size={14} />
              {t}
            </span>
          ))}
        </div>

        {/* place chips (step 2) */}
        <div className={styles.places}>
          {places.map((p, k) => (
            <span key={p.label} className={styles.place} style={{ "--k": k }}>
              <Icon name={p.icon} size={16} />
              {p.label}
            </span>
          ))}
        </div>

        {/* timeline (step 3) */}
        <div className={styles.timeline}>
          <div className={styles.slots}>
            {slots.slice(0, -1).map((s, k) => (
              <span key={s} style={{ "--k": k }} data-pick={k === 1 || k === 2 || k === 4 || k === 5} />
            ))}
          </div>
          <div className={styles.hours}>
            {slots.map((s) => (
              <span key={s}>{s}:00</span>
            ))}
          </div>
        </div>
      </div>
      )}
    />
  );
}
