import Breadcrumbs from "./Breadcrumbs";
import LazyVideo from "@/components/motion/LazyVideo";
import styles from "./MediaHero.module.css";

/**
 * Full-bleed video banner for inner pages (Advertise, Contact).
 * `lines` are the H1 lines (each animates in); `children` go under the lead
 * (usually the CTA buttons). One H1 per page.
 */
export default function MediaHero({ video, crumbs, eyebrow, lines, lead, children }) {
  const n = lines.length;
  return (
    <section className={styles.hero}>
      <LazyVideo eager src={video.src} poster={video.poster} className={styles.bg} />
      <span className={styles.shade} aria-hidden="true" />
      <div className={`container on-dark ${styles.inner}`}>
        {crumbs && <Breadcrumbs visible={false} items={crumbs} />}
        {eyebrow && <p className={`eyebrow ${styles.in}`} style={{ "--s": 1 }}>{eyebrow}</p>}
        <h1 className={styles.title}>
          {lines.map((l, i) => (
            <span key={i} className={styles.line}>
              <span style={{ "--s": i + 2 }}>{l}</span>
            </span>
          ))}
        </h1>
        {lead && (
          <p className={`${styles.lead} ${styles.in}`} style={{ "--s": n + 2 }}>
            {lead}
          </p>
        )}
        {children && (
          <div className={`${styles.ctas} ${styles.in}`} style={{ "--s": n + 3 }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
