"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Accord = {
  name?: string | null;
  percentage?: number | null;
  color?: { hex?: string | null } | null;
};

type Props = {
  accords: Accord[];
};

export default function MainAccordsChart({ accords }: Props) {
  // Animate when the section becomes visible in the viewport (mobile + desktop)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!containerRef.current || inView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { root: null, threshold: 0.2 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [inView]);

  const items = useMemo(() => {
    return (accords || [])
      .filter(a => typeof a?.percentage === 'number' && (a?.name ?? '').toString().trim().length > 0)
      .sort((a, b) => (b?.percentage || 0) - (a?.percentage || 0));
  }, [accords]);

  if (!items.length) return null;

  return (
    <div ref={containerRef} className="space-y-2 font-saira">
      {items.map((a, i) => {
        const pct = Math.max(0, Math.min(100, Number(a.percentage || 0)));
        const color = a?.color?.hex || '#e5e7eb';
        return (
          <div key={`${a.name}-${i}`} className="relative">
            <div
              className="h-9 rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: inView ? `${pct}%` : '0%',
                backgroundColor: color,
                transitionDelay: `${i * 80}ms`
              }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-3">
              <span className="text-sm font-semibold text-gray-900 font-saira">{a?.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}


