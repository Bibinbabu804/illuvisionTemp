"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import BtnIcon from "@/components/ui/BtnIcon";
import { durations, objectives } from "@/data/planner";
import { site } from "@/data/site";
import { scrollLock } from "@/components/motion/SmoothScroll";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import {
  generateCampaignRecommendations,
  createCampaignProposal,
} from "@/services/api/planner/planner.api";
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
}) {
  const dialogRef = useRef(null);

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

  const selectedCityIds = useMemo(
    () =>
      (plannerState?.locations || [])
        .map((l) => Number(l.city_id ?? l.id))
        .filter((n) => n > 0),
    [plannerState?.locations]
  );

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

  const fetchPlans = useCallback(
    async (signal) => {
      setError("");
      setProposalError("");
      setProposalResult(null);
      setLoading(true);
      idemKeyRef.current.clear();

      try {
        const payload = {
          budget:
            plannerState?.budget !== "" && Number(plannerState?.budget) > 0
              ? Number(plannerState.budget)
              : null,
          currency: plannerState?.currency || "INR",
          duration: plannerState?.duration || "1m",
          start_date: plannerState?.startDate || null,
          city_ids: selectedCityIds,
          screen_types: plannerState?.types || [],
          objective: plannerState?.objective || "awareness",
        };

        const data = await generateCampaignRecommendations(payload, signal);
        if (signal?.aborted) return;
        setResult(data);
        track(EVENTS.PLANNER_SUBMIT, {
          section: "campaign-recommendation-modal",
          currency: payload.currency,
          city_count: selectedCityIds.length,
          package_count: data?.packages?.length || 0,
        });
      } catch (err) {
        if (signal?.aborted) return;
        setError(err?.message || "Unable to analyze campaign plans right now. Please try again.");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [plannerState, selectedCityIds]
  );

  // Automatically generate recommendations as soon as the modal opens
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetchPlans(controller.signal);
    return () => controller.abort();
  }, [open, fetchPlans]);

  const handleEnquireNow = async (pkg) => {
    setProposalError("");
    const configuredWhatsApp = site.contact?.whatsapp;
    if (!normalizeWhatsAppNumber(configuredWhatsApp)) {
      setProposalError("WhatsApp business number is not configured. Please contact us directly.");
      return;
    }

    setCreatingKey(pkg.key);
    try {
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
        preferences: result?.preferences || plannerState,
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

  // Compact summary chips of the brief already entered in the main Campaign Planner form
  const currencyMeta = availableCurrencies.find((c) => c.code === (plannerState?.currency || "INR"));
  const budgetText =
    plannerState?.budget !== "" && Number(plannerState?.budget) > 0
      ? formatMoney(
          plannerState.budget,
          currencyMeta?.symbol || `${plannerState.currency || "INR"} `,
          currencyMeta?.decimals ?? 0,
          currencyMeta?.locale || "en-IN"
        )
      : `Flexible (${plannerState?.currency || "INR"})`;
  const durationText = durations.find((d) => d.id === plannerState?.duration)?.label || "1 month";
  const objectiveText = objectives.find((o) => o.id === plannerState?.objective)?.label || "Brand awareness";
  const cityNames = (plannerState?.locations || []).map((l) => l.name || l.label).filter(Boolean);
  const citiesSummary =
    cityNames.length === 0
      ? "Any location"
      : cityNames.length <= 3
        ? cityNames.join(", ")
        : `${cityNames.slice(0, 3).join(", ")} +${cityNames.length - 3} more`;

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
          <div className={styles.headerInner}>
            <div>
              <p className={styles.eyebrow}>Illuvision Campaign Strategist</p>
              <h2 id="campaign-modal-title" className={styles.title}>
                Your Recommended Campaign Plans
              </h2>
              <p className={styles.subtitle}>
                Tailored advertising packages built from your brief, live screen inventory, and official pricing plans.
              </p>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              aria-label="Close campaign recommendations"
              onClick={onClose}
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </header>

        <div className={styles.body}>
          <div className={styles.bodyInner}>
          {/* Compact Brief Summary Strip + Compare / Edit actions */}
          <div className={styles.summaryStrip}>
            <div className={styles.summaryTags}>
              <span className={styles.summaryTag}>
                <strong>Budget:</strong> {budgetText}
              </span>
              <span className={styles.summaryTag}>
                <strong>Duration:</strong> {durationText}
              </span>
              <span className={styles.summaryTag}>
                <strong>Cities:</strong> {citiesSummary}
              </span>
              <span className={styles.summaryTag}>
                <strong>Goal:</strong> {objectiveText}
              </span>
            </div>
            <div className={styles.summaryActions}>
              {packages.length > 1 && (
                <button
                  type="button"
                  className="chip"
                  onClick={() => setShowCompare((s) => !s)}
                >
                  {showCompare ? "Hide Comparison" : "Compare Packages"}
                </button>
              )}
              <button type="button" className="chip" onClick={onClose}>
                Edit Brief
              </button>
            </div>
          </div>

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
              <div style={{ marginTop: 10 }}>
                <button type="button" className="chip" onClick={() => fetchPlans()}>
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Empty / Insufficient Budget Honest Feedback */}
          {!loading && result && packages.length === 0 && (
            <div className={styles.noticeBox} role="status">
              <strong>No matching packages for this exact brief</strong>
              <p style={{ margin: "6px 0 12px" }}>{result.message}</p>
              <button type="button" className="chip" onClick={onClose}>
                Adjust Brief in Planner
              </button>
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
                      <td key={p.key}>
                        {p.formats_included.slice(0, 3).join(", ")}
                        {p.formats_included.length > 3 ? ` +${p.formats_included.length - 3}` : ""}
                      </td>
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
                        <span className={styles.metricVal}>
                          {pkg.formats_included.length} {pkg.formats_included.length === 1 ? "format" : "formats"}
                        </span>
                      </div>
                    </div>

                    <p className={styles.rationale}>{pkg.why_suitable}</p>

                    {pkg.advantages?.length > 0 && (
                      <ul className={styles.bulletList}>
                        {pkg.advantages.slice(0, 2).map((adv, i) => (
                          <li key={i}>{adv}</li>
                        ))}
                      </ul>
                    )}

                    {pkg.allocation_by_format?.length > 0 && (
                      <div className={styles.allocList}>
                        {pkg.allocation_by_format.slice(0, 2).map((row) => (
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
                        className={pkg.is_recommended ? "btn btn--accent btn--block" : `btn btn--block ${styles.btnDark}`}
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
      </div>
    </dialog>
  );
}
