"use client";

import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { getCategory } from "@/data/catalog";
import { site } from "@/data/site";
import { track, EVENTS } from "@/lib/analytics";
import styles from "./ProductCard.module.css";

export function priceLabel(product) {
  if (site.features.publicPricing && product.price != null) {
    return new Intl.NumberFormat("en", { style: "currency", currency: product.currency }).format(product.price);
  }
  return "Request quote";
}

export default function ProductCard({ product, section = "listing", priority = false, tall = false }) {
  const category = getCategory(product.category);
  const [primary, secondary] = product.images;
  const onClick = () =>
    track(section === "featured" ? EVENTS.FEATURED_PRODUCT : EVENTS.SCREEN_DETAIL, {
      sku: product.sku,
      section,
    });

  // Subtle 3D tilt toward the pointer (mouse only; written to CSS vars).
  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty("--ry", `${px * 6}deg`);
    e.currentTarget.style.setProperty("--rx", `${py * -6}deg`);
  };
  const onLeave = (e) => {
    e.currentTarget.style.setProperty("--ry", "0deg");
    e.currentTarget.style.setProperty("--rx", "0deg");
  };

  return (
    <article className={`${styles.card} ${tall ? styles.tall : ""}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      <Link href={`/screens/${product.slug}`} className={styles.media} onClick={onClick} tabIndex={-1} aria-hidden="true">
        <Image
          src={primary.src}
          alt=""
          fill
          sizes="(max-width: 767px) 92vw, (max-width: 1279px) 46vw, 400px"
          quality={60}
          className={styles.img}
          loading={priority ? "eager" : "lazy"}
        />
        {secondary && (
          <Image
            src={secondary.src}
            alt=""
            fill
            sizes="(max-width: 767px) 92vw, (max-width: 1279px) 46vw, 400px"
            quality={60}
            className={`${styles.img} ${styles.alt}`}
          />
        )}
        <span className={styles.badges}>
          {product.sample && <span className="badge badge--sample">Sample listing</span>}
        </span>
      </Link>

      <div className={styles.body}>
        <div className={styles.meta}>
          <span>{category?.name}</span>
          <span className={styles.sku}>{product.sku}</span>
        </div>
        <h3 className={styles.name}>
          <Link href={`/screens/${product.slug}`} onClick={onClick}>
            {product.name}
          </Link>
        </h3>
        <p className={styles.summary}>{product.summary}</p>

        <dl className={styles.facts}>
          <div>
            <dt>Format</dt>
            <dd>{product.format}</dd>
          </div>
          <div>
            <dt>Ideal for</dt>
            <dd>{product.useCases.slice(0, 2).join(", ")}</dd>
          </div>
        </dl>

        <div className={styles.foot}>
          <span className={styles.price}>{priceLabel(product)}</span>
          <span className={styles.go} aria-hidden="true">
            <Icon name="arrow" size={18} />
          </span>
        </div>
      </div>
    </article>
  );
}
