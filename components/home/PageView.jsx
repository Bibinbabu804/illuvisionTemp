"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fires a single page-level analytics event on mount. */
export default function PageView({ event, props }) {
  useEffect(() => {
    track(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}
