import Link from "next/link";
import { site } from "@/data/site";
import { categories } from "@/data/catalog";
import { EVENTS } from "@/lib/analytics";
import { STOCK_CREDIT } from "@/data/media";
import Icon from "@/components/ui/Icon";
import Magnetic from "@/components/motion/Magnetic";
import TrackedLink from "./TrackedLink";
import FooterReveal from "./FooterReveal";
import FooterWord from "./FooterWord";
import BackToTop from "./BackToTop";
import styles from "./Footer.module.css";

function FLink({ href, children, external }) {
  const inner = (
    <>
      <span>{children}</span>
      <Icon name="arrowUpRight" size={14} />
    </>
  );
  return external ? (
    <a href={href} className={styles.flink} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : href.startsWith("mailto:") || href.startsWith("tel:") ? (
    <a href={href} className={styles.flink}>{inner}</a>
  ) : (
    <Link href={href} className={styles.flink}>{inner}</Link>
  );
}

export default function Footer() {
  const { contact } = site;
  const contactItems = [
    contact.email && { label: contact.email, href: `mailto:${contact.email}` },
    contact.phone && { label: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
  ].filter(Boolean);

  return (
    <FooterReveal>
      <footer className={`on-dark ${styles.footer}`}>
        <span className={styles.glow} aria-hidden="true" />

        <div className="container">
          {/* ---------- big CTA ---------- */}
          <div className={styles.cta}>
            <div>
              <p className={styles.status}>
                <span className={styles.pulse} aria-hidden="true" />
                Ready when you are
              </p>
              <h2 className={styles.headline}>
                <span className={styles.hline}><span>Let&rsquo;s put your</span></span>
                <span className={styles.hline}><span><em>vision</em> on screen.</span></span>
              </h2>
            </div>

            <Magnetic strength={0.4} className={styles.orbWrap}>
              <TrackedLink
                href="/contact"
                className={styles.orb}
                event={EVENTS.SHOP_CTA}
                eventProps={{ section: "footer-orb" }}
              >
                <span className={styles.orbText}>Get a quote</span>
                <span className={styles.orbIcon}>
                  <Icon name="arrowUpRight" size={26} />
                </span>
              </TrackedLink>
            </Magnetic>
          </div>

          <span className={styles.rule} aria-hidden="true" />

          {/* ---------- links ---------- */}
          <div className={styles.grid}>
            <div className={styles.brandCol}>
              <p className={styles.brand}>
                ILLU<span>V</span>ISION
              </p>
              <p className={styles.desc}>{site.description}</p>
            </div>

            <nav aria-label="Screens" className={styles.col}>
              <h3>Screens</h3>
              <ul>
                <li><FLink href="/screens">All screens</FLink></li>
                {categories.slice(0, 5).map((c) => (
                  <li key={c.slug}>
                    <FLink href={`/screens?category=${c.slug}`}>{c.name}</FLink>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Advertising" className={styles.col}>
              <h3>Advertising</h3>
              <ul>
                <li><FLink href="/advertise">Advertise with us</FLink></li>
                <li><FLink href="/advertise#network">Screen network map</FLink></li>
                <li><FLink href="/advertise#planner">Campaign planner</FLink></li>
                <li><FLink href="/advertise#how-it-works">How it works</FLink></li>
              </ul>
            </nav>

            <div className={styles.col}>
              <h3>Contact</h3>
              <ul>
                {contactItems.map((item) => (
                  <li key={item.label}><FLink href={item.href}>{item.label}</FLink></li>
                ))}
                {contact.address && <li className={styles.plain}>{contact.address}</li>}
                <li><FLink href="/contact">Send an enquiry</FLink></li>
                {site.social.map((s) => (
                  <li key={s.href}><FLink href={s.href} external>{s.label}</FLink></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ---------- giant wordmark ---------- */}
        <FooterWord />

        <div className="container">
          <div className={styles.legal}>
            <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
            <p className={styles.note}>
              Preview website — sample products, locations and {STOCK_CREDIT.toLowerCase()} shown for layout only.
            </p>
            <ul>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
            </ul>
            <BackToTop className={styles.top} />
          </div>
        </div>
      </footer>
    </FooterReveal>
  );
}
