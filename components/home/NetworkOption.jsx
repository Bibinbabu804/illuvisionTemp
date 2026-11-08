import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { site } from "@/data/site";
import styles from "./NetworkOption.module.css";

/**
 * "Buy & Join Network" vs "Display Only". Hidden until approved via
 * site.features.networkParticipation. Copy is a placeholder for review.
 */
export default function NetworkOption() {
  if (!site.features.networkParticipation) return null;

  const options = [
    {
      title: "Buy & Join Network",
      body: "Own your screen and make it part of Illuvision's associated advertising network. Terms confirmed on enquiry.",
      cta: "Ask about joining",
    },
    {
      title: "Display Only",
      body: "Own your screen and use it exclusively for your own content.",
      cta: "Explore screens",
    },
  ];

  return (
    <section className="section" aria-labelledby="network-option-title">
      <div className="container">
        <h2 id="network-option-title" className={styles.title}>Two ways to own a screen</h2>
        <div className={styles.grid}>
          {options.map((o, i) => (
            <Reveal key={o.title} delay={i * 100} className={`card ${styles.card}`}>
              <h3>{o.title}</h3>
              <p>{o.body}</p>
              <Button href={i ? "/screens" : "/contact?topic=network"} variant={i ? "ghost" : "primary"}>
                {o.cta}
              </Button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
