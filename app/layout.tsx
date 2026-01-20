import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Nunito, Sacramento } from "next/font/google";
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

// Heading font: Elegant serif with personality
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Body font: Clean, warm, and readable
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Accent font: Hand-drawn script for special callouts
const sacramento = Sacramento({
  variable: "--font-sacramento",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://wildenflower.com'),
  title: {
    default: 'Wildenflower - Wild Beauty, Crafted with Intention',
    template: '%s | Wildenflower',
  },
  description:
    'Handpicked treasures for the untamed spirit. Discover curated tie-dye apparel, artisan leather goods, unique jewelry, and crystals. Crafted with intention, worn with meaning.',
  keywords: [
    'bohemian',
    'crystals',
    'artisan jewelry',
    'tie-dye',
    'leather goods',
    'handcrafted',
    'spiritual',
    'gemstones',
    'boho fashion',
    'handmade gifts',
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
    title: 'Wildenflower - Wild Beauty, Crafted with Intention',
    description:
      'Handpicked treasures for the untamed spirit. Curated bohemian jewelry, crystals, tie-dye, and artisan goods.',
    siteName: 'Wildenflower',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wildenflower - Wild Beauty, Crafted with Intention',
    description:
      'Handpicked treasures for the untamed spirit. Curated bohemian jewelry, crystals, tie-dye, and artisan goods.',
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
  themeColor: '#0D9488', // Deep Turquoise - primary brand color
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${cormorant.variable} ${sacramento.variable} antialiased font-sans`}
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
