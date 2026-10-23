import type { Metadata, Viewport } from "next";
import { Mulish, Poppins, Smooch_Sans, Saira } from "next/font/google";
import SplashScreen from "@/components/SplashScreen";
import CartDrawer from "@/components/CartDrawer";
import MetaPixel from "@/components/MetaPixel";
import ScrollReveal from "@/components/ScrollReveal";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Admin panel typefaces, loaded on demand only
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  style: ["normal","italic"],
  preload: false,
});

const smooch = Smooch_Sans({
  variable: "--font-smooch",
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  preload: false,
});

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  preload: false,
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
    <html lang="en" data-scroll-behavior="smooth" className={`${mulish.variable} ${poppins.variable} ${smooch.variable} ${saira.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
      </head>
      <body
        className="bg-white font-sans text-gray-900 antialiased"
      >
        <MetaPixel />
        <ScrollReveal />
        <CartProvider>
          <CartDrawerProvider>
            <SplashScreen />
            {children}
            <CartDrawer />
          </CartDrawerProvider>
        </CartProvider>
      </body>
    </html>
  );
}
