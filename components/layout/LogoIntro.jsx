import Logo from "./Logo";
import styles from "./LogoIntro.module.css";

/**
 * Brand intro: masked logo reveal + light sweep, then the curtain lifts.
 * Pure CSS (~1.2s), so it never blocks hydration or input. Skipped on
 * repeat visits in the same session and for reduced-motion users by the
 * inline script in app/layout.jsx (adds `intro-done` to <html>).
 */
export default function LogoIntro() {
  return (
    <div className={`${styles.intro} logo-intro`} aria-hidden="true">
      <div className={styles.mark}>
        <Logo className={styles.logo} preload sizes="(max-width: 767px) 70vw, 420px" />
        <span className={styles.sweep} />
      </div>
      <span className={styles.bar} />
    </div>
  );
}
