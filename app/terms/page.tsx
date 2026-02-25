import type { Metadata } from 'next';
import { BotanicalHeader } from '@/components/ui/botanical-header';

export const metadata: Metadata = {
    title: 'Terms of Service | Wildenflower',
    description: 'Terms and conditions governing the use of the Wildenflower website and services.',
};

export default function TermsPage() {
    return (
        <>
            <BotanicalHeader />

            <section className="bg-parchment py-16 lg:py-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
                        Legal
                    </span>
                    <h1 className="mt-3 text-4xl font-bold font-heading text-ink-brown sm:text-5xl mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-earth/60 text-sm">Last updated: January 17, 2026</p>
                </div>
            </section>

            <section className="bg-white py-12 lg:py-16">
                <div className="container mx-auto px-4 max-w-3xl prose prose-lg prose-slate prose-headings:font-heading prose-headings:text-ink-brown prose-a:text-terracotta hover:prose-a:text-terracotta/80">
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using the Wildenflower website (wildenflower.com), you accept
                        and agree to be bound by these Terms of Service. If you do not agree to these
                        terms, please do not use our site.
                    </p>

                    <h2>2. Products & Pricing</h2>
                    <p>
                        All products are handmade by independent artisans. Due to the nature of
                        handcrafted goods, slight variations in color, size, and pattern are normal
                        and part of what makes each piece unique.
                    </p>
                    <p>
                        Prices are listed in USD and are subject to change without notice. We reserve
                        the right to correct pricing errors.
                    </p>

                    <h2>3. Orders & Payment</h2>
                    <ul>
                        <li>All orders are subject to availability and confirmation</li>
                        <li>We accept major credit cards, PayPal, and Apple Pay</li>
                        <li>Payment is processed securely at the time of checkout</li>
                        <li>We reserve the right to cancel orders suspected of fraud</li>
                    </ul>

                    <h2>4. Shipping</h2>
                    <p>
                        Shipping timelines are estimates and not guaranteed. We are not responsible
                        for delays caused by carriers, customs, or unforeseen circumstances. Please
                        see our <a href="/shipping-returns">Shipping & Returns</a> page for full details.
                    </p>

                    <h2>5. Returns & Refunds</h2>
                    <p>
                        We offer a 30-day return policy on most items. Items must be unused, unworn,
                        and in original packaging. Custom or personalized items are non-returnable.
                        See our <a href="/shipping-returns">Shipping & Returns</a> page for the complete policy.
                    </p>

                    <h2>6. Intellectual Property</h2>
                    <p>
                        All content on this website — including text, images, logos, product designs,
                        and photography — is the property of Wildenflower or our artisan partners
                        and is protected by copyright laws. You may not reproduce, distribute, or
                        use any content without written permission.
                    </p>

                    <h2>7. User Accounts</h2>
                    <p>
                        You are responsible for maintaining the confidentiality of your account
                        credentials. You agree to notify us immediately of any unauthorized use
                        of your account.
                    </p>

                    <h2>8. Limitation of Liability</h2>
                    <p>
                        Wildenflower shall not be liable for any indirect, incidental, special, or
                        consequential damages arising from the use of our website or products,
                        to the maximum extent permitted by law.
                    </p>

                    <h2>9. Changes to Terms</h2>
                    <p>
                        We may update these terms from time to time. Continued use of the site
                        after changes constitutes acceptance of the revised terms.
                    </p>

                    <h2>10. Contact</h2>
                    <p>
                        Questions about these terms? Contact us at{' '}
                        <a href="mailto:legal@wildenflower.com">legal@wildenflower.com</a>.
                    </p>
                </div>
            </section>
        </>
    );
}
