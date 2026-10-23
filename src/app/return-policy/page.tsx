import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroVideo from "@/components/HeroVideo";

export const metadata: Metadata = {
  title: "Return & Exchange Policy",
  description: "Review Aroma Notes' return and exchange terms for your purchases.",
  alternates: { canonical: "/return-policy" },
  openGraph: {
    url: "/return-policy",
    title: "Return & Exchange Policy | Aroma Notes",
    description: "We strive for your satisfaction. Review our return and exchange terms.",
  },
  twitter: {
    title: "Return & Exchange Policy | Aroma Notes",
    description: "We strive for your satisfaction. Review our return and exchange terms.",
    card: "summary",
  },
};

export default function ReturnPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <main className="flex-grow bg-white">
        <section>
          <HeroVideo
            eyebrow="Customer Care"
            title="Return & Exchange Policy"
            subtitle="We strive for your satisfaction. Review our return and exchange terms."
          />
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl border border-gray-200 px-6 py-10 sm:px-12 sm:py-14">
            <h2 className="mb-5 text-2xl font-extrabold uppercase tracking-[0.06em] text-gray-900">Eligibility</h2>
            <p className="leading-relaxed text-gray-600">
              For hygiene and quality assurance reasons, opened or used fragrances may not be eligible for return. Please contact us within 7 days of delivery for any concerns.
            </p>

            <h3 className="mt-10 mb-4 border-t border-gray-200 pt-8 text-lg font-bold text-gray-900">Damaged or Incorrect Items</h3>
            <p className="leading-relaxed text-gray-600">
              If your order arrives damaged or incorrect, please reach out with your order number and photos within 48 hours so we can assist promptly.
            </p>

            <h3 className="mt-10 mb-4 border-t border-gray-200 pt-8 text-lg font-bold text-gray-900">Process</h3>
            <ul className="list-disc space-y-2 pl-6 leading-relaxed text-gray-600 marker:text-primary">
              <li>Contact us with your order details and concern.</li>
              <li>We will review and advise next steps, including return shipping guidance if applicable.</li>
              <li>Approved refunds are issued to the original payment method.</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


