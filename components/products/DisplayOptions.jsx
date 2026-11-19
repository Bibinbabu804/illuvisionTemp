import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import { displayOptions } from "@/data/catalog";
import styles from "./DisplayOptions.module.css";

/** Panasonic vs Illuvision: the two display options in every format. */
export default function DisplayOptions() {
  return (
    <section className="section" id="displays" aria-labelledby="displays-title">
      <div className="container">
        <SectionHeader
          label="Display options"
          id="displays-title"
          lines={["Two display", "options."]}
          lead="Every format is available with a Panasonic or an Illuvision display. Pick the one that suits your content and budget."
        />
        <div className={styles.grid}>
          {displayOptions.map((d, i) => (
            <Reveal key={d.id} delay={i * 100} className={`card ${styles.card}`}>
              <h3>{d.name}</h3>
              <ul>
                {d.points.map((point) => (
                  <li key={point}>
                    <span className={styles.tick}><Icon name="check" size={16} /></span>
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
