"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import BtnIcon from "@/components/ui/BtnIcon";
import LocationSearchSelect from "./LocationSearchSelect";
import { durations, objectives } from "@/data/planner";
import { site } from "@/data/site";
import { scrollLock } from "@/components/motion/SmoothScroll";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import {
  generateCampaignRecommendations,
  createCampaignProposal,
} from "@/services/api/planner/planner.api";
import { useCampaignScreenTypes } from "@/services/api/planner/planner.queries";
import { track, EVENTS } from "@/lib/analytics";
import styles from "./CampaignRecommendationModal.module.css";

function formatMoney(amount, symbol = "₹", decimals = 0, locale = "en-IN") {
  const num = Number(amount || 0);
  return `${symbol}${num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export default function CampaignRecommendationModal({
  open,
  onClose,
  plannerState,
  availableCurrencies = [],
  onSyncPlanner,
}) {
  const dialogRef = useRef(null);
  const [prefs, setPrefs] = useState({
    budget: "",
    currency: "INR",
    duration: "1m",
    startDate: "",
    locations: [],
    types: [],
    objective: "awareness",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState({});
  const [showCompare, setShowCompare] = useState(false);

  // Proposal generation state
  const [creatingKey, setCreatingKey] = useState(null);
  const [proposalResult, setProposalResult] = useState(null);
  const [proposalError, setProposalError] = useState("");
  const idemKeyRef = useRef(new Map());

  // Sync latest planner state whenever modal opens
  useEffect(() => {
    if (!open) return;
    setPrefs({
      budget: plannerState?.budget ?? "",
      currency: plannerState?.currency || "INR",
      duration: plannerState?.duration || "1m",
      startDate: plannerState?.startDate || "",
      locations: Array.isArray(plannerState?.locations) ? plannerState.locations : [],
      types: Array.isArray(plannerState?.types) ? plannerState.types : [],
      objective: plannerState?.objective || "awareness",
    });
    setError("");
    setProposalError("");
  }, [open, plannerState]);

  // Native <dialog> open/close + scroll lock
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
      scrollLock(true);
    } else {
      if (dialog.open) dialog.close();
      scrollLock(false);
    }

    return () => scrollLock(false);
  }, [open]);

  const selectedCityIds = useMemo(
    () => (prefs.locations || []).map((l) => Number(l.city_id ?? l.id)).filter((n) => n > 0),
    [prefs.locations]
  );

  const { data: screenTypesData } = useCampaignScreenTypes(selectedCityIds, { enabled: open });
  const availableTypes = useMemo(() => screenTypesData?.types || [], [screenTypesData]);

  const updatePref = (patch) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      onSyncPlanner?.(next);
      return next;
    });
    setProposalResult(null);
    idemKeyRef.current.clear();
  };

  const handleFindPlans = async () => {
    setError("");
    setProposalError("");
    setProposalResult(null);
    setLoading(true);
    idemKeyRef.current.clear();

    try {
      const payload = {
        budget: prefs.budget !== "" && Number(prefs.budget) > 0 ? Number(prefs.budget) : null,
        currency: prefs.currency || "INR",
        duration: prefs.duration || "1m",
        start_date: prefs.startDate || null,
        city_ids: selectedCityIds,
        screen_types: prefs.types || [],
        objective: prefs.objective || "awareness",
      };

      const data = await generateCampaignRecommendations(payload);
      setResult(data);
      track(EVENTS.PLANNER_SUBMIT, {
        section: "campaign-recommendation-modal",
        currency: payload.currency,
        city_count: selectedCityIds.length,
        package_count: data?.packages?.length || 0,
      });
    } catch (err) {
      setError(err?.message || "Unable to analyze campaign plans right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnquireNow = async (pkg) => {
    setProposalError("");
    const configuredWhatsApp = site.contact?.whatsapp;
    if (!normalizeWhatsAppNumber(configuredWhatsApp)) {
      setProposalError("WhatsApp business number is not configured. Please contact us directly.");
      return;
    }

    setCreatingKey(pkg.key);
    try {
      // Stable idempotency key per (recommendation + package) to prevent duplicate DB records on double-click
      let idemKey = idemKeyRef.current.get(pkg.key);
      if (!idemKey) {
        idemKey = `prop_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        idemKeyRef.current.set(pkg.key, idemKey);
      }

      const alternatives = (result?.packages || []).filter((p) => p.key !== pkg.key);
      const frontendOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

      const created = await createCampaignProposal({
        selected_package: pkg,
        alternative_packages: alternatives,
        preferences: result?.preferences || prefs,
        idempotency_key: idemKey,
        frontend_origin: frontendOrigin,
      });

      const wa = buildWhatsAppUrl(configuredWhatsApp, created.whatsapp_message);
      const bundle = {
        ...created,
        whatsappUrl: wa.ok ? wa.url : null,
        packageName: pkg.name,
      };
      setProposalResult(bundle);

      track(EVENTS.AD_ENQUIRY, {
        section: "campaign-proposal-whatsapp",
        package_key: pkg.key,
        currency: pkg.pricing?.currency,
      });

      if (wa.ok && wa.url) {
        window.open(wa.url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setProposalError(err?.message || "Could not generate your campaign proposal. Please try again.");
    } finally {
      setCreatingKey(null);
    }
  };

  const packages = result?.packages || [];

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="campaign-modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose?.();
      }}
    >
      <div className={styles.frame} data-lenis-prevent>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Illuvision Campaign Strategist</p>
            <h2 id="campaign-modal-title" className={styles.title}>
              Let&rsquo;s Plan Your Advertising Campaign
            </h2>
            <p className={styles.subtitle}>
              Tell us your advertising goals and budget. We&rsquo;ll recommend campaign options
              designed around your preferred locations and audience.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Close campaign planner"
            onClick={onClose}
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className={styles.body}>
          {/* Campaign Preferences (reuses Planner state, editable before or after generation) */}
          <section className={styles.prefsCard} aria-label="Campaign preferences">
            <div className={styles.prefsTop}>
              <h3 className={styles.prefsTitle}>Your Campaign Preferences</h3>
              <span className="muted" style={{ fontSize: "0.78rem" }}>
                Synced with your current brief — adjust anytime
              </span>
            </div>

            <div className={styles.prefsGrid}>
              <div className="field">
                <label htmlFor="modal-budget">Target budget <span className="muted">(optional)</span></label>
                <div className={styles.budgetPair}>
                  <select
                    aria-label="Currency"
                    className="input"
                    value={prefs.currency}
                    onChange={(e) => updatePref({ currency: e.target.value })}
                  >
                    {(availableCurrencies.length ? availableCurrencies : [{ code: "INR", symbol: "₹" }]).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol?.trim() || c.code})
                      </option>
                    ))}
                  </select>
                  <input
                    id="modal-budget"
                    type="number"
                    min="0"
                    step="500"
                    className="input"
                    placeholder="Flexible"
                    value={prefs.budget}
                    onChange={(e) =>
                      updatePref({ budget: e.target.value === "" ? "" : Math.max(0, Number(e.target.value)) })
                    }
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="modal-duration">Duration</label>
                <select
                  id="modal-duration"
                  className="input"
                  value={prefs.duration}
                  onChange={(e) => updatePref({ duration: e.target.value })}
                >
                  {durations.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="modal-objective">Objective</label>
                <select
                  id="modal-objective"
                  className="input"
                  value={prefs.objective}
                  onChange={(e) => updatePref({ objective: e.target.value })}
                >
                  {objectives.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="modal-locations">Preferred cities <span className="muted">(optional)</span></label>
              <LocationSearchSelect
                id="modal-locations"
                selectedLocations={prefs.locations}
                onAdd={(loc) => {
                  const cid = String(loc.city_id ?? loc.id);
                  if (prefs.locations.some((x) => String(x.city_id ?? x.id) === cid)) return;
                  updatePref({ locations: [...prefs.locations, loc] });
                }}
                onRemove={(cid) =>
                  updatePref({
                    locations: prefs.locations.filter((x) => String(x.city_id ?? x.id) !== String(cid)),
                  })
                }
                onClearAll={() => updatePref({ locations: [] })}
              />
            </div>

            {availableTypes.length > 0 && (
              <div className="field">
                <label>Preferred screen formats <span className="muted">(optional)</span></label>
                <div className={styles.typeChips}>
                  {availableTypes.slice(0, 12).map((t) => {
                    const active = prefs.types.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={styles.typeChip}
                        data-active={active ? "true" : undefined}
                        onClick={() =>
                          updatePref({
                            types: active
                              ? prefs.types.filter((x) => x !== t.id)
                              : [...prefs.types, t.id],
                          })
                        }
                      >
                        {active && <Icon name="check" size={12} />}
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.actionRow}>
              <button
                type="button"
                className="btn btn--accent"
                disabled={loading}
                onClick={handleFindPlans}
              >
                <BtnIcon name="arrow" />
                <span>{loading ? "Analyzing campaign options…" : "Find My Campaign Plans"}</span>
              </button>

              {packages.length > 1 && (
                <button
                  type="button"
                  className="chip"
                  onClick={() => setShowCompare((s) => !s)}
                >
                  {showCompare ? "Hide Comparison" : "Compare Packages"}
                </button>
              )}
            </div>
          </section>

          {/* Purposeful Loading State */}
          {loading && (
            <div className={styles.loadingBox} role="status" aria-live="polite">
              <span className={styles.spinner} aria-hidden="true" />
              <div>
                <strong>Analyzing your budget, locations and advertising opportunities...</strong>
                <p className="muted" style={{ margin: "2px 0 0", fontSize: "0.84rem" }}>
                  Checking live advertising screen availability and official pricing plans.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={styles.noticeBox} role="alert">
              <strong>Could not generate recommendations:</strong> {error}
            </div>
          )}

          {/* Empty / Insufficient Budget Honest Feedback */}
          {!loading && result && packages.length === 0 && (
            <div className={styles.noticeBox} role="status">
              <strong>No matching packages for this exact combination</strong>
              <p style={{ margin: "6px 0 0" }}>{result.message}</p>
            </div>
          )}

          {/* Proposal Ready + WhatsApp Action */}
          {proposalResult && (
            <section className={styles.proposalReady} role="status" aria-live="polite">
              <div>
                <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#15803d" }}>
                  Proposal Ready &middot; Ref {proposalResult.reference_code}
                </p>
                <h3 style={{ margin: "4px 0 6px", fontSize: "1.1rem" }}>
                  {proposalResult.packageName} proposal generated
                </h3>
                <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--text-2)" }}>
                  Opening WhatsApp prefills your proposal reference, plan summary, and shareable link — review the message and press <strong>Send</strong>. You can also download the PDF below to attach manually if you&rsquo;d like.
                </p>
              </div>
              <div className={styles.proposalActions}>
                {proposalResult.whatsappUrl && (
                  <a
                    href={proposalResult.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--accent"
                  >
                    <BtnIcon name="arrow" />
                    <span>Open WhatsApp</span>
                  </a>
                )}
                <a
                  href={proposalResult.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chip"
                >
                  Download Proposal PDF
                </a>
                <a
                  href={proposalResult.proposal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chip"
                >
                  Open Proposal Page
                </a>
              </div>
            </section>
          )}

          {proposalError && (
            <div className={styles.noticeBox} role="alert">
              {proposalError}
            </div>
          )}

          {/* Consultant Narrative */}
          {!loading && packages.length > 0 && result?.consultant_summary && (
            <div className={styles.consultantBanner}>
              <strong>Campaign Strategist Note:</strong> {result.consultant_summary}
            </div>
          )}

          {/* Compare Packages Strip */}
          {!loading && showCompare && packages.length > 1 && (
            <section className={styles.compareWrap} aria-label="Compare recommended campaign packages">
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th>Dimension</th>
                    {packages.map((p) => (
                      <th key={p.key}>
                        {p.name} {p.is_recommended ? "★" : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Est. Investment</strong></td>
                    {packages.map((p) => (
                      <td key={p.key}>
                        <strong>
                          {formatMoney(
                            p.pricing?.estimated_total_display,
                            p.pricing?.currency_symbol,
                            p.pricing?.currency_decimals,
                            result?.preferences?.currency_locale
                          )}
                        </strong>{" "}
                        <span className="muted">({p.pricing?.currency})</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Coverage</strong></td>
                    {packages.map((p) => (
                      <td key={p.key}>
                        {p.cities_covered_count} {p.cities_covered_count === 1 ? "city" : "cities"} ({p.cities_covered.slice(0, 3).join(", ")})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Placements</strong></td>
                    {packages.map((p) => (
                      <td key={p.key}>{p.screen_count} active screens</td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Formats</strong></td>
                    {packages.map((p) => (
                      <td key={p.key}>{p.formats_included.slice(0, 3).join(", ")}{p.formats_included.length > 3 ? ` +${p.formats_included.length - 3}` : ""}</td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Duration</strong></td>
                    {packages.map((p) => (
                      <td key={p.key}>{p.duration_label}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          {/* Three-Tier Campaign Packages */}
          {!loading && packages.length > 0 && (
            <div className={styles.packagesGrid}>
              {packages.map((pkg) => {
                const pr = pkg.pricing || {};
                const locale = result?.preferences?.currency_locale || "en-IN";
                const isExpanded = Boolean(expandedKeys[pkg.key]);
                const isCreating = creatingKey === pkg.key;

                return (
                  <article
                    key={pkg.key}
                    className={styles.pkgCard}
                    data-recommended={pkg.is_recommended ? "true" : undefined}
                  >
                    <div className={styles.pkgTop}>
                      <h3 className={styles.pkgName}>{pkg.name}</h3>
                      {pkg.is_recommended ? (
                        <span className={styles.recBadge}>Recommended</span>
                      ) : pkg.exceeds_target_budget ? (
                        <span className={styles.stretchBadge}>Stretch Option</span>
                      ) : null}
                    </div>

                    <p className={styles.pkgPos}>{pkg.positioning}</p>

                    <div className={styles.priceBlock}>
                      <div className={styles.priceVal}>
                        {formatMoney(pr.estimated_total_display, pr.currency_symbol, pr.currency_decimals, locale)}
                      </div>
                      <div className={styles.priceMeta}>
                        Indicative estimate ({pr.currency}) &middot; Excl. taxes
                        {pr.currency && pr.currency !== "INR" && (
                          <> &middot; Base ₹{Number(pr.estimated_total_inr || 0).toLocaleString("en-IN")}</>
                        )}
                      </div>
                    </div>

                    <div className={styles.metricsRow}>
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Duration</span>
                        <span className={styles.metricVal}>{pkg.duration_label}</span>
                      </div>
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Placements</span>
                        <span className={styles.metricVal}>{pkg.screen_count} screens</span>
                      </div>
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Coverage</span>
                        <span className={styles.metricVal}>
                          {pkg.cities_covered_count} {pkg.cities_covered_count === 1 ? "city" : "cities"}
                        </span>
                      </div>
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Formats</span>
                        <span className={styles.metricVal}>{pkg.formats_included.length} types</span>
                      </div>
                    </div>

                    <p className={styles.rationale}>{pkg.why_suitable}</p>

                    {pkg.advantages?.length > 0 && (
                      <ul className={styles.bulletList}>
                        {pkg.advantages.map((adv, i) => (
                          <li key={i}>{adv}</li>
                        ))}
                      </ul>
                    )}

                    {pkg.allocation_by_format?.length > 0 && (
                      <div className={styles.allocList}>
                        {pkg.allocation_by_format.slice(0, 3).map((row) => (
                          <div key={row.label} className={styles.allocItem}>
                            <span>{row.label} ({row.screen_count})</span>
                            <strong>{formatMoney(row.amount_display, pr.currency_symbol, pr.currency_decimals, locale)}</strong>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      className={styles.detailsToggle}
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setExpandedKeys((prev) => ({ ...prev, [pkg.key]: !prev[pkg.key] }))
                      }
                    >
                      {isExpanded ? "Hide details" : "View placements, trade-offs & assumptions"}
                    </button>

                    {isExpanded && (
                      <div className={styles.detailsBox}>
                        <div>
                          <strong>Cities covered:</strong> {pkg.cities_covered.join(", ")}
                        </div>
                        {pkg.trade_offs?.length > 0 && (
                          <div>
                            <strong>Trade-offs:</strong>
                            <ul className={styles.bulletList} style={{ marginTop: 4 }}>
                              {pkg.trade_offs.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                          </div>
                        )}
                        {pkg.screens?.length > 0 && (
                          <div>
                            <strong>Included placements ({pkg.screens.length}):</strong>
                            <ul className={styles.bulletList} style={{ marginTop: 4 }}>
                              {pkg.screens.slice(0, 6).map((s) => (
                                <li key={s.id}>
                                  {s.name} — {s.screen_type} ({s.city_name})
                                </li>
                              ))}
                              {pkg.screens.length > 6 && (
                                <li>+{pkg.screens.length - 6} more placements in full PDF proposal</li>
                              )}
                            </ul>
                          </div>
                        )}
                        {pkg.assumptions?.length > 0 && (
                          <div>
                            <strong>Assumptions:</strong>
                            <ul className={styles.bulletList} style={{ marginTop: 4 }}>
                              {pkg.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className={styles.pkgFooter}>
                      <button
                        type="button"
                        className={pkg.is_recommended ? "btn btn--accent btn--block" : "btn btn--light btn--block"}
                        disabled={Boolean(creatingKey)}
                        onClick={() => handleEnquireNow(pkg)}
                      >
                        <BtnIcon name="arrow" />
                        <span>{isCreating ? "Generating Proposal…" : "Enquire Now"}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {result?.limitations?.length > 0 && (
            <p className={styles.disclaimer}>
              Note: {result.limitations.join(" ")}
            </p>
          )}
        </div>
      </div>
    </dialog>
  );
}
