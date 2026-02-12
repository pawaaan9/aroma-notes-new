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
    <div className="flex min-h-screen flex-col animate-fade-in-up">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <main className="flex-grow">
        <section>
          <HeroVideo
            title="Return & Exchange Policy"
            subtitle="We strive for your satisfaction. Review our return and exchange terms."
          />
        </section>

        <section className="py-16 sm:py-24 bg-white">
          <div className="mx-auto max-w-none px-4 sm:px-6 lg:px-[5vw] prose prose-gray max-w-4xl">
            <h2 className="font-smooch text-3xl sm:text-4xl text-gray-900 mb-6">Eligibility</h2>
            <p className="font-saira text-gray-700">
              For hygiene and quality assurance reasons, opened or used fragrances may not be eligible for return. Please contact us within 7 days of delivery for any concerns.
            </p>

            <h3 className="font-smooch text-2xl text-gray-900 mt-10 mb-4">Damaged or Incorrect Items</h3>
            <p className="font-saira text-gray-700">
              If your order arrives damaged or incorrect, please reach out with your order number and photos within 48 hours so we can assist promptly.
            </p>

            <h3 className="font-smooch text-2xl text-gray-900 mt-10 mb-4">Process</h3>
            <ul className="list-disc pl-6 font-saira text-gray-700 space-y-2">
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


