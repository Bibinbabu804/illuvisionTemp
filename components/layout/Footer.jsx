import Link from "next/link";
import Logo from "./Logo";
import Button from "@/components/ui/Button";
import { site } from "@/data/site";
import { categories } from "@/data/catalog";
import { EVENTS } from "@/lib/analytics";
import { STOCK_CREDIT, videos } from "@/data/media";
import LazyVideo from "@/components/motion/LazyVideo";
import Magnetic from "@/components/motion/Magnetic";
import FooterWord from "./FooterWord";
import styles from "./Footer.module.css";

export default function Footer() {
  const { contact } = site;
  const contactItems = [
    contact.email && { label: contact.email, href: `mailto:${contact.email}` },
    contact.phone && { label: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
    contact.address && { label: contact.address },
  ].filter(Boolean);

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.cta}>
          <LazyVideo src={videos.reelDream.src} poster={videos.reelDream.poster} className={styles.ctaVideo} />
          <span className={styles.ctaShade} aria-hidden="true" />
          <div className={`on-dark ${styles.ctaCopy}`}>
            <p className="eyebrow">Ready when you are</p>
            <h2>Find the right screen for your space.</h2>
          </div>
          <div className={styles.ctaActions}>
            <Magnetic>
              <Button href="/screens" variant="light" icon="screen" event={EVENTS.SHOP_CTA} eventProps={{ section: "footer-cta" }}>
                Explore screens
              </Button>
            </Magnetic>
            <Magnetic>
              <Button href="/contact" variant="outline-inv" event={EVENTS.SHOP_CTA} eventProps={{ section: "footer-cta-contact" }}>
                Talk to the team
              </Button>
            </Magnetic>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link href="/" aria-label="Illuvision home" className={styles.brand}>
              <Logo className={styles.logo} sizes="240px" />
            </Link>
            <p className={styles.desc}>{site.description}</p>
          </div>

          <nav aria-label="Screens" className={styles.col}>
            <h3>Screens</h3>
            <ul>
              <li><Link href="/screens">All screens</Link></li>
              {categories.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link href={`/screens?category=${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Advertising" className={styles.col}>
            <h3>Advertising</h3>
            <ul>
              <li><Link href="/advertise">Advertise with Illuvision</Link></li>
              <li><Link href="/advertise#network">Screen network map</Link></li>
              <li><Link href="/advertise#planner">Campaign planner</Link></li>
              <li><Link href="/advertise#how-it-works">How it works</Link></li>
            </ul>
          </nav>

          <div className={styles.col}>
            <h3>Contact</h3>
            <ul>
              {contactItems.map((item) => (
                <li key={item.label}>
                  {item.href ? <a href={item.href}>{item.label}</a> : item.label}
                </li>
              ))}
              <li><Link href="/contact">Send an enquiry</Link></li>
              {site.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <FooterWord />

        <div className={styles.legal}>
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p className={styles.note}>
            Preview website — sample products, locations and {STOCK_CREDIT.toLowerCase()} shown for layout only.
          </p>
          <ul>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
