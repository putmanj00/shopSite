import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CartDrawer from "@/components/cart-drawer";
import QuickViewModal from "@/components/quick-view-modal";
import SkipLink from "@/components/ui/skip-link";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ServiceWorkerRegister from "@/components/service-worker-register";
import SocialProofToast from "@/components/social-proof-toast";
import { ExitIntentPopup, WelcomePopup, RecentPurchasePopup } from "@/components/cro";
import Analytics from "@/components/analytics";
import { CurrencyProvider } from "@/lib/currency-context";
import GeolocationHandler from "@/components/geolocation-handler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://shopsite.com'),
  title: {
    default: 'Artisan Collective - Premium Handmade Goods',
    template: '%s | Artisan Collective',
  },
  description:
    'Discover handcrafted tie-dye apparel, leather goods, artisan jewelry, and original art. Premium quality, made with love by skilled artisans.',
  keywords: [
    'handmade',
    'artisan',
    'tie-dye',
    'leather goods',
    'jewelry',
    'original art',
    'handcrafted',
    'premium',
  ],
  authors: [{ name: 'Artisan Collective' }],
  creator: 'Artisan Collective',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Artisan Collective',
  },
  formatDetection: {
    telephone: true,
    date: false,
    address: false,
    email: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://artisancollective.com',
    title: 'Artisan Collective - Premium Handmade Goods',
    description:
      'Discover handcrafted tie-dye apparel, leather goods, artisan jewelry, and original art.',
    siteName: 'Artisan Collective',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artisan Collective - Premium Handmade Goods',
    description:
      'Discover handcrafted tie-dye apparel, leather goods, artisan jewelry, and original art.',
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
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2e4a62',
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
        <CurrencyProvider>
          <GeolocationHandler />
          <SkipLink />
          <Header />
          <CartDrawer />
          <QuickViewModal />
          <main id="main-content" tabIndex={-1} className="pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <ServiceWorkerRegister />
          <SocialProofToast />
          <WelcomePopup />
          <ExitIntentPopup />
          <RecentPurchasePopup />
          <Analytics />
          <VercelAnalytics />
          <SpeedInsights />
        </CurrencyProvider>
      </body>
    </html>
  );
}
