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
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-none px-4 sm:px-6 lg:px-[5vw]">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-rose-500 mx-auto rounded-full mb-6"></div>
          </div>
          <div className="animate-fade-in-up delay-300">
            <p className="text-lg text-gray-700 leading-relaxed  font-saira">
              Find answers to common questions about our fragrances, ordering, and care.
            </p>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="mx-auto max-w-3xl space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="group border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* FAQ Question - Clickable Header */}
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors duration-200 text-left"
              >
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-200 font-saira">
                  {item.question}
                </h3>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500/10 to-rose-500/10 group-hover:from-amber-500/20 group-hover:to-rose-500/20 transition-all duration-200">
                    {openIndex === index ? (
                      // Minus icon
                      <svg
                        className="w-5 h-5 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M20 12H4"
                        />
                      </svg>
                    ) : (
                      // Plus icon
                      <svg
                        className="w-5 h-5 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </button>

              {/* FAQ Answer - Expandable Content */}
              {openIndex === index && (
                <div className="px-6 py-5 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200 animate-fade-in-up">
                  <p className="text-gray-700 leading-relaxed font-saira">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mx-auto max-w-3xl mt-16 text-center p-8 rounded-lg bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/50 animate-fade-in-up">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Didn&apos;t find your answer?
          </h3>
          <p className="text-gray-700 mb-5 font-saira">
            Our customer service team is here to help! Feel free to reach out through WhatsApp or contact us directly.
          </p>
          <a
            href="https://wa.me/94721922332"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-amber-500 to-rose-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 font-saira uppercase"
          >
            Chat with Us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
