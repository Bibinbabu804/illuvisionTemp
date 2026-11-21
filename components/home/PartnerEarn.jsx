import Reveal, { SplitHeading } from "@/components/ui/Reveal";
import { Kicker } from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { partnerSteps, pricing } from "@/data/catalog";
import { site } from "@/data/site";
import { buildBusinessWhatsAppUrl } from "@/lib/whatsapp";
import { EVENTS } from "@/lib/analytics";
import styles from "./PartnerEarn.module.css";

const tel = (n) => `tel:${n.replace(/\s/g, "")}`;

/** How Founding Partners earn (customer brochure). */
export default function PartnerEarn() {
  if (!site.features.networkParticipation) return null;
  const { phone, phone2 } = site.contact;
  const partnerWa = buildBusinessWhatsAppUrl(
    "Hello Illuvision team, I would like to enquire about becoming a Founding Partner."
  );

  return (
    <section className={`section section--dark ${styles.section}`} id="earn" aria-labelledby="earn-title">
      <div className={`container on-dark ${styles.grid}`}>
        <div className={styles.intro}>
          <Reveal>
            <Kicker>Founding Partners</Kicker>
          </Reveal>
          <SplitHeading id="earn-title" lines={["How Founding", "Partners earn."]} className={styles.title} />
          <Reveal as="p" className={styles.qr} delay={120}>
            Customers scan QR offers on the screen and claim them in your shop. We pay for
            the offer, you get the sale.
          </Reveal>
          <Reveal className={styles.cta} delay={180}>
            <Button href="/contact?topic=network" variant="accent" event={EVENTS.SHOP_CTA} eventProps={{ section: "partner-earn" }}>
              Become a Founding Partner
            </Button>
            {(phone || phone2 || partnerWa.ok) && (
              <p className={styles.phones}>
                {phone && <a href={tel(phone)}>{phone}</a>}
                {phone && phone2 && <span aria-hidden="true"> / </span>}
                {phone2 && <a href={tel(phone2)}>{phone2}</a>}
                {partnerWa.ok && (
                  <>
                    {(phone || phone2) && <span aria-hidden="true"> · </span>}
                    <a href={partnerWa.url} target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                  </>
                )}
              </p>
            )}
          </Reveal>
        </div>

        <ol className={styles.steps}>
          {partnerSteps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 100} className={styles.step}>
              <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.icon}><Icon name={step.icon} size={24} strokeWidth={1.6} /></span>
              <p>{step.title}</p>
            </Reveal>
          ))}
          <li className={styles.disclaimer}>
            <Icon name="info" size={16} />
            {pricing.earningsNote}
          </li>
        </ol>
      </div>
    </section>
  );
}
