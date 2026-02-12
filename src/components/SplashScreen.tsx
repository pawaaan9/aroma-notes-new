"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();

  // Show splash on initial load and on every route change
  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 500);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      {/* Static scenic background */}
      <div className="absolute inset-0 bg-perfume-gradient bg-perfume-paper bg-perfume-vignette" aria-hidden />
      {/* Animated gradient sweep */}
      <div
        className="absolute inset-0 opacity-30 animate-gradient-x"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(248,133,18,0.18), rgba(255,255,255,0.06), rgba(248,133,18,0.18))",
          backgroundSize: "200% 100%",
        }}
        aria-hidden
      />
      {/* Big centered logo */}
      <Image
        src="/logo.png"
        alt="Aroma Notes"
        width={512}
        height={512}
        className="relative z-10 h-40 w-40 sm:h-56 sm:w-56 md:h-80 md:w-80 lg:h-96 lg:w-96"
        priority
      />
    </div>
  );
}


