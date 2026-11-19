"use client";

import { Fragment, useId, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import BtnIcon from "@/components/ui/BtnIcon";
import { displayOptions, formatINR } from "@/data/catalog";
import { track, EVENTS } from "@/lib/analytics";
import styles from "./PriceTable.module.css";

/** Event the product page listens for when Buy now is pressed on that same page. */
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
 * With `productSlug`, each row expands (like the FAQ) to show what each
 * option includes and a Buy now button that opens the product page with
 * that size and display selected.
 */
export default function PriceTable({ variants, caption, productSlug, productName }) {
  const [open, setOpen] = useState(-1);
  const id = useId();
  const expandable = Boolean(productSlug);
  const cols = expandable ? 6 : 5;

  const toggle = (i, v) => {
    const next = open === i ? -1 : i;
    setOpen(next);
    if (next !== -1) track(EVENTS.SHOP_CTA, { section: "price-table", sku: productSlug, size: v.size, display: v.display, cta: "expand" });
  };

  const onBuy = (e, v) => {
    track(EVENTS.SHOP_CTA, { section: "price-table", sku: productSlug, size: v.size, display: v.display, cta: "buy-now" });
    // Already on this product's page: select the variant in place.
    if (window.location.pathname.replace(/\/$/, "") === `/screens/${productSlug}`) {
      e.preventDefault();
      window.history.replaceState(null, "", variantHref(productSlug, v));
      window.dispatchEvent(new CustomEvent(SELECT_VARIANT_EVENT, { detail: { size: v.size, display: v.display } }));
      window.scrollTo({ top: 0, behavior: "smooth" });
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
                    <s>{formatINR(v.regular)}</s>
                  </td>
                  <td className={styles.founding}>{formatINR(v.founding)}</td>
                  <td className={styles.outright}>{formatINR(v.outright)}</td>
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
                              <p className={styles.save}>
                                Save {formatINR(v.regular - v.founding)} as a Founding Partner
                              </p>
                            </div>

                            <div className={styles.options}>
                              <div className={`${styles.option} ${styles.optionFounding}`}>
                                <span className={styles.optionName}>Founding Partner</span>
                                <strong>{formatINR(v.founding)}</strong>
                                <ul>
                                  {founding.map((t) => (
                                    <li key={t}><Icon name="check" size={14} /> {t}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className={styles.option}>
                                <span className={styles.optionName}>Buy Outright</span>
                                <strong>{formatINR(v.outright)}</strong>
                                <ul>
                                  {outright.map((t) => (
                                    <li key={t}><Icon name="check" size={14} /> {t}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <ul className={styles.features} aria-label={`${v.display} display features`}>
                              {featuresFor(v.display, v.size).map((f) => (
                                <li key={f}>{f}</li>
                              ))}
                            </ul>

                            <div className={styles.actions}>
                              <Link
                                href={variantHref(productSlug, v)}
                                className="btn btn--accent"
                                onClick={(e) => onBuy(e, v)}
                              >
                                <BtnIcon name="arrow" />
                                <span>Buy now</span>
                              </Link>
                              <span className={styles.gst}>Prices before GST. 18% GST will be added.</span>
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
