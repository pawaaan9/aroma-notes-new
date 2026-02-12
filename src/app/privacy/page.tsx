import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroVideo from "@/components/HeroVideo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Aroma Notes collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    url: "/privacy",
    title: "Privacy Policy | Aroma Notes",
    description: "Learn how we collect, use, and protect your data.",
  },
  twitter: {
    title: "Privacy Policy | Aroma Notes",
    description: "Learn how we collect, use, and protect your data.",
    card: "summary",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col animate-fade-in-up">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <main className="flex-grow">
        <section>
          <HeroVideo
            title="Privacy Policy"
            subtitle="Your privacy matters. Learn how we collect, use, and protect your data."
          />
        </section>

        <section className="py-16 sm:py-24 bg-white">
          <div className="mx-auto max-w-none px-4 sm:px-6 lg:px-[5vw] prose prose-gray max-w-4xl">
            <h2 className="font-smooch text-3xl sm:text-4xl text-gray-900 mb-6">Information We Collect</h2>
            <p className="font-saira text-gray-700">
              We may collect personal information such as your name, contact details, order history, and preferences to provide and improve our services.
            </p>

            <h3 className="font-smooch text-2xl text-gray-900 mt-10 mb-4">How We Use Your Information</h3>
            <ul className="list-disc pl-6 font-saira text-gray-700 space-y-2">
              <li>Process and fulfill orders.</li>
              <li>Provide customer support and respond to inquiries.</li>
              <li>Improve our products, services, and website experience.</li>
            </ul>

            <h3 className="font-smooch text-2xl text-gray-900 mt-10 mb-4">Sharing & Security</h3>
            <p className="font-saira text-gray-700">
              We do not sell your personal information. We implement reasonable safeguards to protect your data; however, no method of transmission is 100% secure.
            </p>

            <h3 className="font-smooch text-2xl text-gray-900 mt-10 mb-4">Your Choices</h3>
            <p className="font-saira text-gray-700">
              You may request access, correction, or deletion of your personal information, subject to applicable law.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


