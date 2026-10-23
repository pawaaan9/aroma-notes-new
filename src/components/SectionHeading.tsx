import Link from "next/link";
import type { ReactNode } from "react";

/** Editorial section title: numbered eyebrow, large heading, optional link on the right. */
export default function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  tone = "light",
  action,
}: {
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: "light" | "dark";
  action?: { href: string; label: string };
}) {
  const dark = tone === "dark";

  return (
    <div
      data-reveal
      className={`mb-10 flex flex-col gap-6 border-b pb-8 sm:mb-12 md:flex-row md:items-end md:justify-between ${
        dark ? "border-white/10" : "border-gray-200"
      }`}
    >
      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          {index && <span className="text-xs font-black text-primary">{index}</span>}
          <span className="h-px w-10 bg-primary" />
          {eyebrow && (
            <span className={`eyebrow ${dark ? "text-gray-400" : "text-gray-500"}`}>{eyebrow}</span>
          )}
        </div>
        <h2
          className={`mt-4 text-3xl font-black uppercase leading-none tracking-tight sm:text-5xl ${
            dark ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p className={`mt-4 max-w-xl text-sm leading-relaxed sm:text-base ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={`group inline-flex shrink-0 items-center gap-3 self-start border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors md:self-auto ${
            dark
              ? "border-white/25 text-white hover:border-primary hover:bg-primary"
              : "border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
          }`}
        >
          {action.label}
          <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="square" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      )}
    </div>
  );
}
