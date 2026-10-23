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
    <div className="flex min-h-screen flex-col">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <main className="flex-grow bg-white">
        <section>
          <HeroVideo
            eyebrow="Policies"
            title="Privacy Policy"
            subtitle="Your privacy matters. Learn how we collect, use, and protect your data."
          />
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl border border-gray-200 px-6 py-10 sm:px-12 sm:py-14">
            <h2 className="mb-5 text-2xl font-extrabold uppercase tracking-[0.06em] text-gray-900">Information We Collect</h2>
            <p className="leading-relaxed text-gray-600">
              We may collect personal information such as your name, contact details, order history, and preferences to provide and improve our services.
            </p>

            <h3 className="mt-10 mb-4 border-t border-gray-200 pt-8 text-lg font-bold text-gray-900">How We Use Your Information</h3>
            <ul className="list-disc space-y-2 pl-6 leading-relaxed text-gray-600 marker:text-primary">
              <li>Process and fulfill orders.</li>
              <li>Provide customer support and respond to inquiries.</li>
              <li>Improve our products, services, and website experience.</li>
            </ul>

            <h3 className="mt-10 mb-4 border-t border-gray-200 pt-8 text-lg font-bold text-gray-900">Sharing & Security</h3>
            <p className="leading-relaxed text-gray-600">
              We do not sell your personal information. We implement reasonable safeguards to protect your data; however, no method of transmission is 100% secure.
            </p>

            <h3 className="mt-10 mb-4 border-t border-gray-200 pt-8 text-lg font-bold text-gray-900">Your Choices</h3>
            <p className="leading-relaxed text-gray-600">
              You may request access, correction, or deletion of your personal information, subject to applicable law.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


