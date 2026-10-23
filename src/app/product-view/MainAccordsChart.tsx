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

/** Each accord as a labelled row with its own track, so names never overlap the bars. */
export default function MainAccordsChart({ accords }: Props) {
  // Animate when the section becomes visible in the viewport (mobile + desktop)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!containerRef.current || inView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
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
    <div ref={containerRef} className="space-y-4 sm:space-y-3">
      {items.map((a, i) => {
        const pct = Math.max(0, Math.min(100, Number(a.percentage || 0)));
        const color = a?.color?.hex || "#9ca3af";
        return (
          <div
            key={`${a.name}-${i}`}
            className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[120px_1fr_44px]"
          >
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-gray-900">
              <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: color }} />
              <span className="truncate">{a?.name}</span>
            </span>
            {/* On phones the bar drops to its own full-width line under the name */}
            <div className="col-span-2 row-start-2 h-2 bg-gray-100 sm:col-span-1 sm:row-start-auto sm:h-2.5">
              <div
                className="h-full transition-[width] duration-700 ease-out"
                style={{
                  width: inView ? `${pct}%` : "0%",
                  backgroundColor: color,
                  transitionDelay: `${i * 80}ms`,
                }}
              />
            </div>
            <span className="col-start-2 row-start-1 text-right text-xs font-bold text-gray-500 sm:col-start-auto sm:row-start-auto">
              {Math.round(pct)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
