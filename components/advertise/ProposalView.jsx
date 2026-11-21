"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BtnIcon from "@/components/ui/BtnIcon";
import { site } from "@/data/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { fetchCampaignProposal } from "@/services/api/planner/planner.api";
import styles from "./ProposalView.module.css";

function formatMoney(amount, symbol = "₹", decimals = 0, locale = "en-IN") {
  const num = Number(amount || 0);
  return `${symbol}${num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export default function ProposalView({ token }) {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid proposal link.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    fetchCampaignProposal(token, controller.signal)
      .then((data) => {
        setProposal(data);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err?.message || "This campaign proposal link is invalid or has expired.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [token]);

  if (loading) {
    return (
      <section className={styles.page}>
        <div className="container">
          <div className={styles.stateBox} role="status">
            <strong>Loading your campaign proposal…</strong>
            <p className="muted" style={{ margin: 0 }}>Retrieving your saved campaign snapshot.</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !proposal) {
    return (
      <section className={styles.page}>
        <div className="container">
          <div className={styles.stateBox} role="alert">
            <h1 style={{ margin: 0, fontSize: "1.4rem" }}>Proposal Unavailable</h1>
            <p className="muted" style={{ margin: 0 }}>
              {error || "This campaign proposal link is invalid or has expired."}
            </p>
            <Link href="/advertise#planner" className="btn btn--accent">
              <BtnIcon name="arrow" />
              <span>Plan a New Campaign</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const pkg = proposal.selected_package || {};
  const prefs = proposal.preferences || {};
  const pricing = pkg.pricing || proposal.pricing || {};
  const alts = proposal.alternative_packages || [];
  const symbol = pricing.currency_symbol || `${proposal.currency_code} `;
  const decimals = Number(pricing.currency_decimals ?? 0);
  const locale = prefs.currency_locale || "en-IN";
  const citiesText = (pkg.cities_covered || []).join(", ") || "Selected markets";

  const proposalUrl = typeof window !== "undefined" ? window.location.href : "";
  const waText = [
    "Hello, I'm interested in the advertising campaign proposal.",
    "",
    `Proposal Reference: ${proposal.reference_code}`,
    `Recommended Plan: ${proposal.selected_package_name}`,
    `Estimated Budget: ${formatMoney(proposal.estimated_total_display, symbol, decimals, locale)} (${proposal.currency_code})`,
    `Preferred Locations: ${citiesText}`,
    "",
    "Please review my campaign proposal:",
    proposalUrl,
    "",
    "Download Proposal PDF:",
    proposal.pdf_url,
    "",
    "I would like to discuss the next steps.",
  ].join("\n");

  const wa = buildWhatsAppUrl(site.contact?.whatsapp, waText);

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.shell}>
          {/* Branded Header */}
          <header className={styles.hero}>
            <div>
              <span className={styles.badge}>Indicative Campaign Proposal</span>
              <h1 className={styles.heroTitle}>{pkg.name || proposal.selected_package_name}</h1>
              <p className={styles.heroMeta}>
                Ref: <strong>{proposal.reference_code}</strong>
                {proposal.created_at && (
                  <> &middot; Generated {new Date(proposal.created_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}</>
                )}
                {proposal.expires_at && (
                  <> &middot; Valid until {new Date(proposal.expires_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}</>
                )}
              </p>
            </div>
            <div className={styles.heroPrice}>
              <div className={styles.priceBig}>
                {formatMoney(proposal.estimated_total_display, symbol, decimals, locale)}
              </div>
              <div className={styles.priceSub}>
                Estimated total ({proposal.currency_code}) &middot; Excl. taxes
                {proposal.currency_code !== "INR" && (
                  <> &middot; Base ₹{Number(proposal.estimated_total_inr || 0).toLocaleString("en-IN")}</>
                )}
              </div>
            </div>
          </header>

          {/* Actions */}
          <div className={styles.actions}>
            {wa.ok && (
              <a href={wa.url} target="_blank" rel="noopener noreferrer" className="btn btn--accent">
                <BtnIcon name="arrow" />
                <span>Discuss on WhatsApp</span>
              </a>
            )}
            <a href={proposal.pdf_url} target="_blank" rel="noopener noreferrer" className={`btn ${styles.btnDark}`}>
              <BtnIcon name="arrow" />
              <span>Download Proposal PDF</span>
            </a>
            <Link href="/advertise#planner" className="chip">
              Plan Another Campaign
            </Link>
          </div>

          {/* Indicative Notice */}
          <div className={styles.notice}>
            <strong>Indicative Proposal:</strong> This snapshot reflects live Illuvision screen inventory and official pricing plans at the time of generation. Final slot availability, schedules, and commercial terms are confirmed in writing before any campaign goes live.
          </div>

          {/* KPIs */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpi}>
              <span className={styles.kpiLabel}>Campaign Window</span>
              <div className={styles.kpiVal}>{pkg.duration_label || `${pkg.duration_days || 30} days`}</div>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiLabel}>Active Placements</span>
              <div className={styles.kpiVal}>{pkg.screen_count || 0} Screens</div>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiLabel}>Cities Covered</span>
              <div className={styles.kpiVal}>{citiesText}</div>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiLabel}>Advertising Formats</span>
              <div className={styles.kpiVal}>{(pkg.formats_included || []).length} Formats</div>
            </div>
          </div>

          {/* Strategic Rationale */}
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Strategic Rationale &amp; Trade-offs</h2>
            {pkg.why_suitable && <p style={{ margin: 0 }}>{pkg.why_suitable}</p>}
            {pkg.advantages?.length > 0 && (
              <ul className={styles.bullets}>
                {pkg.advantages.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            )}
            {pkg.trade_offs?.length > 0 && (
              <>
                <strong style={{ fontSize: "0.86rem" }}>Considerations</strong>
                <ul className={styles.bullets}>
                  {pkg.trade_offs.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </>
            )}
          </article>

          {/* Budget Allocation */}
          {pkg.allocation_by_format?.length > 0 && (
            <article className={styles.card}>
              <h2 className={styles.cardTitle}>Budget Allocation by Format</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Advertising Format</th>
                      <th className={styles.num}>Screens</th>
                      <th className={styles.num}>Share</th>
                      <th className={styles.num}>Estimated ({proposal.currency_code})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pkg.allocation_by_format.map((row) => (
                      <tr key={row.label}>
                        <td>{row.label}</td>
                        <td className={styles.num}>{row.screen_count}</td>
                        <td className={styles.num}>{row.share_percent}%</td>
                        <td className={styles.num}>{formatMoney(row.amount_display, symbol, decimals, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          )}

          {/* Proposed Placements */}
          {pkg.screens?.length > 0 && (
            <article className={styles.card}>
              <h2 className={styles.cardTitle}>Proposed Advertising Placements</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Placement</th>
                      <th>Format</th>
                      <th>City</th>
                      <th className={styles.num}>Estimated ({proposal.currency_code})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pkg.screens.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.screen_type}</td>
                        <td>{s.city_name}</td>
                        <td className={styles.num}>{formatMoney(s.estimated_display, symbol, decimals, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          )}

          {/* Alternative Options */}
          {alts.length > 0 && (
            <article className={styles.card}>
              <h2 className={styles.cardTitle}>Alternative Campaign Options</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Package</th>
                      <th>Duration</th>
                      <th className={styles.num}>Screens</th>
                      <th className={styles.num}>Cities</th>
                      <th className={styles.num}>Estimated ({proposal.currency_code})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alts.map((alt) => (
                      <tr key={alt.key || alt.name}>
                        <td>
                          <strong>{alt.name}</strong>
                          {alt.positioning && <div className="muted" style={{ fontSize: "0.8rem" }}>{alt.positioning}</div>}
                        </td>
                        <td>{alt.duration_label || `${alt.duration_days || 30} days`}</td>
                        <td className={styles.num}>{alt.screen_count || 0}</td>
                        <td className={styles.num}>{alt.cities_covered_count || 0}</td>
                        <td className={styles.num}>{formatMoney(alt.pricing?.estimated_total_display, symbol, decimals, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          )}

          {/* Assumptions */}
          {pkg.assumptions?.length > 0 && (
            <article className={styles.card}>
              <h2 className={styles.cardTitle}>Important Assumptions &amp; Next Steps</h2>
              <ul className={styles.bullets}>
                {pkg.assumptions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
