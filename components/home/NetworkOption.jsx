import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { ownership } from "@/data/catalog";
import { site } from "@/data/site";
import { EVENTS } from "@/lib/analytics";
import styles from "./NetworkOption.module.css";

/**
 * "Founding Partner" vs "Buy Outright": the two ways to get a screen
 * (customer brochure). Shown when site.features.networkParticipation is on.
 */
export default function NetworkOption() {
  if (!site.features.networkParticipation) return null;

  return (
    <section className={`section ${styles.section}`} id="ways" aria-labelledby="network-option-title">
      <div className="container">
        <SectionHeader
          label="Ways to buy"
          id="network-option-title"
          lines={["Two ways to", "get your screen."]}
          lead="Become a Founding Partner and let your screen earn from approved ads, or buy the display outright for your own content only."
        />
        <div className={styles.grid}>
          {ownership.map((o, i) => (
            <Reveal key={o.id} delay={i * 100} className={`card ${styles.card}`} data-kind={o.id}>
              <h3>{o.title}</h3>
              {o.highlight && (
                <p className={styles.highlight}>
                  <Icon name="spark" size={18} />
                  <span>{o.highlight}</span>
                </p>
              )}
              <ul>
                {o.points.map((point) => (
                  <li key={point}>
                    <Icon name="check" size={16} />
                    {point}
                  </li>
                ))}
              </ul>
              <Button
                href={o.id === "founding" ? "/contact?topic=network" : "/screens#prices"}
                variant={o.id === "founding" ? "accent" : "ghost"}
                event={EVENTS.SHOP_CTA}
                eventProps={{ section: "ways-to-buy", option: o.id }}
              >
                {o.id === "founding" ? "Become a Founding Partner" : "See Buy Outright prices"}
              </Button>
            </Reveal>
          ))}
        </div>
        <Reveal as="p" className={styles.note}>
          <Icon name="info" size={18} />
          Ad video plans are available after the free period for both options.
        </Reveal>
      </div>
    </section>
  );
}
