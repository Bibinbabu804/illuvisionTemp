import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import PriceTable from "./PriceTable";
import { pricing, formatINR } from "@/data/catalog";
import { site } from "@/data/site";
import { buildBusinessWhatsAppUrl } from "@/lib/whatsapp";
import { EVENTS } from "@/lib/analytics";
import styles from "./PriceList.module.css";

const tel = (n) => `tel:${n.replace(/\s/g, "")}`;

/**
 * Founding Partner Price List 2026: rendered server-side via Next.js ISR
 * using authoritative Marketplace Product & Variant pricing from the backend API.
 */
export default function PriceList({ pricingData }) {
  if (!site.features.publicPricing) return null;
  const { phone, phone2 } = site.contact;
  const visitWa = buildBusinessWhatsAppUrl(
    "Hello Illuvision team, I would like to book a free shop visit to discuss digital display options."
  );
  const products = pricingData?.products || [];
  const isUnavailable = Boolean(pricingData?.unavailable);
  const year = pricingData?.year || 2026;

  return (
    <section className={`section ${styles.section}`} id="prices" aria-labelledby="prices-title">
      <div className="container">
        <SectionHeader
          label="Price list"
          id="prices-title"
          lines={["Founding Partner", `Price List ${year}.`]}
          lead={`${pricing.foundingNote} Tap any row to see what's included and buy.`}
        />

        <Reveal>
          <p className={`notice ${styles.gst}`}>
            <Icon name="info" />
            <span><strong>{pricing.gstNote}</strong></span>
          </p>
        </Reveal>

        {isUnavailable ? (
          <div className="card" role="status" style={{ padding: "32px 24px", marginBottom: 32, textAlign: "center" }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>
              Founding Partner pricing is temporarily unavailable.
            </p>
            <p style={{ opacity: 0.75, fontSize: "0.95rem" }}>
              Please refresh shortly or contact our team directly for confirmed 2026 Founding Partner rates.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="card" role="status" style={{ padding: "32px 24px", marginBottom: 32, textAlign: "center" }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>
              No Founding Partner pricing is currently published.
            </p>
            <p style={{ opacity: 0.75, fontSize: "0.95rem" }}>
              Contact our team to request an updated commercial quotation for your space.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((p, i) => (
              <Reveal key={p.product_slug || p.product_id} delay={(i % 2) * 80} className={styles.block}>
                <div className={styles.blockHead}>
                  <h3>
                    <Link href={p.product_url || `/screens/${p.product_slug}`}>
                      {p.product_name}
                    </Link>
                  </h3>
                  {p.badge && <span className="badge badge--green">{p.badge}</span>}
                </div>
                <PriceTable
                  variants={p.variants || []}
                  caption={`${p.product_name} Founding Partner prices (${pricingData?.currency || "INR"})`}
                  productSlug={p.product_slug}
                  productName={p.product_name}
                />
              </Reveal>
            ))}
          </div>
        )}

        <div className={styles.terms}>
          <Reveal className={`card ${styles.term} ${styles.termFounding}`}>
            <h3>Founding Partner</h3>
            <ul>
              <li><Icon name="check" size={16} /> Delivered and installed</li>
              <li><Icon name="check" size={16} /> 3 months free ad videos</li>
              <li><Icon name="check" size={16} /> Free software and support</li>
              <li><Icon name="check" size={16} /> Earn a share of ad profit</li>
            </ul>
          </Reveal>
          <Reveal className={`card ${styles.term}`} delay={70}>
            <h3>Buy Outright</h3>
            <ul>
              <li><Icon name="check" size={16} /> You own it for your own content only</li>
              <li><Icon name="check" size={16} /> Installation and transport extra</li>
            </ul>
          </Reveal>
          <Reveal className={`card ${styles.term}`} delay={140}>
            <h3>After the free 3 months</h3>
            <dl className={styles.plans}>
              {pricing.plans.map((plan) => (
                <div key={plan.name}>
                  <dt>{plan.name}</dt>
                  <dd>
                    <strong>{formatINR(plan.price)}</strong>/month · {plan.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal className={`card ${styles.term}`} delay={210}>
            <h3>Refer &amp; Earn</h3>
            <p>{pricing.referral}</p>
          </Reveal>
        </div>

        <Reveal className={styles.cta}>
          <div>
            <h3>Book your free shop visit</h3>
            <p>
              {phone && <a href={tel(phone)}>{phone}</a>}
              {phone && phone2 && <span aria-hidden="true"> | </span>}
              {phone2 && <a href={tel(phone2)}>{phone2}</a>}
              {visitWa.ok && (
                <>
                  {(phone || phone2) && <span aria-hidden="true"> | </span>}
                  <a href={visitWa.url} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </>
              )}
            </p>
          </div>
          <Button href="/contact?topic=visit" variant="accent" event={EVENTS.SHOP_CTA} eventProps={{ section: "price-list" }}>
            Book a free shop visit
          </Button>
        </Reveal>

        <p className={styles.small}>{pricing.earningsNote}</p>
      </div>
    </section>
  );
}
