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
                                        <td className="px-5 py-4 text-right text-primary-700 font-medium">{rate.cost}</td>
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
                    <span className="catalog-label text-ink-brown/80">The Field Guarantee</span>
                    <h2 className="mt-3 text-2xl font-bold font-heading text-ink-brown mb-6">
                        Returns
                    </h2>
                    <div className="bg-cream p-8 rounded-2xl shadow-sm space-y-6">
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">14-Day Returns</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                You have 14 days from the day your order arrives to request a return. Items must be
                                unworn, unwashed, and in original condition.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">One of a Kind</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Many pieces are truly one of a kind. Small differences in dye pattern, color, and
                                texture between the photo and your piece are natural — they are what make it yours,
                                not defects.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">How to Return</h3>
                            <ol className="text-earth text-sm leading-relaxed list-decimal list-inside space-y-2">
                                <li>Email us at <span className="text-primary-700">wildenflowercreations@gmail.com</span> with your order number and a brief note</li>
                                <li>We reply within 2 business days to confirm your return</li>
                                <li>Pack the piece securely and ship it back — return shipping is the customer&apos;s unless the item arrived damaged or was our mistake, in which case we cover it</li>
                                <li>Refund to your original payment method within 5–7 business days of receipt</li>
                            </ol>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">Exchanges</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Need a different size within the 14-day window? Email us and we&apos;ll help. Because
                                most pieces are one of a kind, an exact swap isn&apos;t always possible — we&apos;ll
                                find the closest fit or process a return.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">Non-Returnable Items</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Custom or personalized orders, earrings (for hygiene reasons), and final sale items
                                (marked at purchase) cannot be returned. Gift cards are non-refundable.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Lifetime Repair — the Deep Woods promise */}
            <section className="bg-parchment pb-16 lg:pb-24">
                <div className="container mx-auto px-4 max-w-3xl">
                    <span className="catalog-label text-ink-brown/80">Made to Be Kept</span>
                    <h2 className="mt-3 text-2xl font-bold font-heading text-ink-brown mb-6">
                        Lifetime Repair
                    </h2>
                    <div className="bg-cream p-8 rounded-2xl shadow-sm space-y-6">
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">Craftsmanship, for the life of the piece</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                We stand behind how our work is made. If a piece fails at the craftsmanship —
                                stitching, hardware, a dye set that lifts, a seam that gives — we&apos;ll repair it
                                for the life of the piece. This covers our handmade leather, tie-dye, and jewelry.
                                Crystals and artwork have nothing to repair, so this promise doesn&apos;t apply to
                                them.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">How it works</h3>
                            <ol className="text-earth text-sm leading-relaxed list-decimal list-inside space-y-2">
                                <li>Email <span className="text-primary-700">wildenflowercreations@gmail.com</span> with photos of the issue and your order number <em>before</em> shipping anything</li>
                                <li>We confirm the repair is covered and tell you where to send it</li>
                                <li>You ship the piece in; we cover the repair and return shipping back to you</li>
                            </ol>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">What it is — and isn&apos;t</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                This is a repair promise, not a refund or replacement guarantee. We&apos;ll always
                                try to repair first. It doesn&apos;t cover normal wear, accidental damage, loss, or
                                the natural one-of-a-kind dye variation described above.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
