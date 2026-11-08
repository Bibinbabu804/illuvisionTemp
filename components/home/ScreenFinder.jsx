"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { getCategory } from "@/data/catalog";
import { track, EVENTS } from "@/lib/analytics";
import styles from "./ScreenFinder.module.css";

const questions = [
  {
    id: "where",
    q: "Where will the screen live?",
    options: [
      { id: "indoor", label: "Indoors", hint: "Receptions, stores, offices", icon: "layers" },
      { id: "window", label: "Shop window", hint: "Facing the street through glass", icon: "sun" },
      { id: "outdoor", label: "Outdoors", hint: "Façades, forecourts, roadside", icon: "map" },
    ],
  },
  {
    id: "goal",
    q: "What should it do?",
    options: [
      { id: "promote", label: "Promote", hint: "Offers, ads and launches", icon: "spark" },
      { id: "inform", label: "Inform", hint: "Menus, prices, wayfinding", icon: "list" },
      { id: "collab", label: "Collaborate", hint: "Meetings, touch, training", icon: "hand" },
      { id: "wow", label: "Make a statement", hint: "Big, immersive visuals", icon: "bolt" },
    ],
  },
  {
    id: "size",
    q: "How big is the space?",
    options: [
      { id: "compact", label: "Compact", hint: "Counter, aisle or entrance", icon: "screen" },
      { id: "standard", label: "Standard", hint: "A typical wall or room", icon: "ruler" },
      { id: "large", label: "Large", hint: "Atrium, hall or façade", icon: "grid" },
    ],
  },
];

/** Simple, transparent rules: no data claims, just format guidance. */
function recommend({ where, goal, size }) {
  if (where === "outdoor") return { main: "outdoor-led", alt: "digital-standees", why: "Outdoor viewing needs weather-rated, very bright LED." };
  if (goal === "collab") return { main: "interactive-panels", alt: "indoor-displays", why: "Touch-ready panels are built for meetings and self-service." };
  if (goal === "inform" && where === "indoor") return { main: "menu-boards", alt: "indoor-displays", why: "Counter and overhead boards keep menus and prices easy to update." };
  if (goal === "wow" || size === "large") return { main: "led-video-walls", alt: "indoor-displays", why: "Modular LED scales to any size for a seamless statement wall." };
  if (goal === "promote" && size === "compact") return { main: "digital-standees", alt: "indoor-displays", why: "A freestanding portrait screen catches people at eye level." };
  if (where === "window") return { main: "indoor-displays", alt: "digital-standees", why: "Ask about high-brightness models so content stays clear through glass." };
  return { main: "indoor-displays", alt: "digital-standees", why: "A wall-mounted commercial display suits most indoor spaces." };
}

const ease = [0.16, 1, 0.3, 1];

export default function ScreenFinder({ index }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [dir, setDir] = useState(1);
  const done = step >= questions.length;
  const result = done ? recommend(answers) : null;

  const choose = (qid, oid) => {
    const next = { ...answers, [qid]: oid };
    setAnswers(next);
    setDir(1);
    setStep((s) => s + 1);
    track(EVENTS.PLANNER_CHANGE, { section: "screen-finder", question: qid, answer: oid });
    if (step + 1 >= questions.length) {
      track(EVENTS.SHOP_CTA, { section: "screen-finder", result: recommend(next).main });
    }
  };

  const back = () => {
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
  };
  const restart = () => {
    setDir(-1);
    setAnswers({});
    setStep(0);
  };

  const main = result && getCategory(result.main);
  const alt = result && getCategory(result.alt);

  return (
    <section className="section" aria-labelledby="finder-title">
      <div className="container">
        <SectionHeader
          index={index}
          label="Screen finder"
          id="finder-title"
          lines={["Not sure which screen?", "Answer three questions."]}
          lead="Tell us about your space and goal, and we will point you to the format that fits best."
        />

        <div className={styles.card}>
          {/* progress */}
          <div className={styles.progress} aria-hidden="true">
            {questions.map((q, i) => (
              <span key={q.id} data-on={i < step || done} />
            ))}
          </div>

          <div className={styles.stage}>
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              {!done ? (
                <motion.div
                  key={step}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -60 }}
                  transition={{ duration: 0.5, ease }}
                >
                  <p className={styles.count}>Question {step + 1} of {questions.length}</p>
                  <h3 className={styles.q}>{questions[step].q}</h3>
                  <div className={styles.options} role="group" aria-label={questions[step].q}>
                    {questions[step].options.map((o, i) => (
                      <motion.button
                        key={o.id}
                        type="button"
                        className={styles.option}
                        data-picked={answers[questions[step].id] === o.id}
                        onClick={() => choose(questions[step].id, o.id)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + i * 0.06, duration: 0.5, ease }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span className={styles.optIcon}><Icon name={o.icon} size={26} strokeWidth={1.5} /></span>
                        <strong>{o.label}</strong>
                        <span>{o.hint}</span>
                      </motion.button>
                    ))}
                  </div>
                  {step > 0 && (
                    <button type="button" className={`text-link ${styles.back}`} onClick={back}>
                      <Icon name="chevronLeft" size={16} /> Back
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  className={styles.result}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease }}
                  aria-live="polite"
                >
                  <motion.div
                    className={styles.resultMedia}
                    initial={{ clipPath: "inset(0 100% 0 0 round 20px)" }}
                    animate={{ clipPath: "inset(0 0% 0 0 round 20px)" }}
                    transition={{ duration: 1, ease }}
                  >
                    <Image src={main.image.src} alt={main.image.alt} fill sizes="(max-width: 767px) 90vw, 40vw" quality={70} className={styles.cover} />
                  </motion.div>
                  <div className={styles.resultCopy}>
                    <p className={styles.count}>Our suggestion</p>
                    <h3 className={styles.q}>{main.name}</h3>
                    <p className={styles.why}>{result.why}</p>
                    <p className={styles.alt}>
                      Also worth a look: <Link href={`/screens?category=${alt.slug}`}>{alt.name}</Link>
                    </p>
                    <div className={styles.ctas}>
                      <Button href={`/screens?category=${main.slug}`} icon="screen" event={EVENTS.SHOP_CTA} eventProps={{ section: "screen-finder-result", category: main.slug }}>
                        View {main.name.toLowerCase()}
                      </Button>
                      <button type="button" className={`text-link ${styles.back}`} onClick={restart}>
                        <Icon name="rotate" size={16} /> Start over
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
