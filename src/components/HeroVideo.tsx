"use client";

import Link from "next/link";

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export default function HeroVideo({ eyebrow, title, subtitle }: Props) {
  return (
    <section className="relative flex min-h-[46vh] items-end overflow-hidden bg-black pt-28">
      {/* Background video (same across all screens) */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/hero-mobile.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/65" />

      {/* Content */}
      <div className="relative z-10 w-full px-4 pb-12 sm:px-6 sm:pb-16 lg:px-[10vw]">
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-primary">Home</Link>
          <span className="h-px w-4 bg-gray-500" />
          <span className="text-white">{title}</span>
        </nav>
        <div className="mt-8 border-l-2 border-primary pl-5 sm:pl-8">
          {eyebrow ? <p className="eyebrow text-primary">{eyebrow}</p> : null}
          {title ? (
            <h1 className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl">
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <p className="mt-4 max-w-xl text-sm text-gray-300 sm:text-base">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
