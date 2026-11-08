import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Accordion from "@/components/ui/Accordion";
import styles from "./FaqSection.module.css";

export default function FaqSection({ items, title = ["Questions,", "answered."], eyebrow = "FAQ", index }) {
  return (
    <section className="section" aria-labelledby="faq-title">
      <div className={`container ${styles.grid}`}>
        <SectionHeader
          className={styles.head}
          index={index}
          label={eyebrow}
          id="faq-title"
          lines={title}
          layout="stack"
          lead="Can't find what you need? Send us a message and the team will help."
        />
        <Reveal delay={120}>
          <Accordion items={items} defaultOpen={0} />
        </Reveal>
      </div>
    </section>
  );
}
