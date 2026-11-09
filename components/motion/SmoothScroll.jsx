"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Lenis smooth scrolling for mouse/trackpad. Touch devices keep native
 * scrolling (syncTouch: false) so mobile never feels sticky or laggy.
 * Disabled entirely for reduced-motion users.
 *
 * Nested scroll areas opt out with the `data-lenis-prevent` attribute.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      // 0.1 = smooth but responsive; lower values feel laggy on trackpads
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      syncTouch: false,
      anchors: { offset: -96 },
    });
    window.__lenis = lenis;
    document.documentElement.classList.add("has-lenis");
    return () => {
      lenis.destroy();
      window.__lenis = undefined;
      document.documentElement.classList.remove("has-lenis");
    };
  }, []);

  // New page → start at the top (unless navigating to an anchor).
  useEffect(() => {
    if (window.location.hash) return;
    window.__lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}

/** Helpers for components that need to pause or drive scrolling. */
export const scrollLock = (locked) => {
  const l = typeof window !== "undefined" ? window.__lenis : null;
  if (!l) return;
  if (locked) l.stop();
  else l.start();
};

export const smoothScrollTo = (target, opts = {}) => {
  const l = window.__lenis;
  if (l) l.scrollTo(target, { offset: -96, ...opts });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "smooth" });
  }
};
