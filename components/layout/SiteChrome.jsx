"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LogoIntro from "@/components/layout/LogoIntro";

const CHROMELESS_PREFIXES = ["/proposals"];

export default function SiteChrome({ children }) {
  const pathname = usePathname() || "";
  const isChromeless = CHROMELESS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isChromeless) {
    return <main id="main">{children}</main>;
  }

  return (
    <>
      <LogoIntro />
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
