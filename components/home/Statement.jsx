import Image from "next/image";
import ScrollText from "@/components/motion/ScrollText";
import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/ui/Reveal";
import { Kicker } from "@/components/ui/SectionHeader";
import { media, videos } from "@/data/media";
import styles from "./Statement.module.css";

export default function Statement({ index }) {
  return (
    <section className={styles.section} id="statement" aria-label="About Illuvision">
      <div className="container">
        <Reveal className={styles.label}>
          <Kicker index={index}>What we do</Kicker>
        </Reveal>
        <ScrollText
          className={styles.text}
          tokens={[
            "Illuvision supplies the screens that turn walls,",
            { video: videos.reelRetro },
            "windows and street corners into stages. From a single reception display to",
            { image: media.outdoorLedFacade },
            "building-scale LED, choose your screen, and put it to work on our advertising network",
            { video: videos.streetKiosk },
            "if you want it to earn.",
          ]}
        />
      </div>

      <Parallax className={`${styles.float} ${styles.f1}`} speed={-0.25}>
        <Image src={media.standeeInStore.src} alt="" fill sizes="220px" quality={60} className={styles.img} />
      </Parallax>
      <Parallax className={`${styles.float} ${styles.f2}`} speed={0.3}>
        <Image src={media.wallDisplay.src} alt="" fill sizes="260px" quality={60} className={styles.img} />
      </Parallax>
    </section>
  );
}
