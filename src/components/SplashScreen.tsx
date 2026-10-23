"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();
  const didRunSplash = useRef(false);

  const isAdmin = pathname.startsWith("/an-admin");

  // One short splash on first paint only, not on every client navigation (that blocked content & delayed images).
  useEffect(() => {
    if (isAdmin) {
      setVisible(false);
      return;
    }
    if (didRunSplash.current) return;
    didRunSplash.current = true;
    const t = setTimeout(() => setVisible(false), 220);
    return () => clearTimeout(t);
  }, [isAdmin]);

  if (isAdmin || !visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <Image
        src="/logo.png"
        alt="Aroma Notes"
        width={512}
        height={512}
        className="h-40 w-40 sm:h-56 sm:w-56 md:h-72 md:w-72"
        priority
      />
    </div>
  );
}
