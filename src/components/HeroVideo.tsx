"use client";

type Props = {
  title?: string;
  subtitle?: string;
};

export default function HeroVideo({ title, subtitle }: Props) {
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
      {/* Background video (same across all screens) */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectFit: "cover", objectPosition: "center center" }}
      >
        <source src="/hero-mobile.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Subtle gradients for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60"></div>

      {/* Content */}
      <div className="relative z-10 px-4 text-center text-white">
        {title ? (
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl font-smooch">
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p className="mx-auto mt-4 max-w-3xl text-lg opacity-90 font-saira">{subtitle}</p>
        ) : null}
      </div>
    </section>
  );
}


