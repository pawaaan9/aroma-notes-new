"use client";
import { useMemo } from "react";

type Accord = {
  name?: string | null;
  percentage?: number | null;
  color?: { hex?: string | null } | null;
};

type Props = {
  accords: Accord[];
};

export default function MainAccordsChips({ accords }: Props) {
  const items = useMemo(() => {
    return (accords || [])
      .filter(a => (a?.name ?? '').toString().trim().length > 0)
      .sort((a, b) => (Number(b?.percentage) || 0) - (Number(a?.percentage) || 0));
  }, [accords]);

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap gap-3 font-saira">
      {items.map((a, i) => (
        <div
          key={`${a.name}-${i}`}
          className="px-3 py-1 rounded-full text-sm border border-gray-700 text-gray-200 flex items-center gap-2 animate-fade-in-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: a?.color?.hex || '#999' }}
          />
          <span>{a?.name}</span>
          {typeof a?.percentage === 'number' ? (
            <span className="text-gray-400">{` ${a.percentage}%`}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}


