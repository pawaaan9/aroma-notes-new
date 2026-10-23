"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fades elements marked with `data-reveal` up into place as they scroll into view.
 * Content stays visible without JS, because hiding only starts once `reveal-ready` is set.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/an-admin")) return;
    const root = document.documentElement;
    root.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    const watch = () => {
      document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => io.observe(el));
    };
    watch();

    // Client-rendered sections (product page, cart) appear after data loads.
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
