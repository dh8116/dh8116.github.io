"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Navigating after a long scroll can leave the previous page's pixels painted
 * below the new one — most visibly going from the bottom of the homepage to the
 * shorter /blog. The DOM and the scroll position are both correct; only Chrome's
 * compositor is stale, because a full-viewport fixed layer (the background) sits
 * behind content that just jumped thousands of pixels.
 *
 * Landing at the top of the new page is the behaviour we want anyway, and a
 * one-frame scroll nudge afterwards forces the viewport to re-raster.
 */
export default function RouteRepaint() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;

    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }

    const settle = requestAnimationFrame(() => {
      const y = window.scrollY;
      window.scrollTo(0, y + 1);
      window.scrollTo(0, y);
    });

    return () => cancelAnimationFrame(settle);
  }, [pathname]);

  return null;
}
