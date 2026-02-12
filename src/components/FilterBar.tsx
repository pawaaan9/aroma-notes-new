"use client";

import { useEffect, useRef, useState } from "react";

type IndicatorStyle = { left: number; width: number; opacity: number };

function Segmented({
  label,
  options,
  value,
  onChange,
  accent,
}: {
  label: string;
  options: { key: string; text: string }[];
  value: string;
  onChange: (key: string) => void;
  accent: "amber" | "rose";
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<IndicatorStyle>({ left: 0, width: 0, opacity: 0 });

  const moveIndicatorTo = (key?: string) => {
    if (!key) return;
    const container = containerRef.current;
    const btn = btnRefs.current[key];
    if (!container || !btn) return;
    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    setIndicator({ left: bRect.left - cRect.left, width: bRect.width, opacity: 1 });
  };

  useEffect(() => {
    moveIndicatorTo(value);
  }, [value]);

  useEffect(() => {
    const onResize = () => moveIndicatorTo(value);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [value]);

  const ring = accent === "amber" ? "ring-amber-300/50" : "ring-rose-300/50";
  const bg = accent === "amber" ? "bg-amber-100/70" : "bg-rose-100/70";
  const text = accent === "amber" ? "text-amber-800" : "text-rose-800";

  return (
    <div className={`rounded-2xl border border-gray-200/60 bg-white/70 backdrop-blur ring-1 ${ring} p-3 shadow-sm`}> 
      <div className="px-1 pb-2 text-xs font-semibold tracking-wide text-gray-700">{label}</div>
      <div ref={containerRef} className="relative flex gap-2">
        <span
          className={`absolute top-0 bottom-0 my-auto h-9 ${bg} rounded-full transition-all duration-300 ease-out`}
          style={{ left: `${indicator.left}px`, width: `${indicator.width}px`, opacity: indicator.opacity }}
        />
        {options.map((opt) => (
          <button
            key={opt.key}
            ref={(el) => { btnRefs.current[opt.key] = el; }}
            onClick={() => onChange(opt.key)}
            className={`relative z-10 inline-flex items-center justify-center rounded-full px-4 h-9 text-sm font-medium transition-all duration-300 ${
              value === opt.key ? `${text}` : "text-gray-700 hover:text-gray-900"
            }`}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FilterBar() {
  const [inStock, setInStock] = useState("in");
  const [price, setPrice] = useState("asc");
  const [gender, setGender] = useState("unisex");
  const [inspiration, setInspiration] = useState("originals");
  const [raised, setRaised] = useState(false);

  useEffect(() => {
    const onScroll = () => setRaised(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`sticky top-20 z-30 transition-shadow duration-300 ${raised ? "shadow-lg shadow-amber-500/10" : "shadow-none"}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Segmented
          label="Availability"
          accent="amber"
          options={[
            { key: "in", text: "In stock" },
            { key: "out", text: "Out of stock" },
          ]}
          value={inStock}
          onChange={setInStock}
        />
        <Segmented
          label="Price"
          accent="rose"
          options={[
            { key: "asc", text: "Low → High" },
            { key: "desc", text: "High → Low" },
          ]}
          value={price}
          onChange={setPrice}
        />
        <Segmented
          label="Gender"
          accent="amber"
          options={[
            { key: "male", text: "Male" },
            { key: "female", text: "Female" },
            { key: "unisex", text: "Unisex" },
          ]}
          value={gender}
          onChange={setGender}
        />
        <Segmented
          label="Brand Inspiration"
          accent="rose"
          options={[
            { key: "originals", text: "YB Originals" },
            { key: "inspired", text: "Inspired" },
          ]}
          value={inspiration}
          onChange={setInspiration}
        />
      </div>
    </div>
  );
}


