"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import { Kicker } from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import LazyVideo from "@/components/motion/LazyVideo";
import { media, videos } from "@/data/media";
import { EVENTS } from "@/lib/analytics";
import { smoothScrollTo } from "@/components/motion/SmoothScroll";
import styles from "./BuyingStory.module.css";

/**
 * Scroll-told story of buying a screen. The section pins; as you scroll,
 * one "screen" morphs between form factors (wall display → standee →
 * LED wall → quote → live) while the copy for each chapter swaps in.
 * Shapes are % of the stage so they work at every viewport size.
 */
const steps = [
  {
    title: "Start with your space",
    body: "A reception wall, a shop window, a street corner. Tell us where the screen will live and who will see it.",
    tags: ["Room size", "Viewing distance", "Light levels"],
    shape: { width: "86%", height: "58%", radius: 18 },
    stand: "wall",
    glow: "rgba(124, 196, 255, 0.35)",
    media: { image: media.receptionScreen },
  },
  {
    title: "Choose your format",
    body: "Wall displays, LED walls, standees or outdoor LED. We help you match the format to the space and the message.",
    tags: ["Indoor", "LED wall", "Standee", "Outdoor"],
    shape: { width: "36%", height: "86%", radius: 22 },
    stand: "floor",
    glow: "rgba(217, 164, 255, 0.35)",
    media: { image: media.standeeInStore },
  },
  {
    title: "See it at full scale",
    body: "Big, bright content changes how a space feels. Picture your brand at the size people will actually see it.",
    tags: ["Brightness", "Resolution", "Scale"],
    shape: { width: "98%", height: "46%", radius: 10 },
    stand: "none",
    glow: "rgba(255, 181, 71, 0.32)",
    media: { video: videos.heroCity },
  },
  {
    title: "Get a confirmed quote",
    body: "Model, specification, delivery and support, confirmed in writing before you commit to anything.",
    tags: ["No obligation", "Specs in writing"],
    shape: { width: "64%", height: "74%", radius: 26 },
    stand: "none",
    glow: "rgba(61, 220, 79, 0.32)",
    media: { quote: true },
  },
  {
    title: "Switch it on",
    body: "Your content goes live. Want your screen to earn as well? Ask about Illuvision's advertising network.",
    tags: ["Your content", "Optional: advertising"],
    shape: { width: "90%", height: "62%", radius: 18 },
    stand: "wall",
    glow: "rgba(61, 220, 79, 0.5)",
    media: { video: videos.reelDream },
    cta: true,
  },
];

const ease = [0.16, 1, 0.3, 1];

export default function BuyingStory({ index }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(steps.length - 1, Math.max(0, Math.floor(p * steps.length)));
    if (i !== active) setActive(i);
  });

  const step = steps[active];
  const goTo = (i) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    smoothScrollTo(top + (span * (i + 0.5)) / steps.length, { offset: 0 });
  };

  const tilt = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [6, -6]);

  return (
    <section ref={ref} className={styles.section} style={{ height: `${steps.length * 100}vh` }} aria-labelledby="story-title">
      <div className={styles.sticky}>
        <motion.span
          className={styles.ambient}
          animate={{ background: `radial-gradient(60% 60% at 70% 50%, ${step.glow}, transparent 70%)` }}
          transition={{ duration: 1.2, ease }}
          aria-hidden="true"
        />

        <div className={`container on-dark ${styles.grid}`}>
          {/* ---------- copy ---------- */}
          <div className={styles.copy}>
            <Kicker index={index}>How buying works</Kicker>
            <h2 id="story-title" className="visually-hidden">How buying a screen from Illuvision works</h2>

            <div className={styles.counter} aria-hidden="true">
              <span className={styles.counterNum}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={active}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.6, ease }}
                  >
                    {String(active + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className={styles.counterTotal}>/ {String(steps.length).padStart(2, "0")}</span>
            </div>

            <div className={styles.textStage}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
                  transition={{ duration: 0.55, ease }}
                >
                  <h3 className={styles.title}>{step.title}</h3>
                  <p className={styles.body}>{step.body}</p>
                  <ul className={styles.tags}>
                    {step.tags.map((t, i) => (
                      <motion.li
                        key={t}
                        className="badge badge--outline"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease }}
                      >
                        {t}
                      </motion.li>
                    ))}
                  </ul>
                  {step.cta && (
                    <div className={styles.ctas}>
                      <Button href="/screens" variant="light" icon="screen" event={EVENTS.SHOP_CTA} eventProps={{ section: "story" }}>
                        Explore screens
                      </Button>
                      <Button href="/advertise" variant="outline-inv" event={EVENTS.AD_CTA} eventProps={{ section: "story" }}>
                        Advertising network
                      </Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* progress rail */}
            <ol className={styles.rail} aria-label="Story chapters">
              {steps.map((s, i) => (
                <RailItem key={s.title} i={i} n={steps.length} progress={scrollYProgress} active={i === active} label={s.title} onClick={() => goTo(i)} />
              ))}
            </ol>
          </div>

          {/* ---------- morphing screen ---------- */}
          <div className={styles.stage}>
            <motion.div className={styles.tiltWrap} style={{ rotateY: tilt }}>
              <motion.div
                className={styles.device}
                animate={{ width: step.shape.width, height: step.shape.height, borderRadius: step.shape.radius }}
                transition={{ duration: reduce ? 0 : 0.9, ease }}
              >
                <AnimatePresence initial={false}>
                  <motion.div
                    key={active}
                    className={styles.screen}
                    initial={{ opacity: 0, scale: 1.15 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.8, ease }}
                  >
                    <ScreenContent media={step.media} />
                  </motion.div>
                </AnimatePresence>
                <span className={styles.glare} aria-hidden="true" />
              </motion.div>

              <motion.span
                className={styles.stand}
                data-stand={step.stand}
                animate={{ opacity: step.stand === "floor" ? 1 : 0, scaleY: step.stand === "floor" ? 1 : 0 }}
                transition={{ duration: 0.6, ease }}
                aria-hidden="true"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RailItem({ i, n, progress, active, label, onClick }) {
  const fill = useTransform(progress, [i / n, (i + 1) / n], [0, 1]);
  return (
    <li>
      <button type="button" className={styles.railBtn} data-active={active} onClick={onClick} aria-label={`Chapter ${i + 1}: ${label}`} aria-current={active ? "step" : undefined}>
        <span className={styles.railTrack}>
          <motion.span style={{ scaleX: fill }} />
        </span>
      </button>
    </li>
  );
}

function ScreenContent({ media: m }) {
  if (m.image) {
    return <Image src={m.image.src} alt={m.image.alt} fill sizes="(max-width: 1023px) 90vw, 50vw" quality={70} className={styles.cover} />;
  }
  if (m.video) {
    return <LazyVideo src={m.video.src} poster={m.video.poster} className={styles.cover} />;
  }
  // In-screen UI for the quote chapter (illustrative layout, no real data)
  return (
    <div className={styles.quote}>
      <div className={styles.quoteHead}>
        <span className={styles.quoteLogo}>Quote request</span>
        <span className={styles.quoteBadge}>
          <Icon name="check" size={14} strokeWidth={2.6} /> Ready to confirm
        </span>
      </div>
      {["Model & size", "Specifications", "Delivery location", "Support & warranty"].map((row, i) => (
        <motion.div
          key={row}
          className={styles.quoteRow}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 + i * 0.12, duration: 0.5, ease }}
        >
          <span>{row}</span>
          <span className={styles.quoteVal}>
            <Icon name="check" size={14} strokeWidth={2.6} /> Confirmed in your quote
          </span>
        </motion.div>
      ))}
      <motion.div
        className={styles.quoteBar}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.9, duration: 1.2, ease }}
      />
    </div>
  );
}
