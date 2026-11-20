import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Reveal from "@/components/ui/Reveal";
import Accordion from "@/components/ui/Accordion";
import ProductGallery from "@/components/products/ProductGallery";
import PurchasePanel from "@/components/products/PurchasePanel";
import ProductCard from "@/components/products/ProductCard";
import PriceTable from "@/components/products/PriceTable";
import Icon from "@/components/ui/Icon";
import { pricing } from "@/data/catalog";
import { site, faqs } from "@/data/site";
import { pageMetadata, productSchema, JsonLd } from "@/lib/seo";
import { getMarketplaceProductBySlug, getPublicProductSlugs } from "@/services/server/marketplace";
import styles from "./page.module.css";

export const revalidate = 300; // Next.js ISR: revalidate product details every 5 minutes
export const dynamicParams = true; // Allow newly created admin products to resolve dynamically via ISR

export async function generateStaticParams() {
  const slugs = await getPublicProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getMarketplaceProductBySlug(slug);
  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const categoryName = product.category_name;
  const title = product.seo?.title || (categoryName ? `${product.name} — ${categoryName}` : product.name);
  const baseDesc = product.seo?.description || product.summary || product.short_description || "";
  const description = baseDesc
    ? `${baseDesc} See Founding Partner and Buy Outright prices, or request a quote from Illuvision.`
    : `Explore ${product.name} specifications, display options, and commercial pricing from Illuvision.`;
  const primaryImage = product.seo?.image || product.images?.[0]?.src;

  return {
    ...pageMetadata({
      title,
      description,
      path: `/screens/${product.slug}`,
      image: primaryImage,
    }),
    ...(product.sample && { robots: { index: false, follow: true } }),
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getMarketplaceProductBySlug(slug);
  if (!product) notFound();

  const categoryName = product.category_name || "Screens";
  const categorySlug = product.category || "";
  const brandName = product.brand?.name || product.brand_name || null;
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [{ src: "/images/products/wall-mount.webp", alt: product.name, pos: "50% 50%" }];
  const specifications = Array.isArray(product.specifications) ? product.specifications : [];
  const keySpecs = specifications.slice(0, 4);
  const related = Array.isArray(product.related_products) ? product.related_products : [];
  const useCases = Array.isArray(product.useCases) && product.useCases.length > 0
    ? product.useCases
    : Array.isArray(product.ideal_for)
      ? product.ideal_for
      : [];
  const info = product.info || {};
  const packageContents = Array.isArray(product.package_contents) ? product.package_contents : [];

  const details = [
    {
      q: "Overview",
      a: (
        <>
          <p>{product.summary || product.short_description}</p>
          {product.overview && (
            <p style={{ marginTop: 12, whiteSpace: "pre-line" }}>{product.overview.replace(/<[^>]*>/g, "")}</p>
          )}
          {(useCases.length > 0 || product.format || brandName) && (
            <p style={{ marginTop: 12 }}>
              {useCases.length > 0 && `Typical uses: ${useCases.join(", ")}. `}
              {product.format && `Format: ${product.format}. `}
              {brandName && `Brand: ${brandName}.`}
            </p>
          )}
        </>
      ),
    },
    ...(specifications.length > 0
      ? [
          {
            q: "Detailed specifications",
            a: (
              <dl className={styles.specTable}>
                {specifications.map((spec, idx) => (
                  <div key={`${spec.name}-${idx}`}>
                    <dt>{spec.name}</dt>
                    <dd>
                      {spec.value}
                      {spec.unit ? ` ${spec.unit}` : ""}
                    </dd>
                  </div>
                ))}
              </dl>
            ),
          },
        ]
      : []),
    ...(packageContents.length > 0
      ? [
          {
            q: "What's in the box",
            a: (
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {packageContents.map((item, idx) => (
                  <li key={`${item}-${idx}`}>{item}</li>
                ))}
              </ul>
            ),
          },
        ]
      : [
          {
            q: "What's in the box",
            a: info.inTheBox || "Box contents are confirmed with your model configuration and quotation.",
          },
        ]),
    {
      q: "Warranty",
      a: info.warranty || "Model-specific warranty terms are confirmed in your quote.",
    },
    {
      q: "Support",
      a: info.support || "Support options for this model are confirmed in your quote.",
    },
    {
      q: "Delivery",
      a:
        info.delivery ||
        "Delivery availability, lead times and costs depend on your location and are confirmed in your quote.",
    },
  ];

  return (
    <>
      <JsonLd data={productSchema(product, site.features.publicPricing)} />
      <section className={styles.top}>
        <div className="container">
          <Breadcrumbs
            visible={false}
            items={[
              { label: "Home", href: "/" },
              { label: "Screens", href: "/screens" },
              ...(categorySlug
                ? [{ label: categoryName, href: `/screens?category=${categorySlug}` }]
                : []),
              { label: product.name, href: `/screens/${product.slug}` },
            ]}
          />
          <div className={styles.grid}>
            <Reveal variant="clip" className={styles.galleryCol}>
              <ProductGallery images={images} name={product.name} sample={product.sample} />
            </Reveal>
            {/* fade only: a transform here would break the fixed mobile CTA inside */}
            <Reveal variant="fade" delay={80} className={styles.panelCol}>
              <PurchasePanel product={product} categoryName={categoryName} />
            </Reveal>
          </div>
        </div>
      </section>

      {keySpecs.length > 0 && (
        <section className={styles.specs} aria-labelledby="key-specs">
          <div className="container">
            <h2 id="key-specs" className={styles.h2}>Key specifications</h2>
            <ul className={styles.keySpecs}>
              {keySpecs.map((spec, i) => (
                <Reveal as="li" key={`${spec.name}-${i}`} delay={i * 70}>
                  <span>{spec.name}</span>
                  <strong>
                    {spec.value}
                    {spec.unit ? ` ${spec.unit}` : ""}
                  </strong>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {site.features.publicPricing && product.variants?.length > 0 && (
        <section className={styles.prices} id="prices" aria-labelledby="prices-title">
          <div className="container">
            <h2 id="prices-title" className={styles.h2}>Sizes and prices</h2>
            <p className={styles.pricesLead}>{pricing.foundingNote}</p>
            <PriceTable
              variants={product.variants}
              caption={`${product.name} prices`}
              productSlug={product.slug}
              productName={product.name}
            />
            <p className="notice" style={{ marginTop: 16 }}>
              <Icon name="info" />
              <span>
                <strong>{pricing.gstNote}</strong> Founding Partner prices include delivery and installation. With Buy
                Outright, installation and transport are charged separately.
              </span>
            </p>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="details-title" style={{ paddingTop: "clamp(48px,6vw,80px)" }}>
        <div className={`container ${styles.details}`}>
          <h2 id="details-title" className={styles.h2}>Product details</h2>
          <Accordion items={details} defaultOpen={0} />
        </div>
      </section>

      {related.length > 0 && (
        <section className={`section ${styles.related}`} aria-labelledby="related-title">
          <div className="container">
            <h2 id="related-title" className={styles.h2}>You may also like</h2>
            <ul className={styles.relatedGrid}>
              {related.map((p, i) => (
                <Reveal as="li" key={p.slug || p.id} delay={i * 80}>
                  <ProductCard product={p} section="related" />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="pfaq-title">
        <div className={`container ${styles.details}`}>
          <h2 id="pfaq-title" className={styles.h2}>Frequently asked</h2>
          <Accordion items={faqs.general} />
        </div>
      </section>
    </>
  );
}
