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
    q: "Where will the screen go?",
    options: [
      { id: "wall", label: "On a wall", hint: "Behind the counter or above a display", icon: "layers" },
      { id: "entrance", label: "At the entrance", hint: "By the door, facing people walking in", icon: "pin" },
      { id: "floor", label: "On the shop floor", hint: "Freestanding, beside what it promotes", icon: "screen" },
    ],
  },
  {
    id: "move",
    q: "Will you move it during the day?",
    options: [
      { id: "yes", label: "Yes, it folds away", hint: "Put out in the morning, in at closing", icon: "rotate" },
      { id: "no", label: "No, it stays put", hint: "A fixed spot in the space", icon: "pin" },
    ],
  },
  {
    id: "size",
    q: "How big should it be?",
    options: [
      { id: "compact", label: "Compact", hint: "32 inch", icon: "screen" },
      { id: "standard", label: "Standard", hint: "43 inch", icon: "ruler" },
      { id: "large", label: "Large", hint: "50 or 55 inch", icon: "grid" },
    ],
  },
];

/** Simple, transparent rules based on the formats and sizes in the brochure. */
function recommend({ where, move, size }) {
  if (where === "wall") return { main: "wall-mount", alt: "half-glass-standee", why: "A wall mount display saves floor space, and comes in 32, 43 and 55 inch." };
  if (move === "yes" && size !== "large") return { main: "a-frame-standee", alt: "half-glass-standee", why: "The A-frame standee folds away, which makes it perfect for entrances." };
  if (move === "yes") return { main: "half-glass-standee", alt: "a-frame-standee", why: "The A-frame comes in 32 and 43 inch. For 50 or 55 inch, a half-glass standee is the closest fit." };
  if (where === "entrance") return { main: "full-glass-standee", alt: "half-glass-standee", why: "A premium full-height glass front makes a strong first impression at the door." };
  return { main: "half-glass-standee", alt: "full-glass-standee", why: "A sleek standee with a solid lower panel sits well on a busy shop floor." };
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
                    <Image src={main.image.src} alt={main.image.alt} fill sizes="(max-width: 767px) 90vw, 40vw" quality={70} className={styles.cover} style={{ objectPosition: main.image.pos }} />
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
