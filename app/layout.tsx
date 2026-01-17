import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CartDrawer from "@/components/cart-drawer";
import QuickViewModal from "@/components/quick-view-modal";
import SkipLink from "@/components/ui/skip-link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'ShopSite - Premium Products & Modern Design',
    template: '%s | ShopSite',
  },
  description:
    'Discover curated collections of premium products with exceptional quality and modern design. Shop the latest trends with fast, reliable delivery.',
  keywords: [
    'ecommerce',
    'shopping',
    'premium products',
    'online store',
    'modern design',
  ],
  authors: [{ name: 'ShopSite' }],
  creator: 'ShopSite',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shopsite.com',
    title: 'ShopSite - Premium Products & Modern Design',
    description:
      'Discover curated collections of premium products with exceptional quality and modern design.',
    siteName: 'ShopSite',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopSite - Premium Products & Modern Design',
    description:
      'Discover curated collections of premium products with exceptional quality and modern design.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipLink />
        <Header />
        <CartDrawer />
        <QuickViewModal />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
