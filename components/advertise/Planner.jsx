"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import BtnIcon from "@/components/ui/BtnIcon";
import { currencies, durations, objectives, budgetSlider, plannerRules } from "@/data/planner";
import { areas, screens, screenTypes, isSample } from "@/data/network";
import { readPlanner, savePlanner } from "@/lib/plannerStore";
import { track, EVENTS } from "@/lib/analytics";
import { smoothScrollTo } from "@/components/motion/SmoothScroll";
import styles from "./Planner.module.css";

const initial = {
  budget: budgetSlider.initial,
  currency: "USD",
  duration: "1m",
  area: "any",
  types: [],
  objective: "awareness",
  startDate: "",
};

export function formatBudget(budget, currency) {
  const c = currencies.find((x) => x.code === currency);
  return `${c?.symbol ?? ""}${Number(budget || 0).toLocaleString("en")}`;
}

/**
 * Budget-first planner. With no approved rate rules (`plannerRules` is
 * null) it prepares an enquiry brief and never estimates reach, spend
 * allocation or availability.
 */
export default function Planner({ inPage = false, index }) {
  const router = useRouter();
  const id = useId();
  const [state, setState] = useState(initial);
  const hydrated = useRef(false);

  // Restore previous selections once on mount (sessionStorage is client-only).
  useEffect(() => {
    const saved = readPlanner();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from storage
      setState((s) => ({ ...s, ...pick(saved) }));
    }
    hydrated.current = true;
  }, []);

  const update = (patch, field) => {
    setState((s) => ({ ...s, ...patch }));
    if (field) track(EVENTS.PLANNER_CHANGE, { section: "planner", field });
  };

  const typeLabels = Object.fromEntries(screenTypes.map((t) => [t.id, t.label]));

  const matches = useMemo(
    () =>
      screens.filter(
        (s) =>
          (state.area === "any" || s.area === state.area) &&
          (state.types.length === 0 || state.types.includes(s.type))
      ),
    [state.area, state.types]
  );

  const budgetOk = Number(state.budget) > 0;

  const proceed = () => {
    savePlanner({ ...state, screens: readPlanner()?.screens });
    track(EVENTS.PLANNER_SUBMIT, {
      section: "planner",
      currency: state.currency,
      duration: state.duration,
      area: state.area,
      types: state.types.join(","),
    });
    if (inPage) {
      smoothScrollTo("#enquiry");
      document.getElementById("enquiry-name")?.focus({ preventScroll: true });
    } else {
      router.push("/advertise#enquiry");
    }
  };

  return (
    <section className={`section ${styles.section}`} id="planner" aria-labelledby={`${id}-title`}>
      <div className="container">
        <SectionHeader
          index={index}
          label="Campaign planner"
          id={`${id}-title`}
          lines={["Start with", "your budget."]}
          lead="Set your budget and preferences. We use your brief to find suitable screens and come back with confirmed options and pricing."
        />

        <Reveal className={styles.shell} variant="scale">
          <form className={styles.form} onSubmit={(e) => { e.preventDefault(); proceed(); }}>
            {/* Budget */}
            <fieldset className={styles.group}>
              <legend className={styles.legend}>
                <span>01</span> Budget
              </legend>
              <div className={styles.budgetRow}>
                <label className="visually-hidden" htmlFor={`${id}-cur`}>Currency</label>
                <select
                  id={`${id}-cur`}
                  className={`input ${styles.currency}`}
                  value={state.currency}
                  onChange={(e) => update({ currency: e.target.value }, "currency")}
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                <label className="visually-hidden" htmlFor={`${id}-budget`}>Total budget</label>
                <input
                  id={`${id}-budget`}
                  className={`input ${styles.budgetInput}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="50"
                  value={state.budget}
                  onChange={(e) => update({ budget: e.target.value === "" ? "" : Math.max(0, Number(e.target.value)) })}
                  onBlur={() => track(EVENTS.PLANNER_BUDGET, { section: "planner", currency: state.currency })}
                />
              </div>
              <input
                type="range"
                className={styles.range}
                min={budgetSlider.min}
                max={budgetSlider.max}
                step={budgetSlider.step}
                value={Math.min(Number(state.budget) || 0, budgetSlider.max)}
                style={{ "--p": `${(Math.min(Number(state.budget) || 0, budgetSlider.max) / budgetSlider.max) * 100}%` }}
                onChange={(e) => update({ budget: Number(e.target.value) })}
                onPointerUp={() => track(EVENTS.PLANNER_BUDGET, { section: "planner", currency: state.currency })}
                aria-label="Budget slider"
              />
              <div className={styles.rangeScale} aria-hidden="true">
                <span>{formatBudget(budgetSlider.min, state.currency)}</span>
                <span>{formatBudget(budgetSlider.max, state.currency)}+</span>
              </div>
            </fieldset>

            {/* Duration */}
            <fieldset className={styles.group}>
              <legend className={styles.legend}>
                <span>02</span> Campaign duration
              </legend>
              <div className={styles.options}>
                {durations.map((d) => (
                  <label key={d.id} className={styles.option}>
                    <input
                      type="radio"
                      name={`${id}-duration`}
                      value={d.id}
                      checked={state.duration === d.id}
                      onChange={() => update({ duration: d.id }, "duration")}
                    />
                    <span>{d.label}</span>
                  </label>
                ))}
              </div>
              <div className={`field ${styles.date}`}>
                <label htmlFor={`${id}-start`}>Preferred start date <span className="muted">(optional)</span></label>
                <input
                  id={`${id}-start`}
                  type="date"
                  className="input"
                  value={state.startDate}
                  onChange={(e) => update({ startDate: e.target.value }, "startDate")}
                />
              </div>
            </fieldset>

            {/* Location & screens */}
            <fieldset className={styles.group}>
              <legend className={styles.legend}>
                <span>03</span> Location & screens
              </legend>
              <div className="field">
                <label htmlFor={`${id}-area`}>Preferred area</label>
                <select
                  id={`${id}-area`}
                  className="input"
                  value={state.area}
                  onChange={(e) => update({ area: e.target.value }, "area")}
                >
                  <option value="any">Any area / not sure</option>
                  {areas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <p className={styles.subLabel}>Screen types</p>
              <div className={styles.options}>
                {screenTypes.map((t) => (
                  <label key={t.id} className={styles.option}>
                    <input
                      type="checkbox"
                      checked={state.types.includes(t.id)}
                      onChange={() =>
                        update(
                          { types: state.types.includes(t.id) ? state.types.filter((x) => x !== t.id) : [...state.types, t.id] },
                          "types"
                        )
                      }
                    />
                    <span>{t.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Objective */}
            <fieldset className={styles.group}>
              <legend className={styles.legend}>
                <span>04</span> Main objective
              </legend>
              <div className={styles.options}>
                {objectives.map((o) => (
                  <label key={o.id} className={styles.option}>
                    <input
                      type="radio"
                      name={`${id}-objective`}
                      value={o.id}
                      checked={state.objective === o.id}
                      onChange={() => update({ objective: o.id }, "objective")}
                    />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </form>

          {/* Live brief */}
          <aside className={styles.summary} aria-live="polite" aria-label="Your campaign brief">
            <p className={styles.summaryEyebrow}>Your campaign brief</p>
            <div className={styles.bigBudget} key={`${state.currency}-${state.budget}`}>
              {budgetOk ? formatBudget(state.budget, state.currency) : "—"}
            </div>
            <p className={styles.budgetCaption}>Total budget · {durations.find((d) => d.id === state.duration)?.label}</p>

            <dl className={styles.brief}>
              <div>
                <dt>Area</dt>
                <dd>{state.area === "any" ? "Any / to be advised" : state.area}</dd>
              </div>
              <div>
                <dt>Screens</dt>
                <dd>{state.types.length ? state.types.map((t) => typeLabels[t]).join(", ") : "Any type"}</dd>
              </div>
              <div>
                <dt>Objective</dt>
                <dd>{objectives.find((o) => o.id === state.objective)?.label}</dd>
              </div>
              {state.startDate && (
                <div>
                  <dt>Start</dt>
                  <dd>{new Date(`${state.startDate}T00:00`).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}</dd>
                </div>
              )}
            </dl>

            <div className={styles.matches}>
              <p className={styles.matchHead}>
                <strong key={matches.length}>{matches.length}</strong>
                {` ${isSample ? "sample " : ""}${matches.length === 1 ? "screen fits" : "screens fit"} these filters`}
              </p>
              {matches.length === 0 ? (
                <p className={styles.alt}>
                  No screens match. Try &ldquo;Any area&rdquo; or another screen type, or send the brief and we will suggest alternatives.
                </p>
              ) : (
                <ul className={styles.matchList}>
                  {matches.slice(0, 3).map((m) => (
                    <li key={m.id}>
                      <Icon name="pin" size={14} /> {m.name}
                      <span>{m.area.replace("Sample ", "")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!plannerRules && (
              <p className={styles.disclaimer}>
                <Icon name="info" size={16} />
                <span>
                  Rates are not published yet, so we do not estimate reach or allocation here.
                  Illuvision will confirm suitable screens, availability and pricing. Sending
                  this brief does not reserve a campaign.
                </span>
              </p>
            )}
            {!budgetOk && <p className={styles.warn}>Enter a budget to continue.</p>}

            <button type="button" className="btn btn--light btn--block" onClick={proceed} disabled={!budgetOk}>
              <BtnIcon name="arrow" />
              <span>Continue to enquiry</span>
            </button>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}

function pick(saved) {
  const keys = Object.keys(initial);
  return Object.fromEntries(Object.entries(saved).filter(([k]) => keys.includes(k)));
}
