import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroVideo from "@/components/HeroVideo";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Review the terms that govern your use of Aroma Notes.",
  alternates: { canonical: "/terms" },
  openGraph: {
    url: "/terms",
    title: "Terms & Conditions | Aroma Notes",
    description: "Review the terms that govern your use of Aroma Notes.",
  },
  twitter: {
    title: "Terms & Conditions | Aroma Notes",
    description: "Review the terms that govern your use of Aroma Notes.",
    card: "summary",
  },
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <main className="flex-grow bg-white">
        <section>
          <HeroVideo
            eyebrow="Policies"
            title="Terms & Conditions"
            subtitle="Please review the terms that govern your use of Aroma Notes."
          />
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl border border-gray-200 px-6 py-10 sm:px-12 sm:py-14">
            <h2 className="mb-5 text-2xl font-extrabold uppercase tracking-[0.06em] text-gray-900">Agreement to Terms</h2>
            <p className="leading-relaxed text-gray-600">
              By accessing or using Aroma Notes, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our site or services.
            </p>

            <h3 className="mt-10 mb-4 border-t border-gray-200 pt-8 text-lg font-bold text-gray-900">Orders & Payments</h3>
            <ul className="list-disc space-y-2 pl-6 leading-relaxed text-gray-600 marker:text-primary">
              <li>All prices are listed in LKR unless stated otherwise.</li>
              <li>Availability and pricing may change without prior notice.</li>
              <li>We reserve the right to refuse or cancel any order at our discretion.</li>
            </ul>

            <h3 className="mt-10 mb-4 border-t border-gray-200 pt-8 text-lg font-bold text-gray-900">Shipping</h3>
            <p className="leading-relaxed text-gray-600">
              Shipping times are estimates and may vary due to carrier or regional constraints. Risk of loss passes to you upon delivery to the carrier.
            </p>

            <h3 className="mt-10 mb-4 border-t border-gray-200 pt-8 text-lg font-bold text-gray-900">Limitation of Liability</h3>
            <p className="leading-relaxed text-gray-600">
              To the maximum extent permitted by law, Aroma Notes is not liable for indirect, incidental, or consequential damages arising from the use of our products or services.
            </p>

            <h3 className="mt-10 mb-4 border-t border-gray-200 pt-8 text-lg font-bold text-gray-900">Changes to Terms</h3>
            <p className="leading-relaxed text-gray-600">
              We may update these Terms from time to time. Continued use of the site after updates constitutes acceptance of the revised Terms.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


