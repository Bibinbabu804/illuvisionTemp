import styles from "./LogoIntro.module.css";

/**
 * Site loader — a screen powering on:
 *  1. a point of light in the dark snaps into a CRT-style line,
 *  2. the line opens into a glowing 16:9 display (LED pixel grid + scanline),
 *  3. ILLUVISION flickers on with an RGB split, then locks in (green V),
 *  4. we zoom through the screen into a white light splash → the site.
 * Pure CSS (~2.6s) so it never blocks hydration. Plays on each full page
 * load; skipped for reduced motion (see bootScript in app/layout.jsx).
 */
export default function LogoIntro() {
  return (
    <div className={`${styles.intro} logo-intro`} aria-hidden="true">
      <div className={styles.stage}>
        <div className={styles.screen}>
          <span className={styles.pixels} />
          <span className={styles.scan} />
          <p className={styles.word}>
            ILLU<span>V</span>ISION
          </p>
          <p className={styles.tag}>Project your vision</p>
        </div>
        <span className={styles.led} />
      </div>

      <div className={styles.foot}>
        <span className={styles.label}>Powering on</span>
        <span className={styles.count} />
      </div>

      <span className={styles.flash} />
    </div>
  );
}
