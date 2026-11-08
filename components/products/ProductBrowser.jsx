"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import ProductCard from "./ProductCard";
import Icon from "@/components/ui/Icon";
import { categories, products } from "@/data/catalog";
import { track, EVENTS } from "@/lib/analytics";
import styles from "./ProductBrowser.module.css";

export default function ProductBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const active = params.get("category") || "all";
  const [query, setQuery] = useState("");

  const setCategory = (slug) => {
    const next = new URLSearchParams(params);
    if (slug === "all") next.delete("category");
    else next.set("category", slug);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    track(EVENTS.SHOP_CTA, { section: "category-filter", category: slug });
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (active === "all" || p.category === active) &&
        (!q || `${p.name} ${p.sku} ${p.summary} ${p.useCases.join(" ")}`.toLowerCase().includes(q))
    );
  }, [active, query]);

  const counts = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.slug, products.filter((p) => p.category === c.slug).length])),
    []
  );

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={`chip-group ${styles.chips}`} role="group" aria-label="Filter by category">
          <button type="button" className={`chip ${styles.chipAnim}`} aria-pressed={active === "all"} onClick={() => setCategory("all")}>
            {active === "all" && <motion.span layoutId="chip-pill" className={styles.pill} transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <b>All</b> <span className="chip__count">{products.length}</span>
          </button>
          {categories.map((c) => (
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

      <p className={styles.count} aria-live="polite">
        Showing {results.length} of {products.length} screens
      </p>

      {results.length ? (
        <LayoutGroup>
          <motion.ul layout className={styles.grid}>
            <AnimatePresence mode="popLayout">
              {results.map((p, i) => (
                <motion.li
                  layout
                  key={p.slug}
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
          <button type="button" className="text-link" onClick={() => { setQuery(""); setCategory("all"); }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
