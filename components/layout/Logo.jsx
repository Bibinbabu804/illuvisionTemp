import Image from "next/image";
// logo-web.png is the supplied assets/images/logo.png resized to 1086px wide
// (same artwork, smaller file). Regenerate it if the master logo changes.
import logo from "@/assets/images/logo-web.png";
import styles from "./Logo.module.css";

/**
 * The supplied logo (assets/images/logo.png) has a large transparent margin.
 * This frame trims only that empty margin so the mark sits at the right
 * optical size; the artwork itself is never cropped or distorted.
 * Always place it on a light surface — the wordmark is dark graphite.
 */
export default function Logo({ className = "", preload = false, sizes = "220px" }) {
  return (
    <span className={`${styles.frame} ${className}`}>
      <Image
        src={logo}
        alt="Illuvision — Project your vision"
        sizes={sizes}
        preload={preload}
        className={styles.img}
      />
    </span>
  );
}
