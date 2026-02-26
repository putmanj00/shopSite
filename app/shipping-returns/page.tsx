import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/page-hero';

export const metadata: Metadata = {
    title: 'Shipping & Returns | Wildenflower',
    description: 'Information about our shipping policies, delivery timelines, and easy return process.',
};

const shippingRates = [
    { method: 'Standard Shipping', time: '5–7 business days', cost: 'Free over $75 / $5.95' },
    { method: 'Express Shipping', time: '2–3 business days', cost: '$12.95' },
    { method: 'Overnight Shipping', time: '1 business day', cost: '$24.95' },
    { method: 'International', time: '7–14 business days', cost: 'Calculated at checkout' },
];

export default function ShippingReturnsPage() {
    return (
        <>
            <PageHero
                backgroundImage="/assets/images/headers/botanical-header-blog.png"
                label="Policies"
                title="Shipping & Returns"
                subtitle="We want you to love every piece. Here's everything you need to know about getting your order and our hassle-free return policy."
            />

            {/* Shipping Rates */}
            <section className="bg-parchment py-16 lg:py-24">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-2xl font-bold font-heading text-ink-brown mb-6">
                        Shipping Options
                    </h2>
                    <div className="overflow-hidden rounded-xl border border-gold/20">
                        <table className="w-full text-sm">
                            <thead className="bg-sage/10">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold text-ink-brown">Method</th>
                                    <th className="px-5 py-3 text-left font-semibold text-ink-brown">Delivery Time</th>
                                    <th className="px-5 py-3 text-right font-semibold text-ink-brown">Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/10">
                                {shippingRates.map((rate) => (
                                    <tr key={rate.method} className="bg-white hover:bg-parchment/50 transition-colors">
                                        <td className="px-5 py-4 font-medium text-ink-brown">{rate.method}</td>
                                        <td className="px-5 py-4 text-earth">{rate.time}</td>
                                        <td className="px-5 py-4 text-right text-terracotta font-medium">{rate.cost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4 text-earth/60 text-sm">
                        All orders are shipped with tracking. Processing takes 1–2 business days.
                    </p>
                </div>
            </section>

            {/* Returns Policy */}
            <section className="bg-parchment py-12 lg:py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-2xl font-bold font-heading text-ink-brown mb-6">
                        Return Policy
                    </h2>
                    <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6">
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">30-Day Returns</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                We accept returns within 30 days of delivery for a full refund. Items must be
                                unused, unworn, and in their original packaging.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">How to Return</h3>
                            <ol className="text-earth text-sm leading-relaxed list-decimal list-inside space-y-2">
                                <li>Contact us at <span className="text-terracotta">wildenflowercreations@gmail.com</span> with your order number</li>
                                <li>Receive a prepaid return shipping label within 24 hours</li>
                                <li>Pack items securely and drop off at any carrier location</li>
                                <li>Refund processed within 5–7 business days of receipt</li>
                            </ol>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">Exchanges</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Need a different size or color? We&apos;re happy to exchange! Contact us and
                                we&apos;ll arrange a free exchange shipment.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">Non-Returnable Items</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Custom-made or personalized items, earrings (for hygiene reasons), and final sale
                                items cannot be returned. Gift cards are non-refundable.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
