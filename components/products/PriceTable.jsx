"use client";

import { Fragment, useId, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import BtnIcon from "@/components/ui/BtnIcon";
import { displayOptions, formatINR } from "@/data/catalog";
import { site } from "@/data/site";
import { track, EVENTS } from "@/lib/analytics";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { requestProductCode } from "@/services/api/products/requestCode.api";
import styles from "./PriceTable.module.css";

/** Event the product page listens for when a variant is chosen. */
export const SELECT_VARIANT_EVENT = "illuvision:select-variant";

/** /screens/<slug>/?size=43&display=Panasonic — read back by PurchasePanel. */
export const variantHref = (slug, v) =>
  `/screens/${slug}/?size=${v.size}&display=${encodeURIComponent(v.display)}`;

const founding = [
  "Delivered and installed",
  "3 months free ad videos",
  "Free software and support",
  "Earn a share of ad profit",
];
const outright = ["You own it, for your own content only", "Installation and transport extra"];

/** Brochure features for a display; 4K applies to Panasonic 43" and above only. */
const featuresFor = (display, size) =>
  (displayOptions.find((d) => d.name === display)?.points || []).filter((p) => !(p.startsWith("4K") && size < 43));

/**
 * Price table for one format: every size + display with its regular,
 * Founding Partner and Buy Outright price (all before GST).
 *
 * With `productSlug`, each row expands to let the visitor choose between
 * Founding Partner and Buy Outright plans and click Request Quote to generate
 * a unique backend Request Code and open WhatsApp.
 */
export default function PriceTable({ variants, caption, productSlug, productName }) {
  const [open, setOpen] = useState(-1);
  const [selectedPlans, setSelectedPlans] = useState({});
  const [requestingRow, setRequestingRow] = useState(null);
  const [rowError, setRowError] = useState({});
  const [rowResult, setRowResult] = useState({});
  const idempotencyRef = useRef({});
  const id = useId();
  const expandable = Boolean(productSlug);
  const cols = expandable ? 6 : 5;

  const getSelectedPlan = (rowIndex, v) => {
    if (selectedPlans[rowIndex]) return selectedPlans[rowIndex];
    if (v.founding != null) return "founding";
    return "outright";
  };

  const selectPlan = (rowIndex, plan) => {
    setSelectedPlans((prev) => ({ ...prev, [rowIndex]: plan }));
    setRowError((prev) => ({ ...prev, [rowIndex]: "" }));
    setRowResult((prev) => ({ ...prev, [rowIndex]: null }));
    idempotencyRef.current[rowIndex] = "";
  };

  const toggle = (i, v) => {
    const next = open === i ? -1 : i;
    setOpen(next);
    if (next !== -1) {
      track(EVENTS.SHOP_CTA, { section: "price-table", sku: productSlug, size: v.size, display: v.display, cta: "expand" });
    }
  };

  const onRequestQuote = async (e, i, v) => {
    e.stopPropagation();
    if (requestingRow !== null) return;

    const plan = getSelectedPlan(i, v);
    const configuredWhatsApp = site.contact?.whatsapp;
    if (!normalizeWhatsAppNumber(configuredWhatsApp)) {
      setRowError((prev) => ({
        ...prev,
        [i]: "WhatsApp enquiry is currently unavailable. Please contact us directly by phone.",
      }));
      return;
    }

    setRequestingRow(i);
    setRowError((prev) => ({ ...prev, [i]: "" }));

    try {
      const cacheSlot = `${i}-${plan}`;
      if (!idempotencyRef.current[cacheSlot]) {
        idempotencyRef.current[cacheSlot] =
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `prq-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      }

      const productUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/screens/${productSlug}`
          : `${site.url.replace(/\/+$/, "")}/screens/${productSlug}`;

      const result = await requestProductCode({
        slug: productSlug,
        variantId: v.variant_id || v.id || null,
        pricingPlan: plan,
        quantity: 1,
        productUrl,
        idempotencyKey: idempotencyRef.current[cacheSlot],
      });

      const wa = buildWhatsAppUrl(configuredWhatsApp, result.whatsapp_message);
      if (!wa.ok || !wa.url) {
        setRowError((prev) => ({
          ...prev,
          [i]: wa.error || "Unable to open WhatsApp. Please contact us directly.",
        }));
        return;
      }

      setRowResult((prev) => ({
        ...prev,
        [i]: { code: result.request_code, whatsappUrl: wa.url },
      }));

      track(EVENTS.SHOP_CTA, {
        section: "price-table",
        sku: productSlug,
        size: v.size,
        display: v.display,
        plan,
        cta: "request-quote-whatsapp",
        request_code: result.request_code,
      });

      const popup = window.open(wa.url, "_blank", "noopener,noreferrer");
      if (!popup) {
        window.location.href = wa.url;
      }
    } catch (error) {
      setRowError((prev) => ({
        ...prev,
        [i]: error?.message || "Unable to generate a request code right now. Please try again.",
      }));
    } finally {
      setRequestingRow(null);
    }
  };

  return (
    <div className={styles.wrap}>
      <table className={styles.table} data-expandable={expandable || undefined}>
        {caption && <caption className="visually-hidden">{caption}</caption>}
        <thead>
          <tr>
            <th scope="col">Size</th>
            <th scope="col">Display</th>
            <th scope="col">Regular</th>
            <th scope="col" className={styles.founding}>Founding Partner</th>
            <th scope="col">Buy Outright</th>
            {expandable && (
              <th scope="col" className={styles.toggleCol}>
                <span className="visually-hidden">Details</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {variants.map((v, i) => {
            const isOpen = open === i;
            const panelId = `${id}-p-${i}`;
            const label = `${v.size}″ ${v.display}`;
            const selectedPlan = getSelectedPlan(i, v);
            const isBusy = requestingRow === i;
            const errorMsg = rowError[i];
            const generated = rowResult[i];

            return (
              <Fragment key={`${v.size}-${v.display}`}>
                <tr
                  className={styles.row}
                  data-tag={v.tag ? "true" : undefined}
                  data-open={isOpen || undefined}
                  onClick={expandable ? () => toggle(i, v) : undefined}
                >
                  <th scope="row">{v.size}&Prime;</th>
                  <td>
                    {v.display}
                    {v.tag && <span className={`badge badge--green ${styles.tag}`}>{v.tag}</span>}
                  </td>
                  <td className={styles.regular}>
                    <span className="visually-hidden">Regular price </span>
                    {v.regular != null ? <s>{formatINR(v.regular)}</s> : <span>—</span>}
                  </td>
                  <td className={styles.founding}>
                    {v.founding != null ? formatINR(v.founding) : "Unavailable"}
                  </td>
                  <td className={styles.outright}>
                    {v.outright != null ? formatINR(v.outright) : "—"}
                  </td>
                  {expandable && (
                    <td className={styles.toggleCol}>
                      <button
                        type="button"
                        className={styles.toggle}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        aria-label={`${isOpen ? "Hide" : "Show"} details for ${label}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(i, v);
                        }}
                      >
                        <Icon name="plus" size={16} />
                      </button>
                    </td>
                  )}
                </tr>

                {expandable && (
                  <tr className={styles.detailRow} data-open={isOpen || undefined}>
                    <td colSpan={cols}>
                      <div className={styles.panel} id={panelId} role="region" aria-label={`${label} details`} inert={!isOpen}>
                        <div className={styles.inner}>
                          <div className={styles.detail}>
                            <div className={styles.detailHead}>
                              <p className={styles.detailTitle}>
                                {label} {productName}
                              </p>
                              {v.regular != null && v.founding != null && v.regular > v.founding && (
                                <p className={styles.save}>
                                  Save {formatINR(v.regular - v.founding)} as a Founding Partner
                                </p>
                              )}
                            </div>

                            <div className={styles.options} role="radiogroup" aria-label={`Choose price plan for ${label}`}>
                              <button
                                type="button"
                                role="radio"
                                aria-checked={selectedPlan === "founding"}
                                data-selected={selectedPlan === "founding" ? "true" : "false"}
                                disabled={v.founding == null}
                                className={styles.option}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectPlan(i, "founding");
                                }}
                              >
                                <span className={styles.optionHead}>
                                  <span className={styles.optionName}>Founding Partner</span>
                                  <span className={styles.optionRadio} aria-hidden="true" />
                                </span>
                                <strong>{v.founding != null ? formatINR(v.founding) : "Unavailable"}</strong>
                                <ul>
                                  {founding.map((t) => (
                                    <li key={t}><Icon name="check" size={14} /> {t}</li>
                                  ))}
                                </ul>
                              </button>

                              <button
                                type="button"
                                role="radio"
                                aria-checked={selectedPlan === "outright"}
                                data-selected={selectedPlan === "outright" ? "true" : "false"}
                                disabled={v.outright == null}
                                className={styles.option}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectPlan(i, "outright");
                                }}
                              >
                                <span className={styles.optionHead}>
                                  <span className={styles.optionName}>Buy Outright</span>
                                  <span className={styles.optionRadio} aria-hidden="true" />
                                </span>
                                <strong>{v.outright != null ? formatINR(v.outright) : "Request quote"}</strong>
                                <ul>
                                  {outright.map((t) => (
                                    <li key={t}><Icon name="check" size={14} /> {t}</li>
                                  ))}
                                </ul>
                              </button>
                            </div>

                            <ul className={styles.features} aria-label={`${v.display} display features`}>
                              {featuresFor(v.display, v.size).map((f) => (
                                <li key={f}>{f}</li>
                              ))}
                            </ul>

                            {errorMsg && (
                              <p role="alert" style={{ color: "#b91c1c", fontSize: "0.85rem", fontWeight: 500, margin: 0 }}>
                                {errorMsg}
                              </p>
                            )}

                            {generated && (
                              <p role="status" className="notice" style={{ margin: 0 }}>
                                <Icon name="check" size={15} />
                                <span>
                                  Request Code <strong>{generated.code}</strong> ready.{" "}
                                  <a
                                    href={generated.whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: "underline", fontWeight: 600 }}
                                  >
                                    Open WhatsApp
                                  </a>
                                </span>
                              </p>
                            )}

                            <div className={styles.actions}>
                              <button
                                type="button"
                                className="btn btn--accent"
                                disabled={isBusy}
                                aria-busy={isBusy}
                                onClick={(e) => onRequestQuote(e, i, v)}
                              >
                                <BtnIcon name="arrow" />
                                <span>{isBusy ? "Generating…" : "Request Quote"}</span>
                              </button>
                              <span className={styles.gst}>
                                Selected: <strong>{selectedPlan === "outright" ? "Buy Outright" : "Founding Partner"}</strong> · Prices before GST. 18% GST will be added.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
