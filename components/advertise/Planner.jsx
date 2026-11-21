"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import BtnIcon from "@/components/ui/BtnIcon";
import LocationSearchSelect from "./LocationSearchSelect";
import CampaignRecommendationModal from "./CampaignRecommendationModal";
import { currencies as fallbackCurrencies, durations, objectives, budgetSlider, plannerRules } from "@/data/planner";
import { readPlanner, savePlanner } from "@/lib/plannerStore";
import {
  useCurrencyContext,
  useSupportedCurrencies,
  useCampaignScreenTypes,
} from "@/services/api/planner/planner.queries";
import { track, EVENTS } from "@/lib/analytics";
import { smoothScrollTo } from "@/components/motion/SmoothScroll";
import styles from "./Planner.module.css";

const DEFAULT_CURRENCY = "INR";

const initial = {
  budget: "",
  currency: DEFAULT_CURRENCY,
  duration: "1m",
  area: "any",
  location: null,
  locations: [],
  types: [],
  typeLabels: {},
  objective: "awareness",
  startDate: "",
};

export function formatBudget(budget, currency, currencyList = fallbackCurrencies) {
  const c = currencyList.find((x) => x.code === currency) || fallbackCurrencies.find((x) => x.code === currency);
  const symbol = c?.symbol ?? `${currency} `;
  return `${symbol}${Number(budget || 0).toLocaleString(c?.locale || "en")}`;
}

/**
 * Resolve effective currency respecting strict priority:
 * 1. Manual user override
 * 2. Saved session currency
 * 3. IP-detected currency
 * 4. Application fallback
 */
export function resolvePreferredCurrency({
  manualCurrency,
  savedCurrency,
  detectedCurrency,
  fallback = DEFAULT_CURRENCY,
}) {
  if (manualCurrency) return manualCurrency;
  if (savedCurrency) return savedCurrency;
  if (detectedCurrency) return detectedCurrency;
  return fallback;
}

/**
 * Budget-first Campaign Planner with:
 * 1. IP-based currency detection & optional budget input
 * 2. Keyboard Enter + Next section progression
 * 3. Dynamic hierarchical Location search
 * 4. Dynamic Advertising Screen types (Fixed + Mobile/Transit)
 */
export default function Planner({ inPage = false, index, headingAs = "h2", lead = false }) {
  const router = useRouter();
  const id = useId();
  const [state, setState] = useState(initial);
  const [budgetError, setBudgetError] = useState("");
  const [prunedNotice, setPrunedNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const manualCurrencyRef = useRef(null);
  const savedCurrencyRef = useRef(null);
  const sectionRefs = useRef([]);
  const lastAdvanceRef = useRef(0);

  const selectedCityIds = useMemo(
    () =>
      (state.locations || [])
        .map((loc) => Number(loc.city_id ?? loc.id))
        .filter((n) => n > 0),
    [state.locations]
  );

  const { data: currencyContext } = useCurrencyContext();
  const { data: backendCurrencies } = useSupportedCurrencies();
  const {
    data: screenTypesData,
    isLoading: screenTypesLoading,
    isFetching: screenTypesFetching,
    isPlaceholderData: screenTypesPlaceholder,
    isError: screenTypesError,
  } = useCampaignScreenTypes(selectedCityIds);

  const availableCurrencies = useMemo(() => {
    const list = Array.isArray(backendCurrencies) && backendCurrencies.length > 0
      ? [...backendCurrencies]
      : [...fallbackCurrencies];

    // Ensure IP-detected currency is always selectable in dropdown
    if (currencyContext?.currencyCode && !list.some((c) => c.code === currencyContext.currencyCode)) {
      list.unshift({
        code: currencyContext.currencyCode,
        symbol: currencyContext.currencySymbol || currencyContext.currencyCode,
        name: currencyContext.currencyCode,
        decimals: currencyContext.currencyDecimals ?? 2,
        locale: currencyContext.currencyLocale || "en-US",
      });
    }
    return list;
  }, [backendCurrencies, currencyContext]);

  const screenTypeGroups = useMemo(() => {
    const groups = screenTypesData?.groups || [];
    return groups.filter((g) => Array.isArray(g.items) && g.items.length > 0);
  }, [screenTypesData]);

  const allScreenTypes = useMemo(() => screenTypesData?.types || [], [screenTypesData]);
  const typeLabelMap = useMemo(
    () => Object.fromEntries(allScreenTypes.map((t) => [t.id, t.label])),
    [allScreenTypes]
  );

  // 1. Restore previous selections once on mount from sessionStorage
  useEffect(() => {
    const saved = readPlanner();
    if (saved) {
      if (saved.currency) {
        savedCurrencyRef.current = saved.currency;
      }
      const picked = pick(saved);
      // Migrate legacy single-location selection into multi-location array
      if (
        (!Array.isArray(picked.locations) || picked.locations.length === 0) &&
        picked.location &&
        (picked.location.city_id || picked.location.type === "city")
      ) {
        picked.locations = [picked.location];
      }
      setState((s) => ({ ...s, ...picked }));
    }
  }, []);

  // 2. Apply IP-detected currency ONLY if user has not manually chosen or restored one
  useEffect(() => {
    if (!currencyContext?.currencyCode) return;
    const nextCurrency = resolvePreferredCurrency({
      manualCurrency: manualCurrencyRef.current,
      savedCurrency: savedCurrencyRef.current,
      detectedCurrency: currencyContext.currencyCode,
      fallback: DEFAULT_CURRENCY,
    });
    setState((s) => (s.currency === nextCurrency ? s : { ...s, currency: nextCurrency }));
  }, [currencyContext]);

  // 3. Reconcile selected screen types whenever location-filtered options update
  useEffect(() => {
    if (!screenTypesData || screenTypesPlaceholder) return;
    const validIds = new Set((screenTypesData.types || []).map((t) => t.id));
    setState((prev) => {
      if (!prev.types.length) return prev;
      const kept = prev.types.filter((t) => validIds.has(t));
      if (kept.length === prev.types.length) return prev;
      const removedCount = prev.types.length - kept.length;
      setPrunedNotice(
        `${removedCount} screen ${removedCount === 1 ? "format was" : "formats were"} removed because ${removedCount === 1 ? "it is" : "they are"} not available in the selected ${prev.locations.length === 1 ? "city" : "cities"}.`
      );
      const next = { ...prev, types: kept };
      savePlanner(next);
      return next;
    });
  }, [screenTypesData, screenTypesPlaceholder]);

  const update = (patch, field) => {
    setState((s) => {
      const next = { ...s, ...patch };
      savePlanner(next);
      return next;
    });
    if (field) track(EVENTS.PLANNER_CHANGE, { section: "planner", field });
  };

  const handleCurrencyChange = (nextCode) => {
    manualCurrencyRef.current = nextCode;
    // Preserve entered budget amount without silently converting
    update({ currency: nextCode }, "currency");
  };

  const handleBudgetChange = (raw) => {
    if (raw === "") {
      setBudgetError("");
      update({ budget: "" });
      return;
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || num < 0) {
      setBudgetError("Enter a valid non-negative budget or leave it blank.");
      return;
    }
    setBudgetError("");
    update({ budget: num });
  };

  const advanceToSection = (targetIndex) => {
    const now = Date.now();
    if (now - lastAdvanceRef.current < 250) return; // Prevent rapid duplicate progression
    lastAdvanceRef.current = now;

    if (budgetError) return;

    const targetEl = sectionRefs.current[targetIndex];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = targetEl.querySelector("input, select, button");
      focusable?.focus({ preventScroll: true });
    } else {
      proceed();
    }
  };

  const handleSectionKeyDown = (e, currentIndex) => {
    if (e.key !== "Enter") return;

    const tag = e.target?.tagName?.toLowerCase();
    // Never hijack Enter in textareas, buttons, or open location combobox
    if (tag === "textarea" || tag === "button") return;
    if (e.target?.closest?.('[data-location-combobox="open"]')) return;

    e.preventDefault();
    advanceToSection(currentIndex + 1);
  };

  const hasBudget = state.budget !== "" && Number(state.budget) > 0;
  const activeCurrencyMeta = availableCurrencies.find((c) => c.code === state.currency);

  const openPlanModal = () => {
    if (budgetError) return;
    savePlanner({
      ...state,
      city_ids: selectedCityIds,
      screens: readPlanner()?.screens,
    });
    track(EVENTS.CAMPAIGN_PLAN_START, {
      elementId: "planner_plan_campaign",
      elementLabel: "Plan Campaign",
      section: "planner",
      currency: state.currency,
      duration: state.duration,
      city_count: selectedCityIds.length,
    });
    setModalOpen(true);
  };

  const proceed = () => {
    if (budgetError) return;
    savePlanner({
      ...state,
      city_ids: selectedCityIds,
      screens: readPlanner()?.screens,
    });
    track(EVENTS.PLANNER_SUBMIT, {
      section: "planner",
      currency: state.currency,
      duration: state.duration,
      area: state.area,
      city_count: selectedCityIds.length,
      types: state.types.join(","),
    });
    if (inPage) {
      smoothScrollTo("#enquiry");
      document.getElementById("enquiry-name")?.focus({ preventScroll: true });
    } else {
      router.push("/advertise#enquiry");
    }
  };

  const syncLocations = (nextLocations) => {
    setPrunedNotice("");
    const names = nextLocations.map((l) => l.name || l.label).filter(Boolean);
    update(
      {
        locations: nextLocations,
        location: nextLocations[0] || null,
        area: names.length > 0 ? names.join(", ") : "any",
      },
      "area"
    );
  };

  const handleAddLocation = (loc) => {
    const canonicalId = String(loc.city_id ?? loc.id);
    if (state.locations.some((x) => String(x.city_id ?? x.id) === canonicalId)) {
      return;
    }
    syncLocations([...state.locations, loc]);
  };

  const handleRemoveLocation = (canonicalId) => {
    syncLocations(
      state.locations.filter((x) => String(x.city_id ?? x.id) !== String(canonicalId))
    );
  };

  const handleClearAllLocations = () => {
    syncLocations([]);
  };

  const selectedAreaDisplay =
    state.locations.length > 0
      ? state.locations.map((l) => l.name || l.label).filter(Boolean).join(", ")
      : state.area === "any" || !state.area
        ? "Any / to be advised"
        : state.area;

  return (
    <section className={`section ${lead ? "section--lead" : ""} ${styles.section}`} id="planner" aria-labelledby={`${id}-title`}>
      <div className="container">
        <SectionHeader
          index={index}
          label="Campaign planner"
          id={`${id}-title`}
          as={headingAs}
          lines={["Start with", "your budget."]}
          lead="Set your budget and preferences. We use your brief to find suitable screens and come back with confirmed options and pricing."
        />

        <Reveal className={styles.shell} variant="scale">
          <form className={styles.form} onSubmit={(e) => { e.preventDefault(); proceed(); }}>
            {/* 01 Budget & IP-Based Currency */}
            <fieldset
              className={styles.group}
              ref={(el) => { sectionRefs.current[0] = el; }}
              onKeyDown={(e) => handleSectionKeyDown(e, 0)}
            >
              <legend className={styles.legend}>
                <span>01</span> Budget <span className="muted" style={{ fontWeight: 400, fontSize: "0.85em" }}>(optional)</span>
              </legend>
              <div className={styles.budgetRow}>
                <label className="visually-hidden" htmlFor={`${id}-cur`}>Currency</label>
                <select
                  id={`${id}-cur`}
                  className={`input ${styles.currency}`}
                  value={state.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                >
                  {availableCurrencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol.trim()})
                    </option>
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
                  placeholder="Optional budget"
                  value={state.budget}
                  aria-invalid={Boolean(budgetError)}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  onBlur={() => track(EVENTS.PLANNER_BUDGET, { section: "planner", currency: state.currency })}
                />
              </div>
              {budgetError && (
                <p role="alert" className={styles.warn}>{budgetError}</p>
              )}
              <input
                type="range"
                className={styles.range}
                min={budgetSlider.min}
                max={budgetSlider.max}
                step={budgetSlider.step}
                value={Math.min(Number(state.budget) || 0, budgetSlider.max)}
                style={{ "--p": `${(Math.min(Number(state.budget) || 0, budgetSlider.max) / budgetSlider.max) * 100}%` }}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setBudgetError("");
                  update({ budget: val === 0 ? "" : val });
                }}
                onPointerUp={() => track(EVENTS.PLANNER_BUDGET, { section: "planner", currency: state.currency })}
                aria-label="Budget slider"
              />
              <div className={styles.rangeScale} aria-hidden="true">
                <span>{formatBudget(budgetSlider.min, state.currency, availableCurrencies)}</span>
                <span>{formatBudget(budgetSlider.max, state.currency, availableCurrencies)}+</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 12 }}>
                <span className="muted" style={{ fontSize: "0.8rem" }}>
                  {currencyContext?.countryCode && !manualCurrencyRef.current && !savedCurrencyRef.current
                    ? `Currency auto-detected for ${currencyContext.countryCode} (${activeCurrencyMeta?.symbol?.trim() || state.currency})`
                    : `Currency: ${state.currency} (${activeCurrencyMeta?.symbol?.trim() || state.currency})`}
                </span>
                <button
                  type="button"
                  className="chip"
                  onClick={() => advanceToSection(1)}
                >
                  Next →
                </button>
              </div>
            </fieldset>

            {/* 02 Duration */}
            <fieldset
              className={styles.group}
              ref={(el) => { sectionRefs.current[1] = el; }}
              onKeyDown={(e) => handleSectionKeyDown(e, 1)}
            >
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
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <button type="button" className="chip" onClick={() => advanceToSection(2)}>
                  Next →
                </button>
              </div>
            </fieldset>

            {/* 03 Dynamic Location Search & Dynamic Advertising Screen Types */}
            <fieldset
              className={styles.group}
              ref={(el) => { sectionRefs.current[2] = el; }}
              onKeyDown={(e) => handleSectionKeyDown(e, 2)}
            >
              <legend className={styles.legend}>
                <span>03</span> Location &amp; screens
              </legend>
              <div className="field">
                <label htmlFor={`${id}-area`}>
                  Preferred cities <span className="muted">(optional — select one or more)</span>
                </label>
                <LocationSearchSelect
                  id={`${id}-area`}
                  selectedLocations={state.locations}
                  onAdd={handleAddLocation}
                  onRemove={handleRemoveLocation}
                  onClearAll={handleClearAllLocations}
                />
              </div>

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <p className={styles.subLabel}>
                  Screen types <span className="muted" style={{ fontWeight: 400 }}>(optional)</span>
                </p>
                {selectedCityIds.length > 0 && (
                  <span className="muted" style={{ fontSize: "0.78rem" }}>
                    {screenTypesFetching
                      ? "Updating formats for selected cities…"
                      : `Available in ${state.locations.map((l) => l.name || l.label).join(", ")}`}
                  </span>
                )}
              </div>
              {prunedNotice && (
                <p className="muted" role="status" style={{ fontSize: "0.8rem", marginBottom: 8 }}>
                  {prunedNotice}
                </p>
              )}
              {screenTypesLoading && !screenTypesData ? (
                <p className="muted" role="status" style={{ fontSize: "0.875rem" }}>
                  Loading available advertising screen formats…
                </p>
              ) : screenTypesError ? (
                <p className="muted" role="status" style={{ fontSize: "0.875rem" }}>
                  Screen format options are temporarily unavailable. You can still continue and our team will recommend suitable screens.
                </p>
              ) : screenTypeGroups.length === 0 ? (
                <p className="muted" role="status" style={{ fontSize: "0.875rem" }}>
                  {selectedCityIds.length > 0
                    ? "No active screen formats are currently listed for the selected city. You can add nearby cities or continue and our team will recommend suitable screens."
                    : "Screen format options are temporarily unavailable. You can still continue and our team will recommend suitable screens."}
                </p>
              ) : (
                <div style={{ display: "grid", gap: 14, opacity: screenTypesFetching && screenTypesPlaceholder ? 0.72 : 1, transition: "opacity 150ms ease" }}>
                  {screenTypeGroups.map((group) => (
                    <div key={group.id}>
                      <p className="muted" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                        {group.label}
                      </p>
                      <div className={styles.options}>
                        {group.items.map((t) => (
                          <label key={t.id} className={styles.option}>
                            <input
                              type="checkbox"
                              checked={state.types.includes(t.id)}
                              onChange={() => {
                                setPrunedNotice("");
                                const nextTypes = state.types.includes(t.id)
                                  ? state.types.filter((x) => x !== t.id)
                                  : [...state.types, t.id];
                                update(
                                  {
                                    types: nextTypes,
                                    typeLabels: { ...state.typeLabels, ...typeLabelMap },
                                  },
                                  "types"
                                );
                              }}
                            />
                            <span>{t.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <button type="button" className="chip" onClick={() => advanceToSection(3)}>
                  Next →
                </button>
              </div>
            </fieldset>

            {/* 04 Objective */}
            <fieldset
              className={styles.group}
              ref={(el) => { sectionRefs.current[3] = el; }}
              onKeyDown={(e) => handleSectionKeyDown(e, 3)}
            >
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
              {hasBudget ? formatBudget(state.budget, state.currency, availableCurrencies) : "Flexible"}
            </div>
            <p className={styles.budgetCaption}>
              {hasBudget ? `Total budget (${state.currency})` : `Budget to be advised (${state.currency})`} ·{" "}
              {durations.find((d) => d.id === state.duration)?.label}
            </p>

            <dl className={styles.brief}>
              <div>
                <dt>Location</dt>
                <dd>{selectedAreaDisplay}</dd>
              </div>
              <div>
                <dt>Screens</dt>
                <dd>
                  {state.types.length
                    ? state.types.map((t) => typeLabelMap[t] || state.typeLabels?.[t] || t).join(", ")
                    : "Any advertising format"}
                </dd>
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

            {!plannerRules && (
              <p className={styles.disclaimer}>
                <Icon name="info" size={16} />
                <span>
                  Illuvision reviews your brief and confirms suitable screens, availability and pricing. Sending
                  this brief does not reserve a campaign.
                </span>
              </p>
            )}

            <button
              type="button"
              className="btn btn--light btn--block"
              onClick={openPlanModal}
              disabled={Boolean(budgetError)}
            >
              <BtnIcon name="arrow" />
              <span>Plan Campaign</span>
            </button>
            <button
              type="button"
              className="text-link"
              onClick={proceed}
              disabled={Boolean(budgetError)}
              style={{ marginTop: 10, fontSize: "0.82rem", width: "100%", textAlign: "center", color: "inherit", opacity: 0.78 }}
            >
              Or continue directly to enquiry form →
            </button>
          </aside>
        </Reveal>
      </div>

      <CampaignRecommendationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        plannerState={state}
        availableCurrencies={availableCurrencies}
      />
    </section>
  );
}

function pick(saved) {
  const keys = Object.keys(initial);
  return Object.fromEntries(Object.entries(saved).filter(([k]) => keys.includes(k)));
}
