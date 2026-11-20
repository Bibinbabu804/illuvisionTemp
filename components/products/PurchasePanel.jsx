"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import BtnIcon from "@/components/ui/BtnIcon";
import { priceLabel } from "./ProductCard";
import { SELECT_VARIANT_EVENT } from "./PriceTable";
import { formatINR } from "@/data/catalog";
import { site } from "@/data/site";
import { track, EVENTS } from "@/lib/analytics";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { requestProductCode } from "@/services/api/products/requestCode.api";
import styles from "./PurchasePanel.module.css";

export default function PurchasePanel({ product, categoryName }) {
  const [qty, setQty] = useState(1);
  const [market, setMarket] = useState("");
  const panelRef = useRef(null);
  const variantSelectRef = useRef(null);
  const inFlightRef = useRef(false);
  const idempotencyKeyRef = useRef("");
  const [showSticky, setShowSticky] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);

  // Size + display chosen in a price table (?size=43&display=Panasonic) or
  // in the picker below. -1 = nothing chosen yet.
  const variants = product.variants || [];
  const [variantIndex, setVariantIndex] = useState(-1);
  const findVariant = (size, display) =>
    variants.findIndex((v) => v.size === Number(size) && v.display.toLowerCase() === String(display).toLowerCase());

  useEffect(() => {
    const fromUrl = () => {
      const q = new URLSearchParams(window.location.search);
      if (q.get("size") && q.get("display")) setVariantIndex(findVariant(q.get("size"), q.get("display")));
    };
    const fromEvent = (e) => setVariantIndex(findVariant(e.detail.size, e.detail.display));
    fromUrl();
    window.addEventListener(SELECT_VARIANT_EVENT, fromEvent);
    return () => window.removeEventListener(SELECT_VARIANT_EVENT, fromEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  const variant = variants[variantIndex];
  const variantLabel = variant ? `${variant.size}″ ${variant.display}` : null;
  const shownPrice = variant
    ? variant.founding != null
      ? formatINR(variant.founding)
      : "Request code"
    : priceLabel(product);

  // Reset idempotency token & inline error whenever selection changes
  useEffect(() => {
    idempotencyKeyRef.current = "";
    setRequestError("");
    setGeneratedCode(null);
  }, [product.slug, variantIndex, qty, market]);

  useEffect(() => {
    track(EVENTS.PRODUCT_VIEW, { sku: product.sku, sample: product.sample });
  }, [product.sku, product.sample]);

  // Mobile sticky CTA appears once the main CTA has scrolled above the viewport.
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

  const handleRequestCode = async (source) => {
    if (inFlightRef.current || isRequesting) return;
    setRequestError("");

    // 1. Validate website WhatsApp configuration before creating a backend code
    const configuredWhatsApp = site.contact?.whatsapp;
    if (!normalizeWhatsAppNumber(configuredWhatsApp)) {
      setRequestError("WhatsApp enquiry is currently unavailable. Please contact us directly by phone.");
      return;
    }

    // 2. Validate mandatory product variant selection when variants exist
    if (variants.length > 0 && !variant) {
      setRequestError("Please select a size and display option before requesting a code.");
      variantSelectRef.current?.focus();
      return;
    }

    inFlightRef.current = true;
    setIsRequesting(true);

    try {
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current =
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `prq-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      }

      const productUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/screens/${product.slug}`
          : `${site.url.replace(/\/+$/, "")}/screens/${product.slug}`;

      const result = await requestProductCode({
        slug: product.slug,
        variantId: variant?.id || null,
        quantity: qty,
        deliveryLocation: market,
        productUrl,
        idempotencyKey: idempotencyKeyRef.current,
      });

      const wa = buildWhatsAppUrl(configuredWhatsApp, result.whatsapp_message);
      if (!wa.ok || !wa.url) {
        setRequestError(wa.error || "Unable to open WhatsApp. Please contact us directly.");
        return;
      }

      setGeneratedCode({
        code: result.request_code,
        whatsappUrl: wa.url,
      });

      track(EVENTS.SHOP_CTA, {
        section: source,
        sku: product.sku,
        cta: "request-code-whatsapp",
        request_code: result.request_code,
      });

      const popup = window.open(wa.url, "_blank", "noopener,noreferrer");
      if (!popup) {
        // Fallback for strict mobile/desktop popup blockers
        window.location.href = wa.url;
      }
    } catch (error) {
      setRequestError(error?.message || "Unable to generate a request code right now. Please try again.");
    } finally {
      inFlightRef.current = false;
      setIsRequesting(false);
    }
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
          <span className={styles.priceLabel}>
            {variant
              ? `${variantLabel} · Founding Partner price, before 18% GST`
              : site.features.publicPricing && product.price != null
                ? "Founding Partner price, before 18% GST"
                : "Price"}
          </span>
          <span className={styles.price}>{shownPrice}</span>
          {variant && variant.outright != null && (
            <span className={styles.outrightNote}>Buy Outright {formatINR(variant.outright)}</span>
          )}
        </div>
        {product.stock ? (
          <span className="badge badge--green">{product.stock}</span>
        ) : (
          <a href="#prices" className={styles.stockNote}>See all sizes and prices</a>
        )}
      </div>

      {site.features.publicPricing && variants.length > 0 && (
        <div className={`field ${styles.variantField}`}>
          <label htmlFor="variant">Size and display</label>
          <select
            ref={variantSelectRef}
            id="variant"
            className="input"
            value={variantIndex}
            aria-invalid={Boolean(requestError && variants.length > 0 && !variant)}
            onChange={(e) => {
              const i = Number(e.target.value);
              setVariantIndex(i);
              const v = variants[i];
              if (v) window.history.replaceState(null, "", `?size=${v.size}&display=${encodeURIComponent(v.display)}`);
            }}
          >
            <option value={-1}>Choose a size and display</option>
            {variants.map((v, i) => (
              <option key={`${v.size}-${v.display}`} value={i}>
                {v.size}″ {v.display}
                {v.founding != null ? ` · ${formatINR(v.founding)}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.controls}>
        <div className="field">
          <label htmlFor="qty">Quantity</label>
          <div className={styles.qty}>
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" disabled={qty <= 1 || isRequesting}>
              <Icon name="minus" size={18} />
            </button>
            <input
              id="qty"
              type="number"
              inputMode="numeric"
              min="1"
              value={qty}
              disabled={isRequesting}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            />
            <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity" disabled={isRequesting}>
              <Icon name="plus" size={18} />
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="market">Deliver to</label>
          {markets.length ? (
            <select id="market" className="input" value={market} disabled={isRequesting} onChange={(e) => setMarket(e.target.value)}>
              <option value="">Select a market</option>
              {markets.map((m) => <option key={m}>{m}</option>)}
            </select>
          ) : (
            <input
              id="market"
              className="input"
              placeholder="Town or city"
              autoComplete="address-level2"
              value={market}
              disabled={isRequesting}
              onChange={(e) => setMarket(e.target.value)}
            />
          )}
        </div>
      </div>

      {requestError && (
        <p role="alert" style={{ color: "#b91c1c", fontSize: "0.875rem", fontWeight: 500, marginBottom: 12 }}>
          {requestError}
        </p>
      )}

      {generatedCode && (
        <p role="status" className="notice" style={{ marginBottom: 12 }}>
          <Icon name="check" size={16} />
          <span>
            Request Code <strong>{generatedCode.code}</strong> ready.{" "}
            <a href={generatedCode.whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", fontWeight: 600 }}>
              Open WhatsApp
            </a>
          </span>
        </p>
      )}

      <button
        type="button"
        className="btn btn--block"
        data-main-cta
        disabled={isRequesting}
        aria-busy={isRequesting}
        onClick={() => handleRequestCode("product-panel")}
      >
        <BtnIcon name="arrow" />
        <span>{isRequesting ? "Generating code…" : "Request Code"}</span>
      </button>

      <ul className={styles.assure}>
        <li><Icon name="check" size={16} /> Generates a unique reference code and opens WhatsApp</li>
        <li><Icon name="check" size={16} /> No obligation to buy</li>
      </ul>

      {/* Mobile sticky CTA */}
      <div className={styles.sticky} data-show={showSticky} aria-hidden={!showSticky} inert={!showSticky}>
        <div>
          <strong>{variant ? `${variantLabel} ${product.name}` : product.name}</strong>
          <span>{shownPrice}</span>
        </div>
        <button
          type="button"
          className="btn btn--plain"
          disabled={isRequesting}
          onClick={() => handleRequestCode("sticky-cta")}
        >
          {isRequesting ? "Generating…" : "Request Code"}
        </button>
      </div>
    </div>
  );
}
