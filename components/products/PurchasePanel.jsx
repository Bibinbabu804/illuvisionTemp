"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import BtnIcon from "@/components/ui/BtnIcon";
import EnquiryForm from "@/components/forms/EnquiryForm";
import { priceLabel } from "./ProductCard";
import { site } from "@/data/site";
import { track, EVENTS } from "@/lib/analytics";
import styles from "./PurchasePanel.module.css";

export default function PurchasePanel({ product, categoryName }) {
  const [qty, setQty] = useState(1);
  const [market, setMarket] = useState("");
  const dialogRef = useRef(null);
  const panelRef = useRef(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    track(EVENTS.PRODUCT_VIEW, { sku: product.sku, sample: product.sample });
  }, [product.sku, product.sample]);

  // Mobile sticky CTA appears once the main CTA has scrolled above the
  // viewport. A passive, rAF-throttled check (one rect read per frame)
  // also handles fast flings that jump past the button entirely.
  useEffect(() => {
    const el = panelRef.current?.querySelector("[data-main-cta]");
    const mq = window.matchMedia("(max-width: 1023px)");
    if (!el) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      setShowSticky(mq.matches && el.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    mq.addEventListener("change", check);
    return () => {
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", check);
      cancelAnimationFrame(frame);
    };
  }, []);

  const openQuote = (source) => {
    track(EVENTS.SHOP_CTA, { section: source, sku: product.sku, cta: "request-quote" });
    dialogRef.current?.showModal();
  };

  const markets = site.deliveryMarkets;

  return (
    <div className={styles.panel} ref={panelRef}>
      <div className={styles.top}>
        <span className={styles.cat}>{categoryName}</span>
        {product.sample && <span className="badge badge--sample">Sample listing</span>}
      </div>
      <h1 className={styles.name}>{product.name}</h1>
      <p className={styles.sku}>
        Model / SKU: <span>{product.sku}</span>
      </p>
      <p className={styles.summary}>{product.summary}</p>

      <div className={styles.priceRow}>
        <div>
          <span className={styles.priceLabel}>Price</span>
          <span className={styles.price}>{priceLabel(product)}</span>
        </div>
        {product.stock ? (
          <span className="badge badge--green">{product.stock}</span>
        ) : (
          <span className={styles.stockNote}>Availability confirmed with your quote</span>
        )}
      </div>

      <div className={styles.controls}>
        <div className="field">
          <label htmlFor="qty">Quantity</label>
          <div className={styles.qty}>
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" disabled={qty <= 1}>
              <Icon name="minus" size={18} />
            </button>
            <input
              id="qty"
              type="number"
              inputMode="numeric"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            />
            <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
              <Icon name="plus" size={18} />
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="market">Deliver to</label>
          {markets.length ? (
            <select id="market" className="input" value={market} onChange={(e) => setMarket(e.target.value)}>
              <option value="">Select a market</option>
              {markets.map((m) => <option key={m}>{m}</option>)}
            </select>
          ) : (
            <input
              id="market"
              className="input"
              placeholder="City, country"
              autoComplete="country-name"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
            />
          )}
        </div>
      </div>

      <button type="button" className="btn btn--block" data-main-cta onClick={() => openQuote("product-panel")}>
        <BtnIcon name="arrow" />
        <span>Request quote</span>
      </button>

      <ul className={styles.assure}>
        <li><Icon name="check" size={16} /> Confirmed specs, price and delivery in your quote</li>
        <li><Icon name="check" size={16} /> No obligation to buy</li>
      </ul>

      {/* Mobile sticky CTA */}
      <div className={styles.sticky} data-show={showSticky} aria-hidden={!showSticky} inert={!showSticky}>
        <div>
          <strong>{product.name}</strong>
          <span>{priceLabel(product)}</span>
        </div>
        <button type="button" className="btn btn--plain" onClick={() => openQuote("sticky-cta")}>
          Request quote
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        data-lenis-prevent
        aria-labelledby="quote-title"
        onClick={(e) => e.target === e.currentTarget && dialogRef.current.close()}
      >
        <div className={styles.dialogInner}>
          <div className={styles.dialogHead}>
            <div>
              <p className="eyebrow">Request a quote</p>
              <h2 id="quote-title">{product.name}</h2>
              <p className="muted">{product.sku}</p>
            </div>
            <button type="button" className={styles.close} onClick={() => dialogRef.current.close()} aria-label="Close">
              <Icon name="close" size={20} />
            </button>
          </div>
          <EnquiryForm
            variant="product"
            product={product}
            defaults={{ quantity: qty, deliveryLocation: market }}
          />
        </div>
      </dialog>
    </div>
  );
}
