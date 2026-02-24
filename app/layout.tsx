import type { Metadata, Viewport } from "next";
import { Playfair_Display, Lora } from "next/font/google";
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

// Heading font: Playfair Display — classic serif for botanical warmth
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

// Body font: Lora — warm, readable serif for brand voice
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://wildenflower.com'),
  title: {
    default: 'Wildenflower | Tie-Dye, Leather Goods, Jewelry & Art',
    template: '%s | Wildenflower',
  },
  description:
    'Made by hand. Found by heart. Wildenflower offers tie-dye apparel, leather goods, handcrafted jewelry, and original art — each piece made with care, found by the person it was meant for.',
  keywords: [
    'tie-dye',
    'leather goods',
    'handcrafted jewelry',
    'original art',
    'handmade',
    'botanical',
    'wildenflower',
  ],
  authors: [{ name: 'Wildenflower' }],
  creator: 'Wildenflower',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Wildenflower',
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
    url: 'https://wildenflower.com',
    siteName: 'Wildenflower',
    title: 'Wildenflower | Tie-Dye, Leather Goods, Jewelry & Art',
    description:
      'Made by hand. Found by heart. Tie-dye, leather goods, handcrafted jewelry, and original art crafted with care.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wildenflower | Tie-Dye, Leather Goods, Jewelry & Art',
    description:
      'Made by hand. Found by heart. Tie-dye, leather goods, jewelry, and original art from Wildenflower.',
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
  themeColor: '#1E3B30', // forest green — Wildenflower brand
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${lora.variable} antialiased`}>
      <body>
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
