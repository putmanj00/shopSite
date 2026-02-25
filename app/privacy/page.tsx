import type { Metadata } from 'next';
import { BotanicalHeader } from '@/components/ui/botanical-header';

export const metadata: Metadata = {
    title: 'Privacy Policy | Wildenflower',
    description: 'How Wildenflower collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
    return (
        <>
            <BotanicalHeader />

            <section className="bg-parchment py-16 lg:py-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
                        Legal
                    </span>
                    <h1 className="mt-3 text-4xl font-bold font-heading text-ink-brown sm:text-5xl mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-earth/60 text-sm">Last updated: January 17, 2026</p>
                </div>
            </section>

            <section className="bg-white py-12 lg:py-16">
                <div className="container mx-auto px-4 max-w-3xl prose prose-lg prose-slate prose-headings:font-heading prose-headings:text-ink-brown prose-a:text-terracotta hover:prose-a:text-terracotta/80">
                    <h2>Information We Collect</h2>
                    <p>
                        When you visit Wildenflower, we collect certain information about your device,
                        your interaction with the site, and information necessary to process your purchases.
                        We may also collect additional information if you contact us for customer support.
                    </p>

                    <h3>Personal Information</h3>
                    <ul>
                        <li>Name, email address, and phone number</li>
                        <li>Billing and shipping addresses</li>
                        <li>Payment information (processed securely via Shopify Payments)</li>
                        <li>Order history and preferences</li>
                    </ul>

                    <h3>Automatically Collected Information</h3>
                    <ul>
                        <li>IP address and browser type</li>
                        <li>Pages visited and time spent on site</li>
                        <li>Referring website or search terms</li>
                        <li>Device and operating system information</li>
                    </ul>

                    <h2>How We Use Your Information</h2>
                    <ul>
                        <li>To fulfill and manage your orders</li>
                        <li>To communicate about your purchases and account</li>
                        <li>To improve our website and shopping experience</li>
                        <li>To send marketing emails (with your consent, and you can opt out anytime)</li>
                        <li>To comply with legal obligations</li>
                    </ul>

                    <h2>Sharing Your Information</h2>
                    <p>
                        We do not sell your personal information. We share data only with service providers
                        who help us operate our business:
                    </p>
                    <ul>
                        <li>Shopify (e-commerce platform)</li>
                        <li>Shipping carriers (to deliver your orders)</li>
                        <li>Payment processors (to process transactions securely)</li>
                        <li>Analytics providers (to improve our site)</li>
                    </ul>

                    <h2>Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access the personal information we hold about you</li>
                        <li>Request correction of inaccurate information</li>
                        <li>Request deletion of your personal information</li>
                        <li>Opt out of marketing communications</li>
                        <li>Lodge a complaint with a supervisory authority</li>
                    </ul>

                    <h2>Cookies</h2>
                    <p>
                        We use cookies to remember your preferences, maintain your shopping cart,
                        and understand how you use our site. You can control cookie settings through
                        your browser preferences.
                    </p>

                    <h2>Security</h2>
                    <p>
                        We implement industry-standard security measures including SSL encryption,
                        secure payment processing, and regular security audits to protect your information.
                    </p>

                    <h2>Contact</h2>
                    <p>
                        For privacy-related inquiries, contact us at{' '}
                        <a href="mailto:privacy@wildenflower.com">privacy@wildenflower.com</a>.
                    </p>
                </div>
            </section>
        </>
    );
}
