"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

/**
 * Automatically tracks Next.js App Router page views across client-side navigations.
 * Deduplicates React StrictMode double-effects inside `trackPageView()`.
 */
export default function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    trackPageView(pathname, document.title);
  }, [pathname]);

  return null;
}
