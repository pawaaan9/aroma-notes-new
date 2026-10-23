"use client";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What Makes Aroma Notes Fragrances Unique?",
    answer: "Aroma Notes brings Sri Lankans the rare opportunity to experience world-class luxury perfumes handcrafted by Yusuf Bhai. Known for his exceptional skill and precision, Yusuf Bhai creates fragrances inspired by high-end niche compositions, using only premium-quality oils. Through Aroma Notes, you can now enjoy these exclusive handmade creations — perfumes that blend authenticity, elegance, and long-lasting luxury, all in one bottle."
  },
  {
    question: "How Long Do the Fragrances Last?",
    answer: "Yusuf Bhai handmade perfumes typically last 6 to 8 hours on the skin, depending on your body chemistry and application method. For the best results, apply on pulse points such as the wrists, neck, and behind the ears to enhance projection and longevity."
  },
  {
    question: "Are All Aroma Notes Fragrances Imported?",
    answer: "Yes. All Aroma Notes fragrances are imported from Yusuf Bhai, who handcrafts each perfume with premium ingredients and world-class expertise. Every fragrance you find at Aroma Notes is an authentic handmade creation, brought directly from his luxury perfume collection to Sri Lanka."
  },
  {
    question: "Which Payment Options Can I Use?",
    answer: "You can pay cash on delivery, by bank deposit (upload your slip at checkout), or with Payzy to split your payment into interest free installments."
  },
  {
    question: "What If My Order Arrives Damaged?",
    answer: "If your order arrives damaged or incorrect, contact us with your order number and photos within 48 hours and we will help you promptly. See our Return Policy for full details."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden border-t border-gray-200 bg-white py-20 sm:py-28">
      <p
        className="text-outline pointer-events-none absolute -left-4 bottom-0 select-none text-[9rem] font-black uppercase leading-none text-gray-900/[0.06] sm:text-[16rem]"
        aria-hidden
      >
        FAQ
      </p>
      <div className="relative mx-auto grid gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-[10vw]">
        {/* Intro */}
        <div data-reveal className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-primary">FAQ</span>
            <span className="h-px w-10 bg-primary" />
            <span className="eyebrow text-gray-500">Help Centre</span>
          </div>
          <h2 className="mt-4 text-4xl font-black uppercase leading-[0.95] tracking-tight text-gray-900 sm:text-5xl">
            Questions,
            <span className="text-outline block">Answered</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-gray-500">
            Everything you need to know about our fragrances, ordering, and care.
          </p>
          <div className="mt-8 max-w-md bg-gray-950 p-6 text-white">
            <p className="eyebrow text-primary">Still curious?</p>
            <p className="mt-3 text-lg font-extrabold leading-snug">Talk to us directly. We usually reply within minutes.</p>
            <a
              href="https://wa.me/94721922332"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-5 inline-flex items-center gap-3 bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-gray-900"
            >
              Chat on WhatsApp
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="square" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-3 lg:col-span-7">
          {faqItems.map((item, index) => {
            const open = openIndex === index;
            return (
              <div
                key={item.question}
                data-reveal
                style={{ "--reveal-delay": `${index * 60}ms` } as React.CSSProperties}
                className={`border bg-white transition-colors duration-300 ${open ? "border-gray-900" : "border-gray-200 hover:border-gray-400"}`}
              >
                <button
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-4 px-5 py-5 text-left sm:gap-6 sm:px-6"
                >
                  <span className={`text-outline shrink-0 text-3xl font-black leading-none transition-colors ${open ? "text-primary" : "text-gray-400"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-base font-bold text-gray-900 sm:text-lg">{item.question}</span>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center transition-colors duration-300 ${
                      open ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <svg
                      className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="square" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
                {/* Smooth open and close */}
                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="border-t border-gray-100 px-5 pb-6 pt-4 leading-relaxed text-gray-600 sm:pl-[4.75rem] sm:pr-6">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
