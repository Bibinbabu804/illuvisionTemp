import Reveal from "./Reveal";
import Breadcrumbs from "./Breadcrumbs";
import styles from "./PageHero.module.css";

/** Compact hero for inner pages (one H1 per page). */
export default function PageHero({ eyebrow, title, lead, crumbs, dark = false, children }) {
  return (
    <section className={`${styles.hero} ${dark ? `${styles.dark} on-dark` : ""}`}>
      <div className="container">
        {crumbs && <Breadcrumbs visible={false} items={crumbs} />}
        <Reveal as="p" className={`eyebrow ${styles.eyebrow}`}>{eyebrow}</Reveal>
        <Reveal as="h1" className={styles.title} delay={60}>{title}</Reveal>
        {lead && <Reveal as="p" className={styles.lead} delay={120}>{lead}</Reveal>}
        {children && <Reveal className={styles.extra} delay={180}>{children}</Reveal>}
      </div>
    </section>
  );
}
