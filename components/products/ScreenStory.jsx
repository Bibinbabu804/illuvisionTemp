"use client";

import Image from "next/image";
import ScrollStory from "@/components/motion/ScrollStory";
import Button from "@/components/ui/Button";
import LazyVideo from "@/components/motion/LazyVideo";
import { media, storyMedia, videos } from "@/data/media";
import { EVENTS } from "@/lib/analytics";
import styles from "./ScreenStory.module.css";

const steps = [
  {
    title: "It starts with a pixel",
    body: "Every screen is built from tiny red, green and blue lights. How closely they sit together decides how sharp the picture looks up close.",
  },
  {
    title: "Thousands make a panel",
    body: "Pixels are packed into panels. Pixel pitch, brightness and refresh rate decide where a panel works best: indoors, outdoors or at eye level.",
  },
  {
    title: "Panels make a wall",
    body: "Panels lock together into the size you need, from a single display to a building-wide LED wall.",
  },
  {
    title: "Built for your space",
    body: "Wall-mounted, freestanding or outdoor. We match the format and size to the room and to how far away people will stand.",
  },
  {
    title: "Switch it on",
    body: "Your content, big and bright. Browse the range and request a quote with confirmed specifications.",
    extra: (
      <Button href="#browse" variant="light" icon="screen" event={EVENTS.SHOP_CTA} eventProps={{ section: "screen-story" }}>
        Browse screens
      </Button>
    ),
  },
];

// where each wall tile flies in from (x%, y%, deg)
const FROM = [
  [-60, -50, -14], [0, -80, 8], [60, -50, 12],
  [-80, 0, 10], [0, 0, 0], [80, 0, -10],
  [-60, 50, 12], [0, 80, -8], [60, 50, -12],
];

/**
 * /screens scroll story: zoom out from a single RGB pixel → a panel →
 * a wall of panels → mounted in a real space → switched on.
 */
export default function ScreenStory() {
  return (
    <ScrollStory
      id="screen-story"
      headingId="screen-story-title"
      kicker="How a screen comes together"
      heading={<>From pixel <em>to wall.</em></>}
      steps={steps}
      renderStage={(active) => (
        <div className={styles.stage} data-step={active}>
          {/* room (steps 4–5) */}
          <div className={styles.room}>
            <Image src={media.receptionScreen.src} alt="" fill sizes="(max-width: 1023px) 100vw, 640px" quality={60} className={styles.cover} />
          </div>

          {/* 1: a single RGB pixel */}
          <div className={styles.pixel}>
            <span />
            <span />
            <span />
          </div>

          {/* 2: a panel */}
          <div className={styles.panel}>
            <Image src={storyMedia.ledMacroBlue.src} alt="" fill sizes="400px" quality={60} className={styles.cover} />
            <span className={styles.dots} />
          </div>

          {/* 3–5: wall of panels */}
          <div className={styles.wall}>
            {FROM.map(([x, y, r], i) => (
              <span key={i} className={styles.tile} style={{ "--x": `${x}%`, "--y": `${y}%`, "--r": `${r}deg`, "--i": i }} />
            ))}
            <div className={styles.on}>
              <LazyVideo src={videos.heroCity.src} poster={videos.heroCity.poster} className={styles.cover} />
            </div>
          </div>

          <span className={styles.caption}>
            {["RGB pixel", "LED panel", "Video wall", "In your space", "Live"][active]}
          </span>
        </div>
      )}
    />
  );
}
