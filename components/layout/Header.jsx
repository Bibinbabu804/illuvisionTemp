"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMotionValueEvent, useScroll } from "motion/react";
import Logo from "./Logo";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { nav } from "@/data/site";
import { EVENTS } from "@/lib/analytics";
import { scrollLock } from "@/components/motion/SmoothScroll";
import styles from "./Header.module.css";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  // Hide while scrolling down, reveal on any scroll up.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    const next = y > prev && y > 240;
    if (next !== hidden) setHidden(next);
  });
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  // A sentinel at the top of the page flips the header state — no scroll listener.
  useEffect(() => {
    const sentinel = document.getElementById("top-sentinel");
    if (!sentinel) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  // Close the menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.classList.toggle("no-scroll", open);
    scrollLock(open);
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      // Simple focus trap inside the open menu.
      if (e.key === "Tab" && menuRef.current) {
        const items = menuRef.current.querySelectorAll("a, button");
        const first = toggleRef.current;
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      document.body.classList.remove("no-scroll");
      scrollLock(false);
    };
  }, [open]);

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={styles.header} data-scrolled={scrolled} data-open={open} data-hidden={hidden && !open}>
      <div className={`container ${styles.bar}`}>
        <div className={styles.pill}>
          <Link href="/" className={styles.brand} aria-label="Illuvision home">
            <Logo className={styles.logo} preload sizes="170px" />
          </Link>
          <nav aria-label="Main" className={styles.nav}>
            <ul>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.link}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.actions}>
          <Button
            href="/screens"
            className={styles.cta}
            icon="screen"
            event={EVENTS.SHOP_CTA}
            eventProps={{ section: "header" }}
          >
            Explore screens
          </Button>
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? "close" : "menu"} size={22} />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        data-lenis-prevent
        ref={menuRef}
        className={styles.menu}
        inert={!open}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile" className={styles.menuInner}>
          <ul>
            {nav.map((item, i) => (
              <li key={item.href} style={{ "--i": i }}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                  <Icon name="arrowUpRight" size={22} />
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.menuCtas} style={{ "--i": nav.length }}>
            <Button href="/screens" block icon="screen" event={EVENTS.SHOP_CTA} eventProps={{ section: "mobile-menu" }}>
              Explore screens
            </Button>
            <Button href="/advertise#planner" variant="ghost" block event={EVENTS.AD_CTA} eventProps={{ section: "mobile-menu" }}>
              Plan a campaign
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
