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
    <div className="flex min-h-screen flex-col animate-fade-in-up">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <main className="flex-grow">
        <section>
          <HeroVideo
            title="Terms & Conditions"
            subtitle="Please review the terms that govern your use of Aroma Notes."
          />
        </section>

        <section className="py-16 sm:py-24 bg-white">
          <div className="mx-auto max-w-none px-4 sm:px-6 lg:px-[5vw] prose prose-gray max-w-4xl">
            <h2 className="font-smooch text-3xl sm:text-4xl text-gray-900 mb-6">Agreement to Terms</h2>
            <p className="font-saira text-gray-700">
              By accessing or using Aroma Notes, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our site or services.
            </p>

            <h3 className="font-smooch text-2xl text-gray-900 mt-10 mb-4">Orders & Payments</h3>
            <ul className="list-disc pl-6 font-saira text-gray-700 space-y-2">
              <li>All prices are listed in LKR unless stated otherwise.</li>
              <li>Availability and pricing may change without prior notice.</li>
              <li>We reserve the right to refuse or cancel any order at our discretion.</li>
            </ul>

            <h3 className="font-smooch text-2xl text-gray-900 mt-10 mb-4">Shipping</h3>
            <p className="font-saira text-gray-700">
              Shipping times are estimates and may vary due to carrier or regional constraints. Risk of loss passes to you upon delivery to the carrier.
            </p>

            <h3 className="font-smooch text-2xl text-gray-900 mt-10 mb-4">Limitation of Liability</h3>
            <p className="font-saira text-gray-700">
              To the maximum extent permitted by law, Aroma Notes is not liable for indirect, incidental, or consequential damages arising from the use of our products or services.
            </p>

            <h3 className="font-smooch text-2xl text-gray-900 mt-10 mb-4">Changes to Terms</h3>
            <p className="font-saira text-gray-700">
              We may update these Terms from time to time. Continued use of the site after updates constitutes acceptance of the revised Terms.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


