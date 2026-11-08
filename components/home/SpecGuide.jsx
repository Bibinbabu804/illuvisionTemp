import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import Spotlight from "@/components/motion/Spotlight";
import { specFields } from "@/data/catalog";
import styles from "./SpecGuide.module.css";

/** What each spec means for the buyer. Explanatory copy, not product data. */
const explain = {
  size: { icon: "ruler", text: "Diagonal or panel dimensions, matched to your wall and viewing distance." },
  resolution: { icon: "grid", text: "Pixel count or pixel pitch. Closer viewers need finer detail." },
  panel: { icon: "screen", text: "LCD, LED or another technology, which affects image, power and lifespan." },
  brightness: { icon: "sun", text: "Measured in nits. Sunlit and outdoor spaces need much more." },
  orientation: { icon: "rotate", text: "Landscape, portrait or both, depending on how it is mounted." },
  connectivity: { icon: "plug", text: "Inputs and network options for playing your content." },
  installation: { icon: "wrench", text: "Wall, ceiling, floor stand or structural mounting needs." },
  operation: { icon: "clock", text: "Whether the screen is rated for extended daily operation." },
};

export default function SpecGuide({ index }) {
  return (
    <section className="section" aria-labelledby="specs-title" id="specifications">
      <div className="container">
        <SectionHeader
          index={index}
          label="Specifications"
          id="specs-title"
          lines={["Every spec,", "confirmed in writing."]}
          lead="We publish only verified specifications. Here is what we confirm for each model, and why it matters for your space."
        />

        <Spotlight as="ul" className={styles.grid}>
          {specFields.map((f, i) => (
            <Reveal as="li" key={f.key} delay={(i % 4) * 70} className={styles.item}>
              <span className={styles.icon}>
                <Icon name={explain[f.key].icon} size={22} strokeWidth={1.6} />
              </span>
              <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
              <h3>{f.label}</h3>
              <p>{explain[f.key].text}</p>
            </Reveal>
          ))}
        </Spotlight>

        <Reveal className={styles.notice}>
          <p className="notice">
            <Icon name="info" />
            <span>
              Model-specific spec sheets are being finalised. Request a quote and we will send
              confirmed specifications for the screens you are interested in.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
