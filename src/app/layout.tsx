import type { Metadata, Viewport } from "next";
import { Poppins, Smooch_Sans, Saira, Exo_2, Audiowide } from "next/font/google";
import WhatsAppChat from "@/components/WhatsAppChat";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  style: ["normal","italic"],
});

const smooch = Smooch_Sans({
  variable: "--font-smooch",
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
});

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
});

const audiowide = Audiowide({
  variable: "--font-audiowide",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  applicationName: "Aroma Notes",
  title: {
    default: "Aroma Notes - Exclusive imports from Yusuf Bhai",
    template: "%s | Aroma Notes"
  },
  description: "Where every scent tells a story. Discover our exclusive collection of artisanal perfumes and signature fragrances, each bottle a masterpiece of olfactory artistry. Hand-crafted with passion, precision, and the finest ingredients from around the world.",
  keywords: [
    "luxury perfume",
    "signature fragrances",
    "artisanal perfumery",
    "exclusive scents",
    "premium fragrances",
    "Aroma Notes",
  ],
  authors: [{ name: "Aroma Notes" }],
  alternates: {
    canonical: '/',
  },
  category: 'ecommerce',
  icons: {
    icon: [
      { url: "/logo-2.png" },
      { url: "/favicon.ico", rel: "icon" },
    ],
    shortcut: [
      { url: "/logo-2.png" },
    ],
    apple: [
      { url: "/logo-2.png" },
    ],
  },
  openGraph: {
    title: "Aroma Notes - Luxury Perfumery & Signature Fragrances",
    description: "Where every scent tells a story. Discover our exclusive collection of artisanal perfumes.",
    type: "website",
    locale: "en_US",
    url: '/',
    siteName: 'Aroma Notes',
    images: [
      { url: "/yusuf-bhai.webp", width: 1200, height: 630, alt: "Aroma Notes" },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@aromanotes',
    creator: '@aromanotes',
    title: "Aroma Notes - Luxury Perfumery & Signature Fragrances",
    description: "Where every scent tells a story. Discover our exclusive collection of artisanal perfumes.",
    images: [
      "/yusuf-bhai.webp",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${smooch.variable} ${saira.variable} ${exo2.variable} ${audiowide.variable} bg-white font-sans text-gray-900 antialiased bg-perfume-gradient bg-perfume-paper bg-perfume-vignette`}
      >
        {/* Floating sparkles layer */}
        <div className="perfume-sparkles" aria-hidden>
          <span className="dot" style={{ left: '10%', bottom: '5%' }} />
          <span className="dot alt" style={{ left: '30%', bottom: '10%' }} />
          <span className="dot" style={{ left: '55%', bottom: '0%' }} />
          <span className="dot alt" style={{ left: '75%', bottom: '12%' }} />
          <span className="dot" style={{ left: '90%', bottom: '8%' }} />
        </div>
        <div className="relative z-10">
          <CartProvider>
            <SplashScreen />
            {children}
            <WhatsAppChat />
          </CartProvider>
        </div>
      </body>
    </html>
  );
}
