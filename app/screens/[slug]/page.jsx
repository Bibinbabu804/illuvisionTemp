import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Reveal from "@/components/ui/Reveal";
import Accordion from "@/components/ui/Accordion";
import ProductGallery from "@/components/products/ProductGallery";
import PurchasePanel from "@/components/products/PurchasePanel";
import ProductCard from "@/components/products/ProductCard";
import Icon from "@/components/ui/Icon";
import {
  products,
  getProduct,
  getCategory,
  specFields,
  relatedProducts,
  productInfoPending,
} from "@/data/catalog";
import { site, faqs } from "@/data/site";
import { pageMetadata, productSchema, JsonLd } from "@/lib/seo";
import styles from "./page.module.css";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const category = getCategory(product.category);
  return {
    ...pageMetadata({
      title: `${product.name} — ${category?.name}`,
      description: `${product.summary} Request a quote from Illuvision for confirmed specifications, pricing and delivery.`,
      path: `/screens/${product.slug}`,
      image: `${product.images[0].src}?w=1200&h=630&fit=crop&auto=format`,
    }),
    // Sample listings are placeholders and should not be indexed.
    ...(product.sample && { robots: { index: false, follow: true } }),
  };
}

const PENDING = "Awaiting confirmed spec sheet";

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const category = getCategory(product.category);
  const related = relatedProducts(product);

  const keySpecs = specFields.slice(0, 4);
  const info = { ...productInfoPending, ...(product.info || {}) };

  const details = [
    {
      q: "Overview",
      a: (
        <>
          <p>{product.summary}</p>
          <p style={{ marginTop: 12 }}>
            Typical uses: {product.useCases.join(", ")}. Format: {product.format}.
          </p>
        </>
      ),
    },
    {
      q: "Detailed specifications",
      a: (
        <dl className={styles.specTable}>
          {specFields.map((f) => (
            <div key={f.key}>
              <dt>{f.label}</dt>
              <dd data-pending={product.specs[f.key] == null}>{product.specs[f.key] ?? PENDING}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    { q: "What's in the box", a: info.inTheBox ?? "Box contents will be listed once confirmed for this model. Ask us in your quote request." },
    { q: "Warranty", a: info.warranty ?? "Model-specific warranty terms are confirmed in your quote." },
    { q: "Support", a: info.support ?? "Support options for this model are confirmed in your quote." },
    { q: "Delivery", a: info.delivery ?? "Delivery availability, lead times and costs depend on your location and are confirmed in your quote." },
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
              { label: category?.name ?? "Category", href: `/screens?category=${product.category}` },
              { label: product.name, href: `/screens/${product.slug}` },
            ]}
          />
          <div className={styles.grid}>
            <Reveal variant="clip" className={styles.galleryCol}>
              <ProductGallery images={product.images} name={product.name} sample={product.sample} />
            </Reveal>
            {/* fade only: a transform here would break the fixed mobile CTA inside */}
            <Reveal variant="fade" delay={80} className={styles.panelCol}>
              <PurchasePanel product={product} categoryName={category?.name} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className={styles.specs} aria-labelledby="key-specs">
        <div className="container">
          <h2 id="key-specs" className={styles.h2}>Key specifications</h2>
          <ul className={styles.keySpecs}>
            {keySpecs.map((f, i) => (
              <Reveal as="li" key={f.key} delay={i * 70}>
                <span>{f.label}</span>
                <strong data-pending={product.specs[f.key] == null}>{product.specs[f.key] ?? "To be confirmed"}</strong>
              </Reveal>
            ))}
          </ul>
          {product.sample && (
            <p className="notice" style={{ marginTop: 20 }}>
              <Icon name="info" />
              <span>
                This is a sample listing for layout purposes. Specifications are not shown until they are verified for the actual model.
              </span>
            </p>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="details-title" style={{ paddingTop: "clamp(48px,6vw,80px)" }}>
        <div className={`container ${styles.details}`}>
          <h2 id="details-title" className={styles.h2}>Product details</h2>
          <Accordion items={details} defaultOpen={0} />
        </div>
      </section>

      <section className={`section ${styles.related}`} aria-labelledby="related-title">
        <div className="container">
          <h2 id="related-title" className={styles.h2}>You may also like</h2>
          <ul className={styles.relatedGrid}>
            {related.map((p, i) => (
              <Reveal as="li" key={p.slug} delay={i * 80}>
                <ProductCard product={p} section="related" />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="pfaq-title">
        <div className={`container ${styles.details}`}>
          <h2 id="pfaq-title" className={styles.h2}>Frequently asked</h2>
          <Accordion items={faqs.general.slice(1)} />
        </div>
      </section>
    </>
  );
}
