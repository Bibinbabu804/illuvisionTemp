"use client";

import { useEffect, useMemo, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { SELECT_VARIANT_EVENT } from "./PriceTable";
import styles from "@/app/screens/[slug]/page.module.css";

/**
 * Restored Key Specifications card grid for Marketplace Product Details.
 * Renders product-level specifications immediately in SSR HTML (zero client fetch)
 * and dynamically merges variant-specific overrides when a visitor chooses a variant.
 */
export default function KeySpecifications({ specifications = [], variants = [], productSlug }) {
  const defaultVariantKey =
    Array.isArray(variants) && variants.length > 0
      ? `${Number(variants[0].size)}::${String(variants[0].display || "").toLowerCase()}`
      : null;
  const [selectedVariantKey, setSelectedVariantKey] = useState(defaultVariantKey);

  useEffect(() => {
    const syncFromUrl = () => {
      const q = new URLSearchParams(window.location.search);
      const size = q.get("size");
      const display = q.get("display");
      if (size && display) {
        setSelectedVariantKey(`${Number(size)}::${String(display).toLowerCase()}`);
      } else {
        setSelectedVariantKey(defaultVariantKey);
      }
    };
    const syncFromEvent = (e) => {
      if (e?.detail?.size && e?.detail?.display) {
        setSelectedVariantKey(`${Number(e.detail.size)}::${String(e.detail.display).toLowerCase()}`);
      }
    };

    syncFromUrl();
    window.addEventListener(SELECT_VARIANT_EVENT, syncFromEvent);
    window.addEventListener("popstate", syncFromUrl);
    return () => {
      window.removeEventListener(SELECT_VARIANT_EVENT, syncFromEvent);
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, [productSlug, defaultVariantKey]);

  const activeVariant = useMemo(() => {
    if (!selectedVariantKey || !Array.isArray(variants)) return null;
    return (
      variants.find(
        (v) => `${Number(v.size)}::${String(v.display || "").toLowerCase()}` === selectedVariantKey
      ) || null
    );
  }, [selectedVariantKey, variants]);

  const displayedSpecs = useMemo(() => {
    const map = new Map();

    // 1. Seed with shared product-level specifications
    (specifications || []).forEach((spec) => {
      if (!spec?.name && !spec?.label) return;
      if (!spec?.value) return;
      const key = spec.key || String(spec.label || spec.name).toLowerCase().replace(/\s+/g, "_");
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: spec.label || spec.name,
          value: spec.unit ? `${spec.value} ${spec.unit}` : spec.value,
        });
      }
    });

    // 2. Apply variant-specific overrides when a variant is selected (no duplicate keys)
    if (activeVariant && Array.isArray(activeVariant.specifications)) {
      activeVariant.specifications.forEach((vSpec) => {
        if (!vSpec?.value) return;
        const key = vSpec.key || String(vSpec.label || vSpec.name).toLowerCase().replace(/\s+/g, "_");
        map.set(key, {
          key,
          label: vSpec.label || vSpec.name,
          value: vSpec.unit ? `${vSpec.value} ${vSpec.unit}` : vSpec.value,
        });
      });
    }

    return Array.from(map.values()).slice(0, 4);
  }, [specifications, activeVariant]);

  if (displayedSpecs.length === 0) {
    return null;
  }

  return (
    <section className={styles.specs} aria-labelledby="key-specs">
      <div className="container">
        <h2 id="key-specs" className={styles.h2}>
          Key specifications
          {activeVariant ? ` — ${activeVariant.size}″ ${activeVariant.display}` : ""}
        </h2>
        <ul className={styles.keySpecs}>
          {displayedSpecs.map((spec, i) => (
            <Reveal as="li" key={spec.key} delay={i * 70}>
              <span>{spec.label}</span>
              <strong>{spec.value}</strong>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
