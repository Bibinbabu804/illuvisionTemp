import { site } from "@/data/site";

export const absoluteUrl = (path = "/") => new URL(path, site.url).toString();

/** Page metadata with canonical + Open Graph + Twitter defaults. */
export function pageMetadata({ title, description, path = "/", image }) {
  const images = image ? [{ url: image }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: title ? `${title} | ${site.name}` : site.name,
      description,
      url: path,
      siteName: site.name,
      type: "website",
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} | ${site.name}` : site.name,
      description,
      ...(images && { images: images.map((i) => i.url) }),
    },
  };
}

export function organizationSchema(logoUrl) {
  const sameAs = site.social.map((s) => s.href);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: absoluteUrl(logoUrl),
    slogan: site.tagline,
    ...(sameAs.length && { sameAs }),
    ...(site.contact.email && { email: site.contact.email }),
  };
}

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

/**
 * Product schema is only emitted for verified (non-sample) products, and
 * only includes an Offer when an approved public price exists.
 */
export function productSchema(product, publicPricing) {
  if (!product || product.sample) return null;
  const images = (product.images || []).map((i) => (typeof i === "string" ? i : i.src)).filter(Boolean);
  const brandName = product.brand?.name || product.brand_name || site.name;
  const canonicalUrl = absoluteUrl(`/screens/${product.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku || product.model_number,
    description: product.seo?.description || product.summary || product.short_description,
    ...(images.length > 0 && { image: images }),
    brand: { "@type": "Brand", name: brandName },
    url: canonicalUrl,
    ...(publicPricing &&
      product.price != null && {
        offers: {
          "@type": "Offer",
          name: `${product.name} — Founding Partner Program`,
          price: product.price,
          priceCurrency: product.currency || "INR",
          url: canonicalUrl,
          eligibleCustomerType: "https://schema.org/Business",
          ...(product.stock && { availability: `https://schema.org/${product.stock}` }),
        },
      }),
  };
}

export function foundingPartnerPriceListSchema(pricingData) {
  const items = pricingData?.items || [];
  if (!items.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: pricingData.title || "Founding Partner Price List 2026",
    description:
      "Founding Partner program pricing for eligible Illuvision commercial digital displays and standees (delivered and installed, before 18% GST).",
    url: absoluteUrl("/screens#prices"),
    numberOfItems: items.length,
    itemListElement: items.map((item, idx) => ({
      "@type": "Offer",
      position: idx + 1,
      name: `${item.product_name} — ${item.variant_name} ${item.brand} (Founding Partner)`,
      price: item.founding_partner_price,
      priceCurrency: item.currency || pricingData.currency || "INR",
      url: absoluteUrl(item.product_url || `/screens/${item.product_slug}`),
      eligibleCustomerType: "https://schema.org/Business",
      itemOffered: {
        "@type": "Product",
        name: `${item.product_name} (${item.variant_name} ${item.brand})`,
        brand: { "@type": "Brand", name: item.brand || site.name },
        url: absoluteUrl(item.product_url || `/screens/${item.product_slug}`),
      },
    })),
  };
}

export function JsonLd({ data }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
