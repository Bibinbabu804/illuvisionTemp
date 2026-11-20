"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import ProductCard from "./ProductCard";
import Icon from "@/components/ui/Icon";
import { categories as staticCategories, products as staticProducts } from "@/data/catalog";
import { usePublicProducts } from "@/services/api/products/product.queries";
import { track, EVENTS } from "@/lib/analytics";
import styles from "./ProductBrowser.module.css";

export default function ProductBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const active = params.get("category") || "all";
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recommended");
  const [size, setSize] = useState("any");

  // Query parameters formatted for the backend API
  const apiFilters = useMemo(() => {
    const f = {};
    if (active !== "all") f.category = active;
    if (query.trim()) f.search = query.trim();
    if (size !== "any") f.size = size;
    if (sort === "price-asc") {
      f.sort_by = "price";
      f.sort_order = "asc";
    } else if (sort === "price-desc") {
      f.sort_by = "price";
      f.sort_order = "desc";
    }
    f.per_page = 50;
    return f;
  }, [active, query, size, sort]);

  const { data: serverResult, isLoading, isError } = usePublicProducts(apiFilters);

  // Fallback computation for offline backend / network resilience
  const fallbackResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = staticProducts
      .filter(
        (p) =>
          (active === "all" || p.category === active) &&
          (!q || `${p.name} ${p.sku} ${p.summary} ${p.useCases.join(" ")}`.toLowerCase().includes(q))
      )
      .map((p) => {
        if (size === "any" || !p.variants) return p;
        const variants = p.variants.filter((v) => v.size === Number(size));
        if (!variants.length) return null;
        return { ...p, variants, price: Math.min(...variants.map((v) => v.founding)) };
      })
      .filter(Boolean);
    if (sort === "price-asc") return [...list].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === "price-desc") return [...list].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    return list;
  }, [active, query, sort, size]);

  // Use dynamic server results when available, otherwise fallback gracefully
  const results = useMemo(() => {
    if (serverResult?.data && Array.isArray(serverResult.data) && serverResult.data.length > 0) {
      return serverResult.data;
    }
    if (!isLoading && (isError || !serverResult?.data || serverResult.data.length === 0)) {
      return fallbackResults;
    }
    return serverResult?.data || [];
  }, [serverResult, isLoading, isError, fallbackResults]);

  // Collect available sizes across products
  const allSizes = useMemo(() => {
    const source = results.length > 0 ? results : staticProducts;
    return [...new Set(source.flatMap((p) => (p.variants || []).map((v) => v.size)))].sort((a, b) => a - b);
  }, [results]);

  const setCategory = (slug) => {
    const next = new URLSearchParams(params);
    if (slug === "all") next.delete("category");
    else next.set("category", slug);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    track(EVENTS.SHOP_CTA, { section: "category-filter", category: slug });
  };

  const onSort = (value) => {
    setSort(value);
    track(EVENTS.SHOP_CTA, { section: "listing-sort", sort: value });
  };
  const onSize = (value) => {
    setSize(value);
    track(EVENTS.SHOP_CTA, { section: "listing-size", size: value });
  };

  const counts = useMemo(
    () => Object.fromEntries(staticCategories.map((c) => [c.slug, staticProducts.filter((p) => p.category === c.slug).length])),
    []
  );

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={`chip-group ${styles.chips}`} role="group" aria-label="Filter by category">
          <button type="button" className={`chip ${styles.chipAnim}`} aria-pressed={active === "all"} onClick={() => setCategory("all")}>
            {active === "all" && <motion.span layoutId="chip-pill" className={styles.pill} transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <b>All</b> <span className="chip__count">{results.length || staticProducts.length}</span>
          </button>
          {staticCategories.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={`chip ${styles.chipAnim}`}
              aria-pressed={active === c.slug}
              onClick={() => setCategory(c.slug)}
            >
              {active === c.slug && <motion.span layoutId="chip-pill" className={styles.pill} transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <b>{c.name}</b> <span className="chip__count">{counts[c.slug]}</span>
            </button>
          ))}
        </div>
        <label className={styles.search}>
          <Icon name="zoom" size={18} />
          <span className="visually-hidden">Search screens</span>
          <input
            type="search"
            className="input"
            placeholder="Search screens"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className={styles.filters}>
        <p className={styles.count} aria-live="polite">
          Showing {results.length} screen{results.length === 1 ? "" : "s"}
          {size !== "any" && ` in ${size}″`}
        </p>
        <div className={styles.selects}>
          <label className={styles.select}>
            <span>Size</span>
            <select className="input" value={size} onChange={(e) => onSize(e.target.value)}>
              <option value="any">All sizes</option>
              {allSizes.map((s) => (
                <option key={s} value={s}>{s} inch</option>
              ))}
            </select>
          </label>
          <label className={styles.select}>
            <span>Sort by</span>
            <select className="input" value={sort} onChange={(e) => onSort(e.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>

      {isLoading && results.length === 0 ? (
        <ul className={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={`grid-skeleton-${i}`} className={styles.item} aria-hidden="true">
              <div
                style={{
                  height: 480,
                  borderRadius: 16,
                  background: "rgba(0, 0, 0, 0.04)",
                  animation: "pulse 1.8s ease-in-out infinite",
                }}
              />
            </li>
          ))}
        </ul>
      ) : results.length ? (
        <LayoutGroup>
          <motion.ul layout className={styles.grid}>
            <AnimatePresence mode="popLayout">
              {results.map((p, i) => (
                <motion.li
                  layout
                  key={p.slug || p.id}
                  className={styles.item}
                  initial={{ opacity: 0, y: 60, rotateX: 18, scale: 0.94 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (i % 3) * 0.08 }}
                >
                  <ProductCard product={p} priority={i < 3} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </LayoutGroup>
      ) : (
        <div className={styles.empty}>
          <p>No screens match your search.</p>
          <button type="button" className="text-link" onClick={() => { setQuery(""); setSize("any"); setCategory("all"); }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
