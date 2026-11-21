"use client";

import { usePathname } from "next/navigation";

const CHROMELESS_PREFIXES = ["/proposals"];

/**
 * Client wrapper that toggles site chrome (intro, header, footer) on chromeless
 * routes like /proposals/[token]. Receives header/footer/intro as ReactNode props
 * from RootLayout so async Server Components like Footer stay on the server.
 */
export default function SiteChrome({ intro, header, footer, children }) {
  const pathname = usePathname() || "";
  const isChromeless = CHROMELESS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isChromeless) {
    return <main id="main">{children}</main>;
  }

  return (
    <>
      {intro}
      {header}
      <main id="main">{children}</main>
      {footer}
    </>
  );
}
